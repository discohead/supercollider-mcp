import { z } from "zod";
import { kickDef, basslineDef, hihatDef, patterns } from "../sc/synthDefs.js";
import { interpretVibe, vibeToParams } from "../lib/vibeInterpreter.js";

export function registerVibeTools(server: any, scServer: any) {
  
  // Initialize techno environment
  server.tool(
    "techno-init",
    `Initialize the techno environment with basic SynthDefs and patterns.
    Run this once at the start of your session.`,
    {},
    async () => {
      try {
        // Load all SynthDefs
        await scServer.synthDef("technoKick", kickDef);
        await scServer.synthDef("hypnoticBass", basslineDef);
        await scServer.synthDef("hihat", hihatDef);
        
        // Initialize tempo
        const tempoCode = `TempoClock.default.tempo = 130/60;`; // 130 BPM
        await scServer.interpret(tempoCode);
        
        return {
          content: [
            { type: "text", text: "Techno environment initialized!" },
            { type: "text", text: "Loaded: technoKick, hypnoticBass, hihat" },
            { type: "text", text: "Tempo set to 130 BPM" }
          ]
        };
      } catch (error) {
        return {
          content: [
            { type: "text", text: `Initialization error: ${error}` }
          ]
        };
      }
    }
  );

  // Create a vibe
  server.tool(
    "vibe-create",
    `Create a hypnotic techno pattern from a vibe description.
    Example vibes: "dark minimal", "deep hypnotic", "driving and intense"`,
    {
      vibe: z.string().describe("Description of the desired vibe"),
      bars: z.number().optional().describe("Length in bars (default: 4)")
    },
    async ({ vibe, bars = 4 }: { vibe: string; bars?: number }) => {
      try {
        // Interpret the vibe
        const interpretation = interpretVibe(vibe);
        const params = vibeToParams(interpretation);
        
        // Build the composition based on interpretation
        let composition = "";
        
        // Always start with kick
        composition += patterns.hypnoticKick + ".play;\\n";
        
        // Add bass if included
        if (params.elements.includes('bass')) {
          // Modify bass pattern based on darkness
          const bassCode = patterns.hypnoticBass.replace(
            "\\\\cutoff, Pseq([800, 400, 1200, 600], inf)",
            `\\\\cutoff, Pseq([${params.basslineCutoff}, ${params.basslineCutoff * 0.5}, ${params.basslineCutoff * 1.5}, ${params.basslineCutoff * 0.75}], inf)`
          );
          composition += "\\n" + bassCode + ".play;\\n";
        }
        
        // Add hihat if included
        if (params.elements.includes('hihat')) {
          composition += "\\n" + patterns.minimalHihat + ".play;\\n";
        }
        
        // Execute the composition
        await scServer.interpret(composition);
        
        return {
          content: [
            { type: "text", text: `Created vibe: "${vibe}"` },
            { type: "text", text: `Interpretation: Energy=${interpretation.energy.toFixed(1)}, Darkness=${interpretation.darkness.toFixed(1)}` },
            { type: "text", text: `Playing: ${params.elements.join(', ')}` },
            { type: "text", text: "Use 'techno-stop' to stop playback" }
          ]
        };
      } catch (error) {
        return {
          content: [
            { type: "text", text: `Error creating vibe: ${error}` }
          ]
        };
      }
    }
  );

  // Stop all patterns
  server.tool(
    "techno-stop",
    "Stop all playing patterns.",
    {},
    async () => {
      try {
        await scServer.interpret("Pdef.clear;");
        
        return {
          content: [
            { type: "text", text: "All patterns stopped" }
          ]
        };
      } catch (error) {
        return {
          content: [
            { type: "text", text: `Error stopping patterns: ${error}` }
          ]
        };
      }
    }
  );

  // Tweak parameters
  server.tool(
    "techno-tweak",
    "Adjust parameters of the running pattern in real-time.",
    {
      element: z.enum(["kick", "bass", "hihat"]).describe("Which element to tweak"),
      param: z.string().describe("Parameter name (freq, cutoff, decay, etc)"),
      value: z.number().describe("New value")
    },
    async ({ element, param, value }: { element: "kick" | "bass" | "hihat"; param: string; value: number }) => {
      try {
        // This is simplified - in reality we'd need more sophisticated pattern control
        const code = `Pdef(\\\\${element}).set(\\\\${param}, ${value});`;
        await scServer.interpret(code);
        
        return {
          content: [
            { type: "text", text: `Updated ${element}.${param} = ${value}` }
          ]
        };
      } catch (error) {
        return {
          content: [
            { type: "text", text: `Error tweaking parameter: ${error}` }
          ]
        };
      }
    }
  );
}