#! /usr/bin/env node
// ESモジュールでのインポートとCommonJSの互換性を確保
import supercolliderjs from "supercolliderjs";
const sc = supercolliderjs;

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// 型定義（SuperColliderサーバーの型）
interface SCServer {
  synthDef: (name: string, code: string) => Promise<any>;
  synth: (def: any, options?: any) => Promise<any>;
  quit: () => void;
}

// SuperColliderサーバーインスタンスをグローバルに保持
let scServerInstance: SCServer | null = null;
let serverInitPromise: Promise<SCServer> | null = null;

// サーバーを初期化する関数
async function initServer(): Promise<SCServer> {
  if (!serverInitPromise) {
    serverInitPromise = (async () => {
      try {
        console.error("SuperColliderサーバーを起動中...");
        const server = await (sc as any).server.boot({
          debug: false,
          echo: false,
          stderr: './supercollider-error.log'
        }) as SCServer;
        
        console.error("SuperColliderサーバー起動完了");
        scServerInstance = server;
        return server;
      } catch (err) {
        console.error("SuperColliderサーバー起動エラー:", err);
        serverInitPromise = null;
        throw err;
      }
    })();
  }
  
  // nullにはならないことを保証する
  return serverInitPromise!;
}

// プロセス終了時にサーバーをシャットダウン
process.on('exit', () => {
  if (scServerInstance) {
    try {
      console.error("SuperColliderサーバーをシャットダウンしています...");
      scServerInstance.quit();
    } catch (e) {
      console.error("シャットダウン中にエラーが発生しました:", e);
    }
  }
});

// サーバーインスタンスの作成
export const server = new McpServer({
    name: "DiceRoller",
    version: "0.1.0",
});


server.tool(
    // supercolliderの音を出すツール
    "supercolliderExecute",
    "SynthDefのコードを生成し、そのコードを実行して音を出します。",
    // ツールの引数を定義するスキーマ
    { supercolliderSynthName: z.string().describe("synthDefの第1引数に渡すコードシンセの名前"), supercolliderCode: z.string().describe("synthDefの第2引数に渡すコード") },
    // ツールが呼び出されたときに実行される関数
    async ({ supercolliderSynthName, supercolliderCode }) => {
        // supercolliderのコードを実行する
        try {
            const scServer = await initServer();
            
            // SynthDefを登録して実行
            const def = await scServer.synthDef(
                supercolliderSynthName,
                supercolliderCode,
            );
            
            // Synthを実行
            await scServer.synth(def);
            
            // シンセの実行時間を確保するために少し待機
            // ここでは演奏の持続時間を指定（ミリ秒）
            // デフォルトは10秒、実際の値はシンセの持続時間に応じて調整する必要あり
            const playDuration = 5000; // 5秒間演奏
            
            console.error(`シンセを${playDuration/1000}秒間演奏中...`);
            await new Promise(resolve => setTimeout(resolve, playDuration));
            console.error('シンセの演奏完了');

            return {
                content: [
                    {
                        type: "text",
                        text: `シンセ名: ${supercolliderSynthName}`,
                    },
                    {
                        type: "text",
                        text: `コード: ${supercolliderCode}`,
                    },
                    {
                        type: "text",
                        text: "SuperColliderで音声を生成しました。",
                    }
                ],
            };
        } catch (error) {
            console.error("SuperCollider実行エラー:", error);
            return {
                content: [
                    {
                        type: "text",
                        text: `エラーが発生しました: ${error instanceof Error ? error.message : JSON.stringify(error, Object.getOwnPropertyNames(error), 2)}`,
                    }
                ],
            };
        }
    }
);


async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("supercollider MCP Server running on stdio");
}

main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});