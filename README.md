# SuperCollider MCP Server

The SuperCollider MCP Server is a [Model Context Protocol (MCP)](https://modelcontextprotocol.io/introduction) server for the SuperCollider programming language that allows to execute synth using supercolliderjs.

## Prerequisites

1. Install [SuperCollider](https://supercollider.github.io/downloads) on your machine.
2. Node.js and npm should be installed on your machine. You can download it from [Node.js official website](https://nodejs.org/).

## Compatibility

This project has been tested and confirmed to work only on macOS with Apple Silicon (M1) processors. Compatibility with other operating systems or processor architectures has not been verified.

## Installation

### Usage with Claude Desktop

Add this to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "mcp-supercollider": {
      "command": [
        "npx", 
        "-y",
        "@makotyo/mcp-supercollider"]
    }
  }
}
```


### Usage with VS Code

Add the following JSON block to your User Settings (JSON) file in VS Code. You can do this by pressing Ctrl + Shift + P and typing Preferences: Open User Settings (JSON).

Optionally, you can add it to a file called .vscode/mcp.json in your workspace. This will allow you to share the configuration with others.

> Note that the mcp key is not needed in the .vscode/mcp.json file.

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
## AI Assistant Configuration

This project includes AI assistant configuration for enhanced development experience:

- **Claude Code**: Deep code analysis and context documentation in `claude/` directory
- **Cursor**: MDC rules in `.cursor/rules/` for active coding guidance
- **GitHub Copilot**: Instructions in `.github/copilot-instructions.md` for inline assistance

### For New Developers

Run these commands to understand the AI setup:
1. Review generated documentation: `ls claude/`
2. Check Cursor rules: `ls .cursor/rules/`
3. Read Copilot instructions: `cat .github/copilot-instructions.md`

### Maintenance Commands

- `/user:context-update` - Update context for new patterns (quarterly)
- `/user:rules-sync` - Synchronize Cursor rules after context updates
- `/user:instructions-optimize` - Optimize Copilot instructions annually

See `.github/AI-SETUP-GUIDE.md` for detailed setup and maintenance instructions.
