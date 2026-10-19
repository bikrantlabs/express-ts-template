import swaggerJsdoc from "swagger-jsdoc";

/**
 * OpenAPI spec — generated automatically from the `@openapi` JSDoc comments
 * sitting right above each route in src/modules/<feature>/routes/.
 * No separate spec file to maintain: add a route, annotate it, done.
 */
export const openApiSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Node + Express + TypeScript Template API",
      version: "1.0.0",
      description:
        "Demo API. /items is backed by PostgreSQL + Redis; /contact emails land in Mailpit (http://localhost:8025) during development.",
    },
    servers: [{ url: "http://localhost:3000", description: "Local development" }],
    tags: [
      { name: "health", description: "Liveness and readiness probes" },
      { name: "items", description: "Demo CRUD resource (PostgreSQL + Redis)" },
      { name: "contact", description: "Demo email endpoint (Mailpit in development)" },
    ],
    components: {
      schemas: {
        Error: {
          type: "object",
          properties: {
            status: { type: "string", enum: ["error"] },
            message: { type: "string" },
            details: { type: "object", additionalProperties: true },
          },
        },
        CreateItemInput: {
          type: "object",
          required: ["name"],
          properties: { name: { type: "string", minLength: 1, maxLength: 120 } },
        },
        ContactMessageInput: {
          type: "object",
          required: ["name", "email", "message"],
          properties: {
            name: { type: "string", minLength: 1, maxLength: 120 },
            email: { type: "string", format: "email" },
            message: { type: "string", minLength: 1, maxLength: 5000 },
          },
        },
      },
    },
  },
  apis: ["src/modules/**/routes/*.routes.ts"],
});
