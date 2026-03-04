import "./setup";
import { getAgent } from "./setup";
import fc from "fast-check";

describe("Property 2: Todo creation defaults", () => {
  it("created todo has done=false, description defaults to empty string, and valid timestamps", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
        fc.option(fc.string(), { nil: undefined }),
        async (title, description) => {
          const body: Record<string, string> = { title };
          if (description !== undefined) {
            body.description = description;
          }

          const res = await getAgent()
            .post("/api/todos")
            .send(body);
          expect(res.status).toBe(201);

          const todo = res.body;
          expect(todo.done).toBe(false);
          expect(todo.description).toBe(description ?? "");
          expect(Number.isNaN(Date.parse(todo.createdAt))).toBe(false);
          expect(Number.isNaN(Date.parse(todo.updatedAt))).toBe(false);
        },
      ),
      { numRuns: 100 },
    );
  });
});
