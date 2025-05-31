# Cursor MDC Rules for SuperCollider MCP Server

This directory contains MDC (Markdown Configuration) rules that enforce coding patterns and best practices discovered from the Claude Code context analysis.

## Structure

### Always Rules (Applied Globally)
- **`always/core-conventions.mdc`** - Universal naming, import, and organization patterns
- **`always/architecture-principles.mdc`** - System boundaries and separation of concerns  
- **`always/code-quality.mdc`** - Error handling, logging, and quality standards

### Component Rules (File-Specific)
- **`components/mcp-tools.mdc`** - Rules for MCP tool definitions (glob: `**/index.ts`)
- **`components/tests.mdc`** - Testing patterns and structure (glob: `**/*.test.ts`)

### Feature Rules (Domain-Specific)
- **`features/supercollider-integration.mdc`** - SuperCollider server management patterns
- **`features/synth-execution.mdc`** - Synth code execution patterns

### Workflow Rules (Process-Oriented)
- **`workflows/server-lifecycle.mdc`** - Server initialization and cleanup workflows

## Key Patterns Enforced

1. **Naming Conventions**
   - Kebab-case for MCP tools: `synth-execute`, `multi-synth-execute`
   - CamelCase with descriptive suffixes: `scServerInstance`, `serverInitPromise`
   - Test files mirror source with `.test.ts` suffix

2. **Architecture Patterns**
   - Singleton server management with promise caching
   - Stateless operation model with full cleanup after each tool
   - Platform-specific process management (Windows vs Unix)

3. **Code Quality**
   - Consistent error logging with `console.error`
   - Structured MCP response format: `{ content: [{ type: "text", text: "..." }] }`
   - Comprehensive error handling with formatted responses

4. **Testing Patterns**
   - In-memory transport for MCP protocol testing
   - Exact output matching with preserved formatting
   - Short test durations (500ms) for speed

## Usage in Cursor

These rules will be automatically applied by Cursor when:
- Working on files matching the glob patterns
- Creating new code in this project
- Refactoring existing code

The rules help maintain consistency with the established patterns in the SuperCollider MCP server codebase.