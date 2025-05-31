# SuperCollider MCP Test Generation Instructions

## Test File Structure

### Basic Test Template
```typescript
import { describe, it, expect } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { server } from "./index.js";

describe("tool-name", () => {
  it("Check if [expected behavior]", async () => {
    // Test implementation
  });
});
```

### Test Setup Pattern
```typescript
const client = new Client({
  name: "test client",
  version: "0.1.0",
});

const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

await Promise.all([
  client.connect(clientTransport),
  server.connect(serverTransport),
]);
```

## Test Cases

### Basic Tool Test
```typescript
it("Check if synth executes successfully", async () => {
  const result = await client.callTool({
    name: "synth-execute",
    arguments: {
      synth: {
        name: "test-synth",
        code: `{ Out.ar(0, SinOsc.ar(440)) }`
      },
      duration: 500  // Short duration for tests
    }
  });

  expect(result).toEqual({
    content: [
      { type: "text", text: "Synth name: test-synth" },
      { type: "text", text: "Code: { Out.ar(0, SinOsc.ar(440)) }" },
      { type: "text", text: "Playback duration: 0.5 seconds" }
    ]
  });
});
```

### Multi-Item Test
```typescript
it("Check if multiple items process correctly", async () => {
  const result = await client.callTool({
    name: "multi-synth-execute",
    arguments: {
      synths: [
        { name: "synth1", code: `{ Out.ar(0, SinOsc.ar(440)) }` },
        { name: "synth2", code: `{ Out.ar(0, WhiteNoise.ar) }` }
      ],
      duration: 500
    }
  });

  expect(result.content[0].text).toBe("Played 2 synths simultaneously.");
  expect(result.content[1].text).toContain("synth1, synth2");
});
```

### Error Case Test
```typescript
it("Check if error is handled gracefully", async () => {
  const result = await client.callTool({
    name: "synth-execute",
    arguments: {
      synth: {
        name: "invalid-synth",
        code: "invalid code without braces"
      }
    }
  });

  expect(result.content[0].text).toContain("An error occurred:");
});
```

## Test Data Patterns

### Synth Code Examples
```typescript
// Simple sine wave
code: `
{
  arg freq = 440;
  var sig = SinOsc.ar(freq);
  Out.ar(0, sig);
}
`

// White noise
code: `
{
  var sig = WhiteNoise.ar;
  Out.ar(0, sig);
}
`

// Complex synth
code: `
{
  arg freq = 440, amp = 0.5;
  var sig = SinOsc.ar(freq) * amp;
  var env = EnvGen.kr(Env.perc, doneAction: 2);
  Out.ar(0, sig * env);
}
`
```

### Duration Values
```typescript
// For tests: use short durations
duration: 500    // 0.5 seconds
duration: 1000   // 1 second

// Avoid long durations in tests
// duration: 10000  // Don't use in tests
```

## Assertion Patterns

### Exact Match
```typescript
expect(result).toEqual({
  content: [/* exact structure */]
});
```

### Partial Match
```typescript
expect(result.content[0].text).toContain("expected substring");
expect(result.content.length).toBe(3);
```

### Error Assertions
```typescript
// Check error message exists
expect(result.content[0].text).toMatch(/An error occurred:/);

// Check specific error
expect(result.content[0].text).toContain("specific error message");
```

## Test Organization

### Group Related Tests
```typescript
describe("synth-execute", () => {
  it("Check if sine wave is output", async () => {});
  it("Check if custom frequency works", async () => {});
  it("Check if invalid code throws error", async () => {});
});

describe("multi-synth-execute", () => {
  it("Check if two synths play", async () => {});
  it("Check if empty array is handled", async () => {});
});
```

### Test Naming Convention
- Start with "Check if..."
- Use present tense
- Be specific about what's tested
- Examples:
  - "Check if sine wave is output"
  - "Check if multiple synths play simultaneously"
  - "Check if invalid code returns error"

## Common Test Scenarios

1. **Happy Path**: Normal operation with valid inputs
2. **Edge Cases**: Empty arrays, minimum/maximum values
3. **Error Cases**: Invalid code, missing parameters
4. **Duration Tests**: Different duration values
5. **Multi-Item Tests**: Arrays with various sizes
6. **State Tests**: Sequential operations

## Performance Considerations

- Keep test durations short (500-1000ms)
- Use simple synth definitions
- Avoid complex audio processing in tests
- Clean up resources between tests