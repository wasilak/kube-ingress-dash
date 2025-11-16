# Task Completion Requirements

When implementing tasks from specs, you MUST follow these completion criteria:

## Critical Thinking After Implementation
- After completing any task implementation, ALWAYS critically evaluate whether the code is functional or dead code
- Ask yourself: "Is this code actually being used anywhere in the application?"
- Verify integration points: Check if the implemented functionality is imported and called
- Search the codebase for actual usage of new classes, functions, or modules
- If code is not integrated, identify ALL places where it should be used and integrate it fully
- Don't just implement infrastructure - ensure it's wired into the application flow
- Reference your steering rules to ensure you're following best practices

## Build Verification
- Always run `npm run build` after implementing code changes
- Fix ALL build errors before marking a task as complete
- Address ALL build warnings before marking a task as complete
- A task is NOT complete if the build fails or produces warnings

## Git Commit Requirement
- After each task is approved and completed by the user, commit the changes
- Use a descriptive commit message that includes:
  - Type prefix (feat:, fix:, refactor:, etc.)
  - Brief description of what was implemented
  - Reference to the task number or name
- Stage all relevant files before committing
- Example: `feat: enhance TypeScript type safety\n\nTask: 2. Enhance TypeScript Type Safety`

## Verification Steps
1. Implement the code changes
2. Run `npm run build` to verify the build succeeds
3. Fix any errors or warnings that appear
4. Re-run the build to confirm all issues are resolved
5. Mark the task as complete
6. After user approval, commit the changes with a descriptive message

## Why This Matters
- Ensures code integrates properly with the existing codebase
- Catches TypeScript errors, import issues, and configuration problems early
- Maintains production-ready code quality
- Prevents broken builds from being committed
- Creates a clear history of task completion
- Makes it easy to track progress and revert changes if needed
