import "./setup";
import { getAgent } from "./setup";
import fc from "fast-check";
import mongoose from "mongoose";

/**
 * Property 7: Non-existent ID returns 404
 * Generate random valid ObjectId strings not in DB, send PUT/PATCH/DELETE, assert 404
 * Validates: Requirements 5.2, 6.2, 7.2
 */
describe("Property 7: Non-existent ID returns 404", () => {
  it("PUT, PATCH /done, and DELETE all return 404 for non-existent ObjectIds", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 0, max: 0xffffff }).map(() => new mongoose.Types.ObjectId().toHexString()),
        async (randomId) => {
          const putRes = await getAgent()
            .put(`/api/todos/${randomId}`)
            .send({ title: "irrelevant" });
          expect(putRes.status).toBe(404);

          const patchRes = await getAgent()
            .patch(`/api/todos/${randomId}/done`);
          expect(patchRes.status).toBe(404);

          const deleteRes = await getAgent()
            .delete(`/api/todos/${randomId}`);
          expect(deleteRes.status).toBe(404);
        },
      ),
      { numRuns: 100 },
    );
  });
});
