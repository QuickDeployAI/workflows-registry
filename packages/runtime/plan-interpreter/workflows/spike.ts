import { createHook } from "workflow";

export async function double(value: number): Promise<number> {
  "use step";
  return value * 2;
}

export async function spikeWorkflow(value: number): Promise<number> {
  "use workflow";
  const doubled = await double(value);
  return doubled + 1;
}

export async function spikeHookWorkflow(token: string): Promise<string> {
  "use workflow";
  using hook = createHook<{ note: string }>({ token });
  const payload = await hook;
  return payload.note;
}
