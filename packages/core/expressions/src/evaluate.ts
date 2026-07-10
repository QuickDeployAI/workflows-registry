import type { Expression } from "./ast.js";

export interface EvaluationContext {
  readonly input: unknown;
  readonly nodeOutputs: Readonly<Record<string, unknown>>;
}

export class ExpressionEvaluationError extends Error {
  constructor(
    message: string,
    readonly expression: Expression,
  ) {
    super(message);
    this.name = "ExpressionEvaluationError";
  }
}

/**
 * Deterministic, total-by-construction evaluator. Missing paths raise a typed
 * ExpressionEvaluationError (never a silent `undefined`) so compile-time
 * fidelity gaps can't leak into runtime as empty strings or no-ops.
 * Pure data-in/data-out — there is no code-execution path here by design.
 */
export function evaluateExpression(expression: Expression, context: EvaluationContext): unknown {
  switch (expression.kind) {
    case "literal":
      return expression.value;
    case "input":
      return resolvePath(context.input, expression.path, expression, "input");
    case "nodeOutput": {
      if (!(expression.nodeId in context.nodeOutputs)) {
        throw new ExpressionEvaluationError(
          `No output recorded for node "${expression.nodeId}".`,
          expression,
        );
      }
      return resolvePath(
        context.nodeOutputs[expression.nodeId],
        expression.path,
        expression,
        `nodeOutput(${expression.nodeId})`,
      );
    }
    case "interpolate":
      return expression.parts
        .map((part) => stringify(evaluateExpression(part, context)))
        .join("");
    case "compare": {
      const left = evaluateExpression(expression.left, context);
      const right = evaluateExpression(expression.right, context);
      return compare(expression.operator, left, right, expression);
    }
    case "boolean": {
      const values = expression.operands.map((operand) =>
        toBoolean(evaluateExpression(operand, context), expression),
      );
      switch (expression.operator) {
        case "and":
          return values.every(Boolean);
        case "or":
          return values.some(Boolean);
        case "not": {
          if (values.length !== 1) {
            throw new ExpressionEvaluationError("not takes exactly one operand.", expression);
          }
          return !values[0];
        }
      }
      break;
    }
    case "object": {
      const result: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(expression.entries)) {
        result[key] = evaluateExpression(value, context);
      }
      return result;
    }
    case "array":
      return expression.items.map((item) => evaluateExpression(item, context));
  }
}

function resolvePath(
  root: unknown,
  path: readonly string[],
  expression: Expression,
  label: string,
): unknown {
  let current: unknown = root;
  for (const segment of path) {
    if (Array.isArray(current) && /^\d+$/.test(segment)) {
      current = current[Number(segment)];
      continue;
    }
    if (current !== null && typeof current === "object" && segment in (current as object)) {
      current = (current as Record<string, unknown>)[segment];
      continue;
    }
    throw new ExpressionEvaluationError(
      `Path ${label}.${path.join(".")} is missing at segment "${segment}".`,
      expression,
    );
  }
  return current;
}

function compare(
  operator: "eq" | "ne" | "lt" | "le" | "gt" | "ge",
  left: unknown,
  right: unknown,
  expression: Expression,
): boolean {
  if (operator === "eq") return deepEquals(left, right);
  if (operator === "ne") return !deepEquals(left, right);
  if (typeof left === "number" && typeof right === "number") {
    switch (operator) {
      case "lt":
        return left < right;
      case "le":
        return left <= right;
      case "gt":
        return left > right;
      case "ge":
        return left >= right;
    }
  }
  if (typeof left === "string" && typeof right === "string") {
    const order = left < right ? -1 : left > right ? 1 : 0;
    switch (operator) {
      case "lt":
        return order < 0;
      case "le":
        return order <= 0;
      case "gt":
        return order > 0;
      case "ge":
        return order >= 0;
    }
  }
  throw new ExpressionEvaluationError(
    `Ordered comparison "${operator}" requires two numbers or two strings.`,
    expression,
  );
}

function deepEquals(left: unknown, right: unknown): boolean {
  if (Object.is(left, right)) return true;
  if (typeof left !== typeof right || left === null || right === null) return false;
  if (typeof left !== "object") return false;
  return JSON.stringify(sortKeys(left)) === JSON.stringify(sortKeys(right));
}

function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
        .map(([key, entry]) => [key, sortKeys(entry)]),
    );
  }
  return value;
}

function toBoolean(value: unknown, expression: Expression): boolean {
  if (typeof value === "boolean") return value;
  throw new ExpressionEvaluationError("Boolean operators require boolean operands.", expression);
}

function stringify(value: unknown): string {
  if (typeof value === "string") return value;
  if (value === null || value === undefined) {
    throw new ExpressionEvaluationError("Cannot interpolate null/undefined.", literalOf(value));
  }
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return JSON.stringify(value);
}

function literalOf(value: unknown): Expression {
  return { kind: "literal", value };
}
