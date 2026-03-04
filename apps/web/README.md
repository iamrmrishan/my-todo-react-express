# Todo Web (`web`)

React frontend for the Todo application with drag-and-drop task management, built with shadcn/ui and @dnd-kit.

## Setup

1. Install dependencies (from monorepo root):

```sh
pnpm install
```

2. Make sure the API server is running (see `apps/api/README.md`).

3. Start the dev server:

```sh
pnpm dev
```

The app runs at `http://localhost:5173` by default.

## Environment Variables

| Variable       | Default                 | Description         |
| -------------- | ----------------------- | ------------------- |
| `VITE_API_URL` | `http://localhost:3001` | API server base URL |

Set via a `.env` file in `apps/web/` or inline:

```sh
VITE_API_URL=http://localhost:3001 pnpm dev
```

## Features

- Create, edit, and delete todos
- Drag-and-drop between "To Do" and "Done" lists to toggle completion
- Optimistic UI updates with automatic rollback on API failure
- Client-side title validation
- Confirmation dialog before deletion
- Fade-in/fade-out animations and drag lift effects

## Scripts

| Command        | Description                              |
| -------------- | ---------------------------------------- |
| `pnpm dev`     | Start Vite dev server with hot reload    |
| `pnpm build`   | Type-check and build for production      |
| `pnpm preview` | Preview production build                 |
| `pnpm test`    | Run Vitest tests (property-based + unit) |
| `pnpm lint`    | Lint source files                        |

## Testing

Tests use Vitest + React Testing Library with jsdom. API calls are mocked with MSW. Property-based tests use `fast-check`.

```sh
pnpm test
```

## Tech Stack

- React 18 + TypeScript
- shadcn/ui (Radix UI primitives)
- @dnd-kit/react for drag-and-drop
- Tailwind CSS 4
- Vite
