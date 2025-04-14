# 序章：はじめに

## 音楽とAIの関係

近年、人工知能（AI）の急速な発展は様々な分野に革命をもたらしています。音楽の世界もその例外ではありません。AIによる作曲、編曲、音声合成など、かつては人間の専門知識と感性だけが成し得た創造的作業が、今やAIの支援によって新たな可能性を見出しています。
音楽生成AIとして代表的なものはSunoでしょう。曲のイメージをプロンプトとして入力するだけで本格的な楽曲を生成することができます。

## SuperColliderについて

SuperColliderは、1996年に開発が始まった強力なオーディオ合成エンジンとプログラミング言語です。リアルタイムオーディオ合成とアルゴリズミック作曲のための環境として、実験音楽、電子音楽、アルゴリズミック作曲など、先端的な音楽制作の現場で広く使われています。
従来、SuperColliderの操作には専門的な知識が必要でした。SuperCollider独自の言語を学び、音響合成の原理を理解し、プログラミングのスキルを身につける必要があったのです。これは音楽家やアーティストにとって大きな参入障壁となっていました。

## SuperColliderをMCPサーバーで操る

本書では、SuperColliderを操作するMCPサーバーの作成方法について解説し、どのような可能性が広がるのかを探ります。具体的には、以下のような内容を扱います：
- MCPサーバーの基本的な実装方法
- SuperColliderを操作するためのツールの実装
- 自然言語による音響デザインの実現
- SuperColliderの強力な機能を活用した音楽制作の新たなアプローチ


# 1章：SuperColliderについて簡単に
SuperColliderを操作するMCPサーバーを作成するにあたって、まずはSuperColliderの基本的な知識を押さえておきましょう。

## SuperColliderとは何か

SuperColliderには、次の 3 つの主要コンポーネントがあります。

**scsynth** – サーバーとして実装されたリアルタイム オーディオ エンジン
**sclang** – サーバーのクライアントとして機能するインタープリタ型プログラミング言語
**scide** – ヘルプ システムが統合された sclang 用エディター

クライアント/サーバー アーキテクチャにより、複数のクライアントが接続してサーバー上の状況を制御することが可能です。  
sclang はサーバーのネイティブ言語およびクライアントですが、Python、JavaScript、Haskell、Scalaなど、他のプログラミング言語によるクライアント実装もいくつかあります。 SuperCollider には、マルチスレッドをサポートするsupernovaと呼ばれる scsynth の代替実装も含まれています。 SuperColliderは James McCartney によって開発され、1996 年に最初にリリースされました。 2002 年に、彼は寛大にもこれを GNU General Public License の下でフリー ソフトウェアとしてリリースしました。 それ以来、アクティブで熱心なコミュニティによって保守および開発されています。

MCPサーバーのTypescript SDKとSuperColliderのJavaScriptライブラリを組み合わせてMCPサーバーの実装を行います。


## 2章：SuperCollider MCPサーバーの実装

### MCPサーバーの基本的な実装方法

MCPサーバーは、LLM（大規模言語モデル）がアプリケーションやツールとやり取りするための標準化されたプロトコルです。  
TypescriptのSDKが提供されているので、これを利用して基本的なMCPサーバーの実装方法について確認していきましょう。

#### Toolの実装

toolを定義する際の基本的な構文は以下のようになります。

```typescript
tool(
    name: string, // ツールの名前
    description: string, // ツールの説明
    paramsSchema: Args, // 引数のスキーマ。zodを使用して定義
    cb: ToolCallback<Args>, // ツールを呼び出した際に実行されるコールバック
)
```

単純な足し算を行うツールの実装例は以下のようになります。

```typescript
server.tool(
    "add",
    "Adds two numbers together",
    { 
        a: z.number(),
        b: z.number() 
    },
    async ({ a, b }) => ({
    content: [
        { 
            type: "text",
             text: String(a + b) 
        }
    ]
  })
);
```

### サーバーの起動

MCPの仕様として、クライアントとの通信のためのトランスポートにはStdIOもしくはStreamable HTTPが推奨されています。（2025/4/12現在）

以下はStdIOを使用したサーバーの起動を行うコード例です。

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new McpServer({
  name: "example-server",
  version: "1.0.0"
});

// ... set up server resources, tools, and prompts ...

const transport = new StdioServerTransport();
await server.connect(transport);
```

### SuperCollider MCPサーバーの実装

さて、いよいよSuperColliderを操作するMCPサーバーの実装に入ります。
SuperColliderのJavaScriptライブラリである `supercolliderjs` を使用して、SuperColliderをMCPサーバーから操作できるようにします。


```typescript
server.tool(
    "supercollider-execute",
    "SynthDefのコードを生成し、そのコードを実行して音を出します。",
    { 
        supercolliderSynthName: z.string().describe("synthDefの第1引数に渡すコードシンセの名前"), supercolliderCode: z.string().describe("synthDefの第2引数に渡すコード") 
    },
    async ({ supercolliderSynthName, supercolliderCode }) => {

            const scServer = await (sc as any).server.boot({
                debug: false,
                echo: false,
                stderr: './supercollider-error.log'
            }) as SCServer;
            
            const def = await scServer.synthDef(
                supercolliderSynthName,
                supercolliderCode,
            );
            
            await scServer.synth(def);

            return {
                content: [
                    {
                        type: "text",
                        text: `シンセ名: ${supercolliderSynthName}`,
                    },
                    {
                        type: "text",
                        text: `実行コード: ${supercolliderCode}`,
                    }
                ],
            };
    }
);
```

SynthDefは音色名と音色の定義を行うコードを引数に取ります。
音色と音色の定義をLLMに生成させ、それをそのまま実行することで音を出すことができます。

シンセサイザーの音を出すために必要な実装はたったこれだけです。

### inspectorによる動作確認

### Claude Desktopから利用する

### VS Codeの利用

## 3章：自然言語によるサウンドデザイン

MCPサーバーの実装が完了したので、これを使って色んな音を出してみましょう。
実際に出る音はGithubのリポジトリに保存しているので、そちらを確認してみてください。

Prompt: 天に昇るような音を出してみて
URL: https:gihub.com/your-repo/supercollider-sounds/blob/main/heavenly_ascension.scd

toolへの入力: 

``` typescript
{
  `supercolliderCode`: `
{
  var freq = LFNoise1.kr(0.1).exprange(300, 1200);
  var mainOsc = SinOsc.ar(freq * [1, 1.002], 0, 0.3);
  
  // Rising effect
  var rise = XLine.kr(0.5, 4, 8);
  var risingSine = SinOsc.ar(freq * rise, 0, 0.2);
  
  // Shimmer effect with high frequencies
  var shimmer = SinOsc.ar(
    freq * [5, 7, 9, 11] * LFNoise1.kr(0.3!4).exprange(0.9, 1.1),
    0,
    LFNoise1.kr(0.2!4).range(0.01, 0.08)
  );
  
  // Reverb to create spaciousness
  var sig = mainOsc + risingSine + shimmer.sum;
  var reverb = FreeVerb.ar(sig, 0.8, 0.9, 0.2);
  
  // Slight panning movement
  var panned = Pan2.ar(reverb, SinOsc.kr(0.1).range(-0.5, 0.5));
  
  panned * EnvGen.kr(Env.linen(4, 8, 6, 0.6), doneAction: 2);
}
`,
  `supercolliderSynthName`: `HeavenlyAscension`
}
```



Prompt: 天から降るような音
toolへの入力: 

``` typescript
{
  `supercolliderCode`: `
{
  // 降下する主音
  var baseFreq = XLine.kr(2000, 200, 10);
  var mainOsc = SinOsc.ar(baseFreq * [1, 1.01], 0, 0.3);
  
  // 天からの降下効果 - シンプル化
  var droplets = Mix.fill(6, {
    var t = Dust.kr(2);
    var e = EnvGen.kr(Env.perc(0.01, 0.5), t);
    var f = TRand.kr(800, 3000, t);
    var p = TRand.kr(-0.8, 0.8, t);
    Pan2.ar(SinOsc.ar(f * LFNoise1.kr(3).range(0.9, 1.1), 0, e * 0.08), p);
  });
  
  // 空間的効果
  var sig = mainOsc + droplets;
  var reverb = FreeVerb.ar(sig, 0.7, 0.8, 0.3);
  
  // フェードアウト
  reverb * EnvGen.kr(Env.linen(2, 8, 5, 0.6), doneAction: 2);
}
`,
  `supercolliderSynthName`: `HeavenlyDescent`
}
```

このように、自然言語で音のイメージを伝えるだけで、SuperColliderのコードを生成し、音を出すことができます。