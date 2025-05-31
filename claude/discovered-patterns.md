# Discovered Patterns - SuperCollider MCP Server

## Naming Conventions

### File Naming
- **Entry point**: `index.ts` (not `server.ts` as specified in package.json main field)
- **Test files**: Mirror source files with `.test.ts` suffix (e.g., `index.test.ts`)
- **Build output**: Matches source structure in `build/` directory

### Variable and Function Naming
```typescript
// Instances use camelCase with descriptive suffixes
let scServerInstance: SCServer | null = null;
let serverInitPromise: Promise<SCServer> | null = null;

// Arrays use plural names
let activeSynths: any[] = [];

// Async functions often include verb prefix
async function initServer(): Promise<SCServer>
async function loadAndPlaySynth()
async function cleanupServer()
```

### Tool Naming
- Kebab-case for MCP tool names: `"synth-execute"`, `"multi-synth-execute"`
- Descriptive verb-noun pattern

## Code Organization Patterns

### Import Structure
```typescript
// External imports first, with alias pattern
import supercolliderjs from "supercolliderjs";
const sc = supercolliderjs;

// MCP SDK imports with explicit .js extensions
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
```

### Interface Definition
```typescript
// Manual interface for external library types
interface SCServer {
  synthDef: (name: string, code: string) => Promise<any>;
  synth: (def: any, options?: any) => Promise<any>;
  quit: () => void;
}
```

### State Management Pattern
```typescript
// Module-level state variables
let scServerInstance: SCServer | null = null;
let serverInitPromise: Promise<SCServer> | null = null;
let activeSynths: any[] = [];

// Singleton initialization pattern
async function initServer(): Promise<SCServer> {
  if (serverInitPromise) {
    return serverInitPromise;
  }
  // ... initialization logic
}
```

## Error Handling Patterns

### Console Error Logging
```typescript
// Consistent use of console.error for server-side logging
console.error("Starting SuperCollider server...");
console.error("SuperCollider server startup error:", err);
```

### Structured Error Responses
```typescript
catch (error) {
  console.error("SuperCollider execution error:", error);
  return {
    content: [
      {
        type: "text",
        text: `An error occurred: ${error instanceof Error ? error.message : JSON.stringify(error, Object.getOwnPropertyNames(error), 2)}`,
      }
    ],
  };
}
```

## MCP Tool Definition Pattern

### Zod Schema Pattern
```typescript
server.tool(
  "tool-name",
  `Multi-line description
  with usage instructions.`,
  {
    // Nested object schemas with descriptions
    synth: z.object({
      name: z.string().describe("Synth name"),
      code: z.string().describe("Synth code")
    }).describe("Synth information to play"),
    // Optional parameters with defaults
    duration: z.number().optional().describe("Playback duration in milliseconds. Default is 5000 (5 seconds)")
  },
  async ({ param1, param2 = defaultValue }) => {
    // Implementation
  }
);
```

## Testing Patterns

### In-Memory Testing Setup
```typescript
// Standard test structure
describe("tool-name", () => {
  it("Description of test", async () => {
    const client = new Client({
      name: "test client",
      version: "0.1.0",
    });

    // Create linked transport pair
    const [clientTransport, serverTransport] = 
      InMemoryTransport.createLinkedPair();
    
    // Parallel connection
    await Promise.all([
      client.connect(clientTransport),
      server.connect(serverTransport),
    ]);

    // Tool invocation and assertion
    const result = await client.callTool({
      name: "tool-name",
      arguments: { /* ... */ },
    });

    expect(result).toEqual({ /* expected */ });
  });
});
```

## Platform-Specific Patterns

### Cross-Platform Process Termination
```typescript
try {
  if (process.platform === 'win32') {
    require('child_process').execSync('taskkill /F /IM sclang.exe', { stdio: 'ignore' });
  } else {
    require('child_process').execSync('pkill -f sclang', { stdio: 'ignore' });
  }
} catch (killErr) {
  console.error('Attempting to terminate sclang process:', killErr);
}
```

## Async/Promise Patterns

### Promise Caching for Initialization
```typescript
// Cache promise to prevent multiple initializations
if (serverInitPromise) {
  return serverInitPromise;
}

serverInitPromise = (async () => {
  // ... initialization
})();

return serverInitPromise!;
```

### Timeout Pattern
```typescript
// Using setTimeout with Promise for delays
await new Promise(resolve => setTimeout(resolve, duration));
```

## Resource Cleanup Pattern

### Comprehensive Cleanup Function
```typescript
async function cleanupServer() {
  if (scServerInstance) {
    try {
      // 1. Quit server
      await scServerInstance.quit();
      
      // 2. Reset state
      scServerInstance = null;
      serverInitPromise = null;
      activeSynths = [];
      
      // 3. Force kill processes
      // ... platform-specific cleanup
    } catch (error) {
      console.error("Server termination error:", error);
    }
  }
}
```

## Output Format Pattern

### Consistent Tool Response Structure
```typescript
return {
  content: [
    {
      type: "text",
      text: `Label: ${value}`,
    },
    // Multiple text blocks for structured output
  ],
};
```