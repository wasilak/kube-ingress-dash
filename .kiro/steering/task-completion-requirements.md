# Task Completion Requirements

When implementing tasks from specs, you MUST follow these completion criteria:

## Build Verification
- Always run `npm run build` after implementing code changes
- Fix ALL build errors before marking a task as complete
- Address ALL build warnings before marking a task as complete
- A task is NOT complete if the build fails or produces warnings

## Verification Steps
1. Implement the code changes
2. Run `npm run build` to verify the build succeeds
3. Fix any errors or warnings that appear
4. Re-run the build to confirm all issues are resolved
5. Only then mark the task as complete

## Why This Matters
- Ensures code integrates properly with the existing codebase
- Catches TypeScript errors, import issues, and configuration problems early
- Maintains production-ready code quality
- Prevents broken builds from being committed
