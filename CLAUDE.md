# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run setup          # First-time setup: install deps + generate Prisma client + run migrations
npm run dev            # Start dev server (Turbopack)
npm run build          # Production build
npm run lint           # ESLint
npm test               # Run all tests (Vitest)
npx vitest run src/lib/__tests__/file-system.test.ts  # Run a single test file
npm run db:reset       # Reset and re-run all migrations (destructive)
npx prisma migrate dev # Create and apply a new migration
npx prisma generate    # Regenerate Prisma client after schema changes
```

## Environment Variables

| Variable | Required | Notes |
|---|---|---|
| `ANTHROPIC_API_KEY` | No | If absent, a `MockLanguageModel` returns static code instead of calling Claude |
| `JWT_SECRET` | No | Defaults to `"development-secret-key"` if unset |

## Architecture

**UIGen** is an AI-powered React component generator. Users describe a component in a chat UI; Claude generates code that lives in a **virtual (in-memory) file system** and is previewed live in a sandboxed iframe. Nothing is written to disk.

### Request flow

1. User sends a chat message → `src/app/api/chat/route.ts`
2. Route calls `streamText` (Vercel AI SDK) with the Claude model defined in `src/lib/provider.ts` (`claude-haiku-4-5`)
3. Claude uses two AI tools (`str_replace_editor`, `file_manager` in `src/lib/tools/`) to create/edit files in the virtual FS
4. On stream completion, messages + FS state are persisted to the DB if the user is authenticated
5. The `FileSystemContext` (`src/lib/contexts/file-system-context.tsx`) holds the virtual FS in React state; `PreviewFrame` rebuilds an import map + `srcdoc` HTML to re-render the iframe

### Key architectural pieces

- **Virtual file system** (`src/lib/file-system.ts`): In-memory FS class. All generated code lives here. Serialized to JSON for DB persistence.
- **JSX transformer** (`src/lib/transform/`): Transforms `.jsx`/`.tsx` files to blob URLs using `@babel/standalone` so they can be dynamically imported in the browser preview iframe.
- **AI system prompt** (`src/lib/prompts/`): Defines how Claude should generate React components.
- **Server Actions** (`src/actions/index.ts`): Auth (sign-in/sign-up) and project CRUD.
- **`node-compat.cjs`**: Injected via `NODE_OPTIONS` to delete `globalThis.localStorage`/`sessionStorage` on the server — required for Node 25+ SSR compatibility.

### Auth

Custom JWT auth (no NextAuth). `jose` signs HS256 tokens stored as `httpOnly` cookies (`auth-token`, 7-day expiry). Anonymous users can use the app freely; their work is saved to `sessionStorage` via `src/lib/anon-work-tracker.ts` and migrated into a project on sign-up/sign-in.

### Database

Prisma v7 + SQLite (`prisma/dev.db`). Prisma client is generated to `src/generated/prisma` (non-default path — use this import path, not `@prisma/client`). The `Project.messages` and `Project.data` fields are raw JSON strings (manually stringified/parsed).

The database schema is defined in the `prisma/schema.prisma` file. Reference it anytime you need to understand the structure of data stored in the database.

### Path alias

`@/*` maps to `./src/*` (configured in `tsconfig.json`).

## Code Style

- Use comments sparingly. Only comment complex code.
