import { describe, expect, it } from "vitest";
import { ExpressionSchema, inputRef, literal, nodeOutputRef, type Expression } from "./ast.js";
import { ExpressionEvaluationError, evaluateExpression } from "./evaluate.js";

const context = {
  input: { petId: "p-1", qty: 2, flag: true },
  nodeOutputs: { findPet: { price: 12.5, tags: ["a", "b"] } },
};

describe("evaluateExpression", () => {
  it("resolves literals, input paths, and node outputs", () => {
    expect(evaluateExpression(literal(42), context)).toBe(42);
    expect(evaluateExpression(inputRef("petId"), context)).toBe("p-1");
    expect(evaluateExpression(nodeOutputRef("findPet", "price"), context)).toBe(12.5);
    expect(evaluateExpression(nodeOutputRef("findPet", "tags", "1"), context)).toBe("b");
  });

  it("is deterministic (same input, same output)", () => {
    const expr: Expression = {
      kind: "object",
      entries: {
        id: inputRef("petId"),
        total: { kind: "compare", operator: "gt", left: nodeOutputRef("findPet", "price"), right: literal(10) },
      },
    };
    expect(evaluateExpression(expr, context)).toEqual(evaluateExpression(expr, context));
  });

  it("interpolates strings", () => {
    const expr: Expression = {
      kind: "interpolate",
      parts: [literal("pet:"), inputRef("petId"), literal(":qty:"), inputRef("qty")],
    };
    expect(evaluateExpression(expr, context)).toBe("pet:p-1:qty:2");
  });

  it("throws typed errors on missing paths instead of yielding undefined", () => {
    expect(() => evaluateExpression(inputRef("missing"), context)).toThrow(
      ExpressionEvaluationError,
    );
    expect(() => evaluateExpression(nodeOutputRef("nope", "x"), context)).toThrow(
      ExpressionEvaluationError,
    );
  });

  it("compares numbers, strings, and deep-equal objects", () => {
    expect(
      evaluateExpression(
        { kind: "compare", operator: "le", left: literal(1), right: literal(2) },
        context,
      ),
    ).toBe(true);
    expect(
      evaluateExpression(
        { kind: "compare", operator: "eq", left: literal({ a: [1] }), right: literal({ a: [1] }) },
        context,
      ),
    ).toBe(true);
    expect(() =>
      evaluateExpression(
        { kind: "compare", operator: "lt", left: literal(1), right: literal("2") },
        context,
      ),
    ).toThrow(ExpressionEvaluationError);
  });

  it("boolean operators require booleans", () => {
    expect(
      evaluateExpression(
        { kind: "boolean", operator: "and", operands: [literal(true), inputRef("flag")] },
        context,
      ),
    ).toBe(true);
    expect(() =>
      evaluateExpression({ kind: "boolean", operator: "or", operands: [literal(1)] }, context),
    ).toThrow(ExpressionEvaluationError);
  });

  it("round-trips through the zod schema", () => {
    const expr: Expression = {
      kind: "boolean",
      operator: "not",
      operands: [{ kind: "compare", operator: "eq", left: inputRef("qty"), right: literal(0) }],
    };
    const parsed = ExpressionSchema.parse(JSON.parse(JSON.stringify(expr)));
    expect(evaluateExpression(parsed, context)).toBe(true);
  });
});
