import "./setup";
import { getAgent } from "./setup";
import fc from "fast-check";

/**
 * **Validates: Requirements 6.1**
 */
describe("Property 5: Toggle done is an involution", () => {
  it("toggling done twice returns to the original value", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
        fc.option(fc.string(), { nil: undefined }),
        async (title, description) => {
          // Create a todo (done defaults to false)
          const createBody: Record<string, string> = { title };
          if (description !== undefined) {
            createBody.description = description;
          }

          const createRes = await getAgent()
            .post("/api/todos")
            .send(createBody);
          expect(createRes.status).toBe(201);

          const todoId = createRes.body._id;
          const originalDone = createRes.body.done;

          // First toggle — done should flip
          const toggle1Res = await getAgent().patch(
            `/api/todos/${todoId}/done`,
          );
          expect(toggle1Res.status).toBe(200);
          expect(toggle1Res.body.done).toBe(!originalDone);

          // Second toggle — done should return to original
          const toggle2Res = await getAgent().patch(
            `/api/todos/${todoId}/done`,
          );
          expect(toggle2Res.status).toBe(200);
          expect(toggle2Res.body.done).toBe(originalDone);

          // Verify via GET that the persisted value matches
          const listRes = await getAgent().get("/api/todos");
          expect(listRes.status).toBe(200);

          const match = listRes.body.find((t: any) => t._id === todoId);
          expect(match).toBeDefined();
          expect(match.done).toBe(originalDone);
        },
      ),
      { numRuns: 100 },
    );
  });
});
