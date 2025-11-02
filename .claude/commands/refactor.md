# Refactor with Investigation and Planning

リファクタリング対象を調査し、planモードで実行計画を立ててからリファクタリングを実施します。

## Command

**IMPORTANT: You MUST execute this command in PLAN MODE. Follow these steps:**

1. **Investigation Phase - Use refactoring-investigator agent**:
   - Launch the `refactoring-investigator` agent to analyze the specified code area
   - If no specific area is provided, ask the user which area to investigate:
     - Specific feature (e.g., `src/features/attendance`)
     - Specific files or components
     - Entire codebase (use with caution)
   - Wait for the investigation report before proceeding

2. **Review Investigation Results**:
   - Present the agent's findings to the user
   - Highlight the top priority issues (🔴 Critical and 🟠 High priority)
   - Ask the user which refactoring items they want to address:
     - Option 1: Address all critical and high priority issues
     - Option 2: Select specific issues from the report
     - Option 3: Focus on a particular category (e.g., only code duplication)

3. **Enter Plan Mode**:
   - **CRITICAL**: Switch to plan mode to create a detailed refactoring plan
   - Use the ExitPlanMode tool to present your plan
   - Your plan MUST include:
     - **Scope**: What will be refactored
     - **Approach**: How each issue will be addressed
     - **Steps**: Detailed step-by-step breakdown
     - **Impact Analysis**: Which files will be changed
     - **Risk Assessment**: Potential breaking changes
     - **Testing Strategy**: How to verify the refactoring
   - Wait for user approval before proceeding

4. **Execute Refactoring** (only after plan approval):
   - Follow the approved plan step by step
   - Use TodoWrite to track progress
   - For each refactoring step:
     - Mark todo as in_progress before starting
     - Make the changes
     - Mark todo as completed after finishing
   - Apply project coding standards from CLAUDE.md:
     - Maintain TypeScript strict mode
     - Avoid `any` types
     - Use TailwindCSS only
     - Follow folder structure rules
     - Use function components
     - Follow naming conventions

5. **Verification**:
   - Run TypeScript type checking: `npx tsc --noEmit`
   - Run ESLint: `npx eslint <changed-files> --fix`
   - Run Prettier: `npx prettier --write <changed-files>`
   - If tests exist, suggest running them: `npm test`

6. **Summary Report**:
   - List all files changed
   - Summarize what was refactored
   - Highlight any remaining issues not addressed
   - Suggest next steps if applicable

## Important Rules

- **ALWAYS use plan mode** - Never skip the planning phase
- **ALWAYS use the refactoring-investigator agent first** - Don't guess what needs refactoring
- **ALWAYS wait for user approval** before executing the plan
- **NEVER make changes without a plan** - Investigation → Plan → Approval → Execution
- **Track progress with TodoWrite** - Keep the user informed
- Use serena's symbolic editing tools when possible (replace_symbol_body, insert_after_symbol, etc.)
- Avoid reading entire files unless necessary
- Focus on one issue at a time

## Description

このコマンドは以下の3段階でリファクタリングを実行します：

1. **調査フェーズ** - refactoring-investigatorエージェントによる分析
2. **計画フェーズ** - planモードで詳細な実行計画を作成（必須）
3. **実行フェーズ** - ユーザー承認後、計画に従って実施

## Usage

```
/refactor
```

または対象を指定：

```
/refactor src/features/attendance
```

## Benefits

- **安全性**: 必ず計画を立ててから実行（plan mode必須）
- **体系的**: エージェントによる徹底的な調査
- **透明性**: 何をどう変更するか事前に明確化
- **制御性**: ユーザーが承認してから実行
- **追跡可能**: TodoWriteで進捗を可視化
- **品質保証**: 変更後にlint/formatを自動実行

## Workflow Example

```
User: /refactor src/features/attendance
↓
Step 1: Launch refactoring-investigator agent
  → Agent analyzes code and reports findings

Step 2: Review results with user
  → Highlight critical issues
  → User selects what to address

Step 3: ENTER PLAN MODE (using ExitPlanMode tool)
  → Create detailed refactoring plan
  → User reviews and approves

Step 4: Execute refactoring
  → Follow plan step by step
  → Track with TodoWrite
  → Make changes using symbolic tools

Step 5: Verification
  → Run tsc, eslint, prettier
  → Suggest testing

Step 6: Summary report
  → List changes made
  → Highlight remaining issues
```

## Notes

- **Plan modeは必須** - スキップ不可
- **調査なしの実行は禁止** - 必ずエージェントで調査
- **ユーザー承認が必須** - 計画承認後に実行
- 大規模なリファクタリングは複数回に分けることを推奨
- テストがある場合は必ず実行を推奨
- プロジェクトのコーディング規約（CLAUDE.md）を厳守
