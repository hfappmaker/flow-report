# WorkTimeManagementV2 Project Rules for Claude Code

## 1. Development Environment

- Node.js 18+ required
- Use pnpm as package manager
- DevContainer for unified development environment

## 2. Code Standards

### 2.1 Folder Structure

```
src/
  ├── app              // Routing components
  │   ├── api          // API definitions (organized by feature)
  ├── assets           // Static files (images, fonts, etc.)
  ├── components       // Generic components (buttons, labels, text boxes, etc.)
  ├── config           // Global configuration and environment variables
  ├── features         // Feature modules with subfolders as needed:
  │   ├── actions      // Feature-specific server actions
  │   ├── assets       // Feature-specific static files
  │   ├── components   // Feature-specific components
  │   ├── hooks        // Feature-specific custom hooks
  │   ├── libs         // Feature-specific libraries (initialization, config, non-data-fetching code)
  │   ├── repositories // Feature-specific repositories
  │   ├── schemas      // Feature-specific validation schemas (Zod, etc.)
  │   ├── stores       // Feature-specific state management
  │   ├── testing      // Feature-specific test utilities and mocks
  │   ├── types        // Feature-specific type definitions
  │   └── utils        // Feature-specific utility pure functions
  ├── hooks            // Generic hooks
  ├── libs             // Generic libraries (initialization, config, non-data-fetching code)
  ├── repositories     // Generic repositories
  ├── stores           // App-wide shared state management stores
  ├── testing          // Generic test utilities and mocks
  ├── types            // App-wide type definitions
  └── utils            // Generic utility pure functions
```

**Important Notes:**

- Only include necessary folders in each feature module
- Avoid barrel files to prevent tree-shaking issues; use direct imports
- Use ESLint rules to restrict cross-feature imports and maintain unidirectional code structure

### 2.2 Naming Conventions

- Directory/file names: kebab-case (e.g., `user-info/`, `user-profile.tsx`, `user-type.ts`)
- Constants: UPPER_SNAKE_CASE
- Variables/functions: camelCase

### 2.3 Coding Standards

- Use TypeScript strict mode
- Follow ESLint and Prettier configurations
- Prefer function components
- Explicitly define Props types
- Avoid `any` type (except when using libraries where unavoidable - add comments explaining why)
- Avoid type assertions with `as`
- Use TailwindCSS classes instead of custom CSS
- Define reusable styles in tailwind.config
- Don't use `<br />` for line breaks
- Manage environment variables in `.env` files (never commit sensitive information)
- Don't import Prisma runtime libraries (e.g., `import { Decimal } from "@prisma/client/runtime/library"`)
- Don't use Tailwind classes for element selection in tests

### 2.4 Functional Programming Standards

**CRITICAL: Claude Code must strictly adhere to these functional programming principles when writing code:**

- **NEVER use `let` for variable declarations** - always use `const`
- **NEVER use mutable array methods** such as:
  - `array.push()` → use `[...array, newItem]` or `array.concat(newItem)`
  - `array.pop()` → use `array.slice(0, -1)`
  - `array.shift()` → use `array.slice(1)`
  - `array.unshift()` → use `[newItem, ...array]`
  - `array.splice()` → use `array.slice()` and spread operator
  - `array.sort()` → use `[...array].sort()` or `array.toSorted()`
  - `array.reverse()` → use `[...array].reverse()` or `array.toReversed()`
- **NEVER reassign object properties** - use spread operator or object methods:
  - Instead of `obj.prop = value`, use `{ ...obj, prop: value }`
  - Instead of `delete obj.prop`, use object destructuring with rest
- **Use immutable patterns**:
  - Array transformations: `map()`, `filter()`, `reduce()`, `slice()`, `concat()`
  - Object transformations: spread operator `{...}`, `Object.assign()` (creating new objects)
  - Modern immutable methods: `toSorted()`, `toReversed()`, `toSpliced()`, `with()`
- **Exceptions** (allowed by ESLint configuration):
  - React refs: `ref.current = value`
  - React component displayName: `Component.displayName = "Name"`

**Rationale**: Functional programming with immutable data structures leads to:

- More predictable and testable code
- Easier debugging and reasoning about code behavior
- Prevention of unintended side effects
- Better compatibility with React's rendering model

ESLint will warn about violations of these rules. Claude Code must write code that produces zero warnings.

## 3. Commit Messages

Use conventional commit prefixes:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only changes
- `style`: Code changes that don't affect meaning (whitespace, formatting, etc.)
- `refactor`: Refactoring
- `test`: Adding or modifying test code
- `chore`: Build process or tool changes

## 4. Claude Code Specific Instructions

### ESLint実行の禁止

**Claude CodeはESLintを実行してはいけません。**

- `pnpm exec eslint` を実行しない
- `eslint` コマンドを直接実行しない

コード品質の確認が必要な場合は、TypeScriptの型チェック（`pnpm exec tsc`）を使用してください。

### 一般的な指針

- Maintain the existing code style and patterns
- Follow the folder structure when creating new files
- Prioritize editing existing files over creating new ones
- Use the project's existing testing framework (check package.json or codebase)

### MCP Settings Management

- **ALWAYS** manage MCP permissions and settings in `.claude/settings.json` for repository-wide sharing
- **NEVER** create or modify `.claude/settings.local.json` files
- All MCP server configurations and permissions must be committed to the repository
- When adding new MCP permissions, update `.claude/settings.json` directly
- This ensures consistent MCP settings across all team members and environments

### Files to Ignore

Claude Code should avoid processing these files and directories:

- `node_modules/` - Package dependencies
- `.next/` - Next.js build output
- `dist/` - Distribution/build files
- `build/` - Build output
- `coverage/` - Test coverage reports
- `.env*` - Environment variable files
- `*.log` - Log files
- `test-results/` - Playwright test results
- `playwright-report/` - Playwright HTML reports
- `prisma/migrations/` - Database migration files
- `.git/` - Git repository data
- `*.lock` - Lock files (package-lock.json, yarn.lock)

# Important Instruction Reminders

Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (\*.md) or README files. Only create documentation files if explicitly requested by the User.
