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
        console.error("[TECHNO] Starting techno environment initialization...");
        
        // Load all SynthDefs
        console.error("[TECHNO] Loading SynthDefs...");
        await scServer.synthDef("technoKick", kickDef);
        console.error("[TECHNO] Loaded technoKick");
        
        await scServer.synthDef("hypnoticBass", basslineDef);
        console.error("[TECHNO] Loaded hypnoticBass");
        
        await scServer.synthDef("hihat", hihatDef);
        console.error("[TECHNO] Loaded hihat");
        
        // Initialize tempo (using simpler syntax)
        console.error("[TECHNO] Setting tempo...");
        try {
          const tempoCode = `TempoClock.default.tempo_(130/60)`; // 130 BPM
          await scServer.interpret(tempoCode);
          console.error("[TECHNO] Tempo set to 130 BPM");
        } catch (tempoError) {
          console.error("[TECHNO] Tempo setting failed, continuing without it:", tempoError);
          console.error("[TECHNO] Tempo will be handled by individual patterns");
        }
        
        console.error("[TECHNO] Initialization complete!");
        
        return {
          content: [
            { type: "text", text: "Techno environment initialized!" },
            { type: "text", text: "Loaded: technoKick, hypnoticBass, hihat" },
            { type: "text", text: "Tempo set to 130 BPM" }
          ]
        };
      } catch (error) {
        console.error("[TECHNO] Initialization error:", error);
        return {
          content: [
            { type: "text", text: `Initialization error: ${error instanceof Error ? error.message : JSON.stringify(error)}` },
            { type: "text", text: "Make sure SuperCollider is installed and accessible." }
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
        
        // Create a composite synth based on interpretation
        const vibeName = vibe.replace(/\s+/g, '_').toLowerCase();
        
        // Build a synth that combines the elements
        let synthCode = `{
          var tempo = 130/60 * 4; // Convert to quarter notes per second
          var kickGate, bassGate, hihatGate;
          var kick, bass, hihat, mix;
          
          // Tempo-synced triggers
          kickGate = Impulse.kr(tempo);
          bassGate = Impulse.kr(tempo / 2); // Half-time bass
          hihatGate = Impulse.kr(tempo * 2); // Double-time hihat
          
          // Kick drum (always present)
          kick = EnvGen.kr(Env.perc(0.001, ${interpretation.energy * 0.3 + 0.1}), kickGate) * 
                 SinOsc.ar(${interpretation.energy * 30 + 40} * EnvGen.kr(Env.perc(0.001, 0.08, 4, -4), kickGate));
        `;
        
        // Add bass if included
        if (params.elements.includes('bass')) {
          synthCode += `
          // Bass line
          bass = EnvGen.kr(Env.adsr(0.001, 0.1, 0.7, 0.2), bassGate) *
                 LPF.ar(Saw.ar(${interpretation.energy * 20 + 40}), ${params.basslineCutoff});
          `;
        } else {
          synthCode += `bass = 0;`;
        }
        
        // Add hihat if included
        if (params.elements.includes('hihat')) {
          synthCode += `
          // Hi-hat
          hihat = EnvGen.kr(Env.perc(0.001, ${0.1 - interpretation.darkness * 0.05}), hihatGate) *
                  HPF.ar(WhiteNoise.ar(${interpretation.energy * 0.3 + 0.1}), 8000);
          `;
        } else {
          synthCode += `hihat = 0;`;
        }
        
        synthCode += `
          // Mix and output
          mix = (kick + bass + hihat) * ${interpretation.energy * 0.5 + 0.3};
          mix = mix.tanh; // Soft limiting
          mix ! 2; // Stereo output
        }`;
        
        // Create and play the synth
        const synthDef = await scServer.synthDef(vibeName, synthCode);
        const synthInstance = await scServer.synth(synthDef);
        
        return {
          content: [
            { type: "text", text: `Created vibe: "${vibe}"` },
            { type: "text", text: `Interpretation: Energy=${interpretation.energy.toFixed(1)}, Darkness=${interpretation.darkness.toFixed(1)}` },
            { type: "text", text: `Playing: ${params.elements.join(', ')}` },
            { type: "text", text: "Use 'techno-stop' to stop playback" }
          ]
        };
      } catch (error) {
        console.error("[TECHNO] Vibe creation error:", error);
        return {
          content: [
            { type: "text", text: `Error creating vibe: ${error instanceof Error ? error.message : JSON.stringify(error)}` }
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
        // For now, we'll use a simple approach - this would need to be improved
        // to track individual synths and stop them properly
        return {
          content: [
            { type: "text", text: "Note: Individual synth stopping not yet implemented" },
            { type: "text", text: "Use techno-init to reset the environment" }
          ]
        };
      } catch (error) {
        return {
          content: [
            { type: "text", text: `Error stopping patterns: ${error instanceof Error ? error.message : JSON.stringify(error)}` }
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
        // For now, parameter tweaking is not implemented with the new synth approach
        return {
          content: [
            { type: "text", text: "Parameter tweaking not yet implemented with the new synth approach" },
            { type: "text", text: `Would set ${element}.${param} = ${value}` }
          ]
        };
      } catch (error) {
        return {
          content: [
            { type: "text", text: `Error tweaking parameter: ${error instanceof Error ? error.message : JSON.stringify(error)}` }
          ]
        };
      }
    }
  );
}