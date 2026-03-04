import { useState } from "react";
import { useDraggable } from "@dnd-kit/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TodoForm } from "@/components/TodoForm";
import { Pencil, Trash2, Check, Undo2, GripVertical } from "lucide-react";
import type { Todo, UpdateTodoInput } from "@/types/todo";

interface TodoCardProps {
  todo: Todo;
  onEdit: (id: string, data: UpdateTodoInput) => Promise<void>;
  onDelete: (id: string) => void;
  onToggleDone: (id: string) => Promise<void>;
}

export function TodoCard({ todo, onEdit, onDelete, onToggleDone }: TodoCardProps) {
  const [editing, setEditing] = useState(false);
  const { ref, isDragging } = useDraggable({
    id: todo._id,
    data: { todo },
  });

  if (editing) {
    return (
      <Card ref={ref} className="animate-in fade-in duration-200">
        <CardContent className="p-4">
          <TodoForm
            initialData={{ title: todo.title, description: todo.description }}
            onSubmit={async (data) => {
              await onEdit(todo._id, data);
              setEditing(false);
            }}
            onCancel={() => setEditing(false)}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      ref={ref}
      className={`transition-all duration-200 ${
        isDragging ? "opacity-50 scale-105 shadow-lg" : "opacity-100"
      } animate-in fade-in slide-in-from-top-2`}
    >
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start gap-2">
          <GripVertical className="mt-1 h-4 w-4 shrink-0 cursor-grab text-muted-foreground" />
          <CardTitle className={`flex-1 text-base ${todo.done ? "line-through text-muted-foreground" : ""}`}>
            {todo.title}
          </CardTitle>
        </div>
      </CardHeader>
      {todo.description && (
        <CardContent className="px-4 pb-2 pt-0 pl-10">
          <p className={`text-sm ${todo.done ? "text-muted-foreground line-through" : "text-muted-foreground"}`}>
            {todo.description}
          </p>
        </CardContent>
      )}
      <CardContent className="flex gap-1 px-4 pb-3 pt-0 pl-10">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onToggleDone(todo._id)}
          aria-label={todo.done ? "Mark as not done" : "Mark as done"}
        >
          {todo.done ? <Undo2 className="h-4 w-4" /> : <Check className="h-4 w-4" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setEditing(true)}
          aria-label="Edit todo"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive"
          onClick={() => onDelete(todo._id)}
          aria-label="Delete todo"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
