# flow-report Project Rules for Claude Code

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

**Database Access Rules:**

- Server Actions must NOT access the database directly; always go through repository layer
- Create feature-specific repository files (e.g., `features/user-info/repositories/user-info-repository.ts`)
- Place shared repositories in `src/repositories/`

**Result Type Pattern:**

- All repository functions must return `Result<T>` type instead of throwing exceptions
- Import from `@/types/result`: `import { Result, ok, err } from "@/types/result"`
- Wrap database operations in try-catch and return error messages
- Do not throw exceptions from repositories; use `err("message")` instead

**Result Type Definition:**

```typescript
type Result<T> = { success: true; data: T } | { success: false; error: string };
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

### 2.6 Form Creation Rules

**Always use `react-hook-form` + `zodResolver` pattern for forms:**

- Do NOT use individual `useState` for each form field
- Do NOT manually validate form data without Zod schema
- Always define validation schema in `features/[feature]/schemas/` directory
- Always use `@/components/ui/form` components (`Form`, `FormField`, `FormControl`, `FormMessage`)

**Required imports:**

```typescript
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  myFormSchema,
  MyFormValues,
} from "@/features/[feature]/schemas/my-form-schema";
```

**Required pattern:**

```typescript
// 1. Initialize form with zodResolver
const form = useForm<MyFormValues>({
  resolver: zodResolver(myFormSchema),
  defaultValues: {
    fieldName: initialValue ?? "",
  },
});

// 2. Handle submit with safeParse validation
const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  const values = form.getValues();
  const result = myFormSchema.safeParse(values);
  if (!result.success) {
    result.error.issues.forEach((issue) => {
      const path = issue.path[0] as keyof MyFormValues;
      form.setError(path, { message: issue.message });
    });
    return;
  }
  // Proceed with validated data: result.data
};

// 3. Use FormField for each input
<Form {...form}>
  <form onSubmit={handleFormSubmit}>
    <FormField
      control={form.control}
      name="fieldName"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Label</FormLabel>
          <FormControl>
            <Input {...field} value={field.value ?? ""} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </form>
</Form>
```

**Reference implementation:** `src/features/contract/components/contract-form.tsx`

### 2.7 Loading Processing Rules

**Always use `useTransitionContext` for loading handling:**

- Import from `@/contexts/transition-context`: `import { useTransitionContext } from "@/contexts/transition-context"`
- Do NOT use `useState` for individual loading states
- Do NOT use `useTransition` directly from React
- Do NOT implement custom loading spinners or overlays
- Exception: Only deviate from this rule when the user explicitly requests a different approach

**Required pattern for server actions and async operations:**

```typescript
const { isPending, startTransition } = useTransitionContext();

const handleAction = () => {
  startTransition(async () => {
    const result = await serverAction(data);
    // Handle result...
  });
};

// Use isPending to disable buttons during loading
<Button onClick={handleAction} disabled={isPending}>
  Submit
</Button>
```

**What `useTransitionContext` provides:**

- `startTransition`: Wraps async operations and automatically manages loading state
- `isPending`: Boolean indicating loading state (use for disabling UI elements)
- `setManualPending`: For manual loading control in special cases

### 2.8 UI Component Usage Rules

**Always use components from `src/components/ui/`:**

- Do NOT create custom implementations of basic UI components
- Do NOT use native HTML elements directly when a UI component exists
- Always import from `@/components/ui/` for the following components:

| Component           | Import Path                     |
| ------------------- | ------------------------------- |
| Button              | `@/components/ui/button`        |
| Input               | `@/components/ui/input`         |
| Label               | `@/components/ui/label`         |
| Checkbox            | `@/components/ui/checkbox`      |
| Select              | `@/components/ui/select`        |
| Textarea            | `@/components/ui/textarea`      |
| Dialog              | `@/components/ui/dialog`        |
| Card                | `@/components/ui/card`          |
| Badge               | `@/components/ui/badge`         |
| Avatar              | `@/components/ui/avatar`        |
| Tabs                | `@/components/ui/tabs`          |
| Switch              | `@/components/ui/switch`        |
| RadioGroup          | `@/components/ui/radio-group`   |
| DatePicker          | `@/components/ui/date-picker`   |
| TimePicker          | `@/components/ui/time-picker`   |
| DropdownMenu        | `@/components/ui/dropdown-menu` |
| Sheet               | `@/components/ui/sheet`         |
| Popover             | `@/components/ui/popover`       |
| Form components     | `@/components/ui/form`          |
| Loading components  | `@/components/ui/loading`       |
| Feedback components | `@/components/ui/feedback`      |

**Examples:**

```typescript
// ✅ Good
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// ❌ Bad - using native HTML elements
<button onClick={...}>Submit</button>
<input type="text" />
<label>Name</label>

// ❌ Bad - creating custom component when UI component exists
const CustomButton = styled.button`...`;
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

### Communication Language

**CRITICAL: All communication with users must be in Japanese:**

- All responses, explanations, and messages to the user must be written in Japanese
- Code comments should be in Japanese when explaining implementation
- Error messages and warnings should be in Japanese
- Commit messages must use English prefixes (feat, fix, docs, etc.) but descriptions should be in Japanese (e.g., `feat: ユーザー認証機能を追加`)
- Exception: Code itself (variable names, function names, etc.) should follow English naming conventions as specified in section 2.2
- Exception: Technical terms that are commonly used in English (e.g., "repository", "component") can remain in English within Japanese sentences

### Do Not Run ESLint

- Do not run `pnpm exec eslint` or `eslint` directly
- Use `pnpm exec tsc` for type checking instead

### MCP Settings Management

- Manage MCP settings in `.claude/settings.json` (not `.claude/settings.local.json`)
- Commit all MCP configurations to the repository
