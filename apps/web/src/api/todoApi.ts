import type { Todo, CreateTodoInput, UpdateTodoInput } from "@/types/todo";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.json().catch(() => ({ error: "Unknown error" }));
    const message = body.error || body.message || "Unknown error";
    throw new Error(`${response.status}: ${message}`);
  }
  return response.json();
}

export async function fetchTodos(): Promise<Todo[]> {
  const response = await fetch(`${BASE_URL}/api/todos`);
  return handleResponse<Todo[]>(response);
}

export async function createTodo(data: CreateTodoInput): Promise<Todo> {
  const response = await fetch(`${BASE_URL}/api/todos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<Todo>(response);
}

export async function updateTodo(id: string, data: UpdateTodoInput): Promise<Todo> {
  const response = await fetch(`${BASE_URL}/api/todos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<Todo>(response);
}

export async function toggleTodoDone(id: string): Promise<Todo> {
  const response = await fetch(`${BASE_URL}/api/todos/${id}/done`, {
    method: "PATCH",
  });
  return handleResponse<Todo>(response);
}

export async function deleteTodo(id: string): Promise<void> {
  const response = await fetch(`${BASE_URL}/api/todos/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({ error: "Unknown error" }));
    const message = body.error || body.message || "Unknown error";
    throw new Error(`${response.status}: ${message}`);
  }
}
