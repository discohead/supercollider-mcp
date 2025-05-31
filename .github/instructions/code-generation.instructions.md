# SuperCollider MCP Code Generation Instructions

## New Tool Creation

### 1. Define Tool in index.ts
```typescript
server.tool(
  "your-tool-name",  // kebab-case
  `Description line 1.
  Description line 2 with usage notes.`,
  {
    // Required params with descriptions
    required: z.string().describe("What this param does"),
    // Optional params with defaults
    optional: z.number().optional().describe("Default is X")
  },
  async ({ required, optional = defaultValue }) => {
    try {
      const scServer = await initServer();
      // Your implementation
      await cleanupServer();
      return {
        content: [
          { type: "text", text: "Success message" }
        ]
      };
    } catch (error) {
      console.error("Tool-specific error:", error);
      return {
        content: [{
          type: "text",
          text: `An error occurred: ${error instanceof Error ? error.message : JSON.stringify(error, Object.getOwnPropertyNames(error), 2)}`
        }]
      };
    }
  }
);
```

### 2. Add Helper Functions
```typescript
// Place before tool definitions
async function yourHelperFunction(scServer: SCServer, param: string): Promise<any> {
  // Implementation
  return result;
}
```

### 3. Extend Interfaces
```typescript
interface YourDataStructure {
  field1: string;
  field2: number;
}
```

## SuperCollider Integration

### Synth Definition Pattern
```typescript
const synthCode = `
{
  arg param1 = defaultValue, param2 = defaultValue2;
  var signal = YourUGen.ar(param1);
  var processed = AnotherUGen.ar(signal, param2);
  Out.ar(0, processed);
}
`;
```

### Multi-Synth Pattern
```typescript
const synthPromises = [];
for (const item of items) {
  synthPromises.push(loadAndPlaySynth(scServer, item.name, item.code));
}
const loadedSynths = await Promise.all(synthPromises);
```

### Duration Handling
```typescript
// Always in milliseconds
duration: z.number().optional().describe("Duration in milliseconds. Default is 5000 (5 seconds)")

// In implementation
await new Promise(resolve => setTimeout(resolve, duration));

// In response
text: `Duration: ${duration / 1000} seconds`
```

## State Management

### Global State
```typescript
// At module level
let yourState: YourType[] = [];

// In cleanup
yourState = [];
```

### Server State
```typescript
// Always check server instance
if (!scServerInstance) {
  throw new Error("Server not initialized");
}
```

## Error Messages

### User-Friendly Errors
```typescript
// Specific error cases
if (!synth.code) {
  throw new Error("Synth code is required");
}

// Generic handler
catch (error) {
  const message = error instanceof Error 
    ? error.message 
    : JSON.stringify(error, Object.getOwnPropertyNames(error), 2);
  
  return {
    content: [{
      type: "text",
      text: `Failed to execute synth: ${message}`
    }]
  };
}
```

## Logging Best Practices
```typescript
// Operation start
console.error(`Starting operation with ${items.length} items...`);

// Progress updates
console.error(`Processing item ${index + 1} of ${items.length}`);

// Completion
console.error('Operation complete');
```

## Common Patterns to Follow

1. **Parameter Validation**: Use Zod schemas with descriptive messages
2. **Resource Management**: Always init then cleanup server
3. **Async Operations**: Use Promise.all for parallel operations
4. **Time Units**: Always milliseconds internally, show seconds to user
5. **Error Context**: Include operation context in error messages
6. **State Reset**: Clear all state in cleanup functions
7. **Type Safety**: Define interfaces for complex data structures