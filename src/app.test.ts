import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "@/app";

/**
 * Fast app-level tests that only exercise the Express wiring.
 * DB/Redis/SMTP-backed behavior lives in the per-module *.test.ts files.
 */
const app = createApp();

describe("GET /api/health", () => {
  it("returns 200 with an ok status", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });
});

describe("GET /api/health/ready", () => {
  it("reports PostgreSQL and Redis as up", async () => {
    const res = await request(app).get("/api/health/ready");
    expect(res.status).toBe(200);
    expect(res.body.checks).toEqual({ database: "up", redis: "up" });
  });
});

describe("unknown route", () => {
  it("returns 404 in the standard error shape", async () => {
    const res = await request(app).get("/api/does-not-exist");
    expect(res.status).toBe(404);
    expect(res.body.status).toBe("error");
  });
});
