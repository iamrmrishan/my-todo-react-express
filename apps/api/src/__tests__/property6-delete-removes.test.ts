import "./setup";
import { getAgent } from "./setup";
import fc from "fast-check";

/**
 * **Validates: Requirements 7.1**
 */
describe("Property 6: Delete removes todo from collection", () => {
  it("deleting a todo removes it from the collection", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
        fc.option(fc.string(), { nil: undefined }),
        async (title, description) => {
          // Create a todo
          const createBody: Record<string, string> = { title };
          if (description !== undefined) {
            createBody.description = description;
          }

          const createRes = await getAgent()
            .post("/api/todos")
            .send(createBody);
          expect(createRes.status).toBe(201);

          const todoId = createRes.body._id;

          // Delete the todo
          const deleteRes = await getAgent().delete(`/api/todos/${todoId}`);
          expect(deleteRes.status).toBe(200);

          // GET all todos and assert the deleted todo is absent
          const listRes = await getAgent().get("/api/todos");
          expect(listRes.status).toBe(200);

          const match = listRes.body.find((t: any) => t._id === todoId);
          expect(match).toBeUndefined();
        },
      ),
      { numRuns: 100 },
    );
  });
});
