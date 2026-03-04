# Todo App — Turborepo Monorepo

A full-stack TODO application built on a Turborepo monorepo with an Express.js API backend (MongoDB) and a React frontend (shadcn/ui, drag-and-drop).

## Project Structure

```
apps/
  api/    — Express.js REST API with MongoDB/Mongoose
  web/    — React SPA with shadcn/ui and @dnd-kit drag-and-drop
packages/
  ui/             — Shared component library
  eslint-config/  — Shared ESLint configuration
  typescript-config/ — Shared TypeScript configuration
```

## Prerequisites

- Node.js >= 18
- pnpm 8.x
- MongoDB (local instance or connection string)

## Setup

1. Install dependencies:

```sh
pnpm install
```

2. Configure environment variables:

```sh
cp apps/api/.env.example apps/api/.env
# Edit apps/api/.env with your MongoDB connection string
```

3. Start MongoDB (if running locally):

```sh
mongod
```

## Scripts

| Command       | Description                        |
| ------------- | ---------------------------------- |
| `pnpm dev`    | Start all apps in development mode |
| `pnpm build`  | Build all apps and packages        |
| `pnpm test`   | Run tests across all apps          |
| `pnpm lint`   | Lint all apps and packages         |
| `pnpm format` | Format code with Prettier          |

## Apps

### API (`apps/api`)

REST API server at `http://localhost:3001` with Swagger docs at `/api-docs`. See [apps/api/README.md](apps/api/README.md).

### Web (`apps/web`)

React frontend at `http://localhost:5173` with drag-and-drop todo management. See [apps/web/README.md](apps/web/README.md).

## Tech Stack

- **Monorepo**: Turborepo + pnpm workspaces
- **Backend**: Express.js, Mongoose, Swagger/OpenAPI
- **Frontend**: React, shadcn/ui, @dnd-kit/react, Tailwind CSS
- **Testing**: Jest + Supertest (API), Vitest + React Testing Library (Web), fast-check (property-based)
- **Language**: TypeScript throughout
