#! /usr/bin/env node

import supercolliderjs from "supercolliderjs";
const sc = supercolliderjs;

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerVibeTools } from "./tools/vibeTools.js";

interface SCServer {
  synthDef: (name: string, code: string) => Promise<any>;
  synth: (def: any, options?: any) => Promise<any>;
  interpret: (code: string) => Promise<any>;
  quit: () => void;
}

let scServerInstance: SCServer | null = null;
let serverInitPromise: Promise<SCServer> | null = null;

let activeSynths: any[] = [];

async function initServer(): Promise<SCServer> {
  if (serverInitPromise) {
    return serverInitPromise;
  }

  serverInitPromise = (async () => {
    try {
      console.error("Starting SuperCollider server...");
      const server = await (sc as any).server.boot({
        debug: false,
        echo: false,
        stderr: './supercollider-error.log'
      }) as SCServer;

      console.error("SuperCollider server startup complete");
      scServerInstance = server;
      return server;
    } catch (err) {
      console.error("SuperCollider server startup error:", err);
      serverInitPromise = null;
      throw err;
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
  if (scServerInstance) {
    try {
      await scServerInstance.quit();

      scServerInstance = null;
      serverInitPromise = null;
      activeSynths = [];

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

// Create server instance
export const server = new McpServer({
  name: "SuperColliderMcpServer",
  version: "0.1.0",
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

      const loadedSynths = await Promise.all(synthPromises);

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

// Register vibe tools for techno composition
registerVibeTools(server, {
  synthDef: async (name: string, code: string) => {
    const scServer = await initServer();
    return scServer.synthDef(name, code);
  },
  interpret: async (code: string) => {
    const scServer = await initServer();
    return scServer.interpret(code);
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
console.error("supercollider MCP Server running on stdio");

