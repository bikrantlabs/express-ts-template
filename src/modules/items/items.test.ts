import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createApp } from "@/app";
import { prisma } from "@/db/prisma";
import { redis } from "@/lib/redis";

/**
 * Integration tests — run against the real PostgreSQL + Redis from
 * docker-compose.yml. `npm run db:up` must be done once; `npm test` applies
 * Prisma migrations before running the suite.
 */
const app = createApp();

beforeAll(async () => {
  await prisma.$connect();
}, 60_000);

beforeEach(async () => {
  await prisma.item.deleteMany();
  await redis.flushall();
});

afterAll(async () => {
  await Promise.allSettled([prisma.$disconnect(), redis.quit()]);
});

describe("GET /api/items", () => {
  it("returns an empty list when the table is empty", async () => {
    const res = await request(app).get("/api/items");
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  it("returns created items, newest first", async () => {
    await request(app).post("/api/items").send({ name: "First" });
    await request(app).post("/api/items").send({ name: "Second" });

    const res = await request(app).get("/api/items");
    expect(res.status).toBe(200);
    expect((res.body.data as { name: string }[]).map((i) => i.name)).toEqual(["Second", "First"]);
  });
});

describe("POST /api/items", () => {
  it("creates an item with server-generated id and timestamps", async () => {
    const res = await request(app).post("/api/items").send({ name: "Buy milk" });
    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({ name: "Buy milk" });
    expect(res.body.data.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(res.body.data.createdAt).toBeTruthy();
  });

  it("rejects an empty or missing name", async () => {
    const empty = await request(app).post("/api/items").send({ name: "" });
    expect(empty.status).toBe(400);
    expect(empty.body.status).toBe("error");

    const missing = await request(app).post("/api/items").send({});
    expect(missing.status).toBe(400);
  });
});

describe("GET /api/items/:id", () => {
  it("returns a single item", async () => {
    const created = await request(app).post("/api/items").send({ name: "Find me" });
    const res = await request(app).get(`/api/items/${created.body.data.id}`);
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe("Find me");
  });

  it("404s for an unknown id", async () => {
    const res = await request(app).get("/api/items/00000000-0000-4000-8000-000000000000");
    expect(res.status).toBe(404);
    expect(res.body.status).toBe("error");
  });

  it("400s for a malformed id", async () => {
    const res = await request(app).get("/api/items/not-a-uuid");
    expect(res.status).toBe(400);
  });
});

describe("PUT /api/items/:id", () => {
  it("updates the name and bumps updated_at", async () => {
    const created = await request(app).post("/api/items").send({ name: "Old name" });
    const id = created.body.data.id as string;

    const res = await request(app).put(`/api/items/${id}`).send({ name: "New name" });
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe("New name");
    expect(new Date(res.body.data.updatedAt as string).getTime()).toBeGreaterThanOrEqual(
      new Date(created.body.data.updatedAt as string).getTime(),
    );
  });

  it("404s for an unknown id", async () => {
    const res = await request(app)
      .put("/api/items/00000000-0000-4000-8000-000000000000")
      .send({ name: "Ghost" });
    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/items/:id", () => {
  it("deletes the item so it can no longer be fetched", async () => {
    const created = await request(app).post("/api/items").send({ name: "Temporary" });
    const id = created.body.data.id as string;

    const del = await request(app).delete(`/api/items/${id}`);
    expect(del.status).toBe(204);

    const get = await request(app).get(`/api/items/${id}`);
    expect(get.status).toBe(404);
  });

  it("404s when deleting twice", async () => {
    const created = await request(app).post("/api/items").send({ name: "Only once" });
    const id = created.body.data.id as string;

    await request(app).delete(`/api/items/${id}`);
    const second = await request(app).delete(`/api/items/${id}`);
    expect(second.status).toBe(404);
  });
});

describe("Redis list cache", () => {
  it("warms the cache on list and invalidates it on writes", async () => {
    await request(app).post("/api/items").send({ name: "Cached" });

    await request(app).get("/api/items");
    expect(await redis.get("items:list")).toBeTruthy(); // warmed

    await request(app).post("/api/items").send({ name: "Invalidates" });
    expect(await redis.get("items:list")).toBeNull(); // invalidated by create
  });
});
