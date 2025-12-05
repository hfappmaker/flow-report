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

### 2.2 Naming Conventions

- Directory/file names: kebab-case (e.g., `user-info/`, `user-profile.tsx`, `user-type.ts`)
- Constants: UPPER_SNAKE_CASE
- Variables/functions: camelCase

### 2.3 Coding Standards

- Use TypeScript strict mode
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

Immutability rules are enforced by ESLint:

- Use `const` only (no `let`)
- Use immutable array methods (`map`, `filter`, `reduce`, `toSorted`, `toReversed`)
- Use spread operator for object updates (`{ ...obj, prop: value }`)

### 2.5 Repository Layer Error Handling

**Result Type Pattern:**

- All repository functions must return `Result<T>` type instead of throwing exceptions
- Import from `@/types/result`: `import { Result, ok, err } from "@/types/result"`
- Wrap database operations in try-catch and return error messages
- Do not throw exceptions from repositories; use `err("message")` instead

**Result Type Definition:**

```typescript
type Result<T> = { success: true; data: T } | { success: false; error: string }
```

**Examples:**

```typescript
// Query operation
async function getById(id: string): Promise<Result<Entity | null>> {
  try {
    const entity = await db.entity.findUnique({ where: { id } });
    return ok(entity);
  } catch (error) {
    console.error("Error:", error);
    return err("データの取得に失敗しました");
  }
}

// Create operation with validation
async function create(data: Input): Promise<Result<Entity>> {
  if (!isValid(data)) {
    return err("入力データが不正です");
  }
  try {
    const entity = await db.entity.create({ data });
    return ok(entity);
  } catch (error) {
    console.error("Error:", error);
    return err("データの作成に失敗しました");
  }
}
```

**Consuming Result in Server Actions:**

```typescript
export const createAction = async (data: Input) => {
  const result = await repository.create(data);
  if (!result.success) {
    return { success: false, error: result.error };
  }
  revalidatePath("/path");
  return { success: true, data: result.data };
};
```

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

### Do Not Run ESLint

- Do not run `pnpm exec eslint` or `eslint` directly
- Use `pnpm exec tsc` for type checking instead

### MCP Settings Management

- Manage MCP settings in `.claude/settings.json` (not `.claude/settings.local.json`)
- Commit all MCP configurations to the repository
