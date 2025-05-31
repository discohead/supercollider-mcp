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