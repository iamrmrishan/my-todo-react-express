import { useState, useCallback } from "react";
import { DragDropProvider } from "@dnd-kit/react";
import { useTodos } from "@/hooks/useTodos";
import { TodoForm } from "@/components/TodoForm";
import { TodoList } from "@/components/TodoList";
import { DoneList } from "@/components/DoneList";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function App() {
  const { todos, loading, error, addTodo, editTodo, toggleDone, removeTodo, retry } = useTodos();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const todoItems = todos.filter((t) => !t.done);
  const doneItems = todos.filter((t) => t.done);

  const handleDragEnd = useCallback(
    (event: { operation: { source: { id: string | number } | null; target: { id: string | number } | null } }) => {
      const { source, target } = event.operation;
      if (!source || !target) return;

      const draggedId = source.id as string;
      const droppedOn = target.id as string;
      const todo = todos.find((t) => t._id === draggedId);
      if (!todo) return;

      // Toggle only when dropping into the opposite list
      if (!todo.done && droppedOn === "done-list") {
        toggleDone(draggedId);
      } else if (todo.done && droppedOn === "todo-list") {
        toggleDone(draggedId);
      }
    },
    [todos, toggleDone]
  );

  const handleConfirmDelete = useCallback(() => {
    if (deleteId) {
      removeTodo(deleteId);
      setDeleteId(null);
    }
  }, [deleteId, removeTodo]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error && todos.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-destructive">{error}</p>
        <Button onClick={retry}>Retry</Button>
      </div>
    );
  }

  return (
    <DragDropProvider onDragEnd={handleDragEnd}>
      <div className="mx-auto max-w-2xl p-6 space-y-6">
        <h1 className="text-2xl font-bold">Todo App</h1>

        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <TodoForm onSubmit={addTodo} />

        <div className="grid gap-6 md:grid-cols-2">
          <TodoList
            todos={todoItems}
            onEdit={editTodo}
            onDelete={setDeleteId}
            onToggleDone={toggleDone}
          />
          <DoneList
            todos={doneItems}
            onEdit={editTodo}
            onDelete={setDeleteId}
            onToggleDone={toggleDone}
          />
        </div>

        <DeleteConfirmDialog
          open={deleteId !== null}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteId(null)}
        />
      </div>
    </DragDropProvider>
  );
}
