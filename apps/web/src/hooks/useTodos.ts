import { useState, useEffect, useCallback, useRef } from "react";
import type { Todo, CreateTodoInput, UpdateTodoInput } from "@/types/todo";
import * as api from "@/api/todoApi";

export interface UseTodosReturn {
  todos: Todo[];
  loading: boolean;
  error: string | null;
  addTodo: (data: CreateTodoInput) => Promise<void>;
  editTodo: (id: string, data: UpdateTodoInput) => Promise<void>;
  toggleDone: (id: string) => Promise<void>;
  removeTodo: (id: string) => Promise<void>;
  retry: () => void;
}

export function useTodos(): UseTodosReturn {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const todosRef = useRef<Todo[]>(todos);

  // Keep ref in sync with state
  useEffect(() => {
    todosRef.current = todos;
  }, [todos]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.fetchTodos();
      setTodos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch todos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const addTodo = useCallback(async (data: CreateTodoInput) => {
    const optimistic: Todo = {
      _id: `temp-${Date.now()}`,
      title: data.title,
      description: data.description ?? "",
      done: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTodos((prev) => [optimistic, ...prev]);
    try {
      const created = await api.createTodo(data);
      setTodos((prev) => prev.map((t) => (t._id === optimistic._id ? created : t)));
    } catch (err) {
      setTodos((prev) => prev.filter((t) => t._id !== optimistic._id));
      setError(err instanceof Error ? err.message : "Failed to create todo");
    }
  }, []);

  const editTodo = useCallback(async (id: string, data: UpdateTodoInput) => {
    const snapshot = todosRef.current;
    setTodos((prev) =>
      prev.map((t) =>
        t._id === id ? { ...t, title: data.title, description: data.description ?? t.description, updatedAt: new Date().toISOString() } : t
      )
    );
    try {
      const updated = await api.updateTodo(id, data);
      setTodos((prev) => prev.map((t) => (t._id === id ? updated : t)));
    } catch (err) {
      setTodos(snapshot);
      setError(err instanceof Error ? err.message : "Failed to update todo");
    }
  }, []);

  const toggleDone = useCallback(async (id: string) => {
    const snapshot = todosRef.current;
    setTodos((prev) => prev.map((t) => (t._id === id ? { ...t, done: !t.done } : t)));
    try {
      const updated = await api.toggleTodoDone(id);
      setTodos((prev) => prev.map((t) => (t._id === id ? updated : t)));
    } catch (err) {
      setTodos(snapshot);
      setError(err instanceof Error ? err.message : "Failed to toggle todo");
    }
  }, []);

  const removeTodo = useCallback(async (id: string) => {
    const snapshot = todosRef.current;
    setTodos((prev) => prev.filter((t) => t._id !== id));
    try {
      await api.deleteTodo(id);
    } catch (err) {
      setTodos(snapshot);
      setError(err instanceof Error ? err.message : "Failed to delete todo");
    }
  }, []);

  return { todos, loading, error, addTodo, editTodo, toggleDone, removeTodo, retry: fetchAll };
}
