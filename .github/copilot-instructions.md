# SuperCollider MCP Server Patterns

## Project Structure
- TypeScript with ES modules (`"type": "module"`)
- Test files: `*.test.ts` alongside source files
- Build output: `build/` directory
- Entry point: `src/index.ts` with shebang `#! /usr/bin/env node`

## Naming Conventions
- Tools: kebab-case `"synth-execute"`, `"multi-synth-execute"`
- Variables: camelCase `scServerInstance`, `activeSynths`
- Interfaces: PascalCase `SCServer`
- Test descriptions: Present tense "Check if..."

## Import Pattern
```typescript
// External imports first
import supercolliderjs from "supercolliderjs";
const sc = supercolliderjs;

// MCP imports require .js extension
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
```

## Server Management Pattern
```typescript
let scServerInstance: SCServer | null = null;
let serverInitPromise: Promise<SCServer> | null = null;

async function initServer(): Promise<SCServer> {
  if (serverInitPromise) return serverInitPromise;
  
  serverInitPromise = (async () => {
    try {
      const server = await (sc as any).server.boot({
        debug: false,
        echo: false,
        stderr: './supercollider-error.log'
      });
      scServerInstance = server;
      return server;
    } catch (err) {
      serverInitPromise = null;
      throw err;
    }
  })();
  
  return serverInitPromise!;
}
```

## Tool Definition Pattern
```typescript
server.tool(
  "tool-name",
  `Multi-line description.
  Include usage notes.`,
  {
    // Zod schema with descriptions
    field: z.string().describe("Field description"),
    optional: z.number().optional().describe("Optional with default")
  },
  async ({ field, optional = defaultValue }) => {
    try {
      const scServer = await initServer();
      
      // Implementation
      
      await cleanupServer();
      
      return {
        content: [
          { type: "text", text: "Result message" }
        ]
      };
    } catch (error) {
      console.error("Error context:", error);
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

## Error Handling Pattern
```typescript
// Always log to stderr
console.error("Operation context...");

// Comprehensive error serialization
error instanceof Error ? error.message : JSON.stringify(error, Object.getOwnPropertyNames(error), 2)
```

## Test Pattern
```typescript
import { describe, it, expect } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { server } from "./index.js";

describe("tool-name", () => {
  it("Check if expected behavior occurs", async () => {
    const client = new Client({
      name: "test client",
      version: "0.1.0",
    });
    
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    
    await Promise.all([
      client.connect(clientTransport),
      server.connect(serverTransport),
    ]);
    
    const result = await client.callTool({
      name: "tool-name",
      arguments: { /* ... */ }
    });
    
    expect(result).toEqual({
      content: [/* expected content */]
    });
  });
});
```

## SuperCollider Synth Pattern
```typescript
// SynthDef code wrapped in curly braces
const synthCode = `
{
  arg freq = 440;
  var sig = SinOsc.ar(freq);
  Out.ar(0, sig);
}
`;

// Load and play sequence
const def = await scServer.synthDef(synthName, synthCode);
const synth = await scServer.synth(def);
activeSynths.push(synth);

// Duration control
await new Promise(resolve => setTimeout(resolve, duration));
```

## Cleanup Pattern
```typescript
async function cleanupServer() {
  if (scServerInstance) {
    try {
      await scServerInstance.quit();
      scServerInstance = null;
      serverInitPromise = null;
      activeSynths = [];
      
      // Force kill sclang process
      try {
        if (process.platform === 'win32') {
          require('child_process').execSync('taskkill /F /IM sclang.exe', { stdio: 'ignore' });
        } else {
          require('child_process').execSync('pkill -f sclang', { stdio: 'ignore' });
        }
      } catch (killErr) {
        console.error('Attempting to terminate sclang process:', killErr);
      }
    } catch (error) {
      console.error("Server termination error:", error);
    }
  }
}
```

## Response Format
```typescript
// Success response
return {
  content: [
    { type: "text", text: "Primary result" },
    { type: "text", text: "Additional details" },
    { type: "text", text: `Duration: ${duration / 1000} seconds` }
  ]
};

// Error response
return {
  content: [{
    type: "text",
    text: `An error occurred: ${errorMessage}`
  }]
};
```

## Package.json Patterns
```json
{
  "type": "module",
  "bin": {
    "mcp-supercollider": "./build/index.js"
  },
  "scripts": {
    "build": "tsc && chmod +x ./build/index.js",
    "test": "vitest"
  },
  "files": ["build"]
}
```

## TypeScript Config
- ES2022 target
- Node module resolution
- Strict mode enabled
- Output to `build/` directory

## Critical Rules
1. Always use `.js` extensions for MCP imports
2. Log to stderr, not stdout
3. Include shebang in entry file
4. Handle server singleton pattern
5. Clean up processes on error
6. Return structured content arrays
7. Describe all Zod schema fields
8. Test with InMemoryTransport
9. Duration in milliseconds
10. Wrap SynthDef code in curly braces