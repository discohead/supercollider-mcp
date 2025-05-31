# Prompt: Refactor Code to Match SuperCollider MCP Patterns

I need to refactor the following code to match the established patterns in the SuperCollider MCP server:

```typescript
[PASTE YOUR CODE HERE]
```

## Issues to Fix:
- [ ] Import statements missing `.js` extensions
- [ ] Using `console.log` instead of `console.error`
- [ ] Tool name not in kebab-case
- [ ] Missing parameter descriptions in Zod schema
- [ ] Not following the server singleton pattern
- [ ] Error handling doesn't match the pattern
- [ ] Response format inconsistent
- [ ] Missing cleanup after operations
- [ ] [OTHER ISSUES]

Please refactor this code to:
1. Follow the correct import pattern with `.js` extensions for MCP imports
2. Use the established tool definition pattern
3. Implement proper error handling with detailed error messages
4. Follow the singleton server management pattern
5. Use the consistent response format
6. Add proper cleanup
7. Match the coding style of the existing codebase

---

## Example Usage:

I need to refactor the following code to match the established patterns in the SuperCollider MCP server:

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";

server.tool(
  "PlaySound",
  "Plays a sound",
  {
    frequency: z.number()
  },
  async ({ frequency }) => {
    const server = await sc.server.boot();
    const synth = await server.synth("sine", { freq: frequency });
    console.log("Playing sound");
    setTimeout(() => {
      return { text: "Done" };
    }, 1000);
  }
);
```

## Issues to Fix:
- [x] Import statements missing `.js` extensions
- [x] Using `console.log` instead of `console.error`
- [x] Tool name not in kebab-case
- [x] Missing parameter descriptions in Zod schema
- [x] Not following the server singleton pattern
- [x] Error handling doesn't match the pattern
- [x] Response format inconsistent
- [x] Missing cleanup after operations
- [x] Not properly handling async/await with setTimeout