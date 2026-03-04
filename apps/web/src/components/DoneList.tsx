import { useDroppable } from "@dnd-kit/react";
import { TodoCard } from "@/components/TodoCard";
import type { Todo, UpdateTodoInput } from "@/types/todo";

interface DoneListProps {
  todos: Todo[];
  onEdit: (id: string, data: UpdateTodoInput) => Promise<void>;
  onDelete: (id: string) => void;
  onToggleDone: (id: string) => Promise<void>;
}

export function DoneList({ todos, onEdit, onDelete, onToggleDone }: DoneListProps) {
  const { ref, isDropTarget } = useDroppable({ id: "done-list" });

  return (
    <div
      ref={ref}
      className={`min-h-[120px] space-y-3 rounded-lg border-2 border-dashed p-4 transition-colors duration-200 ${
        isDropTarget ? "border-primary bg-primary/5" : "border-transparent"
      }`}
    >
      <h2 className="text-lg font-semibold">Done</h2>
      {todos.length === 0 && (
        <p className="text-sm text-muted-foreground">No completed todos</p>
      )}
      {todos.map((todo) => (
        <TodoCard
          key={todo._id}
          todo={todo}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleDone={onToggleDone}
        />
      ))}
    </div>
  );
}
