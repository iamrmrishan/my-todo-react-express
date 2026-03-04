export interface Todo {
  _id: string;
  title: string;
  description: string;
  done: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTodoInput {
  title: string;
  description?: string;
}

export interface UpdateTodoInput {
  title: string;
  description?: string;
}
