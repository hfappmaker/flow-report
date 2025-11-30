# Sync Serena Memories

Serenaのメモリーが現在のコードベースに追従しているか確認し、必要に応じて更新します。

## Command

**IMPORTANT: Follow these steps carefully:**

1. **List and Read Current Memories**:
   - Use `mcp__serena__list_memories` to get all available memories
   - Read each memory using `mcp__serena__read_memory`

2. **Gather Current Codebase State**:
   For each memory type, gather relevant information:

   **For `project_overview`**:
   - Read `package.json` for current versions (React, Next.js, TypeScript, etc.)
   - List `src/features/` directory to get current feature modules
   - Check for any major architectural changes

   **For `code_style_conventions`**:
   - Read `CLAUDE.md` for current coding standards
   - Read `eslint.config.mjs` for linting rules
   - Check `tsconfig.json` for TypeScript settings

   **For `suggested_commands`**:
   - Read `package.json` scripts section
   - List `.claude/commands/` for custom Claude commands

   **For `task_completion_checklist`**:
   - Verify commands and checks are still valid
   - Cross-reference with `CLAUDE.md` requirements

3. **Compare and Identify Differences**:
   For each memory, compare the stored content with the current state:
   - List all differences found
   - Categorize as: Added, Removed, Changed, or Outdated
   - Prioritize by importance (Critical, Important, Minor)

4. **Report Findings to User**:
   Present a summary table:
   ```
   | Memory Name              | Status    | Changes Needed |
   |--------------------------|-----------|----------------|
   | project_overview         | Outdated  | 3 items        |
   | code_style_conventions   | Current   | None           |
   | ...                      | ...       | ...            |
   ```

   For each memory with changes, detail:
   - What is outdated/missing/incorrect
   - What the current correct value should be

5. **Ask for User Confirmation**:
   - Present the proposed updates
   - Ask: "Should I update these memories? (all/select/none)"
   - Wait for user response before proceeding

6. **Update Memories** (only after confirmation):
   - Use `mcp__serena__edit_memory` for minor changes
   - Use `mcp__serena__write_memory` for major rewrites
   - Report each update as it completes

7. **Verification**:
   - Re-read updated memories to confirm changes
   - Present final summary

## Memory Validation Rules

### project_overview
Must include:
- Accurate version numbers from package.json
- Complete list of feature modules from src/features/
- Current technology stack
- Deployment information

### code_style_conventions
Must match:
- CLAUDE.md coding standards
- ESLint configuration rules
- TypeScript strict mode settings
- Naming conventions in use

### suggested_commands
Must include:
- All scripts from package.json
- All custom Claude commands from .claude/commands/
- Development, build, test, and database commands

### task_completion_checklist
Must reflect:
- Current lint/format/test commands
- CLAUDE.md quality requirements
- Git workflow expectations

## Usage

```
/sync-serena-memories
```

## Notes

- This command is read-only until user confirms updates
- Critical differences (version mismatches, missing features) are highlighted
- Memories are updated incrementally to preserve formatting
- Always verify updates after writing
