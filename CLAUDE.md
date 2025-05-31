# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- **Build**: `npm run build` - Compiles TypeScript to JavaScript in the `build/` directory and sets executable permissions
- **Test**: `npm test` - Runs Vitest test suite
- **Run a single test**: `npm test -- <test-name>` or `npx vitest <test-name>`

## Architecture

This is a Model Context Protocol (MCP) server that integrates SuperCollider audio synthesis capabilities. The architecture consists of:

### Core Components

1. **MCP Server** (src/index.ts:82-85): Built using `@modelcontextprotocol/sdk`, exposes SuperCollider functionality through MCP tools
2. **SuperCollider Integration**: Uses `supercolliderjs` to boot and manage SuperCollider server instances
3. **Available Tools**:
   - `synth-execute`: Executes a single SynthDef with specified code and duration
   - `multi-synth-execute`: Executes multiple SynthDefs simultaneously

### Key Implementation Details

- **Server Management**: The SuperCollider server is initialized on-demand and cleaned up after each operation (src/index.ts:21-79)
- **Japanese Comments**: The codebase contains Japanese comments and error messages
- **Platform-specific Cleanup**: Different cleanup commands for Windows vs Unix systems (src/index.ts:65-68)
- **Error Handling**: Synth execution errors are caught and returned as formatted MCP responses

### Testing

Tests use Vitest with in-memory MCP client/server connections to verify synth execution without actual audio output.

## Prerequisites

- SuperCollider must be installed on the system
- Only tested on macOS with Apple Silicon (M1)

## Key Discovered Patterns

### Naming Conventions
- **MCP Tools**: Kebab-case (`synth-execute`, `multi-synth-execute`)
- **Variables**: camelCase with descriptive suffixes (`scServerInstance`, `serverInitPromise`)
- **Test Files**: Mirror source with `.test.ts` suffix

### Code Organization
- **Single File Architecture**: All server logic in `src/index.ts`
- **Import Pattern**: External imports first, with `.js` extensions for MCP SDK
- **State Management**: Module-level variables with singleton initialization

### MCP Patterns
- **Tool Response Format**: Consistent `{ content: [{ type: "text", text: "..." }] }`
- **Zod Schemas**: Descriptive parameters with `.describe()` on each field
- **Error Handling**: Graceful degradation with formatted error responses

### Testing Patterns
- **In-Memory Transport**: No real SC process in tests
- **Exact Output Matching**: Precise assertion of response structure
- **Short Durations**: 500ms test durations for speed

### SuperCollider Integration
- **Server Lifecycle**: Boot on-demand, cleanup after each operation
- **Process Management**: Platform-specific cleanup (Windows vs Unix)
- **Fire-and-Forget**: No synth control after creation

## Quick Reference

### Common Tasks
```bash
# Development cycle
npm run build && npm test

# Clean build
rm -rf build/ && npm run build

# Reset SuperCollider
pkill -f sclang
rm -f ./supercollider-error.log

# Watch mode testing
npx vitest --watch
```

### File Locations
- **Source**: `src/index.ts` - All server implementation
- **Tests**: `src/index.test.ts` - Test suite
- **Build Output**: `build/index.js` - Executable server
- **SC Errors**: `./supercollider-error.log` - SuperCollider error output

### Important Patterns
```typescript
// Singleton server initialization
if (serverInitPromise) return serverInitPromise;

// MCP tool structure
server.tool("name", "description", zodSchema, async (args) => {
  return { content: [{ type: "text", text: "response" }] };
});

// Cleanup pattern
await scServerInstance.quit();
scServerInstance = null;
serverInitPromise = null;
```

## Documentation Links

For detailed information, see:
- [`claude/codebase-map.md`](claude/codebase-map.md) - Complete project structure
- [`claude/discovered-patterns.md`](claude/discovered-patterns.md) - Coding conventions and patterns
- [`claude/architecture/system-design.md`](claude/architecture/system-design.md) - System architecture
- [`claude/technologies/`](claude/technologies/) - Technology-specific patterns
- [`claude/workflows/`](claude/workflows/) - Development and testing workflows
- [`.claude/commands/`](.claude/commands/) - Reusable command documentation

## AI Assistant Ecosystem

This project maintains a three-layer AI configuration system:

1. **Knowledge Layer** (Claude Code Context)
   - CLAUDE.md: Primary project reference
   - `claude/`: Discovered patterns, architecture, workflows (8 files)
   
2. **Behavioral Layer** (Cursor Rules)
   - `.cursor/rules/`: MDC rules for active code generation guidance (8 rule files)
   - Always rules: 447/500 lines
   - Available to Claude Code via file reading when deeper context needed

3. **Persistent Layer** (Copilot Instructions)  
   - `.github/copilot-instructions.md`: Core universal patterns (230 lines)
   - `.github/instructions/`: 3 specialized task-specific instructions
   - `.github/prompts/`: 3 reusable prompt templates for complex operations

Claude Code can access all layers for comprehensive understanding.

Last ecosystem update: 2025-05-30
Next maintenance due: 2025-08-28

For maintenance: Run `/user:ai-ecosystem-maintenance`