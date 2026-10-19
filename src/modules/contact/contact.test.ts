import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "@/app";

/**
 * Integration test for the mailing slice — asserts the email actually lands
 * in Mailpit (docker-compose.yml) via its HTTP API. No mocks.
 * Mailpit web UI: http://localhost:8025
 */
const app = createApp();
const MAILPIT_API = "http://localhost:8025/api/v1";

beforeEach(async () => {
  await fetch(`${MAILPIT_API}/messages`, { method: "DELETE" });
});

describe("POST /api/contact", () => {
  it("accepts a message and delivers it to Mailpit", async () => {
    const res = await request(app).post("/api/contact").send({
      name: "Ada",
      email: "ada@example.com",
      message: "Hello from the integration test!",
    });
    expect(res.status).toBe(202);
    expect(res.body.status).toBe("accepted");

    const inbox = (await (await fetch(`${MAILPIT_API}/messages`)).json()) as {
      total: number;
      messages: { Subject: string }[];
    };
    expect(inbox.total).toBe(1);
    expect(inbox.messages[0]?.Subject).toContain("Ada");
  });

  it("rejects an invalid payload with the standard error shape", async () => {
    const res = await request(app).post("/api/contact").send({ name: "Ada", email: "nope" });
    expect(res.status).toBe(400);
    expect(res.body.status).toBe("error");
    expect(res.body.message).toBe("Validation failed");
  });
});
