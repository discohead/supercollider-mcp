import { describe, it, expect } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { server } from "./index.js";
 
describe("synth-execute", () => {
  it("Check if sine wave is output", async () => {

    const client = new Client({
      name: "test client",
      version: "0.1.0",
    });
 
    // Create in-memory communication channel
    const [clientTransport, serverTransport] =
      InMemoryTransport.createLinkedPair();
      
    // Connect client and server
    await Promise.all([
      client.connect(clientTransport),
      server.connect(serverTransport),
    ]);
 
    const result = await client.callTool({
      name: "synth-execute",
      arguments: {
        synth: {
            name: "test-synth",
            code: `
            {
                arg freq = 440;
                var sig = SinOsc.ar(freq);
                Out.ar(0, sig);
            }
            `,
        },
        duration: 500
      },
    });
 
    expect(result).toEqual({
      content: [
        {
          type: "text",
          text: "Synth name: test-synth",
        },
        {
          type: "text",
          text: `Code: 
            {
                arg freq = 440;
                var sig = SinOsc.ar(freq);
                Out.ar(0, sig);
            }
            `,
        },
        {
          type: "text",
          text: "Playback duration: 0.5 seconds",
        },
      ],
    });
  });
});


describe("multi-synth-execute", () => {
    it("Check if sine wave and noise are output", async () => {
    
        const client = new Client({
        name: "test client",
        version: "0.1.0",
        });
     
        // Create in-memory communication channel
        const [clientTransport, serverTransport] =
        InMemoryTransport.createLinkedPair();
        
        // Connect client and server
        await Promise.all([
        client.connect(clientTransport),
        server.connect(serverTransport),
        ]);
     
        const result = await client.callTool({
        name: "multi-synth-execute",
        arguments: {
            synths: [
            {
                name: "test-synth",
                code: `
                {
                    arg freq = 440;
                    var sig = SinOsc.ar(freq);
                    Out.ar(0, sig);
                }
                `,
            },
            {
                name: "noise-synth",
                code: `
                {
                    var sig = WhiteNoise.ar;
                    Out.ar(0, sig);
                }
                `,
            },
            ],
            duration: 500,
        },
        });
     
        expect(result).toEqual({
        content: [
            {
            type: "text",
            text: "Played 2 synths simultaneously."
            },
            {
            type: "text",
            text: "Synths played: test-synth, noise-synth"
            },
            {
            type: "text",
            text: "Total playback duration: 0.5 seconds"
            },
        ],
        });
    });
    });