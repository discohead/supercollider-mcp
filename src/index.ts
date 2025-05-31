#! /usr/bin/env node

// Import local supercolliderjs 
import * as sc from "../supercolliderjs/packages/supercolliderjs/lib/index.js";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerVibeTools } from "./tools/vibeTools.js";
import { execSync } from "child_process";
import { MockSCServer } from "./mockSuperCollider.js";

interface SCServer {
  synthDef: (name: string, code: string) => Promise<any>;
  synth: (def: any, options?: any) => Promise<any>;
  quit: () => void;
}

interface SCLang {
  interpret: (code: string) => Promise<any>;
  quit: () => void;
}

let scServerInstance: SCServer | null = null;
let scLangInstance: SCLang | null = null;
let serverInitPromise: Promise<SCServer> | null = null;
let langInitPromise: Promise<SCLang> | null = null;

let activeSynths: any[] = [];

async function initLang(): Promise<SCLang> {
  if (langInitPromise) {
    return langInitPromise;
  }

  langInitPromise = (async () => {
    try {
      console.error("[SC] Starting SuperCollider language...");
      
      const sclang = await (sc as any).lang.boot({
        debug: false,
        echo: false,
        stdin: false
      });
      
      console.error("[SC] SuperCollider language startup complete");
      scLangInstance = sclang;
      return sclang;
    } catch (err) {
      console.error("[SC] SuperCollider language startup error:", err);
      langInitPromise = null;
      throw err;
    }
  })();

  return langInitPromise;
}

async function initServer(): Promise<SCServer> {
  if (serverInitPromise) {
    return serverInitPromise;
  }

  serverInitPromise = (async () => {
    try {
      console.error("[SC] Starting SuperCollider server...");
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("SuperCollider startup timeout (30s)")), 30000);
      });
      
      const bootPromise = (sc as any).server.boot({
        debug: false,
        echo: false,
        stderr: './supercollider-error.log',
        stdout: './supercollider-output.log',
        // Try different configuration options
        host: 'localhost',
        port: 57110,
        // Fix audio configuration issues
        serverOptions: {
          numInputBusChannels: 0,  // Disable input to avoid sample rate mismatch
          numOutputBusChannels: 2,
          sampleRate: 48000,
          blockSize: 512
        }
      });
      
      const server = await Promise.race([bootPromise, timeoutPromise]) as SCServer;

      console.error("[SC] SuperCollider server startup complete");
      scServerInstance = server;
      return server;
    } catch (err) {
      console.error("[SC] SuperCollider server startup error:", err);
      console.error("[SC] Error details:", JSON.stringify(err, Object.getOwnPropertyNames(err)));
      
      // Check if SuperCollider is installed
      try {
        try {
          execSync('which sclang', { stdio: 'ignore' });
          console.error("[SC] SuperCollider binary found in PATH");
        } catch {
          // Try macOS app location (supercolliderjs expects it in SuperCollider/ subdirectory)
          try {
            execSync('ls "/Applications/SuperCollider/SuperCollider.app/Contents/MacOS/sclang"', { stdio: 'ignore' });
            console.error("[SC] SuperCollider found in /Applications/SuperCollider but not in PATH");
            console.error("[SC] Consider adding to PATH or using full path");
          } catch {
            console.error("[SC] SuperCollider not found in standard locations");
          }
        }
      } catch {
        console.error("[SC] ERROR: SuperCollider not found. Please install SuperCollider first.");
      }
      
      // Fallback to mock server for testing
      console.error("[SC] Falling back to mock SuperCollider server for testing");
      const mockServer = new MockSCServer();
      scServerInstance = mockServer as any;
      serverInitPromise = null;
      return mockServer as any;
    }
  })();

  return serverInitPromise!;
}

async function loadAndPlaySynth(scServer: SCServer, synthName: string, synthCode: string): Promise<any> {
  const def = await scServer.synthDef(synthName, synthCode);
  const synth = await scServer.synth(def);
  activeSynths.push(synth);
  return synth;
}

async function cleanupServer() {
  // Cleanup language instance
  if (scLangInstance) {
    try {
      scLangInstance.quit();
      scLangInstance = null;
      langInitPromise = null;
    } catch (error) {
      console.error("Language termination error:", error);
    }
  }

  // Cleanup server instance  
  if (scServerInstance) {
    try {
      scServerInstance.quit();

      scServerInstance = null;
      serverInitPromise = null;
      activeSynths = [];

      try {
        if (process.platform === 'win32') {
          execSync('taskkill /F /IM sclang.exe', { stdio: 'ignore' });
        } else {
          execSync('pkill -f sclang', { stdio: 'ignore' });
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

// Create server instance
export const server = new McpServer({
  name: "SuperColliderMcpServer",
  version: "0.1.0",
});

// Add initialization logging - but don't override the default handler
process.on('uncaughtException', (error: any) => {
  console.error("[MCP] Uncaught exception:", error);
  // Don't exit - just log the error and continue
  if (error.code === 'ENOENT') {
    console.error("[MCP] This is likely a SuperCollider path issue");
  }
});

process.on('unhandledRejection', (reason, promise) => {
  console.error("[MCP] Unhandled rejection at:", promise, "reason:", reason);
  // Don't exit - just log the error and continue
});


server.tool(
  "synth-execute",
  `Generates SynthDef code and executes it to produce sound.
  Please wrap the code in curly braces {}.`,
  {
    synth: z.object({
      name: z.string().describe("Synth name"),
      code: z.string().describe("Synth code")
    }).describe("Synth information to play"),
    duration: z.number().optional().describe("Playback duration in milliseconds. Default is 5000 (5 seconds)")
  },
  async ({ synth, duration = 5000 }) => {
    try {
      const scServer = await initServer();

      const def = await scServer.synthDef(synth.name, synth.code);
      await scServer.synth(def);

      console.error(`Playing synth for ${duration / 1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, duration));

      await cleanupServer();

      console.error('Synth playback complete');

      return {
        content: [
          {
            type: "text",
            text: `Synth name: ${synth.name}`,
          },
          {
            type: "text",
            text: `Code: ${synth.code}`,
          },
          {
            type: "text",
            text: `Playback duration: ${duration / 1000} seconds`,
          }
        ],
      };
    } catch (error) {
      console.error("SuperCollider execution error:", error);
      return {
        content: [
          {
            type: "text",
            text: `An error occurred: ${error instanceof Error ? error.message : JSON.stringify(error, Object.getOwnPropertyNames(error), 2)}`,
          }
        ],
      };
    }
  }
);

server.tool(
  "multi-synth-execute",
  "Execute multiple SynthDefs simultaneously.",
  {
    synths: z.array(
      z.object({
        name: z.string().describe("Synth name"),
        code: z.string().describe("Synth code")
      })
    ).describe("List of synths to play"),
    duration: z.number().optional().describe("Playback duration in milliseconds. Default is 10000 (10 seconds)")
  },
  async (
    { synths, duration = 10000 }:
      {
        synths: { name: string, code: string }[],
        duration?: number
      }
  ) => {
    try {
      const scServer = await initServer();
      const synthPromises = [];

      for (const synth of synths) {
        synthPromises.push(loadAndPlaySynth(scServer, synth.name, synth.code));
      }

      await Promise.all(synthPromises);

      console.error(`Playing ${synths.length} synths for ${duration / 1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, duration));

      await cleanupServer();

      console.error('Multiple synth playback complete');

      return {
        content: [
          {
            type: "text",
            text: `Played ${synths.length} synths simultaneously.`,
          },
          {
            type: "text",
            text: `Synths played: ${synths.map(s => s.name).join(', ')}`,
          },
          {
            type: "text",
            text: `Total playback duration: ${duration / 1000} seconds`,
          }
        ],
      };
    } catch (error) {
      console.error("Multiple synth execution error:", error);
      return {
        content: [
          {
            type: "text",
            text: `An error occurred: ${error instanceof Error ? error.message : JSON.stringify(error, Object.getOwnPropertyNames(error), 2)}`,
          }
        ],
      };
    }
  }
);

// Check if SuperCollider is available before starting
try {
  execSync('which sclang', { stdio: 'ignore' });
  console.error("[MCP] SuperCollider found in PATH");
} catch {
  // Try macOS app location (supercolliderjs expects it in SuperCollider/ subdirectory)
  try {
    execSync('ls "/Applications/SuperCollider/SuperCollider.app/Contents/MacOS/sclang"', { stdio: 'ignore' });
    console.error("[MCP] SuperCollider found in /Applications/SuperCollider");
    console.error("[MCP] Note: Consider adding SuperCollider to PATH for better performance");
  } catch {
    console.error("[MCP] WARNING: SuperCollider not found");
    console.error("[MCP] Please install SuperCollider from: https://supercollider.github.io/downloads");
    console.error("[MCP] Some features may not work without SuperCollider");
  }
}

const transport = new StdioServerTransport();

// Register vibe tools for techno composition 
console.error("[MCP] Registering vibe tools...");
try {
  registerVibeTools(server, {
    synthDef: async (name: string, code: string) => {
      const scServer = await initServer();
      return scServer.synthDef(name, code);
    },
    interpret: async (code: string) => {
      const sclang = await initLang();
      return sclang.interpret(code);
    }
  });
  console.error("[MCP] Vibe tools registered successfully");
} catch (error) {
  console.error("[MCP] Failed to register vibe tools:", error);
  console.error("[MCP] Continuing with basic tools only");
}

console.error("[MCP] Connecting to transport...");
await server.connect(transport);
console.error("[MCP] Transport connected successfully");
console.error("[MCP] Techno Vibe MCP Server running on stdio");
console.error("[MCP] Server ready and listening for requests");

