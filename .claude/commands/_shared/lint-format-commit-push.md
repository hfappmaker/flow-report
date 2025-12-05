# Shared: Format, Commit, and Push

This is a shared command fragment. Do not use directly.

## Steps

1. **Get staged files**: Run `git diff --cached --name-only` to list all staged files

2. **Prettier formatting**: Process files ONE BY ONE (do NOT batch multiple files):
   - For each staged file with extensions `.ts`, `.tsx`, `.js`, `.jsx`:
     - Run `pnpm exec prettier --write "<file>"`
     - Wait for the command to complete before processing the next file
     - IMPORTANT: Run a separate command for each file, never combine multiple files in one command

3. **Re-stage changes**: Run `git add <files>` to re-stage all modified files

4. **Analyze changes**: Run `git diff --cached` to see all staged changes

5. **Generate commit message**: Analyze the diff output and generate an appropriate commit message following Conventional Commits format:
   - Use prefixes: `feat:`, `fix:`, `refactor:`, `docs:`, `style:`, `test:`, `chore:`
   - Write a concise summary in Japanese
   - Include technical details if significant

6. **Commit**: Run `git commit -m "<generated-message>

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"`

7. **Push**: Run `git push` to push to the remote repository
