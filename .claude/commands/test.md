# Test Commands - SuperCollider MCP Server

## Primary Test Command

```bash
npm test
```

### Alias
```bash
npm run test
```

### What It Does
- Executes Vitest test runner
- Runs all `*.test.ts` files in the project
- Uses in-memory MCP transport (no real SuperCollider process)
- Exits with appropriate status code

## Vitest Direct Commands

### Run All Tests
```bash
npx vitest
```

### Run Specific Test File
```bash
npx vitest src/index.test.ts
```

### Run Tests Matching Pattern
```bash
# By test name
npx vitest -t "sine wave"

# By file pattern
npx vitest index
```

## Development Testing

### Watch Mode
```bash
npx vitest --watch
```
*Reruns tests on file changes*

### UI Mode
```bash
npx vitest --ui
```
*Opens browser-based test UI*

### Single Run with Details
```bash
npx vitest --run --reporter=verbose
```

## Test Coverage

### Generate Coverage Report
```bash
npx vitest --coverage
```
*Note: Requires @vitest/coverage-v8 (not installed)*

### Install Coverage Support
```bash
npm install -D @vitest/coverage-v8
npx vitest --coverage
```

## Debugging Tests

### Show Console Output
```bash
npx vitest --no-silent
```

### Run Single Test
```typescript
// In test file, temporarily add:
it.only("test name", async () => {
  // This test only
});
```

### Skip Failing Test
```typescript
// In test file:
it.skip("broken test", async () => {
  // Skipped
});
```

## Test Output Examples

### Successful Run
```
 ✓ src/index.test.ts (2)
   ✓ synth-execute (1)
     ✓ Check if sine wave is output
   ✓ multi-synth-execute (1)
     ✓ Check if sine wave and noise are output

 Test Files  1 passed (1)
      Tests  2 passed (2)
   Start at  14:32:15
   Duration  523ms
```

### Failed Test
```
 ❯ src/index.test.ts (2)
   ❯ synth-execute (1)
     × Check if sine wave is output
       → expected { content: [ { type: 'text',…
   ✓ multi-synth-execute (1)
```

## Environment Variables

### Debug Vitest
```bash
DEBUG=vitest:* npm test
```

### Disable Colors
```bash
NO_COLOR=1 npm test
```

## Test Filtering

### By Test Suite
```bash
# Run only "synth-execute" describe block
npx vitest -t "synth-execute"
```

### By File Path
```bash
# Run tests in specific directory
npx vitest src/

# Exclude pattern
npx vitest --exclude "**/node_modules/**"
```

## Performance Testing

### Show Test Duration
```bash
npx vitest --reporter=verbose
```

### Benchmark Mode
```bash
# Add benchmark tests first, then:
npx vitest bench
```

## CI/CD Test Commands

### For GitHub Actions
```bash
npm ci
npm run build
npm test -- --run --reporter=json > test-results.json
```

### For Pre-commit Hook
```bash
npm test -- --run --changed
```

## Common Test Scenarios

### After Code Changes
```bash
# Quick test of changed files
npx vitest --run --changed

# Full test suite
npm test
```

### Before Commit
```bash
# Build and test
npm run build && npm test
```

### During Development
```bash
# Terminal 1: Watch mode
npx vitest --watch

# Terminal 2: Make changes
code src/index.ts
```

## Troubleshooting

### Tests Hanging
```bash
# Kill any zombie processes
pkill -f sclang

# Run with timeout
npx vitest --test-timeout=10000
```

### Import Errors
```bash
# Check TypeScript compilation
npx tsc --noEmit

# Rebuild
npm run build
```

### Assertion Failures
```bash
# See full diff
npx vitest --reporter=verbose --no-truncate
```

## Test Configuration

### Current Setup
- **Framework**: Vitest
- **No config file**: Uses defaults
- **Test pattern**: `**/*.test.ts`
- **Transform**: TypeScript via esbuild

### Add Configuration (if needed)
```javascript
// vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    testTimeout: 30000,
    globals: true,
  },
})
```

## Related Commands

- Build before testing: `npm run build`
- Clean build: `rm -rf build/`
- Check types: `npx tsc --noEmit`