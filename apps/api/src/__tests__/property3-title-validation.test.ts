import "./setup";
import { getAgent } from "./setup";
import fc from "fast-check";

// Arbitrary that generates empty or whitespace-only strings
const whitespaceOrEmpty = fc.oneof(
  fc.constant(""),
  fc
    .array(fc.constantFrom(" ", "\t", "\n", "\r"), { minLength: 1, maxLength: 20 })
    .map((chars) => chars.join("")),
);

describe("Property 3: Title validation rejects missing or empty title", () => {
  it("POST with whitespace-only or missing title returns 400 and collection unchanged", async () => {
    await fc.assert(
      fc.asyncProperty(
        whitespaceOrEmpty,
        async (invalidTitle) => {
          const countBefore = await getAgent().get("/api/todos");
          const before = countBefore.body.length;

          const res = await getAgent()
            .post("/api/todos")
            .send({ title: invalidTitle });
          expect(res.status).toBe(400);

          const countAfter = await getAgent().get("/api/todos");
          expect(countAfter.body.length).toBe(before);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("POST with missing title field returns 400 and collection unchanged", async () => {
    const countBefore = await getAgent().get("/api/todos");
    const before = countBefore.body.length;

    // no title field at all
    const res1 = await getAgent().post("/api/todos").send({});
    expect(res1.status).toBe(400);

    // description only, no title
    const res2 = await getAgent().post("/api/todos").send({ description: "some desc" });
    expect(res2.status).toBe(400);

    const countAfter = await getAgent().get("/api/todos");
    expect(countAfter.body.length).toBe(before);
  });

  it("PUT with whitespace-only or missing title returns 400 and todo unchanged", async () => {
    // Create a valid todo first
    const createRes = await getAgent()
      .post("/api/todos")
      .send({ title: "Original Title", description: "Original Desc" });
    expect(createRes.status).toBe(201);
    const todoId = createRes.body._id;

    await fc.assert(
      fc.asyncProperty(
        whitespaceOrEmpty,
        async (invalidTitle) => {
          const res = await getAgent()
            .put(`/api/todos/${todoId}`)
            .send({ title: invalidTitle, description: "Updated Desc" });
          expect(res.status).toBe(400);

          // Verify the todo is unchanged
          const getRes = await getAgent().get("/api/todos");
          const todo = getRes.body.find((t: any) => t._id === todoId);
          expect(todo).toBeDefined();
          expect(todo.title).toBe("Original Title");
          expect(todo.description).toBe("Original Desc");
        },
      ),
      { numRuns: 100 },
    );
  });

  it("PUT with missing title field returns 400 and todo unchanged", async () => {
    const createRes = await getAgent()
      .post("/api/todos")
      .send({ title: "Keep Me", description: "Unchanged" });
    expect(createRes.status).toBe(201);
    const todoId = createRes.body._id;

    // no title field
    const res1 = await getAgent().put(`/api/todos/${todoId}`).send({});
    expect(res1.status).toBe(400);

    // description only
    const res2 = await getAgent()
      .put(`/api/todos/${todoId}`)
      .send({ description: "new desc" });
    expect(res2.status).toBe(400);

    const getRes = await getAgent().get("/api/todos");
    const todo = getRes.body.find((t: any) => t._id === todoId);
    expect(todo.title).toBe("Keep Me");
    expect(todo.description).toBe("Unchanged");
  });
});
