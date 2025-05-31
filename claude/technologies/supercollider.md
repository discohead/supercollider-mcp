# SuperCollider Integration Patterns - SuperCollider MCP Server

## SuperCollider.js Library Usage

### Import Pattern
```typescript
import supercolliderjs from "supercolliderjs";
const sc = supercolliderjs;
```

### Server Interface Definition
```typescript
// Manual interface since library is untyped
interface SCServer {
  synthDef: (name: string, code: string) => Promise<any>;
  synth: (def: any, options?: any) => Promise<any>;
  quit: () => void;
}
```

## Server Lifecycle Management

### Server Boot Configuration
```typescript
const server = await (sc as any).server.boot({
  debug: false,      // Suppress debug output
  echo: false,       // Suppress echo output
  stderr: './supercollider-error.log'  // Redirect errors to file
}) as SCServer;
```

### Singleton Server Pattern
```typescript
let scServerInstance: SCServer | null = null;
let serverInitPromise: Promise<SCServer> | null = null;

async function initServer(): Promise<SCServer> {
  if (serverInitPromise) {
    return serverInitPromise;  // Reuse existing initialization
  }
  
  serverInitPromise = (async () => {
    try {
      console.error("Starting SuperCollider server...");
      const server = await (sc as any).server.boot({...});
      console.error("SuperCollider server startup complete");
      scServerInstance = server;
      return server;
    } catch (err) {
      console.error("SuperCollider server startup error:", err);
      serverInitPromise = null;  // Reset for retry
      throw err;
    }
  })();
  
  return serverInitPromise!;
}
```

## Synth Execution Patterns

### Single Synth Execution
```typescript
const def = await scServer.synthDef(synth.name, synth.code);
await scServer.synth(def);
```

### Multi-Synth Execution
```typescript
async function loadAndPlaySynth(scServer: SCServer, synthName: string, synthCode: string): Promise<any> {
  const def = await scServer.synthDef(synthName, synthCode);
  const synth = await scServer.synth(def);
  activeSynths.push(synth);  // Track for potential future use
  return synth;
}

// Parallel execution
const synthPromises = synths.map(s => loadAndPlaySynth(server, s.name, s.code));
const loadedSynths = await Promise.all(synthPromises);
```

## SuperCollider Code Patterns

### Expected Synth Code Format
```javascript
{
    arg freq = 440;           // Arguments with defaults
    var sig = SinOsc.ar(freq); // Signal generation
    Out.ar(0, sig);           // Output to bus 0
}
```

### Test Examples
```javascript
// Sine wave synth
{
    arg freq = 440;
    var sig = SinOsc.ar(freq);
    Out.ar(0, sig);
}

// White noise synth
{
    var sig = WhiteNoise.ar;
    Out.ar(0, sig);
}
```

## Cleanup and Process Management

### Comprehensive Cleanup
```typescript
async function cleanupServer() {
  if (scServerInstance) {
    try {
      // 1. Quit SuperCollider server
      await scServerInstance.quit();

      // 2. Reset state
      scServerInstance = null;
      serverInitPromise = null;
      activeSynths = [];

      // 3. Force kill sclang process
      try {
        if (process.platform === 'win32') {
          require('child_process').execSync('taskkill /F /IM sclang.exe', { stdio: 'ignore' });
        } else {
          require('child_process').execSync('pkill -f sclang', { stdio: 'ignore' });
        }
      } catch (killErr) {
        console.error('Attempting to terminate sclang process:', killErr);
      }

      console.error('SuperCollider server terminated');
    } catch (error) {
      console.error("Server termination error:", error);
    }
  }
}
```

## Duration Control Pattern

### Fire-and-Forget Playback
```typescript
// Start synth
await scServer.synth(def);

// Wait for duration
console.error(`Playing synth for ${duration / 1000} seconds...`);
await new Promise(resolve => setTimeout(resolve, duration));

// Cleanup after duration
await cleanupServer();
```

## Error Handling

### Server Startup Errors
- Logged to console.error
- Promise reset for potential retry
- Error propagated to tool handler

### Synth Execution Errors
- Caught at tool level
- Formatted for MCP response
- Server cleanup still attempted

## Platform Considerations

### Process Names
- Windows: `sclang.exe`
- Unix/macOS: `sclang`

### Error Log Location
- Fixed path: `./supercollider-error.log`
- Relative to working directory

## SuperCollider Integration Characteristics

1. **No Direct SC Language Access**: All operations through supercolliderjs API
2. **Stateless Synths**: No synth control after creation
3. **Bus 0 Output**: All examples output to default bus
4. **Server Per Operation**: Boot and cleanup for each tool invocation
5. **No Real-time Control**: Duration-based playback only

## Known Limitations

1. **Platform Support**: Tested only on macOS M1
2. **No Synth Control**: Cannot stop/modify synths after creation
3. **Single Server**: No concurrent operations
4. **Fixed Output**: Always outputs to bus 0
5. **No Input Processing**: No audio input capabilities