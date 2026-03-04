import "./setup";
import { getAgent } from "./setup";
import fc from "fast-check";

describe("Property 1: Todo creation round-trip", () => {
  it("creating a todo via POST and fetching via GET returns it with matching title and description", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
        fc.option(fc.string(), { nil: undefined }),
        async (title, description) => {
          const body: Record<string, string> = { title };
          if (description !== undefined) {
            body.description = description;
          }

          const createRes = await getAgent()
            .post("/api/todos")
            .send(body);
          expect(createRes.status).toBe(201);

          const listRes = await getAgent().get("/api/todos");
          expect(listRes.status).toBe(200);

          const match = listRes.body.find(
            (t: any) => t._id === createRes.body._id,
          );
          expect(match).toBeDefined();
          expect(match.title).toBe(title);
          expect(match.description).toBe(description ?? "");
        },
      ),
      { numRuns: 100 },
    );
  });
});
