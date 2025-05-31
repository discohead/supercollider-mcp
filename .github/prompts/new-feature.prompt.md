# Prompt: Add New MCP Tool to SuperCollider Server

I need to add a new MCP tool called `[TOOL-NAME]` that [DESCRIBE WHAT IT DOES].

## Requirements:
- Tool name: `[TOOL-NAME]` (in kebab-case)
- Parameters:
  - `[PARAM1]`: [TYPE] - [DESCRIPTION] (required/optional)
  - `[PARAM2]`: [TYPE] - [DESCRIPTION] (required/optional)
- Expected behavior: [DESCRIBE EXPECTED BEHAVIOR]
- SuperCollider functionality needed: [e.g., play synth, record audio, analyze frequency]

## Example Usage:
```typescript
await client.callTool({
  name: "[TOOL-NAME]",
  arguments: {
    [PARAM1]: [EXAMPLE_VALUE],
    [PARAM2]: [EXAMPLE_VALUE]
  }
});
```

## Expected Response:
```typescript
{
  content: [
    { type: "text", text: "[EXPECTED MESSAGE 1]" },
    { type: "text", text: "[EXPECTED MESSAGE 2]" }
  ]
}
```

Please:
1. Add the tool definition to `src/index.ts`
2. Create any necessary helper functions
3. Add comprehensive tests to `src/index.test.ts`
4. Follow the existing patterns for error handling and server management
5. Use the established response format

---

## Example Filled Prompt:

I need to add a new MCP tool called `synth-sequence` that plays multiple synths in sequence with delays between them.

## Requirements:
- Tool name: `synth-sequence`
- Parameters:
  - `sequence`: Array of `{name: string, code: string, delay: number}` - Synths to play in order (required)
  - `loopCount`: number - How many times to loop the sequence (optional, default 1)
- Expected behavior: Play each synth in order, waiting for the specified delay between each
- SuperCollider functionality needed: Sequential synth playback with timing control

## Example Usage:
```typescript
await client.callTool({
  name: "synth-sequence",
  arguments: {
    sequence: [
      { name: "beep1", code: "{ Out.ar(0, SinOsc.ar(440)) }", delay: 1000 },
      { name: "beep2", code: "{ Out.ar(0, SinOsc.ar(880)) }", delay: 500 }
    ],
    loopCount: 2
  }
});
```

## Expected Response:
```typescript
{
  content: [
    { type: "text", text: "Played sequence of 2 synths, 2 times" },
    { type: "text", text: "Total duration: 3 seconds" }
  ]
}
```