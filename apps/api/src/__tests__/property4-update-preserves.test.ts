import "./setup";
import { getAgent } from "./setup";
import fc from "fast-check";

/**
 * **Validates: Requirements 5.1**
 */
describe("Property 4: Todo update preserves changes", () => {
  it("updating a todo via PUT reflects changes in response and subsequent GET", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
        fc.option(fc.string(), { nil: undefined }),
        fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
        fc.option(fc.string(), { nil: undefined }),
        async (initialTitle, initialDescription, updateTitle, updateDescription) => {
          // Create initial todo
          const createBody: Record<string, string> = { title: initialTitle };
          if (initialDescription !== undefined) {
            createBody.description = initialDescription;
          }

          const createRes = await getAgent()
            .post("/api/todos")
            .send(createBody);
          expect(createRes.status).toBe(201);

          const todoId = createRes.body._id;

          // Build update body
          const updateBody: Record<string, string> = { title: updateTitle };
          if (updateDescription !== undefined) {
            updateBody.description = updateDescription;
          }

          // PUT to update the todo
          const updateRes = await getAgent()
            .put(`/api/todos/${todoId}`)
            .send(updateBody);
          expect(updateRes.status).toBe(200);
          expect(updateRes.body.title).toBe(updateTitle);

          // When description is omitted from update, the API preserves the existing value
          const expectedDescription =
            updateDescription !== undefined
              ? updateDescription
              : initialDescription ?? "";
          expect(updateRes.body.description).toBe(expectedDescription);

          // GET and verify the update persisted
          const listRes = await getAgent().get("/api/todos");
          expect(listRes.status).toBe(200);

          const match = listRes.body.find((t: any) => t._id === todoId);
          expect(match).toBeDefined();
          expect(match.title).toBe(updateTitle);
          expect(match.description).toBe(expectedDescription);
        },
      ),
      { numRuns: 100 },
    );
  });
});
