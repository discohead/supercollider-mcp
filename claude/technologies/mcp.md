# Model Context Protocol (MCP) Patterns - SuperCollider MCP Server

## MCP Server Setup

### Basic Server Configuration
```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export const server = new McpServer({
  name: "SuperColliderMcpServer",
  version: "0.1.0",
});
```

### Transport Configuration
```typescript
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const transport = new StdioServerTransport();
await server.connect(transport);
console.error("supercollider MCP Server running on stdio");
```

## Tool Definition Pattern

### Standard Tool Structure
```typescript
server.tool(
  "tool-name",                    // Kebab-case naming
  `Multi-line description`,       // Clear description
  {                              // Zod schema for parameters
    param: z.type().describe("Description")
  },
  async (args) => {              // Handler function
    // Implementation
    return {
      content: [{
        type: "text",
        text: "Response"
      }]
    };
  }
);
```

### Actual Tool Implementation

#### Single Synth Execution
```typescript
server.tool(
  "synth-execute",
  `Generates SynthDef code and executes it to produce sound.
  Please wrap the code in curly braces {}.`,
  {
    synth: z.object({
      name: z.string().describe("Synth name"),
      code: z.string().describe("Synth code")
    }).describe("Synth information to play"),
    duration: z.number().optional().describe("Playback duration in milliseconds. Default is 5000 (5 seconds)")
  },
  async ({ synth, duration = 5000 }) => {
    // Tool implementation
  }
);
```

#### Multi-Synth Execution
```typescript
server.tool(
  "multi-synth-execute",
  "Execute multiple SynthDefs simultaneously.",
  {
    synths: z.array(
      z.object({
        name: z.string().describe("Synth name"),
        code: z.string().describe("Synth code")
      })
    ).describe("List of synths to play"),
    duration: z.number().optional().describe("Playback duration in milliseconds. Default is 10000 (10 seconds)")
  },
  async ({ synths, duration = 10000 }) => {
    // Tool implementation
  }
);
```

## Response Format Pattern

### Structured Text Response
```typescript
return {
  content: [
    {
      type: "text",
      text: `Synth name: ${synth.name}`,
    },
    {
      type: "text", 
      text: `Code: ${synth.code}`,
    },
    {
      type: "text",
      text: `Playback duration: ${duration / 1000} seconds`,
    }
  ],
};
```

### Error Response Pattern
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

## Testing MCP Tools

### In-Memory Transport Testing
```typescript
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";

// Create linked transport pair
const [clientTransport, serverTransport] = 
  InMemoryTransport.createLinkedPair();

// Connect both ends
await Promise.all([
  client.connect(clientTransport),
  server.connect(serverTransport),
]);
```

### Tool Invocation in Tests
```typescript
const result = await client.callTool({
  name: "synth-execute",
  arguments: {
    synth: {
      name: "test-synth",
      code: `{ /* SuperCollider code */ }`
    },
    duration: 500
  },
});
```

## MCP Configuration for Clients

### Claude Desktop Configuration
```json
{
  "mcpServers": {
    "mcp-supercollider": {
      "command": [
        "npx", 
        "-y",
        "@makotyo/mcp-supercollider"
      ]
    }
  }
}
```

### VS Code Configuration
```json
{
  "mcp": {
    "servers": {
      "mcp-supercollider": {
        "command": "npx",
        "args": [
          "-y",
          "@makotyo/mcp-supercollider"
        ]
      }
    }
  }
}
```

## MCP Design Patterns Used

### 1. Tool-Based Architecture
- Each capability exposed as a discrete tool
- Tools are self-contained with clear inputs/outputs
- No shared state between tool invocations

### 2. Schema-First Design
- Zod schemas define tool contracts
- Descriptive metadata for each parameter
- Optional parameters with sensible defaults

### 3. Structured Output
- Consistent response format across tools
- Multiple text blocks for organized information
- Error responses follow same structure

### 4. Server Lifecycle Management
- Single server instance exported for testing
- STDIO transport for process communication
- Console.error for server-side logging (not sent to client)

## MCP Best Practices Observed

1. **Clear Tool Naming**: Kebab-case with verb-noun pattern
2. **Descriptive Parameters**: Each parameter includes description
3. **Consistent Responses**: All tools return same response structure
4. **Error Handling**: Graceful degradation with informative errors
5. **Testing Support**: Server instance exported for unit tests
6. **Transport Abstraction**: Works with both STDIO and in-memory transports