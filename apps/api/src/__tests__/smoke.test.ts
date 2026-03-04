import "./setup";
import { getAgent } from "./setup";

describe("API smoke test", () => {
  it("GET /api/todos returns 200 with an empty array", async () => {
    const res = await getAgent().get("/api/todos");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});
