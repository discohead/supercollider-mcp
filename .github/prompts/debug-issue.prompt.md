# Prompt: Debug SuperCollider MCP Issue

I'm experiencing an issue with the SuperCollider MCP server:

## Error Description:
[DESCRIBE THE ERROR OR UNEXPECTED BEHAVIOR]

## When It Occurs:
- [ ] During server startup
- [ ] When executing a synth
- [ ] During cleanup
- [ ] In tests
- [ ] Other: [SPECIFY]

## Error Message:
```
[PASTE ERROR MESSAGE OR STACK TRACE]
```

## Code That Triggers Error:
```typescript
[PASTE RELEVANT CODE]
```

## What I've Tried:
- [LIST DEBUGGING STEPS ALREADY TAKEN]

## Expected Behavior:
[DESCRIBE WHAT SHOULD HAPPEN]

## Environment:
- OS: [macOS/Windows/Linux]
- Node version: [VERSION]
- SuperCollider version: [VERSION]
- Running in: [Claude Desktop/VS Code/Other]

Please help me:
1. Identify the root cause
2. Provide a fix that follows the established patterns
3. Add error handling if missing
4. Suggest how to prevent this in the future

---

## Example Filled Prompt:

I'm experiencing an issue with the SuperCollider MCP server:

## Error Description:
The server hangs and never responds when I try to play a synth with invalid SuperCollider code.

## When It Occurs:
- [x] When executing a synth
- [x] During cleanup

## Error Message:
```
SuperCollider server startup complete
ERROR: syntax error, unexpected NEWLINE, expecting '}'
  in interpreted text
  line 1 char 14:
  Out.ar(0, SinOsc.ar(440)
                ^
ERROR: Command line parse failed
```

## Code That Triggers Error:
```typescript
await client.callTool({
  name: "synth-execute",
  arguments: {
    synth: {
      name: "broken-synth",
      code: "Out.ar(0, SinOsc.ar(440)"  // Missing closing brace
    }
  }
});
```

## What I've Tried:
- Checked if the code is valid SuperCollider syntax (it's not)
- Tried wrapping in try-catch (doesn't help, server hangs)
- Restarted Claude Desktop

## Expected Behavior:
Should return an error response indicating invalid syntax, not hang the server.

## Environment:
- OS: macOS (M1)
- Node version: 20.11.0
- SuperCollider version: 3.13.0
- Running in: Claude Desktop