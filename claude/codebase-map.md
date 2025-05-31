# Codebase Map - SuperCollider MCP Server

## Project Overview

This is a Model Context Protocol (MCP) server that bridges SuperCollider audio synthesis capabilities with AI assistants like Claude. The project uses TypeScript and the MCP SDK to expose SuperCollider functionality through standardized tools.

## Directory Structure

```
/Users/jaredmcfarland/Developer/supercollider-mcp/
├── src/                      # Source code directory
│   ├── index.ts             # Main server implementation and entry point
│   └── index.test.ts        # Test suite for server tools
├── build/                   # Compiled JavaScript output (gitignored)
├── package.json             # Project configuration and dependencies
├── tsconfig.json            # TypeScript compiler configuration
├── LICENSE.txt              # MIT license
├── README.md                # User documentation
├── CLAUDE.md                # Claude Code guidance
└── renovate.json            # Renovate bot configuration for dependency updates
```

## File Purposes

### Core Implementation

**`src/index.ts`** (213 lines)
- Entry point with shebang for CLI execution (`#! /usr/bin/env node`)
- Implements MCP server with two tools: `synth-execute` and `multi-synth-execute`
- Manages SuperCollider server lifecycle (boot, execute, cleanup)
- Handles platform-specific process termination (Windows vs Unix)
- Uses singleton pattern for server instance management
- Exports server instance for testing

**`src/index.test.ts`** (130 lines)
- Test suite using Vitest framework
- Tests both single and multi-synth execution
- Uses in-memory transport for testing without actual audio output
- Verifies expected output format and content

### Configuration Files

**`package.json`**
- Name: `@makotyo/mcp-supercollider`
- Version: 0.2.0
- Type: ES module (`"type": "module"`)
- Binary exposed as `mcp-supercollider`
- Scripts: `build` (TypeScript compilation) and `test` (Vitest)
- Dependencies: MCP SDK, supercolliderjs, zod
- Dev dependencies: TypeScript, Vitest, Node types

**`tsconfig.json`**
- Target: ES2022
- Module system: Node16
- Strict mode enabled
- Output to `./build` directory
- Includes all files in `src/`

### Documentation

**`README.md`**
- Installation instructions for Claude Desktop and VS Code
- Prerequisites (SuperCollider installation)
- Platform compatibility notes (macOS M1 only)

**`CLAUDE.md`**
- Development commands and architecture overview
- Specific guidance for Claude Code

### Automation

**`renovate.json`**
- Extends recommended Renovate configuration
- Automates dependency updates

## Key Characteristics

1. **Single Source File Architecture**: All server logic contained in one file (`index.ts`)
2. **Test-Driven**: Comprehensive tests for both tools
3. **Platform-Aware**: Special handling for different operating systems
4. **Error-Resilient**: Graceful error handling and cleanup
5. **MCP-First Design**: Built specifically for the Model Context Protocol