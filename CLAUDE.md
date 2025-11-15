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
