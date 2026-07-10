import { z } from "zod";

export type CompareOperator = "eq" | "ne" | "lt" | "le" | "gt" | "ge";

/**
 * The single expression representation every importer lowers to. Source
 * expression languages (Arazzo runtime expressions, ASL paths, Logic Apps
 * functions, jq subsets, vendor mapping tokens) are never passed through to
 * eval/JS/templates — they either lower to this AST or land in the fidelity
 * report as unsupported/blocked.
 */
export type Expression =
  | { kind: "literal"; value: unknown }
  | { kind: "input"; path: string[] }
  | { kind: "nodeOutput"; nodeId: string; path: string[] }
  | { kind: "interpolate"; parts: Expression[] }
  | { kind: "compare"; operator: CompareOperator; left: Expression; right: Expression }
  | { kind: "boolean"; operator: "and" | "or" | "not"; operands: Expression[] }
  | { kind: "object"; entries: Record<string, Expression> }
  | { kind: "array"; items: Expression[] };

export const ExpressionSchema: z.ZodType<Expression> = z.lazy(() =>
  z.discriminatedUnion("kind", [
    z.object({ kind: z.literal("literal"), value: z.unknown() }),
    z.object({ kind: z.literal("input"), path: z.array(z.string()) }),
    z.object({
      kind: z.literal("nodeOutput"),
      nodeId: z.string().min(1),
      path: z.array(z.string()),
    }),
    z.object({ kind: z.literal("interpolate"), parts: z.array(ExpressionSchema) }),
    z.object({
      kind: z.literal("compare"),
      operator: z.enum(["eq", "ne", "lt", "le", "gt", "ge"]),
      left: ExpressionSchema,
      right: ExpressionSchema,
    }),
    z.object({
      kind: z.literal("boolean"),
      operator: z.enum(["and", "or", "not"]),
      operands: z.array(ExpressionSchema),
    }),
    z.object({ kind: z.literal("object"), entries: z.record(z.string(), ExpressionSchema) }),
    z.object({ kind: z.literal("array"), items: z.array(ExpressionSchema) }),
  ]),
) as z.ZodType<Expression>;

export function literal(value: unknown): Expression {
  return { kind: "literal", value };
}

export function inputRef(...path: string[]): Expression {
  return { kind: "input", path };
}

export function nodeOutputRef(nodeId: string, ...path: string[]): Expression {
  return { kind: "nodeOutput", nodeId, path };
}
