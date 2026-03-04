import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, within, cleanup } from "@testing-library/react";
import * as fc from "fast-check";
import type { Todo } from "@/types/todo";

vi.mock("@/api/todoApi");

import * as api from "@/api/todoApi";
import App from "@/App";

let idCounter = 0;
function makeTodo(overrides: Partial<Todo> = {}): Todo {
  idCounter++;
  return {
    _id: `id-${idCounter}`,
    title: `Todo ${idCounter}`,
    description: "",
    done: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

function todoArb(): fc.Arbitrary<Todo> {
  return fc.record({
    _id: fc.uuid(),
    title: fc.stringMatching(/^[A-Za-z][A-Za-z0-9]{2,20}$/),
    description: fc.string({ maxLength: 30 }),
    done: fc.boolean(),
    createdAt: fc.constant(new Date().toISOString()),
    updatedAt: fc.constant(new Date().toISOString()),
  });
}

describe("Property 9: Frontend splits todos by done status", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    idCounter = 0;
  });

  afterEach(() => {
    cleanup();
  });

  it(
    "renders todos with done=false in Todo list and done=true in Done list",
    async () => {
      await fc.assert(
        fc.asyncProperty(
          fc
            .array(todoArb(), { minLength: 1, maxLength: 6 })
            .map((todos) => {
              // Ensure unique IDs and titles
              const seenIds = new Set<string>();
              const seenTitles = new Set<string>();
              return todos.filter((t) => {
                if (seenIds.has(t._id) || seenTitles.has(t.title)) return false;
                seenIds.add(t._id);
                seenTitles.add(t.title);
                return true;
              });
            })
            .filter((arr) => arr.length > 0),
          async (todos) => {
            cleanup();
            vi.mocked(api.fetchTodos).mockResolvedValue(todos);

            render(<App />);

            // Wait for first todo to render
            await screen.findByText(todos[0].title, {}, { timeout: 2000 });

            const pendingTodos = todos.filter((t) => !t.done);
            const doneTodos = todos.filter((t) => t.done);

            // Find sections by their heading's parent container
            const todoSection = screen.getByText("To Do").parentElement!;
            const doneSection = screen.getByText("Done").parentElement!;

            for (const todo of pendingTodos) {
              expect(within(todoSection).getByText(todo.title)).toBeInTheDocument();
            }

            for (const todo of doneTodos) {
              expect(within(doneSection).getByText(todo.title)).toBeInTheDocument();
            }

            // No duplication: each unique title appears exactly once
            for (const todo of todos) {
              expect(screen.getAllByText(todo.title)).toHaveLength(1);
            }

            cleanup();
          }
        ),
        { numRuns: 15 }
      );
    },
    30000
  );
});
