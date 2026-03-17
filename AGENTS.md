# Agents

This repo is a TanStack Start + Vite + React (TS, ESM) app with Tailwind v4 + shadcn/ui, React Query, and file-based routing.

Non-negotiables

- No comments: do not add `//` or `/* */` comments anywhere.
- No tests for now: do not create new tests; do not spend time writing test scaffolding.

## Commands

Install

```bash
npm install
```

Dev server

```bash
npm run dev
```

Build + preview

```bash
npm run build
npm run preview
```

Typecheck

```bash
npm run typecheck
```

Lint

```bash
npm run lint
npm run lint:fix
```

Lint a single file

```bash
npm run lint -- src/routes/index.tsx
```

Format

```bash
npm run fmt
npm run fmt:check
```

Format a single file

```bash
npm run fmt -- src/routes/index.tsx
```

Tests (currently none; do not add new tests)

```bash
npm run test
```

Run a single test file (when tests exist)

```bash
npm run test -- src/some.test.ts
```

Run a single test by name (when tests exist)

```bash
npm run test -- -t "some test name"
```

## Repository layout

- `src/routes/**`: file-based routes (TanStack Router). Prefer route-level orchestration here.
- `src/routes/__root.tsx`: document shell, global providers (QueryClient, devtools, toaster).
- `src/components/**`: app components.
- `src/components/ui/**`: reusable UI primitives (no feature coupling).
- `src/lib/**`: small utilities and pure-ish logic.
- `src/integrations/**`: framework/tool integrations (React Query provider, devtools).
- `src/routeTree.gen.ts`: generated; do not edit.

## Architecture rules (important)

- Keep UI components pure and reusable.
- Put feature wiring (mapping, orchestration, side effects) in routes/feature components, not `src/components/ui/**`.
- Do not place React Query mutations/queries inside shared UI primitives; keep them at the route/feature level so state/caching does not leak across callers.
- Prefer components that maintain their own local UI state unless the route needs to own it.

## TypeScript and module rules

- ESM project: keep `import`/`export` syntax, no `require`.
- TS is strict (`tsconfig.json`): no implicit `any`, handle `undefined` explicitly.
- Prefer `type` for object unions and props; use `interface` only when extending third-party types is necessary.
- Avoid `as` assertions; if needed, keep them narrow and close to the source of truth.
- Use path aliases: prefer `@/…` over deep relative paths.

## Imports

Import order (keep stable within a file)

1. React (`import * as React from "react"` when using namespaces)
2. third-party packages
3. internal absolute imports (`@/…`)
4. relative imports (`./…`, `../…`)

Other import rules

- Use `import type { … }` for type-only imports.
- Keep imports minimal; remove unused imports (TS + oxlint will enforce).

## React patterns

- Use function components.
- Prefer `useCallback`/`useMemo` only when it prevents real re-renders or stabilizes references passed to external systems.
- Keep effect cleanup correct (e.g., revoke object URLs, cancel timers/raf).
- Avoid storing derived values in state.

## React Query patterns

- QueryClient is provided in `src/integrations/tanstack-query/root-provider.tsx` and is effectively a singleton.
- Put `useQuery`/`useMutation` in route/feature components, not generic UI components.
- Keep mutation functions pure and parameterized; pass inputs explicitly.
- Prefer user-facing error handling (toast) in the calling layer; keep low-level functions throwing Errors.

## Error handling

- Throw `Error` for programmer/logic failures in libraries (`src/lib/**`).
- Handle user-facing failures in UI with a toast or inline message.
- Preserve original error messages when safe; otherwise map to a generic message.
- Avoid swallowing errors in `catch` without reporting.

## Naming conventions

- Components: `PascalCase`.
- Hooks: `useSomething`.
- Variables/functions: `camelCase`.
- Constants: `SCREAMING_SNAKE_CASE` only for true constants; otherwise `camelCase` is fine.
- Files: `kebab-case.tsx` for components in `src/components/ui/**` (existing pattern).
- Types: `PascalCase`; unions/enums-as-const in `UPPER_SNAKE` only when it reads as a domain constant.

## Styling

- Tailwind v4 + shadcn tokens live in `src/styles.css`.
- Prefer Tailwind utility classes for layout/spacing/typography.
- Use `cn(...)` from `src/lib/utils.ts` to merge conditional classes.
- Keep class strings readable; let `oxfmt` handle wrapping.

## Formatting and linting

- Formatter: `oxfmt` (`npm run fmt`). Do not hand-format.
- Linter: `oxlint` (`npm run lint`). Fix with `npm run lint:fix`.
- Do not add lint-disable comments (no comments rule). If a rule blocks progress, change the code.

## Generated and vendor code

- Do not edit `src/routeTree.gen.ts`.
- Avoid editing lockfiles unless the task explicitly changes dependencies.

## Cursor / Copilot rules

- No Cursor rules found (`.cursor/rules/` or `.cursorrules`).
- No Copilot instructions found (`.github/copilot-instructions.md`).
- If these appear later, treat them as higher priority than this file.
