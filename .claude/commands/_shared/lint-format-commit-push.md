# Shared: Lint, Format, Commit, and Push

This is a shared command fragment. Do not use directly.

## Steps

1. **Get staged files**: Run `git diff --cached --name-only` to list all staged files

2. **ESLint auto-fix**: Process files ONE BY ONE (do NOT batch multiple files):
   - For each staged file with extensions `.ts`, `.tsx`, `.js`, `.jsx`:
     - Run `pnpm exec eslint --cache --cache-location .eslintcache "<file>" --fix`
     - Wait for the command to complete before processing the next file
     - IMPORTANT: Run a separate command for each file, never combine multiple files in one command

3. **Check ESLint warnings**: Process files ONE BY ONE (do NOT batch multiple files):
   - For each staged file with extensions `.ts`, `.tsx`, `.js`, `.jsx`:
     - Run `pnpm exec eslint --cache --cache-location .eslintcache "<file>"`
     - Wait for the command to complete before processing the next file
     - If warnings are found for this file:
       - Analyze the warnings and propose fixes
       - Show the proposed changes to the user
       - Ask for user confirmation before applying the fixes
       - Apply fixes only if user approves
     - IMPORTANT: Run a separate command for each file, never combine multiple files in one command

4. **Prettier formatting**: Process files ONE BY ONE (do NOT batch multiple files):
   - For each staged file with extensions `.ts`, `.tsx`, `.js`, `.jsx`:
     - Run `pnpm exec prettier --write "<file>"`
     - Wait for the command to complete before processing the next file
     - IMPORTANT: Run a separate command for each file, never combine multiple files in one command

5. **Re-stage changes**: Run `git add <files>` to re-stage all modified files

6. **Analyze changes**: Run `git diff --cached` to see all staged changes

7. **Generate commit message**: Analyze the diff output and generate an appropriate commit message following Conventional Commits format:
   - Use prefixes: `feat:`, `fix:`, `refactor:`, `docs:`, `style:`, `test:`, `chore:`
   - Write a concise summary in Japanese
   - Include technical details if significant

8. **Commit**: Run `git commit -m "<generated-message>

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"`

9. **Push**: Run `git push` to push to the remote repository
