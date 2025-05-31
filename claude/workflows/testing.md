# Testing Workflows - SuperCollider MCP Server

## Testing Framework

### Vitest Configuration
- **Framework**: Vitest (v3.1.1+)
- **Test Pattern**: `*.test.ts` files
- **Location**: Alongside source in `src/`
- **No Config File**: Uses Vitest defaults

## Test Structure Pattern

### Basic Test Template
```typescript
import { describe, it, expect } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { server } from "./index.js";

describe("tool-name", () => {
  it("description of behavior", async () => {
    // Setup
    const client = new Client({
      name: "test client",
      version: "0.1.0",
    });

    // Transport
    const [clientTransport, serverTransport] = 
      InMemoryTransport.createLinkedPair();
    
    // Connect
    await Promise.all([
      client.connect(clientTransport),
      server.connect(serverTransport),
    ]);

    // Execute
    const result = await client.callTool({
      name: "tool-name",
      arguments: { /* ... */ }
    });

    // Assert
    expect(result).toEqual({ /* ... */ });
  });
});
```

## Current Test Suite

### Single Synth Test (`synth-execute`)
```typescript
describe("synth-execute", () => {
  it("Check if sine wave is output", async () => {
    // Tests:
    // - Tool accepts synth object with name and code
    // - Duration parameter works (500ms)
    // - Response format matches expected structure
    // - Code formatting preserved in response
  });
});
```

### Multi-Synth Test (`multi-synth-execute`)
```typescript
describe("multi-synth-execute", () => {
  it("Check if sine wave and noise are output", async () => {
    // Tests:
    // - Tool accepts array of synths
    // - Multiple synths can be specified
    // - Synth names listed in response
    // - Count reported correctly
  });
});
```

## Running Tests

### Command Line Options
```bash
# Run all tests
npm test

# Run specific test file
npx vitest src/index.test.ts

# Run tests matching pattern
npx vitest -t "sine wave"

# Watch mode
npx vitest --watch

# With coverage
npx vitest --coverage

# Verbose output
npx vitest --reporter=verbose
```

## Test Design Patterns

### 1. In-Memory Transport
- No actual STDIO communication
- No real SuperCollider process spawned
- Tests MCP protocol layer only

### 2. Exact Output Matching
```typescript
expect(result).toEqual({
  content: [
    {
      type: "text",
      text: "Synth name: test-synth",
    },
    {
      type: "text",
      text: `Code: ${expectedCode}`,  // Exact whitespace match
    },
    {
      type: "text",
      text: "Playback duration: 0.5 seconds",
    },
  ],
});
```

### 3. Short Duration Tests
- Test durations: 500ms (0.5 seconds)
- Keeps test suite fast
- Still exercises timing logic

## Test Data Patterns

### Synth Code Examples
```javascript
// Simple sine wave
{
    arg freq = 440;
    var sig = SinOsc.ar(freq);
    Out.ar(0, sig);
}

// White noise
{
    var sig = WhiteNoise.ar;
    Out.ar(0, sig);
}
```

### Test Naming Convention
- Synths named: `"test-synth"`, `"noise-synth"`
- Descriptive test names: "Check if X is output"

## Writing New Tests

### 1. Tool Behavior Tests
```typescript
it("should handle missing optional parameters", async () => {
  const result = await client.callTool({
    name: "synth-execute",
    arguments: {
      synth: { name: "test", code: "{...}" }
      // duration omitted - should use default
    }
  });
  
  expect(result.content[2].text).toContain("5 seconds"); // Default
});
```

### 2. Error Handling Tests
```typescript
it("should handle invalid synth code gracefully", async () => {
  const result = await client.callTool({
    name: "synth-execute",
    arguments: {
      synth: { 
        name: "bad-synth", 
        code: "invalid code" 
      }
    }
  });
  
  expect(result.content[0].text).toContain("An error occurred");
});
```

### 3. Edge Case Tests
```typescript
it("should handle empty synth array", async () => {
  const result = await client.callTool({
    name: "multi-synth-execute",
    arguments: {
      synths: []
    }
  });
  
  expect(result.content[0].text).toContain("0 synths");
});
```

## Test Limitations

### What's NOT Tested
1. **Actual Audio Output**: No SuperCollider process in tests
2. **Process Management**: Cleanup logic not exercised
3. **Platform-Specific Code**: Windows vs Unix paths
4. **Error Log Creation**: File system operations
5. **Real Timing**: setTimeout behavior mocked

### Potential Test Improvements
```typescript
// Integration test example (not implemented)
describe("integration", () => {
  it("should actually produce audio", async () => {
    // Would require:
    // - Real SC server
    // - Audio capture
    // - Frequency analysis
  });
});
```

## Debugging Test Failures

### 1. Verbose Output
```bash
# See detailed test execution
npx vitest --reporter=verbose

# See console.error output
npx vitest --no-silent
```

### 2. Focused Testing
```typescript
// Run only this test
it.only("specific test", async () => {
  // ...
});

// Skip this test
it.skip("broken test", async () => {
  // ...
});
```

### 3. Debug Output
```typescript
it("debug test", async () => {
  const result = await client.callTool({...});
  
  // Debug helpers
  console.log("Result:", JSON.stringify(result, null, 2));
  console.log("Content length:", result.content.length);
  
  expect(result).toBeDefined();
});
```

## CI/CD Considerations

### Pre-commit Checks
```bash
# Run before committing
npm run build && npm test
```

### GitHub Actions (if added)
```yaml
- name: Test
  run: |
    npm ci
    npm run build
    npm test
```

## Best Practices

1. **Test Names**: Describe expected behavior, not implementation
2. **Fast Tests**: Keep durations short (< 1 second)
3. **Isolated Tests**: Each test independent, no shared state
4. **Exact Assertions**: Match response format precisely
5. **Edge Cases**: Test defaults, empty inputs, errors
6. **No Side Effects**: Tests shouldn't create files or processes