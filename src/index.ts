#! /usr/bin/env node

import supercolliderjs from "supercolliderjs";
const sc = supercolliderjs;

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

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

  return serverInitPromise!;
}

// サーバーインスタンスの作成
export const server = new McpServer({
  name: "SuperColliderMcpServer",
  version: "0.1.0",
});


server.tool(
  "supercolliderExecute",
  "SynthDefのコードを生成し、そのコードを実行して音を出します。",
  { supercolliderSynthName: z.string().describe("synthDefの第1引数に渡すコードシンセの名前"), supercolliderCode: z.string().describe("synthDefの第2引数に渡すコード") },
  async (
    { supercolliderSynthName, supercolliderCode }:
      {
        supercolliderSynthName: string,
        supercolliderCode: string
      }) => {
    try {
      const scServer = await initServer();

      const def = await scServer.synthDef(
        supercolliderSynthName,
        supercolliderCode,
      );

      await scServer.synth(def);

      // シンセの実行時間を確保するために少し待機
      // ここでは演奏の持続時間を指定（ミリ秒）
      // デフォルトは5秒、実際の値はシンセの持続時間に応じて調整する必要あり
      const playDuration = 5000; // 5秒間演奏

      console.error(`シンセを${playDuration / 1000}秒間演奏中...`);
      await new Promise(resolve => setTimeout(resolve, playDuration));
      await scServer.quit();
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


const transport = new StdioServerTransport();
await server.connect(transport);
console.error("supercollider MCP Server running on stdio");

