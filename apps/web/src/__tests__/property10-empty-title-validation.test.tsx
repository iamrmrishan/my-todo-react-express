import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as fc from "fast-check";
import { TodoForm } from "@/components/TodoForm";

describe("Property 10: Frontend empty title validation", () => {
  afterEach(() => {
    cleanup();
  });

  it(
    "rejects whitespace-only titles and shows validation error without calling onSubmit",
    async () => {
      const user = userEvent.setup();

      await fc.assert(
        fc.asyncProperty(
          fc.stringMatching(/^[ \t\n\r]{0,10}$/),
          async (whitespaceTitle) => {
            cleanup();
            const onSubmit = vi.fn().mockResolvedValue(undefined);

            render(<TodoForm onSubmit={onSubmit} />);

            const titleInput = screen.getByLabelText("Title");
            const submitButton = screen.getByRole("button", { name: "Add Todo" });

            // Clear and type the whitespace string
            await user.clear(titleInput);
            if (whitespaceTitle.length > 0) {
              await user.type(titleInput, whitespaceTitle);
            }

            await user.click(submitButton);

            // Validation error should be shown
            expect(screen.getByText("Title is required")).toBeInTheDocument();

            // onSubmit should NOT have been called
            expect(onSubmit).not.toHaveBeenCalled();
          }
        ),
        { numRuns: 20 }
      );
    },
    30000
  );
});
