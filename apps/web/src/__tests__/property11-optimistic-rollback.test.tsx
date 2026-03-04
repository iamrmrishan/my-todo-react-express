import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { renderHook, act, cleanup, waitFor } from "@testing-library/react";
import * as fc from "fast-check";
import type { Todo } from "@/types/todo";

vi.mock("@/api/todoApi");

import * as api from "@/api/todoApi";
import { useTodos } from "@/hooks/useTodos";

function todoArb(): fc.Arbitrary<Todo> {
  return fc.record({
    _id: fc.uuid(),
    title: fc.stringMatching(/^[A-Za-z][A-Za-z0-9]{2,15}$/),
    description: fc.string({ maxLength: 20 }),
    done: fc.boolean(),
    createdAt: fc.constant(new Date().toISOString()),
    updatedAt: fc.constant(new Date().toISOString()),
  });
}

function uniqueTodos(todos: Todo[]): Todo[] {
  const seenIds = new Set<string>();
  return todos.filter((t) => {
    if (seenIds.has(t._id)) return false;
    seenIds.add(t._id);
    return true;
  });
}

describe("Property 11: Optimistic update rollback on API failure", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it(
    "rolls back addTodo on API failure",
    async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(todoArb(), { minLength: 0, maxLength: 5 }).map(uniqueTodos),
          fc.stringMatching(/^[A-Za-z][A-Za-z0-9]{2,10}$/),
          async (initialTodos, newTitle) => {
            cleanup();
            vi.mocked(api.fetchTodos).mockResolvedValue(initialTodos);
            vi.mocked(api.createTodo).mockRejectedValue(new Error("fail"));

            const { result } = renderHook(() => useTodos());
            await waitFor(() => expect(result.current.loading).toBe(false));

            const snapshotIds = result.current.todos.map((t) => t._id);

            await act(async () => {
              await result.current.addTodo({ title: newTitle });
            });

            const ids = result.current.todos.map((t) => t._id);
            expect(ids.every((id) => !id.startsWith("temp-"))).toBe(true);
            expect(ids).toEqual(snapshotIds);
          }
        ),
        { numRuns: 10 }
      );
    },
    30000
  );

  it(
    "rolls back editTodo on API failure",
    async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(todoArb(), { minLength: 1, maxLength: 5 }).map(uniqueTodos).filter((a) => a.length > 0),
          fc.stringMatching(/^[A-Za-z][A-Za-z0-9]{2,10}$/),
          async (initialTodos, newTitle) => {
            cleanup();
            vi.mocked(api.fetchTodos).mockResolvedValue([...initialTodos]);
            vi.mocked(api.updateTodo).mockRejectedValue(new Error("fail"));

            const { result } = renderHook(() => useTodos());
            await waitFor(() => expect(result.current.loading).toBe(false));

            const targetId = initialTodos[0]._id;
            const originalTitle = initialTodos[0].title;

            await act(async () => {
              await result.current.editTodo(targetId, { title: newTitle });
            });

            const todo = result.current.todos.find((t) => t._id === targetId);
            expect(todo?.title).toBe(originalTitle);
          }
        ),
        { numRuns: 10 }
      );
    },
    30000
  );

  it(
    "rolls back toggleDone on API failure",
    async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(todoArb(), { minLength: 1, maxLength: 5 }).map(uniqueTodos).filter((a) => a.length > 0),
          async (initialTodos) => {
            cleanup();
            vi.mocked(api.fetchTodos).mockResolvedValue([...initialTodos]);
            vi.mocked(api.toggleTodoDone).mockRejectedValue(new Error("fail"));

            const { result } = renderHook(() => useTodos());
            await waitFor(() => expect(result.current.loading).toBe(false));

            const targetId = initialTodos[0]._id;
            const originalDone = initialTodos[0].done;

            await act(async () => {
              await result.current.toggleDone(targetId);
            });

            const todo = result.current.todos.find((t) => t._id === targetId);
            expect(todo?.done).toBe(originalDone);
          }
        ),
        { numRuns: 10 }
      );
    },
    30000
  );

  it(
    "rolls back removeTodo on API failure",
    async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(todoArb(), { minLength: 1, maxLength: 5 }).map(uniqueTodos).filter((a) => a.length > 0),
          async (initialTodos) => {
            cleanup();
            vi.mocked(api.fetchTodos).mockResolvedValue([...initialTodos]);
            vi.mocked(api.deleteTodo).mockRejectedValue(new Error("fail"));

            const { result } = renderHook(() => useTodos());
            await waitFor(() => expect(result.current.loading).toBe(false));

            const snapshotIds = result.current.todos.map((t) => t._id);
            const targetId = initialTodos[0]._id;

            await act(async () => {
              await result.current.removeTodo(targetId);
            });

            expect(result.current.todos.map((t) => t._id)).toEqual(snapshotIds);
          }
        ),
        { numRuns: 10 }
      );
    },
    30000
  );
});
