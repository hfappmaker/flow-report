# WorkTimeManagementV2 Project Rules for Claude Code

## 1. Development Environment
- Node.js 18+ required
- Use npm as package manager (converted from Yarn)
- Claude Code as the primary development assistant
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
  │   ├── assets       // Feature-specific static files
  │   ├── components   // Feature-specific components
  │   ├── hooks        // Feature-specific custom hooks
  │   ├── libs         // Feature-specific libraries (initialization, config, non-data-fetching code)
  │   ├── repositories // Feature-specific repositories
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
  - Use short, intuitive, descriptive names (S-I-D principle)
  - Avoid contractions
  - Context order affects variable meaning
  - Function verb pairs: get/set, remove/add, delete/create, handle (for event handlers)
  - Use singular/plural appropriately
  - Use prefixes only when they emphasize variable meaning

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
- Manage environment variables in `.env` files
- Don't import Prisma runtime libraries (e.g., `import { Decimal } from "@prisma/client/runtime/library"`)

## 3. Git Workflow
### 3.1 Branch Strategy
- `main`: Production branch
- `develop`: Development branch
- `feature/*`: Feature development branches
- `hotfix/*`: Emergency bug fix branches

### 3.2 Commit Messages
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only changes
- `style`: Code changes that don't affect meaning (whitespace, formatting, etc.)
- `refactor`: Refactoring
- `test`: Adding or modifying test code
- `chore`: Build process or tool changes

### 3.3 Pull Requests
- Review required
- Ensure tests pass
- Resolve conflicts
- Include appropriate descriptions and screenshots

## 4. Security
- Manage environment variables in `.env` files
- Never commit sensitive information to Git
- Properly encrypt and store authentication credentials
- Prioritize security updates

## 5. Performance
- Optimize images
- Use code splitting
- Prevent unnecessary re-renders
- Optimize bundle size

## 6. Testing
- Write at least one test case per function
- Don't use Tailwind classes for element selection in tests
- Implement component tests whenever possible
- Implement E2E tests for critical user flows

## 7. Deployment
- Production deployments require approval process
- Run tests before deployment
- Prepare rollback procedures

## 8. Documentation
- Keep README updated
- Update API specifications
- Record important changes in CHANGELOG
- Add comments when necessary

## Claude Code Specific Instructions
- Always run linting and type checking after code changes
- Use the project's existing testing framework (check package.json or codebase)
- Maintain the existing code style and patterns
- Follow the folder structure when creating new files
- Use TypeScript strict mode and avoid `any` types
- Prioritize editing existing files over creating new ones

### Files to Ignore
Claude Code should avoid processing these files and directories:
- `node_modules/` - Package dependencies
- `.next/` - Next.js build output
- `dist/` - Distribution/build files
- `build/` - Build output
- `coverage/` - Test coverage reports
- `.env*` - Environment variable files
- `*.log` - Log files