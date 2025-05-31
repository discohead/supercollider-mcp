# System Design - SuperCollider MCP Server

## Architecture Overview

The SuperCollider MCP Server follows a single-process, tool-based architecture that bridges the Model Context Protocol with SuperCollider's audio synthesis engine.

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│  MCP Client     │ <-----> │  MCP Server      │ <-----> │  SuperCollider  │
│  (Claude/VS)    │  STDIO  │  (index.ts)      │  IPC    │  (sclang)       │
└─────────────────┘         └──────────────────┘         └─────────────────┘
```

## System Boundaries

### 1. MCP Interface Boundary
- **Protocol**: JSON-RPC over STDIO
- **Transport**: `StdioServerTransport`
- **Tools Exposed**:
  - `synth-execute`: Single synth execution
  - `multi-synth-execute`: Multiple concurrent synths

### 2. SuperCollider Integration Boundary
- **Library**: `supercolliderjs`
- **Communication**: Inter-process communication with sclang
- **Lifecycle**: On-demand server boot, automatic cleanup

### 3. Process Boundary
- **Main Process**: Node.js running the MCP server
- **Child Process**: SuperCollider language interpreter (sclang)
- **Error Logs**: Redirected to `./supercollider-error.log`

## Component Architecture

### Core Components

```typescript
// 1. Server Instance (Singleton)
let scServerInstance: SCServer | null = null;
let serverInitPromise: Promise<SCServer> | null = null;

// 2. State Management
let activeSynths: any[] = [];

// 3. MCP Server
export const server = new McpServer({
  name: "SuperColliderMcpServer",
  version: "0.1.0",
});
```

### Component Interactions

1. **Initialization Flow**
   ```
   Tool Request → initServer() → SC Boot → Cache Instance → Return Server
   ```

2. **Execution Flow**
   ```
   Tool Arguments → Load SynthDef → Create Synth → Play Duration → Cleanup
   ```

3. **Cleanup Flow**
   ```
   Quit SC Server → Reset State → Kill Processes → Log Completion
   ```

## Design Patterns

### 1. Singleton Server Management
```typescript
async function initServer(): Promise<SCServer> {
  if (serverInitPromise) {
    return serverInitPromise;  // Return cached promise
  }
  // Initialize once
}
```

### 2. Resource Lifecycle Management
- **Lazy Initialization**: Server boots on first use
- **Automatic Cleanup**: Server terminated after each operation
- **State Reset**: All state variables cleared on cleanup

### 3. Error Boundary Pattern
```typescript
try {
  // Operation
} catch (error) {
  console.error("Context:", error);
  return {
    content: [{
      type: "text",
      text: `An error occurred: ${/* formatted error */}`
    }]
  };
}
```

## Data Flow

### Tool Execution Flow

1. **Input Processing**
   - Zod validates incoming parameters
   - Default values applied (e.g., duration: 5000ms)

2. **Server Initialization**
   - Check for existing instance/promise
   - Boot SuperCollider if needed
   - Configure with no debug/echo output

3. **Synth Execution**
   ```typescript
   // Single synth
   const def = await scServer.synthDef(name, code);
   await scServer.synth(def);
   
   // Multi-synth
   const synthPromises = synths.map(s => loadAndPlaySynth(server, s.name, s.code));
   await Promise.all(synthPromises);
   ```

4. **Duration Control**
   - Promise-based timeout
   - No active synth control (fire-and-forget)

5. **Response Formation**
   - Structured text blocks
   - Consistent format across tools

## Security Considerations

### Process Isolation
- SuperCollider runs as separate process
- Error output redirected to file
- Force-kill on cleanup prevents orphan processes

### Input Validation
- Zod schemas validate all tool inputs
- No direct command injection possible
- Code execution limited to SynthDef context

## Performance Characteristics

### Startup Cost
- First execution incurs SC server boot time
- Subsequent executions reuse server (if within same session)
- Each tool invocation includes full cleanup

### Resource Usage
- Single Node.js process for MCP server
- One sclang process when active
- Memory freed on cleanup

### Scalability Limitations
- Single server instance (no concurrent operations)
- Synchronous synth execution within tools
- No queuing or batching mechanism

## Architectural Decisions

### 1. Stateless Operation Model
- **Decision**: Full cleanup after each operation
- **Rationale**: Ensures clean state, prevents audio conflicts
- **Trade-off**: Higher latency vs. reliability

### 2. Synchronous Tool Execution
- **Decision**: Tools wait for full duration before returning
- **Rationale**: Ensures audio completes before cleanup
- **Trade-off**: Blocking operation vs. guaranteed playback

### 3. Platform-Specific Cleanup
- **Decision**: Different kill commands for Windows/Unix
- **Rationale**: Ensure process termination across platforms
- **Trade-off**: Code complexity vs. reliability

### 4. In-Process Testing
- **Decision**: Use in-memory transport for tests
- **Rationale**: Test MCP protocol without audio dependencies
- **Trade-off**: No actual audio testing vs. fast, reliable tests