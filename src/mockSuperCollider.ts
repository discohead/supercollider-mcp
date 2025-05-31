// Mock SuperCollider server for testing when SC isn't available

export class MockSCServer {
  async synthDef(name: string, code: string): Promise<any> {
    console.error(`[MOCK] Would load SynthDef: ${name}`);
    console.error(`[MOCK] Code: ${code.slice(0, 100)}...`);
    return { name, loaded: true };
  }

  async synth(def: any, options?: any): Promise<any> {
    console.error(`[MOCK] Would play synth: ${def.name}`);
    return { id: Math.random(), playing: true };
  }

  async interpret(code: string): Promise<any> {
    console.error(`[MOCK] Would interpret: ${code.slice(0, 50)}...`);
    return { result: "ok" };
  }

  quit(): void {
    console.error("[MOCK] Would quit SuperCollider server");
  }
}