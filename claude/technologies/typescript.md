# TypeScript Patterns - SuperCollider MCP Server

## Configuration

### tsconfig.json Settings
```json
{
  "compilerOptions": {
    "target": "ES2022",           // Modern JavaScript features
    "module": "Node16",           // Node.js ESM support
    "moduleResolution": "Node16", // Node.js module resolution
    "strict": true,               // All strict type checks
    "esModuleInterop": true,      // CommonJS interop
    "skipLibCheck": true,         // Skip .d.ts checking
    "forceConsistentCasingInFileNames": true
  }
}
```

## Module System Patterns

### ESM Import Style
```typescript
// Note the explicit .js extensions (required for Node16 module resolution)
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
```

### Default Import Aliasing
```typescript
// Workaround for supercolliderjs CommonJS module
import supercolliderjs from "supercolliderjs";
const sc = supercolliderjs;
```

### Dynamic Imports for Platform Code
```typescript
// Using require() for platform-specific code
if (process.platform === 'win32') {
  require('child_process').execSync('taskkill /F /IM sclang.exe', { stdio: 'ignore' });
}
```

## Type Patterns

### Interface for External Libraries
```typescript
// Manual type definition for untyped library
interface SCServer {
  synthDef: (name: string, code: string) => Promise<any>;
  synth: (def: any, options?: any) => Promise<any>;
  quit: () => void;
}
```

### Type Assertions
```typescript
// Non-null assertion when certain of value
return serverInitPromise!;

// Type casting for external library
const server = await (sc as any).server.boot({
  debug: false,
  echo: false,
  stderr: './supercollider-error.log'
}) as SCServer;
```

### Union Types for State
```typescript
let scServerInstance: SCServer | null = null;
let serverInitPromise: Promise<SCServer> | null = null;
```

## Async/Await Patterns

### Promise Caching Pattern
```typescript
async function initServer(): Promise<SCServer> {
  if (serverInitPromise) {
    return serverInitPromise;
  }

  serverInitPromise = (async () => {
    try {
      // Initialization logic
      return server;
    } catch (err) {
      serverInitPromise = null;  // Reset on error
      throw err;
    }
  })();

  return serverInitPromise!;
}
```

### Parallel Async Operations
```typescript
// Promise.all for concurrent operations
const synthPromises = synths.map(s => loadAndPlaySynth(server, s.name, s.code));
const loadedSynths = await Promise.all(synthPromises);
```

### Promise-based Delays
```typescript
// TypeScript-friendly setTimeout wrapper
await new Promise(resolve => setTimeout(resolve, duration));
```

## Error Handling Patterns

### Type-safe Error Formatting
```typescript
catch (error) {
  return {
    content: [{
      type: "text",
      text: `An error occurred: ${
        error instanceof Error 
          ? error.message 
          : JSON.stringify(error, Object.getOwnPropertyNames(error), 2)
      }`,
    }],
  };
}
```

### Try-Catch in Cleanup
```typescript
try {
  // Cleanup operations
} catch (killErr) {
  console.error('Attempting to terminate sclang process:', killErr);
}
```

## Zod Schema Patterns

### Nested Object Schemas
```typescript
{
  synth: z.object({
    name: z.string().describe("Synth name"),
    code: z.string().describe("Synth code")
  }).describe("Synth information to play"),
  duration: z.number().optional().describe("Playback duration in milliseconds. Default is 5000 (5 seconds)")
}
```

### Array Schemas
```typescript
synths: z.array(
  z.object({
    name: z.string().describe("Synth name"),
    code: z.string().describe("Synth code")
  })
).describe("List of synths to play")
```

### Default Parameters with Types
```typescript
async ({ synth, duration = 5000 }) => {
  // TypeScript infers types from Zod schema
}
```

## Test-Specific TypeScript Patterns

### Vitest Integration
```typescript
import { describe, it, expect } from "vitest";
```

### Type-safe Test Structure
```typescript
describe("synth-execute", () => {
  it("Check if sine wave is output", async () => {
    const client = new Client({
      name: "test client",
      version: "0.1.0",
    });
    
    // Type-safe tool invocation
    const result = await client.callTool({
      name: "synth-execute",
      arguments: {
        synth: {
          name: "test-synth",
          code: "..."
        },
        duration: 500
      },
    });
    
    // Structured assertion
    expect(result).toEqual({
      content: [/* ... */]
    });
  });
});
```

## Build Configuration

### Package.json Scripts
```json
{
  "scripts": {
    "build": "tsc && chmod +x ./build/index.js"
  }
}
```

### Shebang for CLI
```typescript
#! /usr/bin/env node
// First line of index.ts for executable
```

## TypeScript Best Practices Observed

1. **Strict Mode**: All strict checks enabled
2. **Explicit Types**: Return types on async functions
3. **Null Safety**: Consistent null/undefined handling
4. **Type Guards**: `instanceof Error` checks
5. **Module Boundaries**: Clear imports/exports
6. **No Any Abuse**: Limited to external library integration