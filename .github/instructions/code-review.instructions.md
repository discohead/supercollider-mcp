# SuperCollider MCP Code Review Instructions

## Import Review Checklist

### ✓ Correct Import Order
```typescript
// 1. External packages
import supercolliderjs from "supercolliderjs";
// 2. MCP SDK with .js extensions
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
// 3. Other imports
```

### ✗ Common Import Errors
```typescript
// Missing .js extension
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";  // ✗

// Wrong import style for supercolliderjs
import * as sc from "supercolliderjs";  // ✗
```

## Tool Definition Review

### ✓ Proper Tool Structure
- Kebab-case name: `"synth-execute"` ✓
- Multi-line description with usage notes ✓
- Zod schema with `.describe()` on all fields ✓
- Async handler with try-catch ✓
- Proper error serialization ✓

### ✗ Common Tool Errors
```typescript
// Missing descriptions
field: z.string()  // ✗

// Not handling optional defaults
async ({ optional }) => {  // ✗ Should be: optional = defaultValue

// Console.log instead of console.error
console.log("Message");  // ✗
```

## Server Management Review

### ✓ Singleton Pattern
- Check `serverInitPromise` before creating ✓
- Store promise to prevent race conditions ✓
- Reset on error ✓

### ✗ Anti-patterns
```typescript
// Creating new server each time
const server = await sc.server.boot();  // ✗

// Not cleaning up
// Missing: await cleanupServer();  // ✗
```

## Error Handling Review

### ✓ Proper Error Handling
```typescript
catch (error) {
  console.error("Context:", error);  // ✓ stderr
  return {
    content: [{
      type: "text",
      text: `An error occurred: ${error instanceof Error ? error.message : JSON.stringify(error, Object.getOwnPropertyNames(error), 2)}`
    }]
  };
}
```

### ✗ Insufficient Error Handling
```typescript
catch (error) {
  return { content: [{ type: "text", text: "Error" }] };  // ✗ No details
}

catch (error) {
  throw error;  // ✗ Should return error response
}
```

## SuperCollider Code Review

### ✓ Proper Synth Format
```typescript
const code = `
{
  arg freq = 440;  // ✓ Parameters with defaults
  var sig = SinOsc.ar(freq);  // ✓ Variable declaration
  Out.ar(0, sig);  // ✓ Output
}
`;
```

### ✗ Common SC Errors
```typescript
// Missing curly braces
const code = "Out.ar(0, SinOsc.ar(440))";  // ✗

// Missing Out.ar
const code = "{ SinOsc.ar(440) }";  // ✗
```

## Response Format Review

### ✓ Consistent Response
```typescript
return {
  content: [
    { type: "text", text: "Primary info" },
    { type: "text", text: "Secondary info" },
    { type: "text", text: `Duration: ${duration / 1000} seconds` }
  ]
};
```

### ✗ Inconsistent Responses
```typescript
// Single string
return { content: "Success" };  // ✗

// Missing type field
return { content: [{ text: "Message" }] };  // ✗
```

## Test Review

### ✓ Good Test Practices
- Short durations (500-1000ms) ✓
- Descriptive test names starting with "Check if" ✓
- Both success and error cases ✓
- Proper assertions ✓

### ✗ Test Anti-patterns
```typescript
// Too long for tests
duration: 10000  // ✗ 10 seconds

// Vague test name
it("test synth", async () => {});  // ✗

// No error case tests  // ✗
```

## Resource Management Review

### ✓ Proper Cleanup
- Server cleanup after operations ✓
- State reset in cleanup ✓
- Process termination handling ✓

### ✗ Resource Leaks
```typescript
// Not tracking active synths
await scServer.synth(def);  // ✗ Should push to activeSynths

// Not resetting state
activeSynths = [];  // ✗ Missing from cleanup
```

## Type Safety Review

### ✓ Proper Types
```typescript
let scServerInstance: SCServer | null = null;  // ✓
async function helper(scServer: SCServer): Promise<any> {  // ✓
```

### ✗ Type Issues
```typescript
let scServerInstance;  // ✗ No type
async function helper(scServer) {  // ✗ No parameter type
```

## Performance Review

### Check For:
1. Unnecessary server restarts
2. Missing Promise.all for parallel operations
3. Synchronous operations that could be async
4. Long timeouts in production code

## Security Review

### Check For:
1. Command injection in synth code
2. Resource exhaustion (infinite synths)
3. File system access outside project
4. Unvalidated user input

## Common Review Points

1. **Naming**: All kebab-case for tools?
2. **Imports**: All have .js extension?
3. **Logging**: All use console.error?
4. **Errors**: All properly serialized?
5. **Cleanup**: Server cleanup called?
6. **Types**: All parameters typed?
7. **Tests**: Cover error cases?
8. **Docs**: Schema fields described?