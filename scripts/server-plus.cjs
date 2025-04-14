const sc = require("supercolliderjs");

sc.server.boot().then(server => {

  console.log(`server: server.isRunning: ${server.isRunning}`);
  const def = server.synthDef(
    "dreamyChordsSpread",
    `{
      arg wobble=5, innerWobble=8, releaseTime=3;
      var cmaj9 = #[60, 64, 67, 71, 74].midicps; // C, E, G, B, D
      var aflat9 = #[56, 60, 63, 67, 70].midicps; // Ab, C, Eb, G, Bb
      var speed = 0.2; // 切り替えの速度（Hz）
      var select = LFPulse.kr(speed, 0, 0.5); // 0か1の値を交互に出力
      var chord = Select.kr(select, [cmaj9, aflat9]);
      var sig = Mix.ar(
        chord.collect { |freq, i|
          // 各音の発音タイミングをずらす
          var timeOffset = i * 0.1;
          // 各音のパンポジションを分散させる（-1.0〜1.0の範囲で左右に配置）
          var pan = (i / (chord.size - 1) * 2 - 1) * 0.8;
          // より大きなデチューン効果にwobbleパラメータを適用
          var detune = LFNoise2.kr(0.1 + (i * 0.05) * wobble/10).range(0.97, 1.03);
          // 各音に異なるエンベロープを適用
          var env = EnvGen.kr(
            Env.asr(
              Rand(0.5, 2.0) + timeOffset, 
              Rand(0.8, 1.0), 
              releaseTime
            ), 
            gate: Impulse.kr(speed, phase: timeOffset % 1)
          );
          // 音色にモジュレーションを加える（innerWobbleパラメータを適用）
          var osc = SinOsc.ar(freq * detune, 0, 0.05) * 
                    LFTri.kr(LFNoise2.kr(0.1 + (i * 0.03)).range(0.1, innerWobble/20)).range(0.6, 1.0);
          
          // ステレオ定位を適用
          Pan2.ar(osc * env, pan)
        }
      ).sum;
      
      // 幻想的な雰囲気を出すためのリバーブ（より深め）
      sig = FreeVerb.ar(sig, 0.8, 0.9, 0.3);
      
      // さらに空間的な広がりを持たせるディレイを追加
      sig = sig + (DelayN.ar(sig, 0.5, [0.3, 0.4]) * 0.4);
      
      sig * 0.3; // 音量調整
  }`
  );

  setInterval(() => {
    server.synth(def, {
      wobble: Math.random() * 10,
      innerWobble: Math.random() * 16,
      releaseTime: Math.random() * 4 + 2,
    });
  }, 4000);
});
