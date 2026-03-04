import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import * as path from "path";
import * as fs from "fs";

// Load the swagger spec by importing swagger-jsdoc and running it against the API routes
async function loadSwaggerSpec(): Promise<Record<string, unknown>> {
  const swaggerJsdoc = (await import("swagger-jsdoc")).default;
  const apiRoutesPath = path.resolve(__dirname, "../../../api/src/routes/*.ts");

  const spec = swaggerJsdoc({
    definition: {
      openapi: "3.0.0",
      info: { title: "Todo API", version: "1.0.0" },
      components: {
        schemas: {
          Todo: {
            type: "object",
            properties: {
              _id: { type: "string" },
              title: { type: "string" },
              description: { type: "string" },
              done: { type: "boolean" },
              createdAt: { type: "string", format: "date-time" },
              updatedAt: { type: "string", format: "date-time" },
            },
          },
        },
      },
    },
    apis: [apiRoutesPath],
  });

  return spec as Record<string, unknown>;
}

describe("Property 14: OpenAPI spec covers all CRUD endpoints", () => {
  it("all CRUD paths are present with documented schemas and status codes", async () => {
    const spec = await loadSwaggerSpec();
    const paths = spec.paths as Record<string, Record<string, unknown>>;

    // Define the required CRUD endpoints
    const requiredEndpoints = [
      { path: "/api/todos", method: "get" },
      { path: "/api/todos", method: "post" },
      { path: "/api/todos/{id}", method: "put" },
      { path: "/api/todos/{id}/done", method: "patch" },
      { path: "/api/todos/{id}", method: "delete" },
    ] as const;

    // Property: for any required endpoint, it must exist in the spec
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...requiredEndpoints),
        async (endpoint) => {
          // Path must exist
          expect(paths).toHaveProperty(endpoint.path);
          const pathObj = paths[endpoint.path];

          // Method must exist on the path
          expect(pathObj).toHaveProperty(endpoint.method);
          const methodObj = pathObj[endpoint.method] as Record<string, unknown>;

          // Must have responses documented
          expect(methodObj).toHaveProperty("responses");
          const responses = methodObj.responses as Record<string, unknown>;
          expect(Object.keys(responses).length).toBeGreaterThan(0);

          // Each response should have content or description
          for (const [statusCode, response] of Object.entries(responses)) {
            const resp = response as Record<string, unknown>;
            expect(
              resp.description || resp.content,
              `${endpoint.method.toUpperCase()} ${endpoint.path} response ${statusCode} should have description or content`
            ).toBeTruthy();
          }

          // POST and PUT should have requestBody
          if (endpoint.method === "post" || endpoint.method === "put") {
            expect(methodObj).toHaveProperty("requestBody");
          }

          // PUT, PATCH, DELETE on /:id should have parameters
          if (endpoint.path.includes("{id}")) {
            expect(methodObj).toHaveProperty("parameters");
          }
        }
      ),
      { numRuns: 5 }
    );
  });
});
