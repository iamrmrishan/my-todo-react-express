import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { CreateTodoInput, UpdateTodoInput } from "@/types/todo";

interface TodoFormProps {
  onSubmit: (data: CreateTodoInput) => Promise<void>;
  initialData?: UpdateTodoInput;
  onCancel?: () => void;
}

export function TodoForm({ onSubmit, initialData, onCancel }: TodoFormProps) {
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [titleError, setTitleError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setTitleError("Title is required");
      return;
    }
    setTitleError("");
    setSubmitting(true);
    try {
      await onSubmit({ title: title.trim(), description: description.trim() || undefined });
      if (!initialData) {
        setTitle("");
        setDescription("");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1">
        <Label htmlFor="todo-title">Title</Label>
        <Input
          id="todo-title"
          placeholder="What needs to be done?"
          value={title}
          onChange={(e) => { setTitle(e.target.value); setTitleError(""); }}
          aria-invalid={!!titleError}
          aria-describedby={titleError ? "title-error" : undefined}
        />
        {titleError && <p id="title-error" className="text-sm text-destructive">{titleError}</p>}
      </div>
      <div className="space-y-1">
        <Label htmlFor="todo-description">Description</Label>
        <Textarea
          id="todo-description"
          placeholder="Add details (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={submitting}>
          {initialData ? "Save" : "Add Todo"}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
