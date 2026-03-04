# Todo API (`@repo/api`)

Express.js REST API for the Todo application with MongoDB persistence and Swagger documentation.

## Setup

1. Install dependencies (from monorepo root):

```sh
pnpm install
```

2. Create a `.env` file from the example:

```sh
cp .env.example .env
```

3. Start the server:

```sh
pnpm dev
```

The API runs at `http://localhost:3001` by default.

## Environment Variables

| Variable      | Default                              | Description               |
| ------------- | ------------------------------------ | ------------------------- |
| `PORT`        | `3001`                               | Server port               |
| `MONGODB_URI` | `mongodb://localhost:27017/todo-app` | MongoDB connection string |

## API Endpoints

| Method   | Path                  | Description                   | Success | Error    |
| -------- | --------------------- | ----------------------------- | ------- | -------- |
| `GET`    | `/api/todos`          | List all todos (newest first) | 200     | 500      |
| `POST`   | `/api/todos`          | Create a todo                 | 201     | 400      |
| `PUT`    | `/api/todos/:id`      | Update title/description      | 200     | 400, 404 |
| `PATCH`  | `/api/todos/:id/done` | Toggle done status            | 200     | 404      |
| `DELETE` | `/api/todos/:id`      | Delete a todo                 | 200     | 404      |

### Request/Response Examples

**Create a todo:**

```json
POST /api/todos
{ "title": "Buy groceries", "description": "Milk, eggs, bread" }
→ 201 { "_id": "...", "title": "Buy groceries", "description": "Milk, eggs, bread", "done": false, "createdAt": "...", "updatedAt": "..." }
```

**Update a todo:**

```json
PUT /api/todos/:id
{ "title": "Buy groceries", "description": "Milk, eggs" }
→ 200 { updated todo object }
```

## Swagger Documentation

Interactive API docs are available at `http://localhost:3001/api-docs` when the server is running.

## Scripts

| Command      | Description                            |
| ------------ | -------------------------------------- |
| `pnpm dev`   | Start with hot reload (tsx watch)      |
| `pnpm build` | Compile TypeScript                     |
| `pnpm test`  | Run Jest tests (property-based + unit) |
| `pnpm lint`  | Lint source files                      |

## Testing

Tests use Jest + Supertest with an in-memory MongoDB instance (`mongodb-memory-server`). Property-based tests use `fast-check`.

```sh
pnpm test
```
