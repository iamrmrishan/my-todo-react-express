import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as fc from "fast-check";

// We need to mock global fetch since the API client uses it directly
const originalFetch = globalThis.fetch;

describe("Property 13: API client throws on non-2xx responses", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it(
    "throws an error containing status and message for non-2xx responses",
    async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 300, max: 599 }),
          fc.stringMatching(/^[A-Za-z ]{3,30}$/),
          async (statusCode, errorMessage) => {
            // Mock fetch to return a non-2xx response
            globalThis.fetch = vi.fn().mockResolvedValue({
              ok: false,
              status: statusCode,
              json: () => Promise.resolve({ error: errorMessage }),
            });

            // Dynamically import to get fresh module with mocked fetch
            const { fetchTodos, createTodo, updateTodo, toggleTodoDone, deleteTodo } =
              await import("@/api/todoApi");

            // Test each API function
            const fns = [
              () => fetchTodos(),
              () => createTodo({ title: "test" }),
              () => updateTodo("some-id", { title: "test" }),
              () => toggleTodoDone("some-id"),
              () => deleteTodo("some-id"),
            ];

            for (const fn of fns) {
              try {
                await fn();
                // Should not reach here
                expect.unreachable("Expected an error to be thrown");
              } catch (err) {
                expect(err).toBeInstanceOf(Error);
                const message = (err as Error).message;
                expect(message).toContain(String(statusCode));
                expect(message).toContain(errorMessage);
              }
            }
          }
        ),
        { numRuns: 15 }
      );
    },
    30000
  );
});
