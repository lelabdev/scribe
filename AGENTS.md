# Project: scribe.lelab

SvelteKit 5 application deployed on Cloudflare Workers with Vitest and Playwright testing.

## Build & Test Commands

**Development:**

- `bun dev` - Start dev server
- `bun run build` - Build for production
- `bun run preview` - Preview production build locally (Cloudflare Workers)

**Quality Checks (ALWAYS run before completing tasks):**

- `bun run lint` - Run ESLint and Prettier check
- `bun run format` - Format code with Prettier
- `bun run check` - Type check with svelte-check
- `bun run check:watch` - Type check in watch mode

**Testing:**

- `bun run test` - Run all tests (unit + e2e)
- `bun run test:unit` - Run unit tests with Vitest
- `bun run test:e2e` - Run Playwright e2e tests
- `bun run test:unit <path>` - Run specific unit test file

**Database:**

- `bun run db:generate` - Generate migrations with Drizzle
- `bun run db:migrate` - Run migrations
- `bun run db:studio` - Open Drizzle Studio

**Types:**

- `bun run types` - Generate Cloudflare Workers types
- `bun run prepare` - Generate types and sync SvelteKit

## Code Style Guidelines

### Formatting (Prettier)

- Tabs (not spaces)
- Single quotes
- No trailing commas
- 100 char line width
- Svelte and Tailwind plugins auto-sort classes

### TypeScript

- Strict mode enabled
- No `any` types - create proper interfaces
- All files must pass `pnpm check`
- Use `lang="ts"` in Svelte script blocks

### Svelte 5 Patterns

- Use runes (`$state`, `$props`, `$derived`) instead of stores
- Use `{@render children()}` for slots
- File-based routing: `src/routes/+page.svelte`, `src/routes/+layout.svelte`

### Naming Conventions

- Files: `kebab-case` for components and pages
- Components: PascalCase (`MyComponent.svelte`)
- Test files: `<component>.svelte.spec.ts` (unit), `*.test.ts` (e2e)
- Functions/variables: camelCase

### Imports

- Use `$lib` alias for src/lib: `import { foo } from '$lib/utils'`
- Use `$app` for SvelteKit: `import { page } from '$app/stores'`

### Testing

- **Unit tests**: Use Vitest with vitest-browser-svelte. Pattern: `src/**/*.svelte.spec.ts`
- **E2E tests**: Use Playwright. Pattern: `e2e/*.test.ts`
- Use `describe/it/expect` from vitest for unit tests
- Use `test/expect` from @playwright/test for e2e tests

### Deployment

- Cloudflare Workers via @sveltejs/adapter-cloudflare
- Config in `wrangler.jsonc`

## AI Documentation

- Project brief and AI-related files are stored in the `ai/` directory
- Use these files when working with AI assistants to maintain context and requirements
- **Skeleton UI Documentation**: See `ai/skeleton-ui-docs.txt` for complete reference on all Skeleton UI components, patterns, and usage

## MCP Tools

You have access to Svelte MCP server tools:

### 1. svelte_list-sections

Discover all available Svelte/SvelteKit documentation. Use FIRST when asked about Svelte topics.

### 2. svelte_get-documentation

Fetch full documentation for specific sections. Call after list-sections to get relevant docs.

### 3. svelte_svelte-autofixer

Analyze Svelte code for issues. MUST use before sending Svelte code to user. Repeat until no issues.

### 4. svelte_playground-link

Generate Svelte Playground link. Ask user first, only call after confirmation, never for file writes.
