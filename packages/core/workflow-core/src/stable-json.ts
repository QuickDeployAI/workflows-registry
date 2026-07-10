/**
 * Deterministic 2-space JSON with short string arrays compacted inline —
 * byte-identical output across runs, required by the workflows.json drift gate.
 * Ported from the sibling registries' registry-build serializers.
 */
export function stableJson(value: unknown): string {
  return compactShortStringArrays(`${JSON.stringify(value, null, 2)}\n`);
}

function compactShortStringArrays(json: string): string {
  const lines = json.split("\n");
  const output: string[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index] ?? "";
    const start = /^(\s*(?:"[^"]+": )?)\[$/.exec(line);
    if (!start) {
      output.push(line);
      continue;
    }

    const prefix = start[1] ?? "";
    const itemIndent = `${line.match(/^\s*/)?.[0] ?? ""}  `;
    const items: string[] = [];
    let cursor = index + 1;
    while (cursor < lines.length) {
      const item = new RegExp(`^${escapeRegExp(itemIndent)}(".*")(?:,)?$`).exec(lines[cursor] ?? "");
      if (!item) break;
      items.push(item[1] ?? "");
      cursor += 1;
    }

    const end = new RegExp(`^${escapeRegExp(line.match(/^\s*/)?.[0] ?? "")}\\](,?)$`).exec(
      lines[cursor] ?? "",
    );
    const inline = `${prefix}[${items.join(", ")}]${end?.[1] ?? ""}`;
    if (items.length > 0 && items.length <= 4 && end && inline.length <= 100) {
      output.push(inline);
      index = cursor;
      continue;
    }

    output.push(line);
  }

  return output.join("\n");
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
