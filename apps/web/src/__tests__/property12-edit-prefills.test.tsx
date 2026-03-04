import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as fc from "fast-check";
import type { Todo } from "@/types/todo";
import { TodoCard } from "@/components/TodoCard";

function todoArb(): fc.Arbitrary<Todo> {
  return fc.record({
    _id: fc.uuid(),
    title: fc.stringMatching(/^[A-Za-z][A-Za-z0-9 ]{1,25}$/),
    description: fc.stringMatching(/^[A-Za-z0-9 ]{0,40}$/),
    done: fc.boolean(),
    createdAt: fc.constant(new Date().toISOString()),
    updatedAt: fc.constant(new Date().toISOString()),
  });
}

describe("Property 12: Edit form pre-fills with current data", () => {
  afterEach(() => {
    cleanup();
  });

  it(
    "pre-fills the edit form with the todo's current title and description",
    async () => {
      const user = userEvent.setup();

      await fc.assert(
        fc.asyncProperty(todoArb(), async (todo) => {
          cleanup();

          const onEdit = vi.fn().mockResolvedValue(undefined);
          const onDelete = vi.fn();
          const onToggleDone = vi.fn().mockResolvedValue(undefined);

          render(
            <TodoCard
              todo={todo}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleDone={onToggleDone}
            />
          );

          // Click the edit button
          const editButton = screen.getByRole("button", { name: "Edit todo" });
          await user.click(editButton);

          // Check that the title input is pre-filled
          const titleInput = screen.getByLabelText("Title") as HTMLInputElement;
          expect(titleInput.value).toBe(todo.title);

          // Check that the description textarea is pre-filled
          const descInput = screen.getByLabelText("Description") as HTMLTextAreaElement;
          expect(descInput.value).toBe(todo.description);
        }),
        { numRuns: 20 }
      );
    },
    30000
  );
});
