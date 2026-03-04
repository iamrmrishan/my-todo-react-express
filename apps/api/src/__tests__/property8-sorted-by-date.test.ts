import "./setup";
import { getAgent } from "./setup";
import fc from "fast-check";
import { Todo } from "../models/Todo";

describe("Property 8: Todos are sorted by creation date descending", () => {
  it("GET /api/todos returns todos with each createdAt >= the next", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
          { minLength: 2, maxLength: 10 },
        ),
        async (titles) => {
          // Clean up from previous iteration
          await Todo.deleteMany({});

          // Create todos sequentially so they get distinct timestamps
          for (const title of titles) {
            const res = await getAgent()
              .post("/api/todos")
              .send({ title });
            expect(res.status).toBe(201);
          }

          const listRes = await getAgent().get("/api/todos");
          expect(listRes.status).toBe(200);
          expect(listRes.body.length).toBe(titles.length);

          for (let i = 0; i < listRes.body.length - 1; i++) {
            const current = new Date(listRes.body[i].createdAt).getTime();
            const next = new Date(listRes.body[i + 1].createdAt).getTime();
            expect(current).toBeGreaterThanOrEqual(next);
          }
        },
      ),
      { numRuns: 20 },
    );
  });
});
