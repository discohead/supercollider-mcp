# Development Workflows - SuperCollider MCP Server

## Initial Setup

### Prerequisites Check
1. **SuperCollider Installation**
   - Required: SuperCollider installed on system
   - Platform: Only tested on macOS with M1
   - Verify: `sclang` should be in PATH

2. **Node.js Environment**
   - Required: Node.js with npm
   - Module system: ES modules enabled
   - TypeScript: Development dependency

### Local Development Setup
```bash
# Clone repository
git clone <repository-url>
cd supercollider-mcp

# Install dependencies
npm install

# Build project
npm run build

# Run tests
npm test
```

## Build Workflow

### TypeScript Compilation
```bash
npm run build
```

**What happens:**
1. TypeScript compiler runs: `tsc`
2. Compiles `src/*.ts` to `build/*.js`
3. Sets executable permissions: `chmod +x ./build/index.js`
4. Preserves shebang line for CLI execution

### Build Output Structure
```
build/
├── index.js        # Main server (executable)
├── index.test.js   # Compiled tests
└── *.d.ts         # Type definitions
```

### Manual Build Steps
```bash
# If needed separately
npx tsc
chmod +x ./build/index.js
```

## Development Cycle

### 1. Code Changes
```bash
# Edit source files
vim src/index.ts

# TypeScript will check types during build
npm run build
```

### 2. Testing Changes
```bash
# Run all tests
npm test

# Run specific test
npx vitest index.test.ts

# Watch mode for development
npx vitest --watch
```

### 3. Manual Testing
```bash
# Test as MCP server
node ./build/index.js

# Or using npx (as clients would)
npx -y @makotyo/mcp-supercollider
```

## Debugging Workflow

### Console Logging
```typescript
// Server logs (not sent to MCP client)
console.error("Debug message");
console.error("Variable value:", variable);
```

### SuperCollider Errors
```bash
# Check error log
cat ./supercollider-error.log

# Monitor in real-time
tail -f ./supercollider-error.log
```

### Process Debugging
```bash
# Check if sclang is running
ps aux | grep sclang

# Force kill if stuck
pkill -f sclang  # Unix/macOS
# or
taskkill /F /IM sclang.exe  # Windows
```

## Adding New Tools

### 1. Define Tool Schema
```typescript
server.tool(
  "new-tool-name",
  "Tool description",
  {
    param: z.string().describe("Parameter description")
  },
  async ({ param }) => {
    // Implementation
  }
);
```

### 2. Add Tests
```typescript
describe("new-tool-name", () => {
  it("should do something", async () => {
    const result = await client.callTool({
      name: "new-tool-name",
      arguments: { param: "value" }
    });
    expect(result).toEqual(/* expected */);
  });
});
```

### 3. Update Documentation
- Add tool to README.md
- Update CLAUDE.md if significant

## Version Management

### Package Version
```json
// package.json
{
  "version": "0.2.0"  // Semantic versioning
}
```

### Server Version
```typescript
// src/index.ts
export const server = new McpServer({
  name: "SuperColliderMcpServer",
  version: "0.1.0",  // MCP server version
});
```

## Dependency Management

### Renovate Bot
- Configured via `renovate.json`
- Creates PRs for dependency updates
- Extends recommended configuration

### Manual Updates
```bash
# Update specific dependency
npm update @modelcontextprotocol/sdk

# Update all dependencies
npm update

# Check outdated
npm outdated
```

## Common Development Tasks

### Clean Build
```bash
# Remove build artifacts
rm -rf build/

# Rebuild
npm run build
```

### Reset SuperCollider
```bash
# Kill any stuck processes
pkill -f sclang

# Remove error log
rm -f ./supercollider-error.log
```

### Test MCP Integration
```bash
# Test with Claude Desktop config
# Add to claude_desktop_config.json and restart Claude

# Test with VS Code
# Add to .vscode/mcp.json or user settings
```

## Troubleshooting

### Build Failures
1. Check TypeScript errors: `npx tsc --noEmit`
2. Verify Node version supports ES2022
3. Ensure clean node_modules: `rm -rf node_modules && npm install`

### Test Failures
1. Check if SuperCollider is installed
2. Verify no sclang processes running
3. Check error log for SC errors

### Runtime Issues
1. Verify executable permissions on build/index.js
2. Check STDIO not being blocked
3. Ensure SuperCollider in PATH

## Best Practices

1. **Always Build Before Testing**: TypeScript changes need compilation
2. **Clean State**: Kill SC processes between debug sessions
3. **Check Logs**: Both console.error and supercollider-error.log
4. **Test Incrementally**: Use single test runs during development
5. **Version Consistently**: Keep package.json and server versions aligned