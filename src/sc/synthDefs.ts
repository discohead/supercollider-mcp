// Basic SynthDef definitions for minimal techno

export const kickDef = `
SynthDef(\\technoKick, {
    arg out = 0, freq = 50, decay = 0.3, amp = 0.8;
    var env = EnvGen.kr(Env.perc(0.001, decay), doneAction: 2);
    var sig = SinOsc.ar(freq * EnvGen.kr(Env.perc(0.001, 0.08, 4, -4)));
    sig = sig + (WhiteNoise.ar(0.1) * EnvGen.kr(Env.perc(0.001, 0.01)));
    sig = (sig * env * amp).tanh;
    Out.ar(out, sig ! 2);
})`;

export const basslineDef = `
SynthDef(\\hypnoticBass, {
    arg out = 0, freq = 55, cutoff = 800, res = 0.3, amp = 0.6, gate = 1;
    var env = EnvGen.kr(Env.adsr(0.01, 0.1, 0.7, 0.1), gate, doneAction: 2);
    var sig = Saw.ar(freq) + Pulse.ar(freq * 0.99, 0.5, 0.5);
    sig = RLPF.ar(sig, cutoff * EnvGen.kr(Env.perc(0.01, 0.2, 3)), res);
    sig = (sig * env * amp).tanh;
    Out.ar(out, sig ! 2);
})`;

export const hihatDef = `
SynthDef(\\hihat, {
    arg out = 0, decay = 0.05, amp = 0.3, pan = 0;
    var env = EnvGen.kr(Env.perc(0.001, decay), doneAction: 2);
    var sig = WhiteNoise.ar() * env * amp;
    sig = HPF.ar(sig, 8000);
    Out.ar(out, Pan2.ar(sig, pan));
})`;

// Pattern templates for hypnotic techno
export const patterns = {
  hypnoticKick: `
Pdef(\\kick,
    Pbind(
        \\instrument, \\technoKick,
        \\dur, 1,  // Four on the floor
        \\freq, 50,
        \\decay, 0.3,
        \\amp, 0.8
    )
)`,

  hypnoticBass: `
Pdef(\\bass,
    Pbind(
        \\instrument, \\hypnoticBass,
        \\dur, Pseq([0.75, 0.25, 0.5, 0.5], inf),
        \\freq, Pseq([55, 55, 82.5, 55], inf),  // A1, A1, E2, A1
        \\cutoff, Pseq([800, 400, 1200, 600], inf),
        \\res, 0.3,
        \\amp, 0.6,
        \\legato, 0.8
    )
)`,

  minimalHihat: `
Pdef(\\hihat,
    Pbind(
        \\instrument, \\hihat,
        \\dur, 0.25,
        \\decay, Pseq([0.05, 0.02, 0.03, 0.02], inf),
        \\amp, Pseq([0.3, 0.1, 0.2, 0.1], inf) * Pgauss(1, 0.1),
        \\pan, Pwhite(-0.3, 0.3)
    )
)`
};