import { useDroppable } from "@dnd-kit/react";
import { TodoCard } from "@/components/TodoCard";
import type { Todo, UpdateTodoInput } from "@/types/todo";

interface TodoListProps {
  todos: Todo[];
  onEdit: (id: string, data: UpdateTodoInput) => Promise<void>;
  onDelete: (id: string) => void;
  onToggleDone: (id: string) => Promise<void>;
}

export function TodoList({ todos, onEdit, onDelete, onToggleDone }: TodoListProps) {
  const { ref, isDropTarget } = useDroppable({ id: "todo-list" });

  return (
    <div
      ref={ref}
      className={`min-h-[120px] space-y-3 rounded-lg border-2 border-dashed p-4 transition-colors duration-200 ${
        isDropTarget ? "border-primary bg-primary/5" : "border-transparent"
      }`}
    >
      <h2 className="text-lg font-semibold">To Do</h2>
      {todos.length === 0 && (
        <p className="text-sm text-muted-foreground">No pending todos</p>
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
