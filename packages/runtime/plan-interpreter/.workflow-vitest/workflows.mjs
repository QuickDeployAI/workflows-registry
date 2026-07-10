// biome-ignore-all lint: generated file
/* eslint-disable */
import { workflowEntrypoint } from 'workflow/runtime';

const workflowCode = `globalThis.__private_workflows = new Map();
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// ../../../node_modules/.pnpm/ms@2.1.3/node_modules/ms/index.js
var require_ms = __commonJS({
  "../../../node_modules/.pnpm/ms@2.1.3/node_modules/ms/index.js"(exports, module2) {
    var s = 1e3;
    var m = s * 60;
    var h = m * 60;
    var d = h * 24;
    var w = d * 7;
    var y = d * 365.25;
    module2.exports = function(val, options) {
      options = options || {};
      var type = typeof val;
      if (type === "string" && val.length > 0) {
        return parse(val);
      } else if (type === "number" && isFinite(val)) {
        return options.long ? fmtLong(val) : fmtShort(val);
      }
      throw new Error("val is not a non-empty string or a valid number. val=" + JSON.stringify(val));
    };
    function parse(str) {
      str = String(str);
      if (str.length > 100) {
        return;
      }
      var match = /^(-?(?:\\d+)?\\.?\\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?\$/i.exec(str);
      if (!match) {
        return;
      }
      var n = parseFloat(match[1]);
      var type = (match[2] || "ms").toLowerCase();
      switch (type) {
        case "years":
        case "year":
        case "yrs":
        case "yr":
        case "y":
          return n * y;
        case "weeks":
        case "week":
        case "w":
          return n * w;
        case "days":
        case "day":
        case "d":
          return n * d;
        case "hours":
        case "hour":
        case "hrs":
        case "hr":
        case "h":
          return n * h;
        case "minutes":
        case "minute":
        case "mins":
        case "min":
        case "m":
          return n * m;
        case "seconds":
        case "second":
        case "secs":
        case "sec":
        case "s":
          return n * s;
        case "milliseconds":
        case "millisecond":
        case "msecs":
        case "msec":
        case "ms":
          return n;
        default:
          return void 0;
      }
    }
    __name(parse, "parse");
    function fmtShort(ms2) {
      var msAbs = Math.abs(ms2);
      if (msAbs >= d) {
        return Math.round(ms2 / d) + "d";
      }
      if (msAbs >= h) {
        return Math.round(ms2 / h) + "h";
      }
      if (msAbs >= m) {
        return Math.round(ms2 / m) + "m";
      }
      if (msAbs >= s) {
        return Math.round(ms2 / s) + "s";
      }
      return ms2 + "ms";
    }
    __name(fmtShort, "fmtShort");
    function fmtLong(ms2) {
      var msAbs = Math.abs(ms2);
      if (msAbs >= d) {
        return plural(ms2, msAbs, d, "day");
      }
      if (msAbs >= h) {
        return plural(ms2, msAbs, h, "hour");
      }
      if (msAbs >= m) {
        return plural(ms2, msAbs, m, "minute");
      }
      if (msAbs >= s) {
        return plural(ms2, msAbs, s, "second");
      }
      return ms2 + " ms";
    }
    __name(fmtLong, "fmtLong");
    function plural(ms2, msAbs, n, name) {
      var isPlural = msAbs >= n * 1.5;
      return Math.round(ms2 / n) + " " + name + (isPlural ? "s" : "");
    }
    __name(plural, "plural");
  }
});

// ../../../node_modules/.pnpm/@workflow+utils@4.1.3/node_modules/@workflow/utils/dist/time.js
var import_ms = __toESM(require_ms(), 1);
function parseDurationToDate(param) {
  if (typeof param === "string") {
    const durationMs = (0, import_ms.default)(param);
    if (typeof durationMs !== "number" || durationMs < 0) {
      throw new Error(\`Invalid duration: "\${param}". Expected a valid duration string like "1s", "1m", "1h", etc.\`);
    }
    return new Date(Date.now() + durationMs);
  } else if (typeof param === "number") {
    if (param < 0 || !Number.isFinite(param)) {
      throw new Error(\`Invalid duration: \${param}. Expected a non-negative finite number of milliseconds.\`);
    }
    return new Date(Date.now() + param);
  } else if (param instanceof Date || param && typeof param === "object" && typeof param.getTime === "function") {
    return param instanceof Date ? param : new Date(param.getTime());
  } else {
    throw new Error(\`Invalid duration parameter. Expected a duration string, number (milliseconds), or Date object.\`);
  }
}
__name(parseDurationToDate, "parseDurationToDate");

// ../../../node_modules/.pnpm/@workflow+errors@4.1.4/node_modules/@workflow/errors/dist/index.js
var BASE_URL = "https://useworkflow.dev/err";
function isError(value) {
  return typeof value === "object" && value !== null && "name" in value && "message" in value;
}
__name(isError, "isError");
var ERROR_SLUGS = {
  NODE_JS_MODULE_IN_WORKFLOW: "node-js-module-in-workflow",
  START_INVALID_WORKFLOW_FUNCTION: "start-invalid-workflow-function",
  SERIALIZATION_FAILED: "serialization-failed",
  WEBHOOK_INVALID_RESPOND_WITH_VALUE: "webhook-invalid-respond-with-value",
  WEBHOOK_RESPONSE_NOT_SENT: "webhook-response-not-sent",
  FETCH_IN_WORKFLOW_FUNCTION: "fetch-in-workflow",
  TIMEOUT_FUNCTIONS_IN_WORKFLOW: "timeout-in-workflow",
  HOOK_CONFLICT: "hook-conflict",
  CORRUPTED_EVENT_LOG: "corrupted-event-log",
  REPLAY_DIVERGENCE: "replay-divergence",
  STEP_NOT_REGISTERED: "step-not-registered",
  WORKFLOW_NOT_REGISTERED: "workflow-not-registered",
  RUNTIME_DECRYPTION_FAILED: "runtime-decryption-failed"
};
var WorkflowError = class extends Error {
  static {
    __name(this, "WorkflowError");
  }
  cause;
  constructor(message, options) {
    const msgDocs = options?.slug ? \`\${message}

Learn more: \${BASE_URL}/\${options.slug}\` : message;
    super(msgDocs, {
      cause: options?.cause
    });
    this.cause = options?.cause;
    if (options?.cause instanceof Error) {
      this.stack = \`\${this.stack}
Caused by: \${options.cause.stack}\`;
    }
  }
  static is(value) {
    return isError(value) && value.name === "WorkflowError";
  }
};
var HookConflictError = class extends WorkflowError {
  static {
    __name(this, "HookConflictError");
  }
  token;
  // TODO: Make this required once all persisted hook_conflict events and World
  // implementations always include the active hook owner's run ID.
  conflictingRunId;
  constructor(token, conflictingRunId) {
    super(\`Hook token "\${token}" is already in use by another workflow\${conflictingRunId ? \` (run "\${conflictingRunId}")\` : ""}\`, {
      slug: ERROR_SLUGS.HOOK_CONFLICT
    });
    this.name = "HookConflictError";
    this.token = token;
    if (conflictingRunId !== void 0) {
      this.conflictingRunId = conflictingRunId;
    }
  }
  static is(value) {
    return isError(value) && value.name === "HookConflictError";
  }
};
var FatalError = class extends Error {
  static {
    __name(this, "FatalError");
  }
  fatal = true;
  constructor(message) {
    super(message);
    this.name = "FatalError";
  }
  static is(value) {
    return isError(value) && value.name === "FatalError";
  }
};
var RetryableError = class extends Error {
  static {
    __name(this, "RetryableError");
  }
  /**
   * The Date when the step should be retried.
   */
  retryAfter;
  constructor(message, options = {}) {
    super(message);
    this.name = "RetryableError";
    if (options.retryAfter !== void 0) {
      this.retryAfter = parseDurationToDate(options.retryAfter);
    } else {
      this.retryAfter = new Date(Date.now() + 1e3);
    }
  }
  static is(value) {
    return isError(value) && value.name === "RetryableError";
  }
};
var FATAL_ERROR_KEY = /* @__PURE__ */ Symbol.for("@workflow/errors//FatalError");
var RETRYABLE_ERROR_KEY = /* @__PURE__ */ Symbol.for("@workflow/errors//RetryableError");
var HOOK_CONFLICT_ERROR_KEY = /* @__PURE__ */ Symbol.for("@workflow/errors//HookConflictError");
if (typeof globalThis !== "undefined") {
  if (!Object.hasOwn(globalThis, FATAL_ERROR_KEY)) {
    Object.defineProperty(globalThis, FATAL_ERROR_KEY, {
      value: FatalError,
      writable: false,
      enumerable: false,
      configurable: false
    });
  }
  if (!Object.hasOwn(globalThis, RETRYABLE_ERROR_KEY)) {
    Object.defineProperty(globalThis, RETRYABLE_ERROR_KEY, {
      value: RetryableError,
      writable: false,
      enumerable: false,
      configurable: false
    });
  }
  if (!Object.hasOwn(globalThis, HOOK_CONFLICT_ERROR_KEY)) {
    Object.defineProperty(globalThis, HOOK_CONFLICT_ERROR_KEY, {
      value: HookConflictError,
      writable: false,
      enumerable: false,
      configurable: false
    });
  }
}

// ../../../node_modules/.pnpm/@workflow+core@4.6.0/node_modules/@workflow/core/dist/symbols.js
var WORKFLOW_CREATE_HOOK = /* @__PURE__ */ Symbol.for("WORKFLOW_CREATE_HOOK");
var WORKFLOW_SLEEP = /* @__PURE__ */ Symbol.for("WORKFLOW_SLEEP");

// ../../../node_modules/.pnpm/@workflow+core@4.6.0/node_modules/@workflow/core/dist/sleep.js
async function sleep(param) {
  const sleepFn = globalThis[WORKFLOW_SLEEP];
  if (!sleepFn) {
    throw new Error("\`sleep()\` can only be called inside a workflow function");
  }
  return sleepFn(param);
}
__name(sleep, "sleep");

// ../../../node_modules/.pnpm/@workflow+core@4.6.0/node_modules/@workflow/core/dist/workflow/get-workflow-metadata.js
var WORKFLOW_CONTEXT_SYMBOL = /* @__PURE__ */ Symbol.for("WORKFLOW_CONTEXT");
function getWorkflowMetadata() {
  const ctx = globalThis[WORKFLOW_CONTEXT_SYMBOL];
  if (!ctx) {
    throw new Error("\`getWorkflowMetadata()\` can only be called inside a workflow or step function");
  }
  return ctx;
}
__name(getWorkflowMetadata, "getWorkflowMetadata");

// ../../../node_modules/.pnpm/@workflow+core@4.6.0/node_modules/@workflow/core/dist/workflow/create-hook.js
function createHook(options) {
  const createHookFn = globalThis[WORKFLOW_CREATE_HOOK];
  if (!createHookFn) {
    throw new Error("\`createHook()\` can only be called inside a workflow function");
  }
  return createHookFn(options);
}
__name(createHook, "createHook");

// ../../../node_modules/.pnpm/workflow@4.6.0_@nestjs+common@11.1.28_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+core@1_2d0e8b8885f204048cf0529d8e13b1c7/node_modules/workflow/dist/stdlib.js
var fetch = globalThis[/* @__PURE__ */ Symbol.for("WORKFLOW_USE_STEP")]("step//workflow@4.6.0//fetch");

// ../../core/expressions/dist/evaluate.js
var ExpressionEvaluationError = class extends Error {
  static {
    __name(this, "ExpressionEvaluationError");
  }
  expression;
  constructor(message, expression) {
    super(message);
    this.expression = expression;
    this.name = "ExpressionEvaluationError";
  }
};
function evaluateExpression(expression, context) {
  switch (expression.kind) {
    case "literal":
      return expression.value;
    case "input":
      return resolvePath(context.input, expression.path, expression, "input");
    case "nodeOutput": {
      if (!(expression.nodeId in context.nodeOutputs)) {
        throw new ExpressionEvaluationError(\`No output recorded for node "\${expression.nodeId}".\`, expression);
      }
      return resolvePath(context.nodeOutputs[expression.nodeId], expression.path, expression, \`nodeOutput(\${expression.nodeId})\`);
    }
    case "interpolate":
      return expression.parts.map((part) => stringify(evaluateExpression(part, context))).join("");
    case "compare": {
      const left = evaluateExpression(expression.left, context);
      const right = evaluateExpression(expression.right, context);
      return compare(expression.operator, left, right, expression);
    }
    case "boolean": {
      const values = expression.operands.map((operand) => toBoolean(evaluateExpression(operand, context), expression));
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
      const result = {};
      for (const [key, value] of Object.entries(expression.entries)) {
        result[key] = evaluateExpression(value, context);
      }
      return result;
    }
    case "array":
      return expression.items.map((item) => evaluateExpression(item, context));
  }
}
__name(evaluateExpression, "evaluateExpression");
function resolvePath(root, path, expression, label) {
  let current = root;
  for (const segment of path) {
    if (Array.isArray(current) && /^\\d+\$/.test(segment)) {
      current = current[Number(segment)];
      continue;
    }
    if (current !== null && typeof current === "object" && segment in current) {
      current = current[segment];
      continue;
    }
    throw new ExpressionEvaluationError(\`Path \${label}.\${path.join(".")} is missing at segment "\${segment}".\`, expression);
  }
  return current;
}
__name(resolvePath, "resolvePath");
function compare(operator, left, right, expression) {
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
  throw new ExpressionEvaluationError(\`Ordered comparison "\${operator}" requires two numbers or two strings.\`, expression);
}
__name(compare, "compare");
function deepEquals(left, right) {
  if (Object.is(left, right)) return true;
  if (typeof left !== typeof right || left === null || right === null) return false;
  if (typeof left !== "object") return false;
  return JSON.stringify(sortKeys(left)) === JSON.stringify(sortKeys(right));
}
__name(deepEquals, "deepEquals");
function sortKeys(value) {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0).map(([key, entry]) => [
      key,
      sortKeys(entry)
    ]));
  }
  return value;
}
__name(sortKeys, "sortKeys");
function toBoolean(value, expression) {
  if (typeof value === "boolean") return value;
  throw new ExpressionEvaluationError("Boolean operators require boolean operands.", expression);
}
__name(toBoolean, "toBoolean");
function stringify(value) {
  if (typeof value === "string") return value;
  if (value === null || value === void 0) {
    throw new ExpressionEvaluationError("Cannot interpolate null/undefined.", literalOf(value));
  }
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return JSON.stringify(value);
}
__name(stringify, "stringify");
function literalOf(value) {
  return {
    kind: "literal",
    value
  };
}
__name(literalOf, "literalOf");

// steps/executors.ts
var computeActionDigest = globalThis[/* @__PURE__ */ Symbol.for("WORKFLOW_USE_STEP")]("step//./steps/executors//computeActionDigest");
computeActionDigest.maxRetries = 3;
var recordAuditEvent = globalThis[/* @__PURE__ */ Symbol.for("WORKFLOW_USE_STEP")]("step//./steps/executors//recordAuditEvent");
recordAuditEvent.maxRetries = 3;
var evaluateRuntimePolicy = globalThis[/* @__PURE__ */ Symbol.for("WORKFLOW_USE_STEP")]("step//./steps/executors//evaluateRuntimePolicy");
evaluateRuntimePolicy.maxRetries = 3;
var readArtifact = globalThis[/* @__PURE__ */ Symbol.for("WORKFLOW_USE_STEP")]("step//./steps/executors//readArtifact");
readArtifact.maxRetries = 3;
var writeArtifact = globalThis[/* @__PURE__ */ Symbol.for("WORKFLOW_USE_STEP")]("step//./steps/executors//writeArtifact");
writeArtifact.maxRetries = 3;
var dispatchCapability = globalThis[/* @__PURE__ */ Symbol.for("WORKFLOW_USE_STEP")]("step//./steps/executors//dispatchCapability");
dispatchCapability.maxRetries = 0;

// steps/agent.ts
var agentCreateSession = globalThis[/* @__PURE__ */ Symbol.for("WORKFLOW_USE_STEP")]("step//./steps/agent//agentCreateSession");
agentCreateSession.maxRetries = 3;
var agentNextTurn = globalThis[/* @__PURE__ */ Symbol.for("WORKFLOW_USE_STEP")]("step//./steps/agent//agentNextTurn");
agentNextTurn.maxRetries = 3;
var agentAppendToolResult = globalThis[/* @__PURE__ */ Symbol.for("WORKFLOW_USE_STEP")]("step//./steps/agent//agentAppendToolResult");
agentAppendToolResult.maxRetries = 3;
var compileSubplanProposal = globalThis[/* @__PURE__ */ Symbol.for("WORKFLOW_USE_STEP")]("step//./steps/agent//compileSubplanProposal");
compileSubplanProposal.maxRetries = 0;

// workflows/run-execution-plan.ts
async function runExecutionPlan(request) {
  const metadata = getWorkflowMetadata();
  const runId = metadata.workflowRunId;
  if (request.bindings.planDigest !== request.planDigest) {
    throw new FatalError(\`Binding lock targets \${request.bindings.planDigest}, not plan \${request.planDigest}.\`);
  }
  const state = {
    runId,
    planDigest: request.planDigest,
    policyDigest: request.planDigest,
    plan: request.plan,
    bindings: new Map(request.bindings.bindings.map((binding) => [
      binding.requirementId,
      binding
    ])),
    outputs: {},
    depth: 0
  };
  await recordAuditEvent({
    runId,
    planDigest: request.planDigest,
    type: "run-started",
    detail: {
      planId: request.plan.id,
      name: request.plan.name
    }
  });
  try {
    const result = await interpretGraph(state, request.plan.entryNodeId, request.input);
    await recordAuditEvent({
      runId,
      planDigest: request.planDigest,
      type: "run-completed",
      detail: {}
    });
    return result;
  } catch (error) {
    await recordAuditEvent({
      runId,
      planDigest: request.planDigest,
      type: "run-failed",
      detail: {
        message: error instanceof Error ? error.message : String(error)
      }
    });
    throw error;
  }
}
__name(runExecutionPlan, "runExecutionPlan");
runExecutionPlan.workflowId = "workflow//./workflows/run-execution-plan//runExecutionPlan";
globalThis.__private_workflows.set("workflow//./workflows/run-execution-plan//runExecutionPlan", runExecutionPlan);
async function interpretGraph(state, entryNodeId, input) {
  let nodeId = entryNodeId;
  let lastOutput;
  while (nodeId !== void 0) {
    const node = state.plan.nodes[nodeId];
    if (!node) throw new FatalError(\`Plan references missing node "\${nodeId}".\`);
    const context = {
      input,
      nodeOutputs: state.outputs
    };
    switch (node.kind) {
      case "succeed":
        return node.output ? evaluateExpression(node.output, context) : lastOutput;
      case "fail":
        throw new FatalError(\`\${node.error}\${node.message ? \`: \${node.message}\` : ""}\`);
      case "choice": {
        let target;
        for (const choice of node.choices) {
          if (evaluateExpression(choice.when, context) === true) {
            target = choice.then;
            break;
          }
        }
        target ??= node.otherwise;
        if (target === void 0) {
          throw new FatalError(\`Choice "\${node.id}" matched no branch and has no otherwise.\`);
        }
        nodeId = target;
        continue;
      }
      case "wait":
        await sleep(\`\${node.seconds}s\`);
        state.outputs[node.id] = {
          waitedSeconds: node.seconds
        };
        break;
      case "signal": {
        const hook = createHook({
          token: \`signal:\${state.runId}:\${node.signalName}\`
        });
        const payload = await hook;
        state.outputs[node.id] = payload;
        break;
      }
      case "approval": {
        const subject = evaluateExpression(node.subject, context);
        state.outputs[node.id] = await runApproval(state, node.id, node.plane, subject, node.expiresSeconds);
        break;
      }
      case "parallel": {
        const results = await Promise.all(node.branches.map((branch) => interpretGraph(state, branch.entryNodeId, input)));
        state.outputs[node.id] = results;
        break;
      }
      case "forEach": {
        const items = evaluateExpression(node.items, context);
        if (!Array.isArray(items)) {
          throw new FatalError(\`forEach "\${node.id}" items did not evaluate to an array.\`);
        }
        const concurrency = Math.min(node.maxConcurrency, state.plan.budgets.maxParallelism);
        const results = [];
        for (let offset = 0; offset < items.length; offset += concurrency) {
          const chunk = items.slice(offset, offset + concurrency);
          const chunkResults = await Promise.all(chunk.map((item, index) => interpretIteration(state, node.bodyEntryNodeId, input, node.id, {
            item,
            index: offset + index
          })));
          results.push(...chunkResults);
        }
        state.outputs[node.id] = results;
        break;
      }
      case "loop": {
        const maxIterations = Math.min(node.maxIterations, state.plan.budgets.maxIterations);
        const results = [];
        for (let iteration = 0; iteration < maxIterations; iteration += 1) {
          if (node.continueWhile) {
            const proceed = evaluateExpression(node.continueWhile, {
              input,
              nodeOutputs: {
                ...state.outputs,
                [node.id]: {
                  iteration,
                  results
                }
              }
            });
            if (proceed !== true) break;
          }
          results.push(await interpretIteration(state, node.bodyEntryNodeId, input, node.id, {
            iteration,
            results
          }));
        }
        state.outputs[node.id] = results;
        break;
      }
      case "childWorkflow": {
        state.outputs[node.id] = await runChildPlan(state, node, context);
        break;
      }
      case "invoke": {
        state.outputs[node.id] = await runInvoke(state, node, context);
        break;
      }
    }
    lastOutput = state.outputs[node.id];
    nodeId = "next" in node ? node.next : void 0;
  }
  return lastOutput;
}
__name(interpretGraph, "interpretGraph");
async function interpretIteration(state, bodyEntryNodeId, input, slotNodeId, slotValue) {
  const iterationState = {
    ...state,
    outputs: {
      ...state.outputs,
      [slotNodeId]: slotValue
    }
  };
  return interpretGraph(iterationState, bodyEntryNodeId, input);
}
__name(interpretIteration, "interpretIteration");
async function runInvoke(state, node, context) {
  const requirement = state.plan.capabilityRequirements.find((req) => req.id === node.binding);
  if (!requirement) throw new FatalError(\`Invoke "\${node.id}" has no requirement "\${node.binding}".\`);
  const binding = state.bindings.get(node.binding);
  if (!binding) throw new FatalError(\`No binding locked for requirement "\${node.binding}".\`);
  const args = evaluateExpression(node.input, context);
  const iterationKey = iterationKeyOf(context);
  if (requirement.protocol === "agent") {
    return runAgentLoop(state, node, requirement, binding, args, iterationKey);
  }
  const preflight = await evaluateRuntimePolicy({
    subject: "workflow",
    requirementId: requirement.id,
    protocol: requirement.protocol,
    operation: requirement.operation,
    effect: requirement.effect,
    planDigest: state.policyDigest,
    runId: state.runId,
    ...binding.endpoint === void 0 ? {} : {
      host: hostOf(binding.endpoint)
    },
    ...binding.credentialHandle === void 0 ? {} : {
      credentialHandle: binding.credentialHandle
    },
    args
  });
  if (preflight.decision === "deny") {
    if (node.onError) return routeError(state, node, context, \`policy denied: \${preflight.reason}\`);
    throw new FatalError(\`Policy denied \${requirement.operation}: \${preflight.reason}\`);
  }
  let approvedArgumentsDigest;
  if (preflight.decision === "approval-required" || node.approval === "business-effect") {
    const approval = await runApproval(state, node.id, "business-effect", args, void 0);
    approvedArgumentsDigest = approval.argumentsDigest;
  }
  const maxAttempts = node.retry?.maxAttempts ?? 1;
  let lastError;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const request = {
        runId: state.runId,
        planDigest: state.planDigest,
        policyDigest: state.policyDigest,
        nodeId: node.id,
        attempt,
        iterationKey,
        subject: "workflow",
        requirement,
        binding,
        args,
        ...approvedArgumentsDigest === void 0 ? {} : {
          approvedArgumentsDigest
        },
        ...await serializeIdempotency(state, node, context)
      };
      return await dispatchCapability(request);
    } catch (error) {
      lastError = error;
      if (error instanceof FatalError || isFatalName(error)) break;
      if (attempt < maxAttempts && (node.retry?.backoffSeconds ?? 0) > 0) {
        await sleep(\`\${node.retry?.backoffSeconds ?? 0}s\`);
      }
    }
  }
  if (node.onError) {
    return routeError(state, node, context, lastError instanceof Error ? lastError.message : String(lastError));
  }
  throw lastError instanceof Error ? lastError : new FatalError(String(lastError));
}
__name(runInvoke, "runInvoke");
async function runAgentLoop(state, node, requirement, _binding, args, iterationKey) {
  const task = String(args?.task ?? "");
  const agent = requirement.operation;
  const sessionKey = \`\${state.runId}:\${state.planDigest}:\${node.id}:\${iterationKey}\`;
  const identity = {
    runId: state.runId,
    planDigest: state.planDigest,
    nodeId: node.id
  };
  const session = await agentCreateSession({
    ...identity,
    agent,
    task,
    sessionKey
  });
  const toolResults = [];
  const maxTurns = state.plan.budgets.maxIterations;
  for (let turn = 0; turn < maxTurns; turn += 1) {
    const result = await agentNextTurn({
      ...identity,
      sessionId: session.sessionId,
      context: {
        task,
        turn,
        toolResults
      }
    });
    if (result.kind === "final") {
      return result.output;
    }
    if (result.kind === "propose-subplan") {
      if (state.depth + 1 >= state.plan.budgets.maxDepth) {
        throw new FatalError(\`Agent subplan at "\${node.id}" exceeds the depth budget.\`);
      }
      const compiled = await compileSubplanProposal({
        ...identity,
        proposal: result.proposal,
        parentBudgets: state.plan.budgets
      });
      const childState = {
        runId: state.runId,
        planDigest: compiled.childPlanDigest,
        policyDigest: state.policyDigest,
        plan: compiled.plan,
        bindings: state.bindings,
        outputs: {},
        depth: state.depth + 1
      };
      const childResult = await interpretGraph(childState, compiled.plan.entryNodeId, toolResults);
      await agentAppendToolResult({
        sessionId: session.sessionId,
        result: childResult
      });
      toolResults.push(childResult);
      continue;
    }
    for (const [actionIndex, action] of result.actions.entries()) {
      const actionRequirement = state.plan.capabilityRequirements.find((candidate) => candidate.id === action.requirementId);
      if (!actionRequirement) {
        throw new FatalError(\`Agent at "\${node.id}" proposed undeclared capability "\${action.requirementId}".\`);
      }
      const actionBinding = state.bindings.get(action.requirementId);
      if (!actionBinding) {
        throw new FatalError(\`Agent capability "\${action.requirementId}" is not bound by the installation lock.\`);
      }
      const preflight = await evaluateRuntimePolicy({
        subject: \`agent:\${agent}\`,
        requirementId: actionRequirement.id,
        protocol: actionRequirement.protocol,
        operation: actionRequirement.operation,
        effect: actionRequirement.effect,
        planDigest: state.policyDigest,
        runId: state.runId,
        ...actionBinding.endpoint === void 0 ? {} : {
          host: hostOf(actionBinding.endpoint)
        },
        ...actionBinding.credentialHandle === void 0 ? {} : {
          credentialHandle: actionBinding.credentialHandle
        },
        args: action.input
      });
      if (preflight.decision === "deny") {
        throw new FatalError(\`Policy denied agent action \${actionRequirement.operation}: \${preflight.reason}\`);
      }
      let approvedArgumentsDigest;
      if (preflight.decision === "approval-required") {
        const approval = await runApproval(state, \`\${node.id}:t\${turn}a\${actionIndex}\`, "business-effect", action.input, void 0);
        approvedArgumentsDigest = approval.argumentsDigest;
      }
      const value = await dispatchCapability({
        runId: state.runId,
        planDigest: state.planDigest,
        policyDigest: state.policyDigest,
        nodeId: node.id,
        attempt: 1,
        iterationKey: \`\${iterationKey}|t\${turn}a\${actionIndex}\`,
        subject: \`agent:\${agent}\`,
        requirement: actionRequirement,
        binding: actionBinding,
        args: action.input,
        ...approvedArgumentsDigest === void 0 ? {} : {
          approvedArgumentsDigest
        },
        ...actionRequirement.effect === "read" ? {} : {
          idempotency: {
            kind: "deduplication-record",
            namespace: \`\${state.plan.id}:agent-actions\`
          }
        }
      });
      await agentAppendToolResult({
        sessionId: session.sessionId,
        result: value
      });
      toolResults.push(value);
    }
  }
  throw new FatalError(\`Agent loop "\${node.id}" exhausted its \${maxTurns}-turn budget without a final answer.\`);
}
__name(runAgentLoop, "runAgentLoop");
async function serializeIdempotency(state, node, context) {
  const policy = node.idempotency;
  if (!policy) return {};
  switch (policy.kind) {
    case "provider-key":
      return {
        idempotency: {
          kind: "provider-key",
          keyValue: String(evaluateExpression(policy.key, context))
        }
      };
    case "deduplication-record":
      return {
        idempotency: {
          kind: "deduplication-record",
          namespace: policy.namespace
        }
      };
    case "lookup-before-create": {
      const { requirement, binding } = resolveBinding(state, policy.lookupBinding);
      return {
        idempotency: {
          kind: "lookup-before-create",
          lookupRequirement: requirement,
          lookupBinding: binding
        }
      };
    }
    case "reconciliation": {
      const { requirement, binding } = resolveBinding(state, policy.verifyBinding);
      return {
        idempotency: {
          kind: "reconciliation",
          verifyRequirement: requirement,
          verifyBinding: binding
        }
      };
    }
    case "not-idempotent":
      return {
        idempotency: {
          kind: "not-idempotent"
        }
      };
  }
}
__name(serializeIdempotency, "serializeIdempotency");
function resolveBinding(state, requirementId) {
  const requirement = state.plan.capabilityRequirements.find((req) => req.id === requirementId);
  const binding = state.bindings.get(requirementId);
  if (!requirement || !binding) {
    throw new FatalError(\`Idempotency helper requirement "\${requirementId}" is not bound.\`);
  }
  return {
    requirement,
    binding
  };
}
__name(resolveBinding, "resolveBinding");
async function routeError(state, node, context, message) {
  state.outputs[node.id] = {
    error: message
  };
  return interpretGraph(state, node.onError, context.input);
}
__name(routeError, "routeError");
async function runApproval(state, nodeId, plane, subject, expiresSeconds) {
  const argumentsDigest = await computeActionDigest(subject);
  const token = \`approval:\${state.runId}:\${state.planDigest}:\${nodeId}:\${argumentsDigest}\`;
  await recordAuditEvent({
    runId: state.runId,
    planDigest: state.planDigest,
    type: "approval-requested",
    nodeId,
    detail: {
      plane,
      token,
      argumentsDigest
    }
  });
  const hook = createHook({
    token
  });
  let decision;
  if (expiresSeconds !== void 0) {
    const expiry = sleep(\`\${expiresSeconds}s\`).then(() => "expired");
    const raced = await Promise.race([
      hook,
      expiry
    ]);
    if (raced === "expired") {
      throw new FatalError(\`Approval for node "\${nodeId}" expired after \${expiresSeconds}s.\`);
    }
    decision = raced;
  } else {
    decision = await hook;
  }
  const resolvedDetail = {
    plane,
    approved: decision.approved,
    presented: decision.argumentsDigest,
    expected: argumentsDigest
  };
  await recordAuditEvent({
    runId: state.runId,
    planDigest: state.planDigest,
    type: "approval-resolved",
    nodeId,
    detail: resolvedDetail
  });
  if (!decision.approved) {
    throw new FatalError(\`Approval for node "\${nodeId}" was rejected.\`);
  }
  if (decision.argumentsDigest !== argumentsDigest) {
    throw new FatalError(\`Approval for node "\${nodeId}" is bound to digest \${decision.argumentsDigest}, not \${argumentsDigest} \\u2014 parameters changed after approval.\`);
  }
  return {
    approved: true,
    argumentsDigest
  };
}
__name(runApproval, "runApproval");
async function runChildPlan(state, node, context) {
  if (state.depth + 1 >= state.plan.budgets.maxDepth) {
    throw new FatalError(\`Child workflow "\${node.id}" exceeds the depth budget.\`);
  }
  const childDigest = await computeActionDigest(node.plan);
  await recordAuditEvent({
    runId: state.runId,
    planDigest: state.planDigest,
    type: "child-workflow",
    nodeId: node.id,
    detail: {
      childPlanDigest: childDigest,
      childPlanId: node.plan.id
    }
  });
  const childInput = evaluateExpression(node.input, context);
  const childState = {
    runId: state.runId,
    planDigest: childDigest,
    policyDigest: state.policyDigest,
    plan: node.plan,
    bindings: state.bindings,
    outputs: {},
    depth: state.depth + 1
  };
  return interpretGraph(childState, node.plan.entryNodeId, childInput);
}
__name(runChildPlan, "runChildPlan");
function iterationKeyOf(context) {
  const markers = [];
  for (const [key, value] of Object.entries(context.nodeOutputs)) {
    if (value !== null && typeof value === "object") {
      const slot = value;
      if (typeof slot.iteration === "number") markers.push(\`\${key}=\${slot.iteration}\`);
      else if (typeof slot.index === "number") markers.push(\`\${key}#\${slot.index}\`);
    }
  }
  return markers.length === 0 ? "0" : markers.sort().join("|");
}
__name(iterationKeyOf, "iterationKeyOf");
function hostOf(endpoint) {
  return new URL(endpoint).host;
}
__name(hostOf, "hostOf");
function isFatalName(error) {
  return error instanceof Error && (error.name === "FatalError" || error.name === "PlanFailure");
}
__name(isFatalName, "isFatalName");

// workflows/spike.ts
function _ts_add_disposable_resource(env, value, async) {
  if (value !== null && value !== void 0) {
    if (typeof value !== "object" && typeof value !== "function") throw new TypeError("Object expected.");
    var dispose, inner;
    if (async) {
      if (!Symbol.asyncDispose) throw new TypeError("Symbol.asyncDispose is not defined.");
      dispose = value[Symbol.asyncDispose];
    }
    if (dispose === void 0) {
      if (!Symbol.dispose) throw new TypeError("Symbol.dispose is not defined.");
      dispose = value[Symbol.dispose];
      if (async) inner = dispose;
    }
    if (typeof dispose !== "function") throw new TypeError("Object not disposable.");
    if (inner) dispose = /* @__PURE__ */ __name(function() {
      try {
        inner.call(this);
      } catch (e) {
        return Promise.reject(e);
      }
    }, "dispose");
    env.stack.push({
      value,
      dispose,
      async
    });
  } else if (async) {
    env.stack.push({
      async: true
    });
  }
  return value;
}
__name(_ts_add_disposable_resource, "_ts_add_disposable_resource");
function _ts_dispose_resources(env) {
  var _SuppressedError = typeof SuppressedError === "function" ? SuppressedError : function(error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
  };
  return (_ts_dispose_resources = /* @__PURE__ */ __name(function _ts_dispose_resources2(env2) {
    function fail(e) {
      env2.error = env2.hasError ? new _SuppressedError(e, env2.error, "An error was suppressed during disposal.") : e;
      env2.hasError = true;
    }
    __name(fail, "fail");
    var r, s = 0;
    function next() {
      while (r = env2.stack.pop()) {
        try {
          if (!r.async && s === 1) return s = 0, env2.stack.push(r), Promise.resolve().then(next);
          if (r.dispose) {
            var result = r.dispose.call(r.value);
            if (r.async) return s |= 2, Promise.resolve(result).then(next, function(e) {
              fail(e);
              return next();
            });
          } else s |= 1;
        } catch (e) {
          fail(e);
        }
      }
      if (s === 1) return env2.hasError ? Promise.reject(env2.error) : Promise.resolve();
      if (env2.hasError) throw env2.error;
    }
    __name(next, "next");
    return next();
  }, "_ts_dispose_resources"))(env);
}
__name(_ts_dispose_resources, "_ts_dispose_resources");
var double = globalThis[/* @__PURE__ */ Symbol.for("WORKFLOW_USE_STEP")]("step//./workflows/spike//double");
async function spikeWorkflow(value) {
  const doubled = await double(value);
  return doubled + 1;
}
__name(spikeWorkflow, "spikeWorkflow");
spikeWorkflow.workflowId = "workflow//./workflows/spike//spikeWorkflow";
globalThis.__private_workflows.set("workflow//./workflows/spike//spikeWorkflow", spikeWorkflow);
async function spikeHookWorkflow(token) {
  const env = {
    stack: [],
    error: void 0,
    hasError: false
  };
  try {
    const hook = _ts_add_disposable_resource(env, createHook({
      token
    }), false);
    const payload = await hook;
    return payload.note;
  } catch (e) {
    env.error = e;
    env.hasError = true;
  } finally {
    _ts_dispose_resources(env);
  }
}
__name(spikeHookWorkflow, "spikeHookWorkflow");
spikeHookWorkflow.workflowId = "workflow//./workflows/spike//spikeHookWorkflow";
globalThis.__private_workflows.set("workflow//./workflows/spike//spikeHookWorkflow", spikeHookWorkflow);

// ../../../node_modules/.pnpm/builtin-modules@5.0.0_patch_hash=90c7108c091ca5c3beba6c26b718302e728e78eb8bfc3a4ed492bc1657376d4a/node_modules/builtin-modules/index.js
var builtinModules = [
  "node:assert",
  "assert",
  "node:assert/strict",
  "assert/strict",
  "node:async_hooks",
  "async_hooks",
  "node:buffer",
  "buffer",
  "node:child_process",
  "child_process",
  "node:cluster",
  "cluster",
  "node:console",
  "console",
  "node:constants",
  "constants",
  "node:crypto",
  "crypto",
  "node:dgram",
  "dgram",
  "node:diagnostics_channel",
  "diagnostics_channel",
  "node:dns",
  "dns",
  "node:dns/promises",
  "dns/promises",
  "node:domain",
  "domain",
  "node:events",
  "events",
  "node:fs",
  "fs",
  "node:fs/promises",
  "fs/promises",
  "node:http",
  "http",
  "node:http2",
  "http2",
  "node:https",
  "https",
  "node:inspector",
  "inspector",
  "node:inspector/promises",
  "inspector/promises",
  "node:module",
  "module",
  "node:net",
  "net",
  "node:os",
  "os",
  "node:path",
  "path",
  "node:path/posix",
  "path/posix",
  "node:path/win32",
  "path/win32",
  "node:perf_hooks",
  "perf_hooks",
  "node:process",
  "process",
  "node:querystring",
  "querystring",
  "node:quic",
  "node:readline",
  "readline",
  "node:readline/promises",
  "readline/promises",
  "node:repl",
  "repl",
  "node:sea",
  "node:sqlite",
  "node:stream",
  "stream",
  "node:stream/consumers",
  "stream/consumers",
  "node:stream/promises",
  "stream/promises",
  "node:stream/web",
  "stream/web",
  "node:string_decoder",
  "string_decoder",
  "node:test",
  "node:test/reporters",
  "node:timers",
  "timers",
  "node:timers/promises",
  "timers/promises",
  "node:tls",
  "tls",
  "node:trace_events",
  "trace_events",
  "node:tty",
  "tty",
  "node:url",
  "url",
  "node:util",
  "util",
  "node:util/types",
  "util/types",
  "node:v8",
  "v8",
  "node:vm",
  "vm",
  "node:wasi",
  "wasi",
  "node:worker_threads",
  "worker_threads",
  "node:zlib",
  "zlib"
];
var builtin_modules_default = builtinModules;

// ../../../node_modules/.pnpm/@workflow+builders@4.1.1/node_modules/@workflow/builders/dist/serde-checker.js
var nodeBuiltins = builtin_modules_default.join("|");
var nodeImportExtractRegex = new RegExp(\`(?:from\\\\s+['"](?:node:)?((?:\${nodeBuiltins})(?:/[^'"]*)?)['"]|require\\\\s*\\\\(\\\\s*['"](?:node:)?((?:\${nodeBuiltins})(?:/[^'"]*)?)['"]\\\\s*\\\\))\`, "g");
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL21zQDIuMS4zL25vZGVfbW9kdWxlcy9tcy9pbmRleC5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vQHdvcmtmbG93K3V0aWxzQDQuMS4zL25vZGVfbW9kdWxlcy9Ad29ya2Zsb3cvdXRpbHMvc3JjL3RpbWUudHMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL0B3b3JrZmxvdytlcnJvcnNANC4xLjQvbm9kZV9tb2R1bGVzL0B3b3JrZmxvdy9lcnJvcnMvc3JjL2luZGV4LnRzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9Ad29ya2Zsb3crY29yZUA0LjYuMC9ub2RlX21vZHVsZXMvQHdvcmtmbG93L2NvcmUvc3JjL3N5bWJvbHMudHMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL0B3b3JrZmxvdytjb3JlQDQuNi4wL25vZGVfbW9kdWxlcy9Ad29ya2Zsb3cvY29yZS9zcmMvc2xlZXAudHMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL0B3b3JrZmxvdytjb3JlQDQuNi4wL25vZGVfbW9kdWxlcy9Ad29ya2Zsb3cvY29yZS9zcmMvd29ya2Zsb3cvZ2V0LXdvcmtmbG93LW1ldGFkYXRhLnRzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9Ad29ya2Zsb3crY29yZUA0LjYuMC9ub2RlX21vZHVsZXMvQHdvcmtmbG93L2NvcmUvc3JjL3dvcmtmbG93L2NyZWF0ZS1ob29rLnRzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS93b3JrZmxvd0A0LjYuMF9AbmVzdGpzK2NvbW1vbkAxMS4xLjI4X3JlZmxlY3QtbWV0YWRhdGFAMC4yLjJfcnhqc0A3LjguMl9fQG5lc3Rqcytjb3JlQDFfMmQwZThiODg4NWYyMDQwNDhjZjA1MjlkOGUxM2IxYzcvbm9kZV9tb2R1bGVzL3dvcmtmbG93L3NyYy9zdGRsaWIudHMiLCAiLi4vLi4vY29yZS9leHByZXNzaW9ucy9zcmMvZXZhbHVhdGUudHMiLCAic3RlcHMvZXhlY3V0b3JzLnRzIiwgInN0ZXBzL2FnZW50LnRzIiwgIndvcmtmbG93cy9ydW4tZXhlY3V0aW9uLXBsYW4udHMiLCAid29ya2Zsb3dzL3NwaWtlLnRzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9idWlsdGluLW1vZHVsZXNANS4wLjBfcGF0Y2hfaGFzaD05MGM3MTA4YzA5MWNhNWMzYmViYTZjMjZiNzE4MzAyZTcyOGU3OGViOGJmYzNhNGVkNDkyYmMxNjU3Mzc2ZDRhL25vZGVfbW9kdWxlcy9idWlsdGluLW1vZHVsZXMvaW5kZXguanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL0B3b3JrZmxvdytidWlsZGVyc0A0LjEuMS9ub2RlX21vZHVsZXMvQHdvcmtmbG93L2J1aWxkZXJzL3NyYy9zZXJkZS1jaGVja2VyLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyIvKipcbiAqIEhlbHBlcnMuXG4gKi8gdmFyIHMgPSAxMDAwO1xudmFyIG0gPSBzICogNjA7XG52YXIgaCA9IG0gKiA2MDtcbnZhciBkID0gaCAqIDI0O1xudmFyIHcgPSBkICogNztcbnZhciB5ID0gZCAqIDM2NS4yNTtcbi8qKlxuICogUGFyc2Ugb3IgZm9ybWF0IHRoZSBnaXZlbiBgdmFsYC5cbiAqXG4gKiBPcHRpb25zOlxuICpcbiAqICAtIGBsb25nYCB2ZXJib3NlIGZvcm1hdHRpbmcgW2ZhbHNlXVxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfE51bWJlcn0gdmFsXG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXG4gKiBAdGhyb3dzIHtFcnJvcn0gdGhyb3cgYW4gZXJyb3IgaWYgdmFsIGlzIG5vdCBhIG5vbi1lbXB0eSBzdHJpbmcgb3IgYSBudW1iZXJcbiAqIEByZXR1cm4ge1N0cmluZ3xOdW1iZXJ9XG4gKiBAYXBpIHB1YmxpY1xuICovIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24odmFsLCBvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgdmFyIHR5cGUgPSB0eXBlb2YgdmFsO1xuICAgIGlmICh0eXBlID09PSAnc3RyaW5nJyAmJiB2YWwubGVuZ3RoID4gMCkge1xuICAgICAgICByZXR1cm4gcGFyc2UodmFsKTtcbiAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICdudW1iZXInICYmIGlzRmluaXRlKHZhbCkpIHtcbiAgICAgICAgcmV0dXJuIG9wdGlvbnMubG9uZyA/IGZtdExvbmcodmFsKSA6IGZtdFNob3J0KHZhbCk7XG4gICAgfVxuICAgIHRocm93IG5ldyBFcnJvcigndmFsIGlzIG5vdCBhIG5vbi1lbXB0eSBzdHJpbmcgb3IgYSB2YWxpZCBudW1iZXIuIHZhbD0nICsgSlNPTi5zdHJpbmdpZnkodmFsKSk7XG59O1xuLyoqXG4gKiBQYXJzZSB0aGUgZ2l2ZW4gYHN0cmAgYW5kIHJldHVybiBtaWxsaXNlY29uZHMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7TnVtYmVyfVxuICogQGFwaSBwcml2YXRlXG4gKi8gZnVuY3Rpb24gcGFyc2Uoc3RyKSB7XG4gICAgc3RyID0gU3RyaW5nKHN0cik7XG4gICAgaWYgKHN0ci5sZW5ndGggPiAxMDApIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgbWF0Y2ggPSAvXigtPyg/OlxcZCspP1xcLj9cXGQrKSAqKG1pbGxpc2Vjb25kcz98bXNlY3M/fG1zfHNlY29uZHM/fHNlY3M/fHN8bWludXRlcz98bWlucz98bXxob3Vycz98aHJzP3xofGRheXM/fGR8d2Vla3M/fHd8eWVhcnM/fHlycz98eSk/JC9pLmV4ZWMoc3RyKTtcbiAgICBpZiAoIW1hdGNoKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIG4gPSBwYXJzZUZsb2F0KG1hdGNoWzFdKTtcbiAgICB2YXIgdHlwZSA9IChtYXRjaFsyXSB8fCAnbXMnKS50b0xvd2VyQ2FzZSgpO1xuICAgIHN3aXRjaCh0eXBlKXtcbiAgICAgICAgY2FzZSAneWVhcnMnOlxuICAgICAgICBjYXNlICd5ZWFyJzpcbiAgICAgICAgY2FzZSAneXJzJzpcbiAgICAgICAgY2FzZSAneXInOlxuICAgICAgICBjYXNlICd5JzpcbiAgICAgICAgICAgIHJldHVybiBuICogeTtcbiAgICAgICAgY2FzZSAnd2Vla3MnOlxuICAgICAgICBjYXNlICd3ZWVrJzpcbiAgICAgICAgY2FzZSAndyc6XG4gICAgICAgICAgICByZXR1cm4gbiAqIHc7XG4gICAgICAgIGNhc2UgJ2RheXMnOlxuICAgICAgICBjYXNlICdkYXknOlxuICAgICAgICBjYXNlICdkJzpcbiAgICAgICAgICAgIHJldHVybiBuICogZDtcbiAgICAgICAgY2FzZSAnaG91cnMnOlxuICAgICAgICBjYXNlICdob3VyJzpcbiAgICAgICAgY2FzZSAnaHJzJzpcbiAgICAgICAgY2FzZSAnaHInOlxuICAgICAgICBjYXNlICdoJzpcbiAgICAgICAgICAgIHJldHVybiBuICogaDtcbiAgICAgICAgY2FzZSAnbWludXRlcyc6XG4gICAgICAgIGNhc2UgJ21pbnV0ZSc6XG4gICAgICAgIGNhc2UgJ21pbnMnOlxuICAgICAgICBjYXNlICdtaW4nOlxuICAgICAgICBjYXNlICdtJzpcbiAgICAgICAgICAgIHJldHVybiBuICogbTtcbiAgICAgICAgY2FzZSAnc2Vjb25kcyc6XG4gICAgICAgIGNhc2UgJ3NlY29uZCc6XG4gICAgICAgIGNhc2UgJ3NlY3MnOlxuICAgICAgICBjYXNlICdzZWMnOlxuICAgICAgICBjYXNlICdzJzpcbiAgICAgICAgICAgIHJldHVybiBuICogcztcbiAgICAgICAgY2FzZSAnbWlsbGlzZWNvbmRzJzpcbiAgICAgICAgY2FzZSAnbWlsbGlzZWNvbmQnOlxuICAgICAgICBjYXNlICdtc2Vjcyc6XG4gICAgICAgIGNhc2UgJ21zZWMnOlxuICAgICAgICBjYXNlICdtcyc6XG4gICAgICAgICAgICByZXR1cm4gbjtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxufVxuLyoqXG4gKiBTaG9ydCBmb3JtYXQgZm9yIGBtc2AuXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IG1zXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqLyBmdW5jdGlvbiBmbXRTaG9ydChtcykge1xuICAgIHZhciBtc0FicyA9IE1hdGguYWJzKG1zKTtcbiAgICBpZiAobXNBYnMgPj0gZCkge1xuICAgICAgICByZXR1cm4gTWF0aC5yb3VuZChtcyAvIGQpICsgJ2QnO1xuICAgIH1cbiAgICBpZiAobXNBYnMgPj0gaCkge1xuICAgICAgICByZXR1cm4gTWF0aC5yb3VuZChtcyAvIGgpICsgJ2gnO1xuICAgIH1cbiAgICBpZiAobXNBYnMgPj0gbSkge1xuICAgICAgICByZXR1cm4gTWF0aC5yb3VuZChtcyAvIG0pICsgJ20nO1xuICAgIH1cbiAgICBpZiAobXNBYnMgPj0gcykge1xuICAgICAgICByZXR1cm4gTWF0aC5yb3VuZChtcyAvIHMpICsgJ3MnO1xuICAgIH1cbiAgICByZXR1cm4gbXMgKyAnbXMnO1xufVxuLyoqXG4gKiBMb25nIGZvcm1hdCBmb3IgYG1zYC5cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gbXNcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovIGZ1bmN0aW9uIGZtdExvbmcobXMpIHtcbiAgICB2YXIgbXNBYnMgPSBNYXRoLmFicyhtcyk7XG4gICAgaWYgKG1zQWJzID49IGQpIHtcbiAgICAgICAgcmV0dXJuIHBsdXJhbChtcywgbXNBYnMsIGQsICdkYXknKTtcbiAgICB9XG4gICAgaWYgKG1zQWJzID49IGgpIHtcbiAgICAgICAgcmV0dXJuIHBsdXJhbChtcywgbXNBYnMsIGgsICdob3VyJyk7XG4gICAgfVxuICAgIGlmIChtc0FicyA+PSBtKSB7XG4gICAgICAgIHJldHVybiBwbHVyYWwobXMsIG1zQWJzLCBtLCAnbWludXRlJyk7XG4gICAgfVxuICAgIGlmIChtc0FicyA+PSBzKSB7XG4gICAgICAgIHJldHVybiBwbHVyYWwobXMsIG1zQWJzLCBzLCAnc2Vjb25kJyk7XG4gICAgfVxuICAgIHJldHVybiBtcyArICcgbXMnO1xufVxuLyoqXG4gKiBQbHVyYWxpemF0aW9uIGhlbHBlci5cbiAqLyBmdW5jdGlvbiBwbHVyYWwobXMsIG1zQWJzLCBuLCBuYW1lKSB7XG4gICAgdmFyIGlzUGx1cmFsID0gbXNBYnMgPj0gbiAqIDEuNTtcbiAgICByZXR1cm4gTWF0aC5yb3VuZChtcyAvIG4pICsgJyAnICsgbmFtZSArIChpc1BsdXJhbCA/ICdzJyA6ICcnKTtcbn1cbiIsICJpbXBvcnQgdHlwZSB7IFN0cmluZ1ZhbHVlIH0gZnJvbSAnbXMnO1xuaW1wb3J0IG1zIGZyb20gJ21zJztcblxuLyoqXG4gKiBQYXJzZXMgYSBkdXJhdGlvbiBwYXJhbWV0ZXIgKHN0cmluZywgbnVtYmVyLCBvciBEYXRlKSBhbmQgcmV0dXJucyBhIERhdGUgb2JqZWN0XG4gKiByZXByZXNlbnRpbmcgd2hlbiB0aGUgZHVyYXRpb24gc2hvdWxkIGVsYXBzZS5cbiAqXG4gKiAtIEZvciBzdHJpbmdzOiBQYXJzZXMgZHVyYXRpb24gc3RyaW5ncyBsaWtlIFwiMXNcIiwgXCI1bVwiLCBcIjFoXCIsIGV0Yy4gdXNpbmcgdGhlIGBtc2AgbGlicmFyeVxuICogLSBGb3IgbnVtYmVyczogVHJlYXRzIGFzIG1pbGxpc2Vjb25kcyBmcm9tIG5vd1xuICogLSBGb3IgRGF0ZSBvYmplY3RzOiBSZXR1cm5zIHRoZSBkYXRlIGRpcmVjdGx5IChoYW5kbGVzIGJvdGggRGF0ZSBpbnN0YW5jZXMgYW5kIGRhdGUtbGlrZSBvYmplY3RzIGZyb20gZGVzZXJpYWxpemF0aW9uKVxuICpcbiAqIEBwYXJhbSBwYXJhbSAtIFRoZSBkdXJhdGlvbiBwYXJhbWV0ZXIgKFN0cmluZ1ZhbHVlLCBEYXRlLCBvciBudW1iZXIgb2YgbWlsbGlzZWNvbmRzKVxuICogQHJldHVybnMgQSBEYXRlIG9iamVjdCByZXByZXNlbnRpbmcgd2hlbiB0aGUgZHVyYXRpb24gc2hvdWxkIGVsYXBzZVxuICogQHRocm93cyB7RXJyb3J9IElmIHRoZSBwYXJhbWV0ZXIgaXMgaW52YWxpZCBvciBjYW5ub3QgYmUgcGFyc2VkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUR1cmF0aW9uVG9EYXRlKHBhcmFtOiBTdHJpbmdWYWx1ZSB8IERhdGUgfCBudW1iZXIpOiBEYXRlIHtcbiAgaWYgKHR5cGVvZiBwYXJhbSA9PT0gJ3N0cmluZycpIHtcbiAgICBjb25zdCBkdXJhdGlvbk1zID0gbXMocGFyYW0pO1xuICAgIGlmICh0eXBlb2YgZHVyYXRpb25NcyAhPT0gJ251bWJlcicgfHwgZHVyYXRpb25NcyA8IDApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgYEludmFsaWQgZHVyYXRpb246IFwiJHtwYXJhbX1cIi4gRXhwZWN0ZWQgYSB2YWxpZCBkdXJhdGlvbiBzdHJpbmcgbGlrZSBcIjFzXCIsIFwiMW1cIiwgXCIxaFwiLCBldGMuYFxuICAgICAgKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBEYXRlKERhdGUubm93KCkgKyBkdXJhdGlvbk1zKTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgcGFyYW0gPT09ICdudW1iZXInKSB7XG4gICAgaWYgKHBhcmFtIDwgMCB8fCAhTnVtYmVyLmlzRmluaXRlKHBhcmFtKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBgSW52YWxpZCBkdXJhdGlvbjogJHtwYXJhbX0uIEV4cGVjdGVkIGEgbm9uLW5lZ2F0aXZlIGZpbml0ZSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzLmBcbiAgICAgICk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgRGF0ZShEYXRlLm5vdygpICsgcGFyYW0pO1xuICB9IGVsc2UgaWYgKFxuICAgIHBhcmFtIGluc3RhbmNlb2YgRGF0ZSB8fFxuICAgIChwYXJhbSAmJlxuICAgICAgdHlwZW9mIHBhcmFtID09PSAnb2JqZWN0JyAmJlxuICAgICAgdHlwZW9mIChwYXJhbSBhcyBhbnkpLmdldFRpbWUgPT09ICdmdW5jdGlvbicpXG4gICkge1xuICAgIC8vIEhhbmRsZSBib3RoIERhdGUgaW5zdGFuY2VzIGFuZCBkYXRlLWxpa2Ugb2JqZWN0cyAoZnJvbSBkZXNlcmlhbGl6YXRpb24pXG4gICAgcmV0dXJuIHBhcmFtIGluc3RhbmNlb2YgRGF0ZSA/IHBhcmFtIDogbmV3IERhdGUoKHBhcmFtIGFzIGFueSkuZ2V0VGltZSgpKTtcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICBgSW52YWxpZCBkdXJhdGlvbiBwYXJhbWV0ZXIuIEV4cGVjdGVkIGEgZHVyYXRpb24gc3RyaW5nLCBudW1iZXIgKG1pbGxpc2Vjb25kcyksIG9yIERhdGUgb2JqZWN0LmBcbiAgICApO1xuICB9XG59XG4iLCAiaW1wb3J0IHsgcGFyc2VEdXJhdGlvblRvRGF0ZSB9IGZyb20gJ0B3b3JrZmxvdy91dGlscyc7XG5pbXBvcnQgdHlwZSB7IFN0cnVjdHVyZWRFcnJvciB9IGZyb20gJ0B3b3JrZmxvdy93b3JsZCc7XG5pbXBvcnQgdHlwZSB7IFN0cmluZ1ZhbHVlIH0gZnJvbSAnbXMnO1xuXG5jb25zdCBCQVNFX1VSTCA9ICdodHRwczovL3VzZXdvcmtmbG93LmRldi9lcnInO1xuXG4vKipcbiAqIEBpbnRlcm5hbFxuICogQ2hlY2sgaWYgYSB2YWx1ZSBpcyBhbiBFcnJvciB3aXRob3V0IHJlbHlpbmcgb24gTm9kZS5qcyB1dGlsaXRpZXMuXG4gKiBUaGlzIGlzIG5lZWRlZCBmb3IgZXJyb3IgY2xhc3NlcyB0aGF0IGNhbiBiZSB1c2VkIGluIFZNIGNvbnRleHRzIHdoZXJlXG4gKiBOb2RlLmpzIGltcG9ydHMgYXJlIG5vdCBhdmFpbGFibGUuXG4gKi9cbmZ1bmN0aW9uIGlzRXJyb3IodmFsdWU6IHVua25vd24pOiB2YWx1ZSBpcyB7IG5hbWU6IHN0cmluZzsgbWVzc2FnZTogc3RyaW5nIH0ge1xuICByZXR1cm4gKFxuICAgIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiZcbiAgICB2YWx1ZSAhPT0gbnVsbCAmJlxuICAgICduYW1lJyBpbiB2YWx1ZSAmJlxuICAgICdtZXNzYWdlJyBpbiB2YWx1ZVxuICApO1xufVxuXG4vKipcbiAqIEBpbnRlcm5hbFxuICogQWxsIHRoZSBzbHVncyBvZiB0aGUgZXJyb3JzIHVzZWQgZm9yIGRvY3VtZW50YXRpb24gbGlua3MuXG4gKi9cbmV4cG9ydCBjb25zdCBFUlJPUl9TTFVHUyA9IHtcbiAgTk9ERV9KU19NT0RVTEVfSU5fV09SS0ZMT1c6ICdub2RlLWpzLW1vZHVsZS1pbi13b3JrZmxvdycsXG4gIFNUQVJUX0lOVkFMSURfV09SS0ZMT1dfRlVOQ1RJT046ICdzdGFydC1pbnZhbGlkLXdvcmtmbG93LWZ1bmN0aW9uJyxcbiAgU0VSSUFMSVpBVElPTl9GQUlMRUQ6ICdzZXJpYWxpemF0aW9uLWZhaWxlZCcsXG4gIFdFQkhPT0tfSU5WQUxJRF9SRVNQT05EX1dJVEhfVkFMVUU6ICd3ZWJob29rLWludmFsaWQtcmVzcG9uZC13aXRoLXZhbHVlJyxcbiAgV0VCSE9PS19SRVNQT05TRV9OT1RfU0VOVDogJ3dlYmhvb2stcmVzcG9uc2Utbm90LXNlbnQnLFxuICBGRVRDSF9JTl9XT1JLRkxPV19GVU5DVElPTjogJ2ZldGNoLWluLXdvcmtmbG93JyxcbiAgVElNRU9VVF9GVU5DVElPTlNfSU5fV09SS0ZMT1c6ICd0aW1lb3V0LWluLXdvcmtmbG93JyxcbiAgSE9PS19DT05GTElDVDogJ2hvb2stY29uZmxpY3QnLFxuICBDT1JSVVBURURfRVZFTlRfTE9HOiAnY29ycnVwdGVkLWV2ZW50LWxvZycsXG4gIFJFUExBWV9ESVZFUkdFTkNFOiAncmVwbGF5LWRpdmVyZ2VuY2UnLFxuICBTVEVQX05PVF9SRUdJU1RFUkVEOiAnc3RlcC1ub3QtcmVnaXN0ZXJlZCcsXG4gIFdPUktGTE9XX05PVF9SRUdJU1RFUkVEOiAnd29ya2Zsb3ctbm90LXJlZ2lzdGVyZWQnLFxuICBSVU5USU1FX0RFQ1JZUFRJT05fRkFJTEVEOiAncnVudGltZS1kZWNyeXB0aW9uLWZhaWxlZCcsXG59IGFzIGNvbnN0O1xuXG50eXBlIEVycm9yU2x1ZyA9ICh0eXBlb2YgRVJST1JfU0xVR1MpW2tleW9mIHR5cGVvZiBFUlJPUl9TTFVHU107XG5cbmludGVyZmFjZSBXb3JrZmxvd0Vycm9yT3B0aW9ucyBleHRlbmRzIEVycm9yT3B0aW9ucyB7XG4gIC8qKlxuICAgKiBUaGUgc2x1ZyBvZiB0aGUgZXJyb3IuIFRoaXMgd2lsbCBiZSB1c2VkIHRvIGdlbmVyYXRlIGEgbGluayB0byB0aGUgZXJyb3IgZG9jdW1lbnRhdGlvbi5cbiAgICovXG4gIHNsdWc/OiBFcnJvclNsdWc7XG59XG5cbi8qKlxuICogVGhlIGJhc2UgY2xhc3MgZm9yIGFsbCBXb3JrZmxvdy1yZWxhdGVkIGVycm9ycy5cbiAqXG4gKiBUaGlzIGVycm9yIGlzIHRocm93biBieSB0aGUgV29ya2Zsb3cgU0RLIHdoZW4gaW50ZXJuYWwgb3BlcmF0aW9ucyBmYWlsLlxuICogWW91IGNhbiB1c2UgdGhpcyBjbGFzcyB3aXRoIGBpbnN0YW5jZW9mYCB0byBjYXRjaCBhbnkgV29ya2Zsb3cgU0RLIGVycm9yLlxuICpcbiAqIEBleGFtcGxlXG4gKiBgYGB0c1xuICogdHJ5IHtcbiAqICAgYXdhaXQgZ2V0UnVuKHJ1bklkKTtcbiAqIH0gY2F0Y2ggKGVycm9yKSB7XG4gKiAgIGlmIChlcnJvciBpbnN0YW5jZW9mIFdvcmtmbG93RXJyb3IpIHtcbiAqICAgICBjb25zb2xlLmVycm9yKCdXb3JrZmxvdyBTREsgZXJyb3I6JywgZXJyb3IubWVzc2FnZSk7XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICovXG5leHBvcnQgY2xhc3MgV29ya2Zsb3dFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgcmVhZG9ubHkgY2F1c2U/OiB1bmtub3duO1xuXG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2U6IHN0cmluZywgb3B0aW9ucz86IFdvcmtmbG93RXJyb3JPcHRpb25zKSB7XG4gICAgY29uc3QgbXNnRG9jcyA9IG9wdGlvbnM/LnNsdWdcbiAgICAgID8gYCR7bWVzc2FnZX1cXG5cXG5MZWFybiBtb3JlOiAke0JBU0VfVVJMfS8ke29wdGlvbnMuc2x1Z31gXG4gICAgICA6IG1lc3NhZ2U7XG4gICAgc3VwZXIobXNnRG9jcywgeyBjYXVzZTogb3B0aW9ucz8uY2F1c2UgfSk7XG4gICAgdGhpcy5jYXVzZSA9IG9wdGlvbnM/LmNhdXNlO1xuXG4gICAgaWYgKG9wdGlvbnM/LmNhdXNlIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgIHRoaXMuc3RhY2sgPSBgJHt0aGlzLnN0YWNrfVxcbkNhdXNlZCBieTogJHtvcHRpb25zLmNhdXNlLnN0YWNrfWA7XG4gICAgfVxuICB9XG5cbiAgc3RhdGljIGlzKHZhbHVlOiB1bmtub3duKTogdmFsdWUgaXMgV29ya2Zsb3dFcnJvciB7XG4gICAgcmV0dXJuIGlzRXJyb3IodmFsdWUpICYmIHZhbHVlLm5hbWUgPT09ICdXb3JrZmxvd0Vycm9yJztcbiAgfVxufVxuXG4vKipcbiAqIFRocm93biB3aGVuIGEgd29ybGQgKHN0b3JhZ2UgYmFja2VuZCkgb3BlcmF0aW9uIGZhaWxzIHVuZXhwZWN0ZWRseS5cbiAqXG4gKiBUaGlzIGlzIHRoZSBjYXRjaC1hbGwgZXJyb3IgZm9yIHdvcmxkIGltcGxlbWVudGF0aW9ucy4gU3BlY2lmaWMsXG4gKiB3ZWxsLWtub3duIGZhaWx1cmUgbW9kZXMgaGF2ZSBkZWRpY2F0ZWQgZXJyb3IgdHlwZXMgKGUuZy5cbiAqIEVudGl0eUNvbmZsaWN0RXJyb3IsIFJ1bkV4cGlyZWRFcnJvciwgVGhyb3R0bGVFcnJvcikuIFRoaXMgZXJyb3JcbiAqIGNvdmVycyBldmVyeXRoaW5nIGVsc2Ug4oCUIHZhbGlkYXRpb24gZmFpbHVyZXMsIG1pc3NpbmcgZW50aXRpZXNcbiAqIHdpdGhvdXQgYSBkZWRpY2F0ZWQgdHlwZSwgb3IgdW5leHBlY3RlZCBIVFRQIGVycm9ycyBmcm9tIHdvcmxkLXZlcmNlbC5cbiAqL1xuZXhwb3J0IGNsYXNzIFdvcmtmbG93V29ybGRFcnJvciBleHRlbmRzIFdvcmtmbG93RXJyb3Ige1xuICBzdGF0dXM/OiBudW1iZXI7XG4gIGNvZGU/OiBzdHJpbmc7XG4gIHVybD86IHN0cmluZztcbiAgLyoqIFJldHJ5LUFmdGVyIHZhbHVlIGluIHNlY29uZHMsIHByZXNlbnQgb24gNDI5IGFuZCA0MjUgcmVzcG9uc2VzICovXG4gIHJldHJ5QWZ0ZXI/OiBudW1iZXI7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgbWVzc2FnZTogc3RyaW5nLFxuICAgIG9wdGlvbnM/OiB7XG4gICAgICBzdGF0dXM/OiBudW1iZXI7XG4gICAgICB1cmw/OiBzdHJpbmc7XG4gICAgICBjb2RlPzogc3RyaW5nO1xuICAgICAgcmV0cnlBZnRlcj86IG51bWJlcjtcbiAgICAgIGNhdXNlPzogdW5rbm93bjtcbiAgICB9XG4gICkge1xuICAgIHN1cGVyKG1lc3NhZ2UsIHtcbiAgICAgIGNhdXNlOiBvcHRpb25zPy5jYXVzZSxcbiAgICB9KTtcbiAgICB0aGlzLm5hbWUgPSAnV29ya2Zsb3dXb3JsZEVycm9yJztcbiAgICB0aGlzLnN0YXR1cyA9IG9wdGlvbnM/LnN0YXR1cztcbiAgICB0aGlzLmNvZGUgPSBvcHRpb25zPy5jb2RlO1xuICAgIHRoaXMudXJsID0gb3B0aW9ucz8udXJsO1xuICAgIHRoaXMucmV0cnlBZnRlciA9IG9wdGlvbnM/LnJldHJ5QWZ0ZXI7XG4gIH1cblxuICBzdGF0aWMgaXModmFsdWU6IHVua25vd24pOiB2YWx1ZSBpcyBXb3JrZmxvd1dvcmxkRXJyb3Ige1xuICAgIHJldHVybiBpc0Vycm9yKHZhbHVlKSAmJiB2YWx1ZS5uYW1lID09PSAnV29ya2Zsb3dXb3JsZEVycm9yJztcbiAgfVxufVxuXG4vKipcbiAqIFRocm93biB3aGVuIGEgd29ya2Zsb3cgcnVuIGZhaWxzIGR1cmluZyBleGVjdXRpb24uXG4gKlxuICogVGhpcyBlcnJvciBpbmRpY2F0ZXMgdGhhdCB0aGUgd29ya2Zsb3cgZW5jb3VudGVyZWQgYSBmYXRhbCBlcnJvciBhbmQgY2Fubm90XG4gKiBjb250aW51ZS4gSXQgaXMgdGhyb3duIHdoZW4gYXdhaXRpbmcgYHJ1bi5yZXR1cm5WYWx1ZWAgb24gYSBydW4gd2hvc2Ugc3RhdHVzXG4gKiBpcyBgJ2ZhaWxlZCdgLiBUaGUgYGNhdXNlYCBwcm9wZXJ0eSBjb250YWlucyB0aGUgdW5kZXJseWluZyBlcnJvciB3aXRoIGl0c1xuICogbWVzc2FnZSwgc3RhY2sgdHJhY2UsIGFuZCBvcHRpb25hbCBlcnJvciBjb2RlLlxuICpcbiAqIFVzZSB0aGUgc3RhdGljIGBXb3JrZmxvd1J1bkZhaWxlZEVycm9yLmlzKClgIG1ldGhvZCBmb3IgdHlwZS1zYWZlIGNoZWNraW5nXG4gKiBpbiBjYXRjaCBibG9ja3MuXG4gKlxuICogQGV4YW1wbGVcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBXb3JrZmxvd1J1bkZhaWxlZEVycm9yIH0gZnJvbSBcIndvcmtmbG93L2ludGVybmFsL2Vycm9yc1wiO1xuICpcbiAqIHRyeSB7XG4gKiAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHJ1bi5yZXR1cm5WYWx1ZTtcbiAqIH0gY2F0Y2ggKGVycm9yKSB7XG4gKiAgIGlmIChXb3JrZmxvd1J1bkZhaWxlZEVycm9yLmlzKGVycm9yKSkge1xuICogICAgIGNvbnNvbGUuZXJyb3IoYFJ1biAke2Vycm9yLnJ1bklkfSBmYWlsZWQ6YCwgZXJyb3IuY2F1c2UubWVzc2FnZSk7XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICovXG5leHBvcnQgY2xhc3MgV29ya2Zsb3dSdW5GYWlsZWRFcnJvciBleHRlbmRzIFdvcmtmbG93RXJyb3Ige1xuICBydW5JZDogc3RyaW5nO1xuICBkZWNsYXJlIGNhdXNlOiBFcnJvciAmIHsgY29kZT86IHN0cmluZyB9O1xuXG4gIGNvbnN0cnVjdG9yKHJ1bklkOiBzdHJpbmcsIGVycm9yOiBTdHJ1Y3R1cmVkRXJyb3IpIHtcbiAgICAvLyBDcmVhdGUgYSBwcm9wZXIgRXJyb3IgaW5zdGFuY2UgZnJvbSB0aGUgU3RydWN0dXJlZEVycm9yIHRvIHNldCBhcyBjYXVzZVxuICAgIC8vIE5PVEU6IGN1c3RvbSBlcnJvciB0eXBlcyBkbyBub3QgZ2V0IHNlcmlhbGl6ZWQvZGVzZXJpYWxpemVkLiBFdmVyeXRoaW5nIGlzIGFuIEVycm9yXG4gICAgY29uc3QgY2F1c2VFcnJvciA9IG5ldyBFcnJvcihlcnJvci5tZXNzYWdlKTtcbiAgICBpZiAoZXJyb3Iuc3RhY2spIHtcbiAgICAgIGNhdXNlRXJyb3Iuc3RhY2sgPSBlcnJvci5zdGFjaztcbiAgICB9XG4gICAgaWYgKGVycm9yLmNvZGUpIHtcbiAgICAgIChjYXVzZUVycm9yIGFzIGFueSkuY29kZSA9IGVycm9yLmNvZGU7XG4gICAgfVxuXG4gICAgc3VwZXIoYFdvcmtmbG93IHJ1biBcIiR7cnVuSWR9XCIgZmFpbGVkOiAke2Vycm9yLm1lc3NhZ2V9YCwge1xuICAgICAgY2F1c2U6IGNhdXNlRXJyb3IsXG4gICAgfSk7XG4gICAgdGhpcy5uYW1lID0gJ1dvcmtmbG93UnVuRmFpbGVkRXJyb3InO1xuICAgIHRoaXMucnVuSWQgPSBydW5JZDtcbiAgfVxuXG4gIHN0YXRpYyBpcyh2YWx1ZTogdW5rbm93bik6IHZhbHVlIGlzIFdvcmtmbG93UnVuRmFpbGVkRXJyb3Ige1xuICAgIHJldHVybiBpc0Vycm9yKHZhbHVlKSAmJiB2YWx1ZS5uYW1lID09PSAnV29ya2Zsb3dSdW5GYWlsZWRFcnJvcic7XG4gIH1cbn1cblxuLyoqXG4gKiBUaHJvd24gd2hlbiBhdHRlbXB0aW5nIHRvIGdldCByZXN1bHRzIGZyb20gYW4gaW5jb21wbGV0ZSB3b3JrZmxvdyBydW4uXG4gKlxuICogVGhpcyBlcnJvciBvY2N1cnMgd2hlbiB5b3UgdHJ5IHRvIGFjY2VzcyB0aGUgcmVzdWx0IG9mIGEgd29ya2Zsb3dcbiAqIHRoYXQgaXMgc3RpbGwgcnVubmluZyBvciBoYXNuJ3QgY29tcGxldGVkIHlldC5cbiAqL1xuZXhwb3J0IGNsYXNzIFdvcmtmbG93UnVuTm90Q29tcGxldGVkRXJyb3IgZXh0ZW5kcyBXb3JrZmxvd0Vycm9yIHtcbiAgcnVuSWQ6IHN0cmluZztcbiAgc3RhdHVzOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IocnVuSWQ6IHN0cmluZywgc3RhdHVzOiBzdHJpbmcpIHtcbiAgICBzdXBlcihgV29ya2Zsb3cgcnVuIFwiJHtydW5JZH1cIiBoYXMgbm90IGNvbXBsZXRlZGAsIHt9KTtcbiAgICB0aGlzLm5hbWUgPSAnV29ya2Zsb3dSdW5Ob3RDb21wbGV0ZWRFcnJvcic7XG4gICAgdGhpcy5ydW5JZCA9IHJ1bklkO1xuICAgIHRoaXMuc3RhdHVzID0gc3RhdHVzO1xuICB9XG5cbiAgc3RhdGljIGlzKHZhbHVlOiB1bmtub3duKTogdmFsdWUgaXMgV29ya2Zsb3dSdW5Ob3RDb21wbGV0ZWRFcnJvciB7XG4gICAgcmV0dXJuIGlzRXJyb3IodmFsdWUpICYmIHZhbHVlLm5hbWUgPT09ICdXb3JrZmxvd1J1bk5vdENvbXBsZXRlZEVycm9yJztcbiAgfVxufVxuXG4vKipcbiAqIFRocm93biB3aGVuIHRoZSBXb3JrZmxvdyBydW50aW1lIGVuY291bnRlcnMgYW4gaW50ZXJuYWwgZXJyb3IuXG4gKlxuICogVGhpcyBlcnJvciBpbmRpY2F0ZXMgYW4gaXNzdWUgd2l0aCB3b3JrZmxvdyBleGVjdXRpb24sIHN1Y2ggYXNcbiAqIHNlcmlhbGl6YXRpb24gZmFpbHVyZXMsIHN0YXJ0aW5nIGFuIGludmFsaWQgd29ya2Zsb3cgZnVuY3Rpb24sIG9yXG4gKiBvdGhlciBydW50aW1lIHByb2JsZW1zLlxuICovXG5leHBvcnQgY2xhc3MgV29ya2Zsb3dSdW50aW1lRXJyb3IgZXh0ZW5kcyBXb3JrZmxvd0Vycm9yIHtcbiAgY29uc3RydWN0b3IobWVzc2FnZTogc3RyaW5nLCBvcHRpb25zPzogV29ya2Zsb3dFcnJvck9wdGlvbnMpIHtcbiAgICBzdXBlcihtZXNzYWdlLCB7XG4gICAgICAuLi5vcHRpb25zLFxuICAgIH0pO1xuICAgIHRoaXMubmFtZSA9ICdXb3JrZmxvd1J1bnRpbWVFcnJvcic7XG4gIH1cblxuICBzdGF0aWMgaXModmFsdWU6IHVua25vd24pOiB2YWx1ZSBpcyBXb3JrZmxvd1J1bnRpbWVFcnJvciB7XG4gICAgcmV0dXJuIGlzRXJyb3IodmFsdWUpICYmIHZhbHVlLm5hbWUgPT09ICdXb3JrZmxvd1J1bnRpbWVFcnJvcic7XG4gIH1cbn1cblxuLyoqXG4gKiBUaHJvd24gd2hlbiB0aGUgcGVyc2lzdGVkIHdvcmtmbG93IGV2ZW50IGxvZyBjYW5ub3QgYmUgcmVwbGF5ZWQgYmVjYXVzZSBpdFxuICogY29udGFpbnMgb3JwaGFuZWQsIGR1cGxpY2F0ZSwgb3IgbWlzbWF0Y2hlZCBldmVudHMuXG4gKlxuICogVGhpcyBpcyBhIHJ1bnRpbWUvaW5mcmFzdHJ1Y3R1cmUgZmFpbHVyZSByYXRoZXIgdGhhbiB1c2VyIGNvZGUgdGhyb3dpbmcuXG4gKiBXaGVuIHRoaXMgcmVhY2hlcyBydW4gZmFpbHVyZSBoYW5kbGluZywgaXQgaXMgcmVjb3JkZWQgd2l0aCB0aGUgZGlzdGluY3RcbiAqIGBDT1JSVVBURURfRVZFTlRfTE9HYCBjb2RlIHNvIHdvcmxkcyBhbmQgYmFja2VuZHMgY2FuIHRyYWNrIGl0IHNlcGFyYXRlbHlcbiAqIGZyb20gZ2VuZXJpYyBydW50aW1lIGZhaWx1cmVzLlxuICovXG5leHBvcnQgY2xhc3MgQ29ycnVwdGVkRXZlbnRMb2dFcnJvciBleHRlbmRzIFdvcmtmbG93UnVudGltZUVycm9yIHtcbiAgY29uc3RydWN0b3IobWVzc2FnZTogc3RyaW5nLCBvcHRpb25zPzogRXJyb3JPcHRpb25zKSB7XG4gICAgc3VwZXIobWVzc2FnZSwge1xuICAgICAgLi4ub3B0aW9ucyxcbiAgICAgIHNsdWc6IEVSUk9SX1NMVUdTLkNPUlJVUFRFRF9FVkVOVF9MT0csXG4gICAgfSk7XG4gICAgdGhpcy5uYW1lID0gJ0NvcnJ1cHRlZEV2ZW50TG9nRXJyb3InO1xuICB9XG5cbiAgc3RhdGljIGlzKHZhbHVlOiB1bmtub3duKTogdmFsdWUgaXMgQ29ycnVwdGVkRXZlbnRMb2dFcnJvciB7XG4gICAgcmV0dXJuIGlzRXJyb3IodmFsdWUpICYmIHZhbHVlLm5hbWUgPT09ICdDb3JydXB0ZWRFdmVudExvZ0Vycm9yJztcbiAgfVxufVxuXG4vKipcbiAqIE9wdGlvbmFsIHN0cnVjdHVyZWQgY29udGV4dCBhdHRhY2hlZCB0byBhIHtAbGluayBSdW50aW1lRGVjcnlwdGlvbkVycm9yfSxcbiAqIGNhcnJpZWQgb3ZlciBmcm9tIHRoZSB1bmRlcmx5aW5nIGRlY3J5cHQgY2FsbCBzaXRlIHRvIGhlbHAgZGlhZ25vc2UgdGhlXG4gKiBmYWlsdXJlIHdpdGhvdXQgcG9raW5nIHRocm91Z2ggc3RhY2tzLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFJ1bnRpbWVEZWNyeXB0aW9uRXJyb3JDb250ZXh0IHtcbiAgLyoqIFRoZSBvcGVyYXRpb24gdGhhdCBmYWlsZWQg4oCUIHVzZWZ1bCB0byB0ZWxsIGVuY3J5cHQgdnMgZGVjcnlwdCBhcGFydC4gKi9cbiAgb3BlcmF0aW9uPzogJ2VuY3J5cHQnIHwgJ2RlY3J5cHQnO1xuICAvKiogQnl0ZSBsZW5ndGggb2YgdGhlIGlucHV0IHBheWxvYWQgYXQgdGhlIHRpbWUgb2YgdGhlIGZhaWx1cmUuICovXG4gIGJ5dGVMZW5ndGg/OiBudW1iZXI7XG4gIC8qKlxuICAgKiBUaGUgZmlyc3QgNCBieXRlcyBvZiB0aGUgaW5wdXQgcGF5bG9hZCwgZGVjb2RlZCBhcyBVVEYtOCBpZiBwcmludGFibGUuXG4gICAqIFVzZWZ1bCBmb3IgdGVsbGluZyBhcGFydCB0cnVuY2F0ZWQtYnV0LXZhbGlkLWxvb2tpbmcgZW5jcnlwdGVkIHBheWxvYWRzXG4gICAqIGZyb20gY29tcGxldGVseSB1bnJlbGF0ZWQgY29ycnVwdGlvbiAoZS5nLiBhbiBIVE1MIGVycm9yIHBhZ2Ugc3VyZmFjZWRcbiAgICogYXMgYSAyMDAgT0spLlxuICAgKi9cbiAgZm9ybWF0UHJlZml4Pzogc3RyaW5nO1xufVxuXG4vKipcbiAqIFRocm93biB3aGVuIHRoZSBTREsncyBidWlsdC1pbiBBRVMtR0NNIGVuY3J5cHRpb24gbGF5ZXIgZmFpbHMgdG8gZW5jcnlwdFxuICogb3IgZGVjcnlwdCBhIHdvcmtmbG93IHBheWxvYWQuXG4gKlxuICogVGhpcyBpcyBhbiBpbnRlcm5hbCBTREsgZmFpbHVyZSDigJQgdXNlciBjb2RlIG5ldmVyIGludm9rZXMgdGhlIFNESydzXG4gKiBlbmNyeXB0aW9uIHByaW1pdGl2ZXMgZGlyZWN0bHkuIENvbW1vbiBjYXVzZXM6XG4gKlxuICogLSBBIGNpcGhlcnRleHQgLyBhdXRoIHRhZyBtaXNtYXRjaCwgdHlwaWNhbGx5IHN1cmZhY2VkIGFzIHRoZSBuYXRpdmUgV2ViXG4gKiAgIENyeXB0byBgT3BlcmF0aW9uRXJyb3I6IFRoZSBvcGVyYXRpb24gZmFpbGVkIGZvciBhbiBvcGVyYXRpb24tc3BlY2lmaWNcbiAqICAgcmVhc29uYC4gVXN1YWxseSBjYXVzZWQgYnkgY2lwaGVydGV4dCBtdXRhdGlvbiBvciB0cnVuY2F0aW9uIGluIHRyYW5zaXRcbiAqICAgYmV0d2VlbiBzdG9yYWdlIGFuZCByZWFkICh0cnVuY2F0ZWQgSFRUUCByZXNwb25zZSwgZWRnZS1jYWNoZSBtaXNzXG4gKiAgIHJldHVybmluZyBhIHBhcnRpYWwgMjAwLCBwcm94eSBkcm9wIGR1cmluZyBzdHJlYW1pbmcsIGV0Yy4pLlxuICogLSBBIGtleSByZXNvbHV0aW9uIG1pc21hdGNoICh3cm9uZyBkZXBsb3ltZW50LCBtaXNzaW5nIGtleSBtYXRlcmlhbCkuXG4gKiAtIEEgbWFsZm9ybWVkIGVuY3J5cHRlZCBlbnZlbG9wZSAodG9vIHNob3J0IHRvIGNvbnRhaW4gdGhlIEdDTSBub25jZVxuICogICBhbmQgdGFnKS5cbiAqXG4gKiBFeHRlbmRzIHtAbGluayBXb3JrZmxvd1J1bnRpbWVFcnJvcn0gc28gdGhlIHJ1bi1mYWlsdXJlIGNsYXNzaWZpZXJcbiAqIHJvdXRlcyBpdCB0byBgUlVOVElNRV9FUlJPUmAuXG4gKi9cbmV4cG9ydCBjbGFzcyBSdW50aW1lRGVjcnlwdGlvbkVycm9yIGV4dGVuZHMgV29ya2Zsb3dSdW50aW1lRXJyb3Ige1xuICAvKiogT3B0aW9uYWwgc3RydWN0dXJlZCBjb250ZXh0IGFib3V0IHRoZSBmYWlsZWQgZW5jcnlwdC9kZWNyeXB0IGNhbGwuICovXG4gIHJlYWRvbmx5IGNvbnRleHQ/OiBSdW50aW1lRGVjcnlwdGlvbkVycm9yQ29udGV4dDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBtZXNzYWdlOiBzdHJpbmcsXG4gICAgb3B0aW9ucz86IEVycm9yT3B0aW9ucyAmIHsgY29udGV4dD86IFJ1bnRpbWVEZWNyeXB0aW9uRXJyb3JDb250ZXh0IH1cbiAgKSB7XG4gICAgc3VwZXIobWVzc2FnZSwge1xuICAgICAgY2F1c2U6IG9wdGlvbnM/LmNhdXNlLFxuICAgICAgc2x1ZzogRVJST1JfU0xVR1MuUlVOVElNRV9ERUNSWVBUSU9OX0ZBSUxFRCxcbiAgICB9KTtcbiAgICB0aGlzLm5hbWUgPSAnUnVudGltZURlY3J5cHRpb25FcnJvcic7XG4gICAgaWYgKG9wdGlvbnM/LmNvbnRleHQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5jb250ZXh0ID0gb3B0aW9ucy5jb250ZXh0O1xuICAgIH1cbiAgfVxuXG4gIHN0YXRpYyBpcyh2YWx1ZTogdW5rbm93bik6IHZhbHVlIGlzIFJ1bnRpbWVEZWNyeXB0aW9uRXJyb3Ige1xuICAgIHJldHVybiBpc0Vycm9yKHZhbHVlKSAmJiB2YWx1ZS5uYW1lID09PSAnUnVudGltZURlY3J5cHRpb25FcnJvcic7XG4gIH1cbn1cblxuLyoqXG4gKiBUaHJvd24gd2hlbiB0aGUgY3VycmVudCB3b3JrZmxvdyByZXBsYXkgY2Fubm90IGZvbGxvdyB0aGUgcGF0aCBkZXNjcmliZWQgYnlcbiAqIHRoZSByZWNvcmRlZCBldmVudCBsb2cuIEEgc2luZ2xlIGRpdmVyZ2VuY2UgZG9lcyBub3QgcHJvdmUgdGhhdCB0aGVcbiAqIHBlcnNpc3RlZCBoaXN0b3J5IGlzIGludmFsaWQ6IGEgc3Vic2VxdWVudCByZXBsYXkgbWF5IG9ic2VydmUgb3Igc2NoZWR1bGVcbiAqIHdvcmsgY29ycmVjdGx5LCBzbyB0aGUgcnVudGltZSBtYXkgcmVkZWxpdmVyIGJlZm9yZSBkZWNsYXJpbmcgY29ycnVwdGlvbi5cbiAqL1xuZXhwb3J0IGNsYXNzIFJlcGxheURpdmVyZ2VuY2VFcnJvciBleHRlbmRzIFdvcmtmbG93UnVudGltZUVycm9yIHtcbiAgcmVhZG9ubHkgZXZlbnRJZDogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2U6IHN0cmluZywgb3B0aW9uczogRXJyb3JPcHRpb25zICYgeyBldmVudElkOiBzdHJpbmcgfSkge1xuICAgIHN1cGVyKG1lc3NhZ2UsIHtcbiAgICAgIC4uLm9wdGlvbnMsXG4gICAgICBzbHVnOiBFUlJPUl9TTFVHUy5SRVBMQVlfRElWRVJHRU5DRSxcbiAgICB9KTtcbiAgICB0aGlzLm5hbWUgPSAnUmVwbGF5RGl2ZXJnZW5jZUVycm9yJztcbiAgICB0aGlzLmV2ZW50SWQgPSBvcHRpb25zLmV2ZW50SWQ7XG4gIH1cblxuICBzdGF0aWMgaXModmFsdWU6IHVua25vd24pOiB2YWx1ZSBpcyBSZXBsYXlEaXZlcmdlbmNlRXJyb3Ige1xuICAgIHJldHVybiBpc0Vycm9yKHZhbHVlKSAmJiB2YWx1ZS5uYW1lID09PSAnUmVwbGF5RGl2ZXJnZW5jZUVycm9yJztcbiAgfVxufVxuXG4vKipcbiAqIFRocm93biB3aGVuIGEgc3RlcCBmdW5jdGlvbiBpcyBub3QgcmVnaXN0ZXJlZCBpbiB0aGUgY3VycmVudCBkZXBsb3ltZW50LlxuICpcbiAqIFRoaXMgaXMgYW4gaW5mcmFzdHJ1Y3R1cmUgZXJyb3Ig4oCUIG5vdCBhIHVzZXIgY29kZSBlcnJvci4gSXQgdHlwaWNhbGx5IG1lYW5zXG4gKiBzb21ldGhpbmcgd2VudCB3cm9uZyB3aXRoIHRoZSBidW5kbGluZy9idWlsZCB0b29saW5nIHRoYXQgY2F1c2VkIHRoZSBzdGVwXG4gKiB0byBub3QgZ2V0IGJ1aWx0IGNvcnJlY3RseS5cbiAqXG4gKiBXaGVuIHRoaXMgaGFwcGVucywgdGhlIHN0ZXAgZmFpbHMgKGxpa2UgYSBGYXRhbEVycm9yKSBhbmQgY29udHJvbCBpcyBwYXNzZWQgYmFja1xuICogdG8gdGhlIHdvcmtmbG93IGZ1bmN0aW9uLCB3aGljaCBjYW4gb3B0aW9uYWxseSBoYW5kbGUgdGhlIGZhaWx1cmUgZ3JhY2VmdWxseS5cbiAqL1xuZXhwb3J0IGNsYXNzIFN0ZXBOb3RSZWdpc3RlcmVkRXJyb3IgZXh0ZW5kcyBXb3JrZmxvd1J1bnRpbWVFcnJvciB7XG4gIHN0ZXBOYW1lOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3Ioc3RlcE5hbWU6IHN0cmluZykge1xuICAgIHN1cGVyKFxuICAgICAgYFN0ZXAgXCIke3N0ZXBOYW1lfVwiIGlzIG5vdCByZWdpc3RlcmVkIGluIHRoZSBjdXJyZW50IGRlcGxveW1lbnQuIFRoaXMgdXN1YWxseSBpbmRpY2F0ZXMgYSBidWlsZCBvciBidW5kbGluZyBpc3N1ZSB0aGF0IGNhdXNlZCB0aGUgc3RlcCB0byBub3QgYmUgaW5jbHVkZWQgaW4gdGhlIGRlcGxveW1lbnQuYCxcbiAgICAgIHsgc2x1ZzogRVJST1JfU0xVR1MuU1RFUF9OT1RfUkVHSVNURVJFRCB9XG4gICAgKTtcbiAgICB0aGlzLm5hbWUgPSAnU3RlcE5vdFJlZ2lzdGVyZWRFcnJvcic7XG4gICAgdGhpcy5zdGVwTmFtZSA9IHN0ZXBOYW1lO1xuICB9XG5cbiAgc3RhdGljIGlzKHZhbHVlOiB1bmtub3duKTogdmFsdWUgaXMgU3RlcE5vdFJlZ2lzdGVyZWRFcnJvciB7XG4gICAgcmV0dXJuIGlzRXJyb3IodmFsdWUpICYmIHZhbHVlLm5hbWUgPT09ICdTdGVwTm90UmVnaXN0ZXJlZEVycm9yJztcbiAgfVxufVxuXG4vKipcbiAqIFRocm93biB3aGVuIGEgd29ya2Zsb3cgZnVuY3Rpb24gaXMgbm90IHJlZ2lzdGVyZWQgaW4gdGhlIGN1cnJlbnQgZGVwbG95bWVudC5cbiAqXG4gKiBUaGlzIGlzIGFuIGluZnJhc3RydWN0dXJlIGVycm9yIOKAlCBub3QgYSB1c2VyIGNvZGUgZXJyb3IuIEl0IHR5cGljYWxseSBtZWFuczpcbiAqIC0gQSBydW4gd2FzIHN0YXJ0ZWQgYWdhaW5zdCBhIGRlcGxveW1lbnQgdGhhdCBkb2VzIG5vdCBoYXZlIHRoZSB3b3JrZmxvd1xuICogICAoZS5nLiwgdGhlIHdvcmtmbG93IHdhcyByZW5hbWVkIG9yIG1vdmVkIGFuZCBhIG5ldyBydW4gdGFyZ2V0ZWQgdGhlIGxhdGVzdCBkZXBsb3ltZW50KVxuICogLSBTb21ldGhpbmcgd2VudCB3cm9uZyB3aXRoIHRoZSBidW5kbGluZy9idWlsZCB0b29saW5nIHRoYXQgY2F1c2VkIHRoZSB3b3JrZmxvd1xuICogICB0byBub3QgZ2V0IGJ1aWx0IGNvcnJlY3RseVxuICpcbiAqIFdoZW4gdGhpcyBoYXBwZW5zLCB0aGUgcnVuIGZhaWxzIHdpdGggYSBgUlVOVElNRV9FUlJPUmAgZXJyb3IgY29kZS5cbiAqL1xuZXhwb3J0IGNsYXNzIFdvcmtmbG93Tm90UmVnaXN0ZXJlZEVycm9yIGV4dGVuZHMgV29ya2Zsb3dSdW50aW1lRXJyb3Ige1xuICB3b3JrZmxvd05hbWU6IHN0cmluZztcblxuICBjb25zdHJ1Y3Rvcih3b3JrZmxvd05hbWU6IHN0cmluZykge1xuICAgIHN1cGVyKFxuICAgICAgYFdvcmtmbG93IFwiJHt3b3JrZmxvd05hbWV9XCIgaXMgbm90IHJlZ2lzdGVyZWQgaW4gdGhlIGN1cnJlbnQgZGVwbG95bWVudC4gVGhpcyB1c3VhbGx5IG1lYW5zIGEgcnVuIHdhcyBzdGFydGVkIGFnYWluc3QgYSBkZXBsb3ltZW50IHRoYXQgZG9lcyBub3QgaGF2ZSB0aGlzIHdvcmtmbG93LCBvciB0aGVyZSB3YXMgYSBidWlsZC9idW5kbGluZyBpc3N1ZS5gLFxuICAgICAgeyBzbHVnOiBFUlJPUl9TTFVHUy5XT1JLRkxPV19OT1RfUkVHSVNURVJFRCB9XG4gICAgKTtcbiAgICB0aGlzLm5hbWUgPSAnV29ya2Zsb3dOb3RSZWdpc3RlcmVkRXJyb3InO1xuICAgIHRoaXMud29ya2Zsb3dOYW1lID0gd29ya2Zsb3dOYW1lO1xuICB9XG5cbiAgc3RhdGljIGlzKHZhbHVlOiB1bmtub3duKTogdmFsdWUgaXMgV29ya2Zsb3dOb3RSZWdpc3RlcmVkRXJyb3Ige1xuICAgIHJldHVybiBpc0Vycm9yKHZhbHVlKSAmJiB2YWx1ZS5uYW1lID09PSAnV29ya2Zsb3dOb3RSZWdpc3RlcmVkRXJyb3InO1xuICB9XG59XG5cbi8qKlxuICogVGhyb3duIHdoZW4gcGVyZm9ybWluZyBvcGVyYXRpb25zIG9uIGEgd29ya2Zsb3cgcnVuIHRoYXQgZG9lcyBub3QgZXhpc3QuXG4gKlxuICogVGhpcyBlcnJvciBvY2N1cnMgd2hlbiB5b3UgY2FsbCBtZXRob2RzIG9uIGEgcnVuIG9iamVjdCAoZS5nLiBgcnVuLnN0YXR1c2AsXG4gKiBgcnVuLmNhbmNlbCgpYCwgYHJ1bi5yZXR1cm5WYWx1ZWApIGJ1dCB0aGUgdW5kZXJseWluZyBydW4gSUQgZG9lcyBub3QgbWF0Y2hcbiAqIGFueSBrbm93biB3b3JrZmxvdyBydW4uIE5vdGUgdGhhdCBgZ2V0UnVuKGlkKWAgaXRzZWxmIGlzIHN5bmNocm9ub3VzIGFuZCB3aWxsXG4gKiBub3QgdGhyb3cg4oCUIHRoaXMgZXJyb3IgaXMgcmFpc2VkIHdoZW4gc3Vic2VxdWVudCBvcGVyYXRpb25zIGRpc2NvdmVyIHRoZSBydW5cbiAqIGlzIG1pc3NpbmcuXG4gKlxuICogVXNlIHRoZSBzdGF0aWMgYFdvcmtmbG93UnVuTm90Rm91bmRFcnJvci5pcygpYCBtZXRob2QgZm9yIHR5cGUtc2FmZSBjaGVja2luZ1xuICogaW4gY2F0Y2ggYmxvY2tzLlxuICpcbiAqIEBleGFtcGxlXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgV29ya2Zsb3dSdW5Ob3RGb3VuZEVycm9yIH0gZnJvbSBcIndvcmtmbG93L2ludGVybmFsL2Vycm9yc1wiO1xuICpcbiAqIHRyeSB7XG4gKiAgIGNvbnN0IHN0YXR1cyA9IGF3YWl0IHJ1bi5zdGF0dXM7XG4gKiB9IGNhdGNoIChlcnJvcikge1xuICogICBpZiAoV29ya2Zsb3dSdW5Ob3RGb3VuZEVycm9yLmlzKGVycm9yKSkge1xuICogICAgIGNvbnNvbGUuZXJyb3IoYFJ1biAke2Vycm9yLnJ1bklkfSBkb2VzIG5vdCBleGlzdGApO1xuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGNsYXNzIFdvcmtmbG93UnVuTm90Rm91bmRFcnJvciBleHRlbmRzIFdvcmtmbG93RXJyb3Ige1xuICBydW5JZDogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKHJ1bklkOiBzdHJpbmcpIHtcbiAgICBzdXBlcihgV29ya2Zsb3cgcnVuIFwiJHtydW5JZH1cIiBub3QgZm91bmRgLCB7fSk7XG4gICAgdGhpcy5uYW1lID0gJ1dvcmtmbG93UnVuTm90Rm91bmRFcnJvcic7XG4gICAgdGhpcy5ydW5JZCA9IHJ1bklkO1xuICB9XG5cbiAgc3RhdGljIGlzKHZhbHVlOiB1bmtub3duKTogdmFsdWUgaXMgV29ya2Zsb3dSdW5Ob3RGb3VuZEVycm9yIHtcbiAgICByZXR1cm4gaXNFcnJvcih2YWx1ZSkgJiYgdmFsdWUubmFtZSA9PT0gJ1dvcmtmbG93UnVuTm90Rm91bmRFcnJvcic7XG4gIH1cbn1cblxuLyoqXG4gKiBUaHJvd24gd2hlbiBhIGhvb2sgdG9rZW4gaXMgYWxyZWFkeSBpbiB1c2UgYnkgYW5vdGhlciBhY3RpdmUgd29ya2Zsb3cgcnVuLlxuICpcbiAqIFRoaXMgaXMgYSB1c2VyIGVycm9yIOKAlCBpdCBtZWFucyB0aGUgc2FtZSBjdXN0b20gdG9rZW4gd2FzIHBhc3NlZCB0b1xuICogYGNyZWF0ZUhvb2tgIGluIHR3byBvciBtb3JlIGNvbmN1cnJlbnQgcnVucy4gVXNlIGEgdW5pcXVlIHRva2VuIHBlciBydW5cbiAqIChvciBvbWl0IHRoZSB0b2tlbiB0byBsZXQgdGhlIHJ1bnRpbWUgZ2VuZXJhdGUgb25lIGF1dG9tYXRpY2FsbHkpLlxuICovXG5leHBvcnQgY2xhc3MgSG9va0NvbmZsaWN0RXJyb3IgZXh0ZW5kcyBXb3JrZmxvd0Vycm9yIHtcbiAgdG9rZW46IHN0cmluZztcbiAgLy8gVE9ETzogTWFrZSB0aGlzIHJlcXVpcmVkIG9uY2UgYWxsIHBlcnNpc3RlZCBob29rX2NvbmZsaWN0IGV2ZW50cyBhbmQgV29ybGRcbiAgLy8gaW1wbGVtZW50YXRpb25zIGFsd2F5cyBpbmNsdWRlIHRoZSBhY3RpdmUgaG9vayBvd25lcidzIHJ1biBJRC5cbiAgY29uZmxpY3RpbmdSdW5JZD86IHN0cmluZztcblxuICBjb25zdHJ1Y3Rvcih0b2tlbjogc3RyaW5nLCBjb25mbGljdGluZ1J1bklkPzogc3RyaW5nKSB7XG4gICAgc3VwZXIoXG4gICAgICBgSG9vayB0b2tlbiBcIiR7dG9rZW59XCIgaXMgYWxyZWFkeSBpbiB1c2UgYnkgYW5vdGhlciB3b3JrZmxvdyR7Y29uZmxpY3RpbmdSdW5JZCA/IGAgKHJ1biBcIiR7Y29uZmxpY3RpbmdSdW5JZH1cIilgIDogJyd9YCxcbiAgICAgIHtcbiAgICAgICAgc2x1ZzogRVJST1JfU0xVR1MuSE9PS19DT05GTElDVCxcbiAgICAgIH1cbiAgICApO1xuICAgIHRoaXMubmFtZSA9ICdIb29rQ29uZmxpY3RFcnJvcic7XG4gICAgdGhpcy50b2tlbiA9IHRva2VuO1xuICAgIGlmIChjb25mbGljdGluZ1J1bklkICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXMuY29uZmxpY3RpbmdSdW5JZCA9IGNvbmZsaWN0aW5nUnVuSWQ7XG4gICAgfVxuICB9XG5cbiAgc3RhdGljIGlzKHZhbHVlOiB1bmtub3duKTogdmFsdWUgaXMgSG9va0NvbmZsaWN0RXJyb3Ige1xuICAgIHJldHVybiBpc0Vycm9yKHZhbHVlKSAmJiB2YWx1ZS5uYW1lID09PSAnSG9va0NvbmZsaWN0RXJyb3InO1xuICB9XG59XG5cbi8qKlxuICogVGhyb3duIHdoZW4gY2FsbGluZyBgcmVzdW1lSG9vaygpYCBvciBgcmVzdW1lV2ViaG9vaygpYCB3aXRoIGEgdG9rZW4gdGhhdFxuICogZG9lcyBub3QgbWF0Y2ggYW55IGFjdGl2ZSBob29rLlxuICpcbiAqIENvbW1vbiBjYXVzZXM6XG4gKiAtIFRoZSBob29rIGhhcyBleHBpcmVkIChwYXN0IGl0cyBUVEwpXG4gKiAtIFRoZSBob29rIHdhcyBhbHJlYWR5IGRpc3Bvc2VkIGFmdGVyIGJlaW5nIGNvbnN1bWVkXG4gKiAtIFRoZSB3b3JrZmxvdyBoYXMgbm90IHN0YXJ0ZWQgeWV0LCBzbyB0aGUgaG9vayBkb2VzIG5vdCBleGlzdFxuICpcbiAqIEEgY29tbW9uIHBhdHRlcm4gaXMgdG8gY2F0Y2ggdGhpcyBlcnJvciBhbmQgc3RhcnQgYSBuZXcgd29ya2Zsb3cgcnVuIHdoZW5cbiAqIHRoZSBob29rIGRvZXMgbm90IGV4aXN0IHlldCAodGhlIFwicmVzdW1lIG9yIHN0YXJ0XCIgcGF0dGVybikuXG4gKlxuICogVXNlIHRoZSBzdGF0aWMgYEhvb2tOb3RGb3VuZEVycm9yLmlzKClgIG1ldGhvZCBmb3IgdHlwZS1zYWZlIGNoZWNraW5nIGluXG4gKiBjYXRjaCBibG9ja3MuXG4gKlxuICogQGV4YW1wbGVcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBIb29rTm90Rm91bmRFcnJvciB9IGZyb20gXCJ3b3JrZmxvdy9pbnRlcm5hbC9lcnJvcnNcIjtcbiAqXG4gKiB0cnkge1xuICogICBhd2FpdCByZXN1bWVIb29rKHRva2VuLCBwYXlsb2FkKTtcbiAqIH0gY2F0Y2ggKGVycm9yKSB7XG4gKiAgIGlmIChIb29rTm90Rm91bmRFcnJvci5pcyhlcnJvcikpIHtcbiAqICAgICAvLyBIb29rIGRvZXNuJ3QgZXhpc3Qg4oCUIHN0YXJ0IGEgbmV3IHdvcmtmbG93IHJ1biBpbnN0ZWFkXG4gKiAgICAgYXdhaXQgc3RhcnRXb3JrZmxvdyhcIm15V29ya2Zsb3dcIiwgcGF5bG9hZCk7XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICovXG5leHBvcnQgY2xhc3MgSG9va05vdEZvdW5kRXJyb3IgZXh0ZW5kcyBXb3JrZmxvd0Vycm9yIHtcbiAgdG9rZW46IHN0cmluZztcblxuICBjb25zdHJ1Y3Rvcih0b2tlbjogc3RyaW5nKSB7XG4gICAgc3VwZXIoJ0hvb2sgbm90IGZvdW5kJywge30pO1xuICAgIHRoaXMubmFtZSA9ICdIb29rTm90Rm91bmRFcnJvcic7XG4gICAgdGhpcy50b2tlbiA9IHRva2VuO1xuICB9XG5cbiAgc3RhdGljIGlzKHZhbHVlOiB1bmtub3duKTogdmFsdWUgaXMgSG9va05vdEZvdW5kRXJyb3Ige1xuICAgIHJldHVybiBpc0Vycm9yKHZhbHVlKSAmJiB2YWx1ZS5uYW1lID09PSAnSG9va05vdEZvdW5kRXJyb3InO1xuICB9XG59XG5cbi8qKlxuICogVGhyb3duIHdoZW4gYW4gb3BlcmF0aW9uIGNvbmZsaWN0cyB3aXRoIHRoZSBjdXJyZW50IHN0YXRlIG9mIGFuIGVudGl0eS5cbiAqIFRoaXMgaW5jbHVkZXMgYXR0ZW1wdHMgdG8gbW9kaWZ5IGFuIGVudGl0eSBhbHJlYWR5IGluIGEgdGVybWluYWwgc3RhdGUsXG4gKiBjcmVhdGUgYW4gZW50aXR5IHRoYXQgYWxyZWFkeSBleGlzdHMsIG9yIGFueSBvdGhlciA0MDktc3R5bGUgY29uZmxpY3QuXG4gKlxuICogVGhlIHdvcmtmbG93IHJ1bnRpbWUgaGFuZGxlcyB0aGlzIGVycm9yIGF1dG9tYXRpY2FsbHkuIFVzZXJzIGludGVyYWN0aW5nXG4gKiB3aXRoIHdvcmxkIHN0b3JhZ2UgYmFja2VuZHMgZGlyZWN0bHkgbWF5IGVuY291bnRlciBpdC5cbiAqL1xuZXhwb3J0IGNsYXNzIEVudGl0eUNvbmZsaWN0RXJyb3IgZXh0ZW5kcyBXb3JrZmxvd1dvcmxkRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihtZXNzYWdlOiBzdHJpbmcpIHtcbiAgICBzdXBlcihtZXNzYWdlKTtcbiAgICB0aGlzLm5hbWUgPSAnRW50aXR5Q29uZmxpY3RFcnJvcic7XG4gIH1cblxuICBzdGF0aWMgaXModmFsdWU6IHVua25vd24pOiB2YWx1ZSBpcyBFbnRpdHlDb25mbGljdEVycm9yIHtcbiAgICByZXR1cm4gaXNFcnJvcih2YWx1ZSkgJiYgdmFsdWUubmFtZSA9PT0gJ0VudGl0eUNvbmZsaWN0RXJyb3InO1xuICB9XG59XG5cbi8qKlxuICogVGhyb3duIHdoZW4gYSBydW4gaXMgbm8gbG9uZ2VyIGF2YWlsYWJsZSDigJQgZWl0aGVyIGJlY2F1c2UgaXQgaGFzIGJlZW5cbiAqIGNsZWFuZWQgdXAsIGV4cGlyZWQsIG9yIGFscmVhZHkgcmVhY2hlZCBhIHRlcm1pbmFsIHN0YXRlIChjb21wbGV0ZWQvZmFpbGVkKS5cbiAqXG4gKiBUaGUgd29ya2Zsb3cgcnVudGltZSBoYW5kbGVzIHRoaXMgZXJyb3IgYXV0b21hdGljYWxseS4gVXNlcnMgaW50ZXJhY3RpbmdcbiAqIHdpdGggd29ybGQgc3RvcmFnZSBiYWNrZW5kcyBkaXJlY3RseSBtYXkgZW5jb3VudGVyIGl0LlxuICovXG5leHBvcnQgY2xhc3MgUnVuRXhwaXJlZEVycm9yIGV4dGVuZHMgV29ya2Zsb3dXb3JsZEVycm9yIHtcbiAgY29uc3RydWN0b3IobWVzc2FnZTogc3RyaW5nKSB7XG4gICAgc3VwZXIobWVzc2FnZSk7XG4gICAgdGhpcy5uYW1lID0gJ1J1bkV4cGlyZWRFcnJvcic7XG4gIH1cblxuICBzdGF0aWMgaXModmFsdWU6IHVua25vd24pOiB2YWx1ZSBpcyBSdW5FeHBpcmVkRXJyb3Ige1xuICAgIHJldHVybiBpc0Vycm9yKHZhbHVlKSAmJiB2YWx1ZS5uYW1lID09PSAnUnVuRXhwaXJlZEVycm9yJztcbiAgfVxufVxuXG4vKipcbiAqIFRocm93biB3aGVuIGFuIG9wZXJhdGlvbiBjYW5ub3QgcHJvY2VlZCBiZWNhdXNlIGEgcmVxdWlyZWQgdGltZXN0YW1wXG4gKiAoZS5nLiByZXRyeUFmdGVyKSBoYXMgbm90IGJlZW4gcmVhY2hlZCB5ZXQuXG4gKlxuICogVGhlIHdvcmtmbG93IHJ1bnRpbWUgaGFuZGxlcyB0aGlzIGVycm9yIGF1dG9tYXRpY2FsbHkuIFVzZXJzIGludGVyYWN0aW5nXG4gKiB3aXRoIHdvcmxkIHN0b3JhZ2UgYmFja2VuZHMgZGlyZWN0bHkgbWF5IGVuY291bnRlciBpdC5cbiAqXG4gKiBAcHJvcGVydHkgcmV0cnlBZnRlciAtIERlbGF5IGluIHNlY29uZHMgYmVmb3JlIHRoZSBvcGVyYXRpb24gY2FuIGJlIHJldHJpZWQuXG4gKi9cbmV4cG9ydCBjbGFzcyBUb29FYXJseUVycm9yIGV4dGVuZHMgV29ya2Zsb3dXb3JsZEVycm9yIHtcbiAgY29uc3RydWN0b3IobWVzc2FnZTogc3RyaW5nLCBvcHRpb25zPzogeyByZXRyeUFmdGVyPzogbnVtYmVyIH0pIHtcbiAgICBzdXBlcihtZXNzYWdlLCB7IHJldHJ5QWZ0ZXI6IG9wdGlvbnM/LnJldHJ5QWZ0ZXIgfSk7XG4gICAgdGhpcy5uYW1lID0gJ1Rvb0Vhcmx5RXJyb3InO1xuICB9XG5cbiAgc3RhdGljIGlzKHZhbHVlOiB1bmtub3duKTogdmFsdWUgaXMgVG9vRWFybHlFcnJvciB7XG4gICAgcmV0dXJuIGlzRXJyb3IodmFsdWUpICYmIHZhbHVlLm5hbWUgPT09ICdUb29FYXJseUVycm9yJztcbiAgfVxufVxuXG4vKipcbiAqIFRocm93biB3aGVuIGEgcmVxdWVzdCBpcyByYXRlIGxpbWl0ZWQgYnkgdGhlIHdvcmtmbG93IGJhY2tlbmQuXG4gKlxuICogVGhlIHdvcmtmbG93IHJ1bnRpbWUgaGFuZGxlcyB0aGlzIGVycm9yIGF1dG9tYXRpY2FsbHkgd2l0aCByZXRyeSBsb2dpYy5cbiAqIFVzZXJzIGludGVyYWN0aW5nIHdpdGggd29ybGQgc3RvcmFnZSBiYWNrZW5kcyBkaXJlY3RseSBtYXkgZW5jb3VudGVyIGl0XG4gKiBpZiByZXRyaWVzIGFyZSBleGhhdXN0ZWQuXG4gKlxuICogQHByb3BlcnR5IHJldHJ5QWZ0ZXIgLSBEZWxheSBpbiBzZWNvbmRzIGJlZm9yZSB0aGUgcmVxdWVzdCBjYW4gYmUgcmV0cmllZC5cbiAqL1xuZXhwb3J0IGNsYXNzIFRocm90dGxlRXJyb3IgZXh0ZW5kcyBXb3JrZmxvd1dvcmxkRXJyb3Ige1xuICByZXRyeUFmdGVyPzogbnVtYmVyO1xuXG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2U6IHN0cmluZywgb3B0aW9ucz86IHsgcmV0cnlBZnRlcj86IG51bWJlciB9KSB7XG4gICAgc3VwZXIobWVzc2FnZSk7XG4gICAgdGhpcy5uYW1lID0gJ1Rocm90dGxlRXJyb3InO1xuICAgIHRoaXMucmV0cnlBZnRlciA9IG9wdGlvbnM/LnJldHJ5QWZ0ZXI7XG4gIH1cblxuICBzdGF0aWMgaXModmFsdWU6IHVua25vd24pOiB2YWx1ZSBpcyBUaHJvdHRsZUVycm9yIHtcbiAgICByZXR1cm4gaXNFcnJvcih2YWx1ZSkgJiYgdmFsdWUubmFtZSA9PT0gJ1Rocm90dGxlRXJyb3InO1xuICB9XG59XG5cbi8qKlxuICogVGhyb3duIHdoZW4gYXdhaXRpbmcgYHJ1bi5yZXR1cm5WYWx1ZWAgb24gYSB3b3JrZmxvdyBydW4gdGhhdCB3YXMgY2FuY2VsbGVkLlxuICpcbiAqIFRoaXMgZXJyb3IgaW5kaWNhdGVzIHRoYXQgdGhlIHdvcmtmbG93IHdhcyBleHBsaWNpdGx5IGNhbmNlbGxlZCAodmlhXG4gKiBgcnVuLmNhbmNlbCgpYCkgYW5kIHdpbGwgbm90IHByb2R1Y2UgYSByZXR1cm4gdmFsdWUuIFlvdSBjYW4gY2hlY2sgZm9yXG4gKiBjYW5jZWxsYXRpb24gYmVmb3JlIGF3YWl0aW5nIHRoZSByZXR1cm4gdmFsdWUgYnkgaW5zcGVjdGluZyBgcnVuLnN0YXR1c2AuXG4gKlxuICogVXNlIHRoZSBzdGF0aWMgYFdvcmtmbG93UnVuQ2FuY2VsbGVkRXJyb3IuaXMoKWAgbWV0aG9kIGZvciB0eXBlLXNhZmVcbiAqIGNoZWNraW5nIGluIGNhdGNoIGJsb2Nrcy5cbiAqXG4gKiBAZXhhbXBsZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IFdvcmtmbG93UnVuQ2FuY2VsbGVkRXJyb3IgfSBmcm9tIFwid29ya2Zsb3cvaW50ZXJuYWwvZXJyb3JzXCI7XG4gKlxuICogdHJ5IHtcbiAqICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcnVuLnJldHVyblZhbHVlO1xuICogfSBjYXRjaCAoZXJyb3IpIHtcbiAqICAgaWYgKFdvcmtmbG93UnVuQ2FuY2VsbGVkRXJyb3IuaXMoZXJyb3IpKSB7XG4gKiAgICAgY29uc29sZS5sb2coYFJ1biAke2Vycm9yLnJ1bklkfSB3YXMgY2FuY2VsbGVkYCk7XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICovXG5leHBvcnQgY2xhc3MgV29ya2Zsb3dSdW5DYW5jZWxsZWRFcnJvciBleHRlbmRzIFdvcmtmbG93RXJyb3Ige1xuICBydW5JZDogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKHJ1bklkOiBzdHJpbmcpIHtcbiAgICBzdXBlcihgV29ya2Zsb3cgcnVuIFwiJHtydW5JZH1cIiBjYW5jZWxsZWRgLCB7fSk7XG4gICAgdGhpcy5uYW1lID0gJ1dvcmtmbG93UnVuQ2FuY2VsbGVkRXJyb3InO1xuICAgIHRoaXMucnVuSWQgPSBydW5JZDtcbiAgfVxuXG4gIHN0YXRpYyBpcyh2YWx1ZTogdW5rbm93bik6IHZhbHVlIGlzIFdvcmtmbG93UnVuQ2FuY2VsbGVkRXJyb3Ige1xuICAgIHJldHVybiBpc0Vycm9yKHZhbHVlKSAmJiB2YWx1ZS5uYW1lID09PSAnV29ya2Zsb3dSdW5DYW5jZWxsZWRFcnJvcic7XG4gIH1cbn1cblxuLyoqXG4gKiBUaHJvd24gd2hlbiBhdHRlbXB0aW5nIHRvIG9wZXJhdGUgb24gYSB3b3JrZmxvdyBydW4gdGhhdCByZXF1aXJlcyBhIG5ld2VyIFdvcmxkIHZlcnNpb24uXG4gKlxuICogVGhpcyBlcnJvciBvY2N1cnMgd2hlbiBhIHJ1biB3YXMgY3JlYXRlZCB3aXRoIGEgbmV3ZXIgc3BlYyB2ZXJzaW9uIHRoYW4gdGhlXG4gKiBjdXJyZW50IFdvcmxkIGltcGxlbWVudGF0aW9uIHN1cHBvcnRzLiBUbyByZXNvbHZlIHRoaXMsIHVwZ3JhZGUgeW91clxuICogYHdvcmtmbG93YCBwYWNrYWdlcyB0byBhIHZlcnNpb24gdGhhdCBzdXBwb3J0cyB0aGUgcmVxdWlyZWQgc3BlYyB2ZXJzaW9uLlxuICpcbiAqIFVzZSB0aGUgc3RhdGljIGBSdW5Ob3RTdXBwb3J0ZWRFcnJvci5pcygpYCBtZXRob2QgZm9yIHR5cGUtc2FmZSBjaGVja2luZyBpblxuICogY2F0Y2ggYmxvY2tzLlxuICpcbiAqIEBleGFtcGxlXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgUnVuTm90U3VwcG9ydGVkRXJyb3IgfSBmcm9tIFwid29ya2Zsb3cvaW50ZXJuYWwvZXJyb3JzXCI7XG4gKlxuICogdHJ5IHtcbiAqICAgY29uc3Qgc3RhdHVzID0gYXdhaXQgcnVuLnN0YXR1cztcbiAqIH0gY2F0Y2ggKGVycm9yKSB7XG4gKiAgIGlmIChSdW5Ob3RTdXBwb3J0ZWRFcnJvci5pcyhlcnJvcikpIHtcbiAqICAgICBjb25zb2xlLmVycm9yKFxuICogICAgICAgYFJ1biByZXF1aXJlcyBzcGVjIHYke2Vycm9yLnJ1blNwZWNWZXJzaW9ufSwgYCArXG4gKiAgICAgICBgYnV0IHdvcmxkIHN1cHBvcnRzIHYke2Vycm9yLndvcmxkU3BlY1ZlcnNpb259YFxuICogICAgICk7XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICovXG5leHBvcnQgY2xhc3MgUnVuTm90U3VwcG9ydGVkRXJyb3IgZXh0ZW5kcyBXb3JrZmxvd0Vycm9yIHtcbiAgcmVhZG9ubHkgcnVuU3BlY1ZlcnNpb246IG51bWJlcjtcbiAgcmVhZG9ubHkgd29ybGRTcGVjVmVyc2lvbjogbnVtYmVyO1xuXG4gIGNvbnN0cnVjdG9yKHJ1blNwZWNWZXJzaW9uOiBudW1iZXIsIHdvcmxkU3BlY1ZlcnNpb246IG51bWJlcikge1xuICAgIHN1cGVyKFxuICAgICAgYFJ1biByZXF1aXJlcyBzcGVjIHZlcnNpb24gJHtydW5TcGVjVmVyc2lvbn0sIGJ1dCB3b3JsZCBzdXBwb3J0cyB2ZXJzaW9uICR7d29ybGRTcGVjVmVyc2lvbn0uIGAgK1xuICAgICAgICBgUGxlYXNlIHVwZ3JhZGUgJ3dvcmtmbG93JyBwYWNrYWdlLmBcbiAgICApO1xuICAgIHRoaXMubmFtZSA9ICdSdW5Ob3RTdXBwb3J0ZWRFcnJvcic7XG4gICAgdGhpcy5ydW5TcGVjVmVyc2lvbiA9IHJ1blNwZWNWZXJzaW9uO1xuICAgIHRoaXMud29ybGRTcGVjVmVyc2lvbiA9IHdvcmxkU3BlY1ZlcnNpb247XG4gIH1cblxuICBzdGF0aWMgaXModmFsdWU6IHVua25vd24pOiB2YWx1ZSBpcyBSdW5Ob3RTdXBwb3J0ZWRFcnJvciB7XG4gICAgcmV0dXJuIGlzRXJyb3IodmFsdWUpICYmIHZhbHVlLm5hbWUgPT09ICdSdW5Ob3RTdXBwb3J0ZWRFcnJvcic7XG4gIH1cbn1cblxuLyoqXG4gKiBBIGZhdGFsIGVycm9yIGlzIGFuIGVycm9yIHRoYXQgY2Fubm90IGJlIHJldHJpZWQuXG4gKiBJdCB3aWxsIGNhdXNlIHRoZSBzdGVwIHRvIGZhaWwgYW5kIHRoZSBlcnJvciB3aWxsXG4gKiBiZSBidWJibGVkIHVwIHRvIHRoZSB3b3JrZmxvdyBsb2dpYy5cbiAqL1xuZXhwb3J0IGNsYXNzIEZhdGFsRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGZhdGFsID0gdHJ1ZTtcblxuICBjb25zdHJ1Y3RvcihtZXNzYWdlOiBzdHJpbmcpIHtcbiAgICBzdXBlcihtZXNzYWdlKTtcbiAgICB0aGlzLm5hbWUgPSAnRmF0YWxFcnJvcic7XG4gIH1cblxuICBzdGF0aWMgaXModmFsdWU6IHVua25vd24pOiB2YWx1ZSBpcyBGYXRhbEVycm9yIHtcbiAgICByZXR1cm4gaXNFcnJvcih2YWx1ZSkgJiYgdmFsdWUubmFtZSA9PT0gJ0ZhdGFsRXJyb3InO1xuICB9XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUmV0cnlhYmxlRXJyb3JPcHRpb25zIHtcbiAgLyoqXG4gICAqIFRoZSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIHRvIHdhaXQgYmVmb3JlIHJldHJ5aW5nIHRoZSBzdGVwLlxuICAgKiBDYW4gYWxzbyBiZSBhIGR1cmF0aW9uIHN0cmluZyAoZS5nLiwgXCI1c1wiLCBcIjJtXCIpIG9yIGEgRGF0ZSBvYmplY3QuXG4gICAqIElmIG5vdCBwcm92aWRlZCwgdGhlIHN0ZXAgd2lsbCBiZSByZXRyaWVkIGFmdGVyIDEgc2Vjb25kICgxMDAwIG1pbGxpc2Vjb25kcykuXG4gICAqL1xuICByZXRyeUFmdGVyPzogbnVtYmVyIHwgU3RyaW5nVmFsdWUgfCBEYXRlO1xufVxuXG4vKipcbiAqIEFuIGVycm9yIHRoYXQgY2FuIGhhcHBlbiBkdXJpbmcgYSBzdGVwIGV4ZWN1dGlvbiwgYWxsb3dpbmdcbiAqIGZvciBjb25maWd1cmF0aW9uIG9mIHRoZSByZXRyeSBiZWhhdmlvci5cbiAqL1xuZXhwb3J0IGNsYXNzIFJldHJ5YWJsZUVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICAvKipcbiAgICogVGhlIERhdGUgd2hlbiB0aGUgc3RlcCBzaG91bGQgYmUgcmV0cmllZC5cbiAgICovXG4gIHJldHJ5QWZ0ZXI6IERhdGU7XG5cbiAgY29uc3RydWN0b3IobWVzc2FnZTogc3RyaW5nLCBvcHRpb25zOiBSZXRyeWFibGVFcnJvck9wdGlvbnMgPSB7fSkge1xuICAgIHN1cGVyKG1lc3NhZ2UpO1xuICAgIHRoaXMubmFtZSA9ICdSZXRyeWFibGVFcnJvcic7XG5cbiAgICBpZiAob3B0aW9ucy5yZXRyeUFmdGVyICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXMucmV0cnlBZnRlciA9IHBhcnNlRHVyYXRpb25Ub0RhdGUob3B0aW9ucy5yZXRyeUFmdGVyKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gRGVmYXVsdCB0byAxIHNlY29uZCAoMTAwMCBtaWxsaXNlY29uZHMpXG4gICAgICB0aGlzLnJldHJ5QWZ0ZXIgPSBuZXcgRGF0ZShEYXRlLm5vdygpICsgMTAwMCk7XG4gICAgfVxuICB9XG5cbiAgc3RhdGljIGlzKHZhbHVlOiB1bmtub3duKTogdmFsdWUgaXMgUmV0cnlhYmxlRXJyb3Ige1xuICAgIHJldHVybiBpc0Vycm9yKHZhbHVlKSAmJiB2YWx1ZS5uYW1lID09PSAnUmV0cnlhYmxlRXJyb3InO1xuICB9XG59XG5cbmV4cG9ydCBjb25zdCBWRVJDRUxfNDAzX0VSUk9SX01FU1NBR0UgPVxuICAnWW91ciBjdXJyZW50IHZlcmNlbCBhY2NvdW50IGRvZXMgbm90IGhhdmUgYWNjZXNzIHRvIHRoaXMgcmVzb3VyY2UuIFVzZSBgdmVyY2VsIGxvZ2luYCBvciBgdmVyY2VsIHN3aXRjaGAgdG8gZW5zdXJlIHlvdSBhcmUgbGlua2VkIHRvIHRoZSByaWdodCBhY2NvdW50Lic7XG5cbmV4cG9ydCB7IFJVTl9FUlJPUl9DT0RFUywgdHlwZSBSdW5FcnJvckNvZGUgfSBmcm9tICcuL2Vycm9yLWNvZGVzLmpzJztcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBDcm9zcy1yZWFsbSBjbGFzcyByZWdpc3RyYXRpb25cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy9cbi8vIGBGYXRhbEVycm9yYCwgYFJldHJ5YWJsZUVycm9yYCwgYW5kIGBIb29rQ29uZmxpY3RFcnJvcmAgYXJlIG5vdCBidWlsdC1pbnMsIHNvIGRpZmZlcmVudCByZWFsbXNcbi8vIChlLmcuIHRoZSB3b3JrZmxvdyBWTSBjb250ZXh0IHZzLiB0aGUgaG9zdCBjb250ZXh0IHRoYXQgcnVucyB0aGUgcXVldWVcbi8vIGhhbmRsZXIpIGJ1bmRsZSBhbmQgbG9hZCB0aGVpciBvd24gY29waWVzIG9mIHRoaXMgbW9kdWxlIOKAlCBtZWFuaW5nIGVhY2hcbi8vIHJlYWxtIGhhcyBpdHMgb3duIGRpc3RpbmN0IGNsYXNzIGlkZW50aXR5LiBDcm9zcy1yZWFsbSBgaW5zdGFuY2VvZmAgZmFpbHNcbi8vIGJlY2F1c2UgdGhlIHByb3RvdHlwZSBjaGFpbnMgbmV2ZXIgbWVldC5cbi8vXG4vLyBUbyBsZXQgc2VyaWFsaXphdGlvbiByZXZpdmVycyByZWNvbnN0cnVjdCBhIHZhbHVlIGFzIHRoZSAqY29uc3VtZXIncypcbi8vIEZhdGFsRXJyb3IgKHNvIHVzZXItY29kZSBgZXJyIGluc3RhbmNlb2YgRmF0YWxFcnJvcmAgcGFzc2VzKSwgZWFjaCBidW5kbGVkXG4vLyBjb3B5IG9mIHRoaXMgbW9kdWxlIHNlbGYtcmVnaXN0ZXJzIGl0cyBjbGFzcyBvbiBgZ2xvYmFsVGhpc2AgdmlhIGEga25vd25cbi8vIFN5bWJvbC5mb3Iga2V5LiBSZXZpdmVycyBpbiBgQHdvcmtmbG93L2NvcmVgIGxvb2sgdXAgdGhlIGNsYXNzIHZpYSB0aGVcbi8vIGNvbnN1bWVyJ3MgZ2xvYmFsVGhpcyBhdCBoeWRyYXRpb24gdGltZS5cbi8vXG4vLyBGaXJzdCByZWdpc3RyYXRpb24gaW4gYSBnaXZlbiByZWFsbSB3aW5zLiBUaGUgZGVzY3JpcHRvciBpcyBub24td3JpdGFibGVcbi8vIGFuZCBub24tY29uZmlndXJhYmxlIHRvIG1ha2UgYWNjaWRlbnRhbCBjbG9iYmVyaW5nIGxvdWQuXG5jb25zdCBGQVRBTF9FUlJPUl9LRVkgPSBTeW1ib2wuZm9yKCdAd29ya2Zsb3cvZXJyb3JzLy9GYXRhbEVycm9yJyk7XG5jb25zdCBSRVRSWUFCTEVfRVJST1JfS0VZID0gU3ltYm9sLmZvcignQHdvcmtmbG93L2Vycm9ycy8vUmV0cnlhYmxlRXJyb3InKTtcbmNvbnN0IEhPT0tfQ09ORkxJQ1RfRVJST1JfS0VZID0gU3ltYm9sLmZvcihcbiAgJ0B3b3JrZmxvdy9lcnJvcnMvL0hvb2tDb25mbGljdEVycm9yJ1xuKTtcblxuaWYgKHR5cGVvZiBnbG9iYWxUaGlzICE9PSAndW5kZWZpbmVkJykge1xuICBpZiAoIU9iamVjdC5oYXNPd24oZ2xvYmFsVGhpcywgRkFUQUxfRVJST1JfS0VZKSkge1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShnbG9iYWxUaGlzLCBGQVRBTF9FUlJPUl9LRVksIHtcbiAgICAgIHZhbHVlOiBGYXRhbEVycm9yLFxuICAgICAgd3JpdGFibGU6IGZhbHNlLFxuICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICBjb25maWd1cmFibGU6IGZhbHNlLFxuICAgIH0pO1xuICB9XG4gIGlmICghT2JqZWN0Lmhhc093bihnbG9iYWxUaGlzLCBSRVRSWUFCTEVfRVJST1JfS0VZKSkge1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShnbG9iYWxUaGlzLCBSRVRSWUFCTEVfRVJST1JfS0VZLCB7XG4gICAgICB2YWx1ZTogUmV0cnlhYmxlRXJyb3IsXG4gICAgICB3cml0YWJsZTogZmFsc2UsXG4gICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgIGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gICAgfSk7XG4gIH1cbiAgaWYgKCFPYmplY3QuaGFzT3duKGdsb2JhbFRoaXMsIEhPT0tfQ09ORkxJQ1RfRVJST1JfS0VZKSkge1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShnbG9iYWxUaGlzLCBIT09LX0NPTkZMSUNUX0VSUk9SX0tFWSwge1xuICAgICAgdmFsdWU6IEhvb2tDb25mbGljdEVycm9yLFxuICAgICAgd3JpdGFibGU6IGZhbHNlLFxuICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICBjb25maWd1cmFibGU6IGZhbHNlLFxuICAgIH0pO1xuICB9XG59XG4iLCAiZXhwb3J0IGNvbnN0IFdPUktGTE9XX1VTRV9TVEVQID0gU3ltYm9sLmZvcignV09SS0ZMT1dfVVNFX1NURVAnKTtcbmV4cG9ydCBjb25zdCBXT1JLRkxPV19DUkVBVEVfSE9PSyA9IFN5bWJvbC5mb3IoJ1dPUktGTE9XX0NSRUFURV9IT09LJyk7XG5leHBvcnQgY29uc3QgV09SS0ZMT1dfU0xFRVAgPSBTeW1ib2wuZm9yKCdXT1JLRkxPV19TTEVFUCcpO1xuZXhwb3J0IGNvbnN0IFdPUktGTE9XX0NPTlRFWFQgPSBTeW1ib2wuZm9yKCdXT1JLRkxPV19DT05URVhUJyk7XG5leHBvcnQgY29uc3QgV09SS0ZMT1dfR0VUX1NUUkVBTV9JRCA9IFN5bWJvbC5mb3IoJ1dPUktGTE9XX0dFVF9TVFJFQU1fSUQnKTtcbmV4cG9ydCBjb25zdCBTVEFCTEVfVUxJRCA9IFN5bWJvbC5mb3IoJ1dPUktGTE9XX1NUQUJMRV9VTElEJyk7XG5leHBvcnQgY29uc3QgU1RSRUFNX05BTUVfU1lNQk9MID0gU3ltYm9sLmZvcignV09SS0ZMT1dfU1RSRUFNX05BTUUnKTtcbmV4cG9ydCBjb25zdCBTVFJFQU1fVFlQRV9TWU1CT0wgPSBTeW1ib2wuZm9yKCdXT1JLRkxPV19TVFJFQU1fVFlQRScpO1xuZXhwb3J0IGNvbnN0IFNUUkVBTV9GUkFNSU5HX1NZTUJPTCA9IFN5bWJvbC5mb3IoJ1dPUktGTE9XX1NUUkVBTV9GUkFNSU5HJyk7XG4vKipcbiAqIFN0YW1wZWQgb24gYSByZWFsIGBXcml0YWJsZVN0cmVhbWAgKHRoZSB1c2VyLXZpc2libGUgYHNlcmlhbGl6ZS53cml0YWJsZWBcbiAqIHJldHVybmVkIGZyb20gYSBzdGVwLXNpZGUgcmV2aXZlciBvciBzdGVwLWNvbnRleHQgYGdldFdyaXRhYmxlKClgKSB0b1xuICogcmVjb3JkIHRoZSBgcnVuSWRgIG9mIHRoZSB3b3JrZmxvdyBydW4gdGhhdCBvd25zIHRoZSB1bmRlcmx5aW5nIHNlcnZlclxuICogc3RyZWFtLiBVc2VkIHRvZ2V0aGVyIHdpdGggYFNUUkVBTV9OQU1FX1NZTUJPTGAuXG4gKlxuICogV2hlbiBgZ2V0RXh0ZXJuYWxSZWR1Y2Vycy5Xcml0YWJsZVN0cmVhbWAgKHRoZSBkZWh5ZHJhdGlvbiBwYXRoIHVzZWQgYnlcbiAqIGBzdGFydCgpYCkgc2VlcyBib3RoIHN5bWJvbHMgb24gYSB3cml0YWJsZSwgaXQgaW5jbHVkZXMgdGhlIGBydW5JZGAgaW5cbiAqIHRoZSBkZXNjcmlwdG9yIGl0IGVtaXRzLiBUaGUgY2hpbGQgcnVuJ3Mgc3RlcC1zaWRlIHJldml2ZXIgdGhlbiBvcGVuc1xuICogYSBzZXJ2ZXIgd3JpdGFibGUgYWdhaW5zdCB0aGUgb3JpZ2luYWwgYChydW5JZCwgbmFtZSlgIGFuZCByZXNvbHZlc1xuICogdGhhdCBydW4ncyBlbmNyeXB0aW9uIGtleSBkaXJlY3RseSDigJQgc28gdGhlIGNoaWxkJ3Mgd3JpdGVzIGxhbmQgb25cbiAqIHRoZSBwYXJlbnQncyBzdHJlYW0gYXMtaXMsIHdpdGggbm8gY2xpZW50IHByb2Nlc3MgaW4gdGhlIGxvb3AuIFRoYXRcbiAqIGtlZXBzIHRoZSBmb3J3YXJkaW5nIGFsaXZlIGZvciB0aGUgZnVsbCBsaWZldGltZSBvZiB0aGUgY2hpbGQgcnVuLFxuICogbm90IGp1c3QgZm9yIHRoZSBwYXJlbnQgc3RlcCB0aGF0IGluaXRpYXRlZCBgc3RhcnQoKWAuXG4gKi9cbmV4cG9ydCBjb25zdCBTVFJFQU1fU0VSVkVSX1JVTl9JRF9TWU1CT0wgPSBTeW1ib2wuZm9yKFxuICAnV09SS0ZMT1dfU1RSRUFNX1NFUlZFUl9SVU5fSUQnXG4pO1xuLyoqXG4gKiBTdGFtcGVkIGFsb25nc2lkZSBgU1RSRUFNX1NFUlZFUl9SVU5fSURfU1lNQk9MYCB3aGVuIHRoZSBkZXBsb3ltZW50IHRoYXRcbiAqIG93bnMgYSBmb3J3YXJkZWQgd3JpdGFibGUgc3RyZWFtIGlzIGtub3duLiBDcm9zcy1kZXBsb3ltZW50IGNvbnN1bWVycyB1c2VcbiAqIGl0IHRvIHJlc29sdmUgdGhlIG93bmluZyBydW4ncyBlbmNyeXB0aW9uIGtleSB3aXRob3V0IGxvYWRpbmcgdGhlIHJ1biBmaXJzdC5cbiAqL1xuZXhwb3J0IGNvbnN0IFNUUkVBTV9TRVJWRVJfREVQTE9ZTUVOVF9JRF9TWU1CT0wgPSBTeW1ib2wuZm9yKFxuICAnV09SS0ZMT1dfU1RSRUFNX1NFUlZFUl9ERVBMT1lNRU5UX0lEJ1xuKTtcbmV4cG9ydCBjb25zdCBCT0RZX0lOSVRfU1lNQk9MID0gU3ltYm9sLmZvcignQk9EWV9JTklUJyk7XG5leHBvcnQgY29uc3QgV0VCSE9PS19SRVNQT05TRV9XUklUQUJMRSA9IFN5bWJvbC5mb3IoXG4gICdXRUJIT09LX1JFU1BPTlNFX1dSSVRBQkxFJ1xuKTtcblxuLyoqXG4gKiBTeW1ib2wgdXNlZCB0byBzdG9yZSB0aGUgY2xhc3MgcmVnaXN0cnkgb24gZ2xvYmFsVGhpcyBpbiB3b3JrZmxvdyBtb2RlLlxuICogVGhpcyBhbGxvd3MgdGhlIGRlc2VyaWFsaXplciB0byBmaW5kIGNsYXNzZXMgYnkgY2xhc3NJZCBpbiB0aGUgVk0gY29udGV4dC5cbiAqL1xuZXhwb3J0IGNvbnN0IFdPUktGTE9XX0NMQVNTX1JFR0lTVFJZID0gU3ltYm9sLmZvcignd29ya2Zsb3ctY2xhc3MtcmVnaXN0cnknKTtcbiIsICJpbXBvcnQgdHlwZSB7IFN0cmluZ1ZhbHVlIH0gZnJvbSAnbXMnO1xuaW1wb3J0IHsgV09SS0ZMT1dfU0xFRVAgfSBmcm9tICcuL3N5bWJvbHMuanMnO1xuXG4vKipcbiAqIFNsZWVwIHdpdGhpbiBhIHdvcmtmbG93IGZvciBhIGdpdmVuIGR1cmF0aW9uLlxuICpcbiAqIFRoaXMgaXMgYSBidWlsdC1pbiBydW50aW1lIGZ1bmN0aW9uIHRoYXQgdXNlcyB0aW1lciBldmVudHMgaW4gdGhlIGV2ZW50IGxvZy5cbiAqXG4gKiBAcGFyYW0gZHVyYXRpb24gLSBUaGUgZHVyYXRpb24gdG8gc2xlZXAgZm9yLCB0aGlzIGlzIGEgc3RyaW5nIGluIHRoZSBmb3JtYXRcbiAqIG9mIGBcIjEwMDBtc1wiYCwgYFwiMXNcImAsIGBcIjFtXCJgLCBgXCIxaFwiYCwgb3IgYFwiMWRcImAuXG4gKiBAb3ZlcmxvYWRcbiAqIEByZXR1cm5zIEEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHdoZW4gdGhlIHNsZWVwIGlzIGNvbXBsZXRlLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2xlZXAoZHVyYXRpb246IFN0cmluZ1ZhbHVlKTogUHJvbWlzZTx2b2lkPjtcblxuLyoqXG4gKiBTbGVlcCB3aXRoaW4gYSB3b3JrZmxvdyB1bnRpbCBhIHNwZWNpZmljIGRhdGUuXG4gKlxuICogVGhpcyBpcyBhIGJ1aWx0LWluIHJ1bnRpbWUgZnVuY3Rpb24gdGhhdCB1c2VzIHRpbWVyIGV2ZW50cyBpbiB0aGUgZXZlbnQgbG9nLlxuICpcbiAqIEBwYXJhbSBkYXRlIC0gVGhlIGRhdGUgdG8gc2xlZXAgdW50aWwsIHRoaXMgbXVzdCBiZSBhIGZ1dHVyZSBkYXRlLlxuICogQG92ZXJsb2FkXG4gKiBAcmV0dXJucyBBIHByb21pc2UgdGhhdCByZXNvbHZlcyB3aGVuIHRoZSBzbGVlcCBpcyBjb21wbGV0ZS5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNsZWVwKGRhdGU6IERhdGUpOiBQcm9taXNlPHZvaWQ+O1xuXG4vKipcbiAqIFNsZWVwIHdpdGhpbiBhIHdvcmtmbG93IGZvciBhIGdpdmVuIGR1cmF0aW9uIGluIG1pbGxpc2Vjb25kcy5cbiAqXG4gKiBUaGlzIGlzIGEgYnVpbHQtaW4gcnVudGltZSBmdW5jdGlvbiB0aGF0IHVzZXMgdGltZXIgZXZlbnRzIGluIHRoZSBldmVudCBsb2cuXG4gKlxuICogQHBhcmFtIGR1cmF0aW9uTXMgLSBUaGUgZHVyYXRpb24gdG8gc2xlZXAgZm9yIGluIG1pbGxpc2Vjb25kcy5cbiAqIEBvdmVybG9hZFxuICogQHJldHVybnMgQSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2hlbiB0aGUgc2xlZXAgaXMgY29tcGxldGUuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzbGVlcChkdXJhdGlvbk1zOiBudW1iZXIpOiBQcm9taXNlPHZvaWQ+O1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2xlZXAocGFyYW06IFN0cmluZ1ZhbHVlIHwgRGF0ZSB8IG51bWJlcik6IFByb21pc2U8dm9pZD4ge1xuICAvLyBJbnNpZGUgdGhlIHdvcmtmbG93IFZNLCB0aGUgc2xlZXAgZnVuY3Rpb24gaXMgc3RvcmVkIGluIHRoZSBnbG9iYWxUaGlzIG9iamVjdCBiZWhpbmQgYSBzeW1ib2xcbiAgY29uc3Qgc2xlZXBGbiA9IChnbG9iYWxUaGlzIGFzIGFueSlbV09SS0ZMT1dfU0xFRVBdO1xuICBpZiAoIXNsZWVwRm4pIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2BzbGVlcCgpYCBjYW4gb25seSBiZSBjYWxsZWQgaW5zaWRlIGEgd29ya2Zsb3cgZnVuY3Rpb24nKTtcbiAgfVxuICByZXR1cm4gc2xlZXBGbihwYXJhbSk7XG59XG4iLCAiZXhwb3J0IGludGVyZmFjZSBXb3JrZmxvd01ldGFkYXRhIHtcbiAgLyoqXG4gICAqIFRoZSBuYW1lIG9mIHRoZSB3b3JrZmxvdy5cbiAgICovXG4gIHdvcmtmbG93TmFtZTogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBVbmlxdWUgaWRlbnRpZmllciBmb3IgdGhlIHdvcmtmbG93IHJ1bi5cbiAgICovXG4gIHdvcmtmbG93UnVuSWQ6IHN0cmluZztcblxuICAvKipcbiAgICogVGltZXN0YW1wIHdoZW4gdGhlIHdvcmtmbG93IHJ1biBzdGFydGVkLlxuICAgKi9cbiAgd29ya2Zsb3dTdGFydGVkQXQ6IERhdGU7XG5cbiAgLyoqXG4gICAqIFRoZSBVUkwgd2hlcmUgdGhlIHdvcmtmbG93IGNhbiBiZSB0cmlnZ2VyZWQuXG4gICAqL1xuICB1cmw6IHN0cmluZztcbn1cblxuZXhwb3J0IGNvbnN0IFdPUktGTE9XX0NPTlRFWFRfU1lNQk9MID1cbiAgLyogQF9fUFVSRV9fICovIFN5bWJvbC5mb3IoJ1dPUktGTE9XX0NPTlRFWFQnKTtcblxuZXhwb3J0IGZ1bmN0aW9uIGdldFdvcmtmbG93TWV0YWRhdGEoKTogV29ya2Zsb3dNZXRhZGF0YSB7XG4gIC8vIEluc2lkZSB0aGUgd29ya2Zsb3cgVk0sIHRoZSBjb250ZXh0IGlzIHN0b3JlZCBpbiB0aGUgZ2xvYmFsVGhpcyBvYmplY3QgYmVoaW5kIGEgc3ltYm9sXG4gIGNvbnN0IGN0eCA9IChnbG9iYWxUaGlzIGFzIGFueSlbV09SS0ZMT1dfQ09OVEVYVF9TWU1CT0xdIGFzIFdvcmtmbG93TWV0YWRhdGE7XG4gIGlmICghY3R4KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgJ2BnZXRXb3JrZmxvd01ldGFkYXRhKClgIGNhbiBvbmx5IGJlIGNhbGxlZCBpbnNpZGUgYSB3b3JrZmxvdyBvciBzdGVwIGZ1bmN0aW9uJ1xuICAgICk7XG4gIH1cbiAgcmV0dXJuIGN0eDtcbn1cbiIsICJpbXBvcnQgdHlwZSB7XG4gIEhvb2ssXG4gIEhvb2tPcHRpb25zLFxuICBSZXF1ZXN0V2l0aFJlc3BvbnNlLFxuICBXZWJob29rLFxuICBXZWJob29rT3B0aW9ucyxcbn0gZnJvbSAnLi4vY3JlYXRlLWhvb2suanMnO1xuaW1wb3J0IHsgV09SS0ZMT1dfQ1JFQVRFX0hPT0sgfSBmcm9tICcuLi9zeW1ib2xzLmpzJztcbmltcG9ydCB7IGdldFdvcmtmbG93TWV0YWRhdGEgfSBmcm9tICcuL2dldC13b3JrZmxvdy1tZXRhZGF0YS5qcyc7XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVIb29rPFQgPSBhbnk+KG9wdGlvbnM/OiBIb29rT3B0aW9ucyk6IEhvb2s8VD4ge1xuICAvLyBJbnNpZGUgdGhlIHdvcmtmbG93IFZNLCB0aGUgaG9vayBmdW5jdGlvbiBpcyBzdG9yZWQgaW4gdGhlIGdsb2JhbFRoaXMgb2JqZWN0IGJlaGluZCBhIHN5bWJvbFxuICBjb25zdCBjcmVhdGVIb29rRm4gPSAoZ2xvYmFsVGhpcyBhcyBhbnkpW1xuICAgIFdPUktGTE9XX0NSRUFURV9IT09LXG4gIF0gYXMgdHlwZW9mIGNyZWF0ZUhvb2s8VD47XG4gIGlmICghY3JlYXRlSG9va0ZuKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgJ2BjcmVhdGVIb29rKClgIGNhbiBvbmx5IGJlIGNhbGxlZCBpbnNpZGUgYSB3b3JrZmxvdyBmdW5jdGlvbidcbiAgICApO1xuICB9XG4gIHJldHVybiBjcmVhdGVIb29rRm4ob3B0aW9ucyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVXZWJob29rKFxuICBvcHRpb25zOiBXZWJob29rT3B0aW9ucyAmIHsgcmVzcG9uZFdpdGg6ICdtYW51YWwnIH1cbik6IFdlYmhvb2s8UmVxdWVzdFdpdGhSZXNwb25zZT47XG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlV2ViaG9vayhvcHRpb25zPzogV2ViaG9va09wdGlvbnMpOiBXZWJob29rPFJlcXVlc3Q+O1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVdlYmhvb2soXG4gIG9wdGlvbnM/OiBXZWJob29rT3B0aW9uc1xuKTogV2ViaG9vazxSZXF1ZXN0PiB8IFdlYmhvb2s8UmVxdWVzdFdpdGhSZXNwb25zZT4ge1xuICBjb25zdCB7IHJlc3BvbmRXaXRoLCB0b2tlbiwgLi4ucmVzdCB9ID0gKG9wdGlvbnMgPz8ge30pIGFzIFdlYmhvb2tPcHRpb25zICYge1xuICAgIHRva2VuPzogc3RyaW5nO1xuICB9O1xuXG4gIGlmICh0b2tlbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgJ2BjcmVhdGVXZWJob29rKClgIGRvZXMgbm90IGFjY2VwdCBhIGB0b2tlbmAgb3B0aW9uLiBXZWJob29rIHRva2VucyBhcmUgYWx3YXlzIHJhbmRvbWx5IGdlbmVyYXRlZC4gVXNlIGBjcmVhdGVIb29rKClgIHdpdGggYHJlc3VtZUhvb2soKWAgZm9yIGRldGVybWluaXN0aWMgdG9rZW4gcGF0dGVybnMuJ1xuICAgICk7XG4gIH1cblxuICBsZXQgbWV0YWRhdGE6IFBpY2s8V2ViaG9va09wdGlvbnMsICdyZXNwb25kV2l0aCc+IHwgdW5kZWZpbmVkO1xuICBpZiAodHlwZW9mIHJlc3BvbmRXaXRoICE9PSAndW5kZWZpbmVkJykge1xuICAgIG1ldGFkYXRhID0geyByZXNwb25kV2l0aCB9O1xuICB9XG5cbiAgY29uc3QgaG9vayA9IGNyZWF0ZUhvb2soeyAuLi5yZXN0LCBtZXRhZGF0YSwgaXNXZWJob29rOiB0cnVlIH0pIGFzXG4gICAgfCBXZWJob29rPFJlcXVlc3Q+XG4gICAgfCBXZWJob29rPFJlcXVlc3RXaXRoUmVzcG9uc2U+O1xuXG4gIGNvbnN0IHsgdXJsIH0gPSBnZXRXb3JrZmxvd01ldGFkYXRhKCk7XG4gIGhvb2sudXJsID0gYCR7dXJsfS8ud2VsbC1rbm93bi93b3JrZmxvdy92MS93ZWJob29rLyR7ZW5jb2RlVVJJQ29tcG9uZW50KGhvb2sudG9rZW4pfWA7XG5cbiAgcmV0dXJuIGhvb2s7XG59XG4iLCAiLyoqXG4gKiBUaGlzIGlzIHRoZSBcInN0YW5kYXJkIGxpYnJhcnlcIiBvZiBzdGVwcyB0aGF0IHdlIG1ha2UgYXZhaWxhYmxlIHRvIGFsbCB3b3JrZmxvdyB1c2Vycy5cbiAqIFRoZSBjYW4gYmUgaW1wb3J0ZWQgbGlrZSBzbzogYGltcG9ydCB7IGZldGNoIH0gZnJvbSAnd29ya2Zsb3cnYC4gYW5kIHVzZWQgaW4gd29ya2Zsb3cuXG4gKiBUaGUgbmVlZCB0byBiZSBleHBvcnRlZCBkaXJlY3RseSBpbiB0aGlzIHBhY2thZ2UgYW5kIGNhbm5vdCBsaXZlIGluIGBjb3JlYCB0byBwcmV2ZW50XG4gKiBjaXJjdWxhciBkZXBlbmRlbmNpZXMgcG9zdC1jb21waWxhdGlvbi5cbiAqL1xuXG4vKipcbiAqIEEgaG9pc3RlZCBgZmV0Y2goKWAgZnVuY3Rpb24gdGhhdCBpcyBleGVjdXRlZCBhcyBhIFwic3RlcFwiIGZ1bmN0aW9uLFxuICogZm9yIHVzZSB3aXRoaW4gd29ya2Zsb3cgZnVuY3Rpb25zLlxuICpcbiAqIEBzZWUgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL0ZldGNoX0FQSVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZmV0Y2goLi4uYXJnczogUGFyYW1ldGVyczx0eXBlb2YgZ2xvYmFsVGhpcy5mZXRjaD4pIHtcbiAgJ3VzZSBzdGVwJztcbiAgcmV0dXJuIGdsb2JhbFRoaXMuZmV0Y2goLi4uYXJncyk7XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBFeHByZXNzaW9uIH0gZnJvbSBcIi4vYXN0LmpzXCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgRXZhbHVhdGlvbkNvbnRleHQge1xuICByZWFkb25seSBpbnB1dDogdW5rbm93bjtcbiAgcmVhZG9ubHkgbm9kZU91dHB1dHM6IFJlYWRvbmx5PFJlY29yZDxzdHJpbmcsIHVua25vd24+Pjtcbn1cblxuZXhwb3J0IGNsYXNzIEV4cHJlc3Npb25FdmFsdWF0aW9uRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIG1lc3NhZ2U6IHN0cmluZyxcbiAgICByZWFkb25seSBleHByZXNzaW9uOiBFeHByZXNzaW9uLFxuICApIHtcbiAgICBzdXBlcihtZXNzYWdlKTtcbiAgICB0aGlzLm5hbWUgPSBcIkV4cHJlc3Npb25FdmFsdWF0aW9uRXJyb3JcIjtcbiAgfVxufVxuXG4vKipcbiAqIERldGVybWluaXN0aWMsIHRvdGFsLWJ5LWNvbnN0cnVjdGlvbiBldmFsdWF0b3IuIE1pc3NpbmcgcGF0aHMgcmFpc2UgYSB0eXBlZFxuICogRXhwcmVzc2lvbkV2YWx1YXRpb25FcnJvciAobmV2ZXIgYSBzaWxlbnQgYHVuZGVmaW5lZGApIHNvIGNvbXBpbGUtdGltZVxuICogZmlkZWxpdHkgZ2FwcyBjYW4ndCBsZWFrIGludG8gcnVudGltZSBhcyBlbXB0eSBzdHJpbmdzIG9yIG5vLW9wcy5cbiAqIFB1cmUgZGF0YS1pbi9kYXRhLW91dCBcdTIwMTQgdGhlcmUgaXMgbm8gY29kZS1leGVjdXRpb24gcGF0aCBoZXJlIGJ5IGRlc2lnbi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGV2YWx1YXRlRXhwcmVzc2lvbihleHByZXNzaW9uOiBFeHByZXNzaW9uLCBjb250ZXh0OiBFdmFsdWF0aW9uQ29udGV4dCk6IHVua25vd24ge1xuICBzd2l0Y2ggKGV4cHJlc3Npb24ua2luZCkge1xuICAgIGNhc2UgXCJsaXRlcmFsXCI6XG4gICAgICByZXR1cm4gZXhwcmVzc2lvbi52YWx1ZTtcbiAgICBjYXNlIFwiaW5wdXRcIjpcbiAgICAgIHJldHVybiByZXNvbHZlUGF0aChjb250ZXh0LmlucHV0LCBleHByZXNzaW9uLnBhdGgsIGV4cHJlc3Npb24sIFwiaW5wdXRcIik7XG4gICAgY2FzZSBcIm5vZGVPdXRwdXRcIjoge1xuICAgICAgaWYgKCEoZXhwcmVzc2lvbi5ub2RlSWQgaW4gY29udGV4dC5ub2RlT3V0cHV0cykpIHtcbiAgICAgICAgdGhyb3cgbmV3IEV4cHJlc3Npb25FdmFsdWF0aW9uRXJyb3IoXG4gICAgICAgICAgYE5vIG91dHB1dCByZWNvcmRlZCBmb3Igbm9kZSBcIiR7ZXhwcmVzc2lvbi5ub2RlSWR9XCIuYCxcbiAgICAgICAgICBleHByZXNzaW9uLFxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc29sdmVQYXRoKFxuICAgICAgICBjb250ZXh0Lm5vZGVPdXRwdXRzW2V4cHJlc3Npb24ubm9kZUlkXSxcbiAgICAgICAgZXhwcmVzc2lvbi5wYXRoLFxuICAgICAgICBleHByZXNzaW9uLFxuICAgICAgICBgbm9kZU91dHB1dCgke2V4cHJlc3Npb24ubm9kZUlkfSlgLFxuICAgICAgKTtcbiAgICB9XG4gICAgY2FzZSBcImludGVycG9sYXRlXCI6XG4gICAgICByZXR1cm4gZXhwcmVzc2lvbi5wYXJ0c1xuICAgICAgICAubWFwKChwYXJ0KSA9PiBzdHJpbmdpZnkoZXZhbHVhdGVFeHByZXNzaW9uKHBhcnQsIGNvbnRleHQpKSlcbiAgICAgICAgLmpvaW4oXCJcIik7XG4gICAgY2FzZSBcImNvbXBhcmVcIjoge1xuICAgICAgY29uc3QgbGVmdCA9IGV2YWx1YXRlRXhwcmVzc2lvbihleHByZXNzaW9uLmxlZnQsIGNvbnRleHQpO1xuICAgICAgY29uc3QgcmlnaHQgPSBldmFsdWF0ZUV4cHJlc3Npb24oZXhwcmVzc2lvbi5yaWdodCwgY29udGV4dCk7XG4gICAgICByZXR1cm4gY29tcGFyZShleHByZXNzaW9uLm9wZXJhdG9yLCBsZWZ0LCByaWdodCwgZXhwcmVzc2lvbik7XG4gICAgfVxuICAgIGNhc2UgXCJib29sZWFuXCI6IHtcbiAgICAgIGNvbnN0IHZhbHVlcyA9IGV4cHJlc3Npb24ub3BlcmFuZHMubWFwKChvcGVyYW5kKSA9PlxuICAgICAgICB0b0Jvb2xlYW4oZXZhbHVhdGVFeHByZXNzaW9uKG9wZXJhbmQsIGNvbnRleHQpLCBleHByZXNzaW9uKSxcbiAgICAgICk7XG4gICAgICBzd2l0Y2ggKGV4cHJlc3Npb24ub3BlcmF0b3IpIHtcbiAgICAgICAgY2FzZSBcImFuZFwiOlxuICAgICAgICAgIHJldHVybiB2YWx1ZXMuZXZlcnkoQm9vbGVhbik7XG4gICAgICAgIGNhc2UgXCJvclwiOlxuICAgICAgICAgIHJldHVybiB2YWx1ZXMuc29tZShCb29sZWFuKTtcbiAgICAgICAgY2FzZSBcIm5vdFwiOiB7XG4gICAgICAgICAgaWYgKHZhbHVlcy5sZW5ndGggIT09IDEpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFeHByZXNzaW9uRXZhbHVhdGlvbkVycm9yKFwibm90IHRha2VzIGV4YWN0bHkgb25lIG9wZXJhbmQuXCIsIGV4cHJlc3Npb24pO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gIXZhbHVlc1swXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgfVxuICAgIGNhc2UgXCJvYmplY3RcIjoge1xuICAgICAgY29uc3QgcmVzdWx0OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiA9IHt9O1xuICAgICAgZm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXMoZXhwcmVzc2lvbi5lbnRyaWVzKSkge1xuICAgICAgICByZXN1bHRba2V5XSA9IGV2YWx1YXRlRXhwcmVzc2lvbih2YWx1ZSwgY29udGV4dCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbiAgICBjYXNlIFwiYXJyYXlcIjpcbiAgICAgIHJldHVybiBleHByZXNzaW9uLml0ZW1zLm1hcCgoaXRlbSkgPT4gZXZhbHVhdGVFeHByZXNzaW9uKGl0ZW0sIGNvbnRleHQpKTtcbiAgfVxufVxuXG5mdW5jdGlvbiByZXNvbHZlUGF0aChcbiAgcm9vdDogdW5rbm93bixcbiAgcGF0aDogcmVhZG9ubHkgc3RyaW5nW10sXG4gIGV4cHJlc3Npb246IEV4cHJlc3Npb24sXG4gIGxhYmVsOiBzdHJpbmcsXG4pOiB1bmtub3duIHtcbiAgbGV0IGN1cnJlbnQ6IHVua25vd24gPSByb290O1xuICBmb3IgKGNvbnN0IHNlZ21lbnQgb2YgcGF0aCkge1xuICAgIGlmIChBcnJheS5pc0FycmF5KGN1cnJlbnQpICYmIC9eXFxkKyQvLnRlc3Qoc2VnbWVudCkpIHtcbiAgICAgIGN1cnJlbnQgPSBjdXJyZW50W051bWJlcihzZWdtZW50KV07XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgaWYgKGN1cnJlbnQgIT09IG51bGwgJiYgdHlwZW9mIGN1cnJlbnQgPT09IFwib2JqZWN0XCIgJiYgc2VnbWVudCBpbiAoY3VycmVudCBhcyBvYmplY3QpKSB7XG4gICAgICBjdXJyZW50ID0gKGN1cnJlbnQgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4pW3NlZ21lbnRdO1xuICAgICAgY29udGludWU7XG4gICAgfVxuICAgIHRocm93IG5ldyBFeHByZXNzaW9uRXZhbHVhdGlvbkVycm9yKFxuICAgICAgYFBhdGggJHtsYWJlbH0uJHtwYXRoLmpvaW4oXCIuXCIpfSBpcyBtaXNzaW5nIGF0IHNlZ21lbnQgXCIke3NlZ21lbnR9XCIuYCxcbiAgICAgIGV4cHJlc3Npb24sXG4gICAgKTtcbiAgfVxuICByZXR1cm4gY3VycmVudDtcbn1cblxuZnVuY3Rpb24gY29tcGFyZShcbiAgb3BlcmF0b3I6IFwiZXFcIiB8IFwibmVcIiB8IFwibHRcIiB8IFwibGVcIiB8IFwiZ3RcIiB8IFwiZ2VcIixcbiAgbGVmdDogdW5rbm93bixcbiAgcmlnaHQ6IHVua25vd24sXG4gIGV4cHJlc3Npb246IEV4cHJlc3Npb24sXG4pOiBib29sZWFuIHtcbiAgaWYgKG9wZXJhdG9yID09PSBcImVxXCIpIHJldHVybiBkZWVwRXF1YWxzKGxlZnQsIHJpZ2h0KTtcbiAgaWYgKG9wZXJhdG9yID09PSBcIm5lXCIpIHJldHVybiAhZGVlcEVxdWFscyhsZWZ0LCByaWdodCk7XG4gIGlmICh0eXBlb2YgbGVmdCA9PT0gXCJudW1iZXJcIiAmJiB0eXBlb2YgcmlnaHQgPT09IFwibnVtYmVyXCIpIHtcbiAgICBzd2l0Y2ggKG9wZXJhdG9yKSB7XG4gICAgICBjYXNlIFwibHRcIjpcbiAgICAgICAgcmV0dXJuIGxlZnQgPCByaWdodDtcbiAgICAgIGNhc2UgXCJsZVwiOlxuICAgICAgICByZXR1cm4gbGVmdCA8PSByaWdodDtcbiAgICAgIGNhc2UgXCJndFwiOlxuICAgICAgICByZXR1cm4gbGVmdCA+IHJpZ2h0O1xuICAgICAgY2FzZSBcImdlXCI6XG4gICAgICAgIHJldHVybiBsZWZ0ID49IHJpZ2h0O1xuICAgIH1cbiAgfVxuICBpZiAodHlwZW9mIGxlZnQgPT09IFwic3RyaW5nXCIgJiYgdHlwZW9mIHJpZ2h0ID09PSBcInN0cmluZ1wiKSB7XG4gICAgY29uc3Qgb3JkZXIgPSBsZWZ0IDwgcmlnaHQgPyAtMSA6IGxlZnQgPiByaWdodCA/IDEgOiAwO1xuICAgIHN3aXRjaCAob3BlcmF0b3IpIHtcbiAgICAgIGNhc2UgXCJsdFwiOlxuICAgICAgICByZXR1cm4gb3JkZXIgPCAwO1xuICAgICAgY2FzZSBcImxlXCI6XG4gICAgICAgIHJldHVybiBvcmRlciA8PSAwO1xuICAgICAgY2FzZSBcImd0XCI6XG4gICAgICAgIHJldHVybiBvcmRlciA+IDA7XG4gICAgICBjYXNlIFwiZ2VcIjpcbiAgICAgICAgcmV0dXJuIG9yZGVyID49IDA7XG4gICAgfVxuICB9XG4gIHRocm93IG5ldyBFeHByZXNzaW9uRXZhbHVhdGlvbkVycm9yKFxuICAgIGBPcmRlcmVkIGNvbXBhcmlzb24gXCIke29wZXJhdG9yfVwiIHJlcXVpcmVzIHR3byBudW1iZXJzIG9yIHR3byBzdHJpbmdzLmAsXG4gICAgZXhwcmVzc2lvbixcbiAgKTtcbn1cblxuZnVuY3Rpb24gZGVlcEVxdWFscyhsZWZ0OiB1bmtub3duLCByaWdodDogdW5rbm93bik6IGJvb2xlYW4ge1xuICBpZiAoT2JqZWN0LmlzKGxlZnQsIHJpZ2h0KSkgcmV0dXJuIHRydWU7XG4gIGlmICh0eXBlb2YgbGVmdCAhPT0gdHlwZW9mIHJpZ2h0IHx8IGxlZnQgPT09IG51bGwgfHwgcmlnaHQgPT09IG51bGwpIHJldHVybiBmYWxzZTtcbiAgaWYgKHR5cGVvZiBsZWZ0ICE9PSBcIm9iamVjdFwiKSByZXR1cm4gZmFsc2U7XG4gIHJldHVybiBKU09OLnN0cmluZ2lmeShzb3J0S2V5cyhsZWZ0KSkgPT09IEpTT04uc3RyaW5naWZ5KHNvcnRLZXlzKHJpZ2h0KSk7XG59XG5cbmZ1bmN0aW9uIHNvcnRLZXlzKHZhbHVlOiB1bmtub3duKTogdW5rbm93biB7XG4gIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkgcmV0dXJuIHZhbHVlLm1hcChzb3J0S2V5cyk7XG4gIGlmICh2YWx1ZSAhPT0gbnVsbCAmJiB0eXBlb2YgdmFsdWUgPT09IFwib2JqZWN0XCIpIHtcbiAgICByZXR1cm4gT2JqZWN0LmZyb21FbnRyaWVzKFxuICAgICAgT2JqZWN0LmVudHJpZXModmFsdWUgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4pXG4gICAgICAgIC5zb3J0KChbYV0sIFtiXSkgPT4gKGEgPCBiID8gLTEgOiBhID4gYiA/IDEgOiAwKSlcbiAgICAgICAgLm1hcCgoW2tleSwgZW50cnldKSA9PiBba2V5LCBzb3J0S2V5cyhlbnRyeSldKSxcbiAgICApO1xuICB9XG4gIHJldHVybiB2YWx1ZTtcbn1cblxuZnVuY3Rpb24gdG9Cb29sZWFuKHZhbHVlOiB1bmtub3duLCBleHByZXNzaW9uOiBFeHByZXNzaW9uKTogYm9vbGVhbiB7XG4gIGlmICh0eXBlb2YgdmFsdWUgPT09IFwiYm9vbGVhblwiKSByZXR1cm4gdmFsdWU7XG4gIHRocm93IG5ldyBFeHByZXNzaW9uRXZhbHVhdGlvbkVycm9yKFwiQm9vbGVhbiBvcGVyYXRvcnMgcmVxdWlyZSBib29sZWFuIG9wZXJhbmRzLlwiLCBleHByZXNzaW9uKTtcbn1cblxuZnVuY3Rpb24gc3RyaW5naWZ5KHZhbHVlOiB1bmtub3duKTogc3RyaW5nIHtcbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJzdHJpbmdcIikgcmV0dXJuIHZhbHVlO1xuICBpZiAodmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgIHRocm93IG5ldyBFeHByZXNzaW9uRXZhbHVhdGlvbkVycm9yKFwiQ2Fubm90IGludGVycG9sYXRlIG51bGwvdW5kZWZpbmVkLlwiLCBsaXRlcmFsT2YodmFsdWUpKTtcbiAgfVxuICBpZiAodHlwZW9mIHZhbHVlID09PSBcIm51bWJlclwiIHx8IHR5cGVvZiB2YWx1ZSA9PT0gXCJib29sZWFuXCIpIHJldHVybiBTdHJpbmcodmFsdWUpO1xuICByZXR1cm4gSlNPTi5zdHJpbmdpZnkodmFsdWUpO1xufVxuXG5mdW5jdGlvbiBsaXRlcmFsT2YodmFsdWU6IHVua25vd24pOiBFeHByZXNzaW9uIHtcbiAgcmV0dXJuIHsga2luZDogXCJsaXRlcmFsXCIsIHZhbHVlIH07XG59XG4iLCAiLyoqX19pbnRlcm5hbF93b3JrZmxvd3N7XCJzdGVwc1wiOntcInN0ZXBzL2V4ZWN1dG9ycy50c1wiOntcImNvbXB1dGVBY3Rpb25EaWdlc3RcIjp7XCJzdGVwSWRcIjpcInN0ZXAvLy4vc3RlcHMvZXhlY3V0b3JzLy9jb21wdXRlQWN0aW9uRGlnZXN0XCJ9LFwiZGlzcGF0Y2hDYXBhYmlsaXR5XCI6e1wic3RlcElkXCI6XCJzdGVwLy8uL3N0ZXBzL2V4ZWN1dG9ycy8vZGlzcGF0Y2hDYXBhYmlsaXR5XCJ9LFwiZXZhbHVhdGVSdW50aW1lUG9saWN5XCI6e1wic3RlcElkXCI6XCJzdGVwLy8uL3N0ZXBzL2V4ZWN1dG9ycy8vZXZhbHVhdGVSdW50aW1lUG9saWN5XCJ9LFwicmVhZEFydGlmYWN0XCI6e1wic3RlcElkXCI6XCJzdGVwLy8uL3N0ZXBzL2V4ZWN1dG9ycy8vcmVhZEFydGlmYWN0XCJ9LFwicmVjb3JkQXVkaXRFdmVudFwiOntcInN0ZXBJZFwiOlwic3RlcC8vLi9zdGVwcy9leGVjdXRvcnMvL3JlY29yZEF1ZGl0RXZlbnRcIn0sXCJ3cml0ZUFydGlmYWN0XCI6e1wic3RlcElkXCI6XCJzdGVwLy8uL3N0ZXBzL2V4ZWN1dG9ycy8vd3JpdGVBcnRpZmFjdFwifX19fSovO1xuZXhwb3J0IHZhciBjb21wdXRlQWN0aW9uRGlnZXN0ID0gZ2xvYmFsVGhpc1tTeW1ib2wuZm9yKFwiV09SS0ZMT1dfVVNFX1NURVBcIildKFwic3RlcC8vLi9zdGVwcy9leGVjdXRvcnMvL2NvbXB1dGVBY3Rpb25EaWdlc3RcIik7XG5jb21wdXRlQWN0aW9uRGlnZXN0Lm1heFJldHJpZXMgPSAzO1xuZXhwb3J0IHZhciByZWNvcmRBdWRpdEV2ZW50ID0gZ2xvYmFsVGhpc1tTeW1ib2wuZm9yKFwiV09SS0ZMT1dfVVNFX1NURVBcIildKFwic3RlcC8vLi9zdGVwcy9leGVjdXRvcnMvL3JlY29yZEF1ZGl0RXZlbnRcIik7XG5yZWNvcmRBdWRpdEV2ZW50Lm1heFJldHJpZXMgPSAzO1xuZXhwb3J0IHZhciBldmFsdWF0ZVJ1bnRpbWVQb2xpY3kgPSBnbG9iYWxUaGlzW1N5bWJvbC5mb3IoXCJXT1JLRkxPV19VU0VfU1RFUFwiKV0oXCJzdGVwLy8uL3N0ZXBzL2V4ZWN1dG9ycy8vZXZhbHVhdGVSdW50aW1lUG9saWN5XCIpO1xuZXZhbHVhdGVSdW50aW1lUG9saWN5Lm1heFJldHJpZXMgPSAzO1xuZXhwb3J0IHZhciByZWFkQXJ0aWZhY3QgPSBnbG9iYWxUaGlzW1N5bWJvbC5mb3IoXCJXT1JLRkxPV19VU0VfU1RFUFwiKV0oXCJzdGVwLy8uL3N0ZXBzL2V4ZWN1dG9ycy8vcmVhZEFydGlmYWN0XCIpO1xucmVhZEFydGlmYWN0Lm1heFJldHJpZXMgPSAzO1xuZXhwb3J0IHZhciB3cml0ZUFydGlmYWN0ID0gZ2xvYmFsVGhpc1tTeW1ib2wuZm9yKFwiV09SS0ZMT1dfVVNFX1NURVBcIildKFwic3RlcC8vLi9zdGVwcy9leGVjdXRvcnMvL3dyaXRlQXJ0aWZhY3RcIik7XG53cml0ZUFydGlmYWN0Lm1heFJldHJpZXMgPSAzO1xuLyoqXG4gKiBUaGUgc2luZ2xlIG1lZGlhdGVkIGRpc3BhdGNoIHBhdGggZm9yIGV2ZXJ5IGNhcGFiaWxpdHkgZWZmZWN0LlxuICogbWF4UmV0cmllcyA9IDA6IHRoZSBpbnRlcnByZXRlciBvd25zIHJldHJpZXMgcGVyIHRoZSBub2RlJ3MgUmV0cnlQb2xpY3ksXG4gKiBzbyByZXRyeSBjb3VudGluZyBzdGF5cyBkZXRlcm1pbmlzdGljIGFuZCBpZGVtcG90ZW5jeS1hd2FyZS5cbiAqLyBleHBvcnQgdmFyIGRpc3BhdGNoQ2FwYWJpbGl0eSA9IGdsb2JhbFRoaXNbU3ltYm9sLmZvcihcIldPUktGTE9XX1VTRV9TVEVQXCIpXShcInN0ZXAvLy4vc3RlcHMvZXhlY3V0b3JzLy9kaXNwYXRjaENhcGFiaWxpdHlcIik7XG5kaXNwYXRjaENhcGFiaWxpdHkubWF4UmV0cmllcyA9IDA7XG4iLCAiLyoqX19pbnRlcm5hbF93b3JrZmxvd3N7XCJzdGVwc1wiOntcInN0ZXBzL2FnZW50LnRzXCI6e1wiYWdlbnRBcHBlbmRUb29sUmVzdWx0XCI6e1wic3RlcElkXCI6XCJzdGVwLy8uL3N0ZXBzL2FnZW50Ly9hZ2VudEFwcGVuZFRvb2xSZXN1bHRcIn0sXCJhZ2VudENyZWF0ZVNlc3Npb25cIjp7XCJzdGVwSWRcIjpcInN0ZXAvLy4vc3RlcHMvYWdlbnQvL2FnZW50Q3JlYXRlU2Vzc2lvblwifSxcImFnZW50TmV4dFR1cm5cIjp7XCJzdGVwSWRcIjpcInN0ZXAvLy4vc3RlcHMvYWdlbnQvL2FnZW50TmV4dFR1cm5cIn0sXCJjb21waWxlU3VicGxhblByb3Bvc2FsXCI6e1wic3RlcElkXCI6XCJzdGVwLy8uL3N0ZXBzL2FnZW50Ly9jb21waWxlU3VicGxhblByb3Bvc2FsXCJ9fX19Ki87XG5leHBvcnQgdmFyIGFnZW50Q3JlYXRlU2Vzc2lvbiA9IGdsb2JhbFRoaXNbU3ltYm9sLmZvcihcIldPUktGTE9XX1VTRV9TVEVQXCIpXShcInN0ZXAvLy4vc3RlcHMvYWdlbnQvL2FnZW50Q3JlYXRlU2Vzc2lvblwiKTtcbmFnZW50Q3JlYXRlU2Vzc2lvbi5tYXhSZXRyaWVzID0gMztcbmV4cG9ydCB2YXIgYWdlbnROZXh0VHVybiA9IGdsb2JhbFRoaXNbU3ltYm9sLmZvcihcIldPUktGTE9XX1VTRV9TVEVQXCIpXShcInN0ZXAvLy4vc3RlcHMvYWdlbnQvL2FnZW50TmV4dFR1cm5cIik7XG5hZ2VudE5leHRUdXJuLm1heFJldHJpZXMgPSAzO1xuZXhwb3J0IHZhciBhZ2VudEFwcGVuZFRvb2xSZXN1bHQgPSBnbG9iYWxUaGlzW1N5bWJvbC5mb3IoXCJXT1JLRkxPV19VU0VfU1RFUFwiKV0oXCJzdGVwLy8uL3N0ZXBzL2FnZW50Ly9hZ2VudEFwcGVuZFRvb2xSZXN1bHRcIik7XG5hZ2VudEFwcGVuZFRvb2xSZXN1bHQubWF4UmV0cmllcyA9IDM7XG4vKipcbiAqIEJvdW5kZWQgZHluYW1pYyBzdWJwbGFuczogYW4gYWdlbnQgbWF5IFBST1BPU0UgYSBzdWJwbGFuIGluIGEgc3VwcG9ydGVkXG4gKiBzb3VyY2UgZm9ybWF0OyBpdCBuZXZlciBtdXRhdGVzIHRoZSBleGVjdXRpbmcgZ3JhcGguIFRoZSBwcm9wb3NhbCBnb2VzXG4gKiB0aHJvdWdoIHRoZSBmdWxsIHBpcGVsaW5lIFx1MjAxNCB2YWxpZGF0ZSBcdTIxOTIgY29tcGlsZSBcdTIxOTIgc3RydWN0dXJhbCBjaGVja3MgXHUyMTkyXG4gKiBkaWdlc3QgXHUyMDE0IGFuZCB0aGUgY2hpbGQgZXhlY3V0ZXMgdW5kZXIgdGhlIHBhcmVudCdzIGluc3RhbGxhdGlvbiBwb2xpY3lcbiAqIHdpdGggc3RyaWN0bHkgc21hbGxlciBidWRnZXRzLlxuICovIGV4cG9ydCB2YXIgY29tcGlsZVN1YnBsYW5Qcm9wb3NhbCA9IGdsb2JhbFRoaXNbU3ltYm9sLmZvcihcIldPUktGTE9XX1VTRV9TVEVQXCIpXShcInN0ZXAvLy4vc3RlcHMvYWdlbnQvL2NvbXBpbGVTdWJwbGFuUHJvcG9zYWxcIik7XG5jb21waWxlU3VicGxhblByb3Bvc2FsLm1heFJldHJpZXMgPSAwO1xuIiwgImltcG9ydCB7IEZhdGFsRXJyb3IsIGNyZWF0ZUhvb2ssIGdldFdvcmtmbG93TWV0YWRhdGEsIHNsZWVwIH0gZnJvbSBcIndvcmtmbG93XCI7XG5pbXBvcnQgeyBldmFsdWF0ZUV4cHJlc3Npb24gfSBmcm9tIFwiQHF1aWNrZGVwbG95YWkvd29ya2Zsb3ctZXhwcmVzc2lvbnNcIjtcbmltcG9ydCB7IGNvbXB1dGVBY3Rpb25EaWdlc3QsIGRpc3BhdGNoQ2FwYWJpbGl0eSwgZXZhbHVhdGVSdW50aW1lUG9saWN5LCByZWNvcmRBdWRpdEV2ZW50IH0gZnJvbSBcIi4uL3N0ZXBzL2V4ZWN1dG9ycy5qc1wiO1xuaW1wb3J0IHsgYWdlbnRBcHBlbmRUb29sUmVzdWx0LCBhZ2VudENyZWF0ZVNlc3Npb24sIGFnZW50TmV4dFR1cm4sIGNvbXBpbGVTdWJwbGFuUHJvcG9zYWwgfSBmcm9tIFwiLi4vc3RlcHMvYWdlbnQuanNcIjtcbi8qKl9faW50ZXJuYWxfd29ya2Zsb3dze1wid29ya2Zsb3dzXCI6e1wid29ya2Zsb3dzL3J1bi1leGVjdXRpb24tcGxhbi50c1wiOntcInJ1bkV4ZWN1dGlvblBsYW5cIjp7XCJ3b3JrZmxvd0lkXCI6XCJ3b3JrZmxvdy8vLi93b3JrZmxvd3MvcnVuLWV4ZWN1dGlvbi1wbGFuLy9ydW5FeGVjdXRpb25QbGFuXCJ9fX19Ki87XG5jbGFzcyBQbGFuRmFpbHVyZSBleHRlbmRzIEVycm9yIHtcbiAgICBjb2RlO1xuICAgIGNvbnN0cnVjdG9yKGNvZGUsIG1lc3NhZ2Upe1xuICAgICAgICBzdXBlcihtZXNzYWdlKSwgdGhpcy5jb2RlID0gY29kZTtcbiAgICAgICAgdGhpcy5uYW1lID0gXCJQbGFuRmFpbHVyZVwiO1xuICAgIH1cbn1cbi8qKlxuICogVGhlIGdlbmVyaWMsIHByZWNvbXBpbGVkIHBsYW4gaW50ZXJwcmV0ZXI6IE9ORSBzdGF0aWNhbGx5LWNvbXBpbGVkXG4gKiB3b3JrZmxvdyBmdW5jdGlvbiB0aGF0IGludGVycHJldHMgYW55IGltbXV0YWJsZSBFeGVjdXRpb25QbGFuVjEuXG4gKiBDb250cm9sIGZsb3cgcnVucyBpbiB0aGUgZGV0ZXJtaW5pc3RpYyB3b3JrZmxvdyBzYW5kYm94OyBldmVyeSBlZmZlY3RcbiAqIGRpc3BhdGNoZXMgdGhyb3VnaCB0aGUgY2xvc2VkIHN0YXRpYyBleGVjdXRvciBzdXJmYWNlOyBhcHByb3ZhbHMgYW5kXG4gKiBzaWduYWxzIHN1c3BlbmQgb24gcmVhbCBXb3JrZmxvdyBTREsgaG9va3M7IHBhcmFsbGVsIGJyYW5jaGVzIGFuZCBjaGlsZFxuICogcGxhbnMgdXNlIHJlYWwgU0RLIGNvbmN1cnJlbmN5LlxuICovIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBydW5FeGVjdXRpb25QbGFuKHJlcXVlc3QpIHtcbiAgICBjb25zdCBtZXRhZGF0YSA9IGdldFdvcmtmbG93TWV0YWRhdGEoKTtcbiAgICBjb25zdCBydW5JZCA9IG1ldGFkYXRhLndvcmtmbG93UnVuSWQ7XG4gICAgaWYgKHJlcXVlc3QuYmluZGluZ3MucGxhbkRpZ2VzdCAhPT0gcmVxdWVzdC5wbGFuRGlnZXN0KSB7XG4gICAgICAgIHRocm93IG5ldyBGYXRhbEVycm9yKGBCaW5kaW5nIGxvY2sgdGFyZ2V0cyAke3JlcXVlc3QuYmluZGluZ3MucGxhbkRpZ2VzdH0sIG5vdCBwbGFuICR7cmVxdWVzdC5wbGFuRGlnZXN0fS5gKTtcbiAgICB9XG4gICAgY29uc3Qgc3RhdGUgPSB7XG4gICAgICAgIHJ1bklkLFxuICAgICAgICBwbGFuRGlnZXN0OiByZXF1ZXN0LnBsYW5EaWdlc3QsXG4gICAgICAgIHBvbGljeURpZ2VzdDogcmVxdWVzdC5wbGFuRGlnZXN0LFxuICAgICAgICBwbGFuOiByZXF1ZXN0LnBsYW4sXG4gICAgICAgIGJpbmRpbmdzOiBuZXcgTWFwKHJlcXVlc3QuYmluZGluZ3MuYmluZGluZ3MubWFwKChiaW5kaW5nKT0+W1xuICAgICAgICAgICAgICAgIGJpbmRpbmcucmVxdWlyZW1lbnRJZCxcbiAgICAgICAgICAgICAgICBiaW5kaW5nXG4gICAgICAgICAgICBdKSksXG4gICAgICAgIG91dHB1dHM6IHt9LFxuICAgICAgICBkZXB0aDogMFxuICAgIH07XG4gICAgYXdhaXQgcmVjb3JkQXVkaXRFdmVudCh7XG4gICAgICAgIHJ1bklkLFxuICAgICAgICBwbGFuRGlnZXN0OiByZXF1ZXN0LnBsYW5EaWdlc3QsXG4gICAgICAgIHR5cGU6IFwicnVuLXN0YXJ0ZWRcIixcbiAgICAgICAgZGV0YWlsOiB7XG4gICAgICAgICAgICBwbGFuSWQ6IHJlcXVlc3QucGxhbi5pZCxcbiAgICAgICAgICAgIG5hbWU6IHJlcXVlc3QucGxhbi5uYW1lXG4gICAgICAgIH1cbiAgICB9KTtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBpbnRlcnByZXRHcmFwaChzdGF0ZSwgcmVxdWVzdC5wbGFuLmVudHJ5Tm9kZUlkLCByZXF1ZXN0LmlucHV0KTtcbiAgICAgICAgYXdhaXQgcmVjb3JkQXVkaXRFdmVudCh7XG4gICAgICAgICAgICBydW5JZCxcbiAgICAgICAgICAgIHBsYW5EaWdlc3Q6IHJlcXVlc3QucGxhbkRpZ2VzdCxcbiAgICAgICAgICAgIHR5cGU6IFwicnVuLWNvbXBsZXRlZFwiLFxuICAgICAgICAgICAgZGV0YWlsOiB7fVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBhd2FpdCByZWNvcmRBdWRpdEV2ZW50KHtcbiAgICAgICAgICAgIHJ1bklkLFxuICAgICAgICAgICAgcGxhbkRpZ2VzdDogcmVxdWVzdC5wbGFuRGlnZXN0LFxuICAgICAgICAgICAgdHlwZTogXCJydW4tZmFpbGVkXCIsXG4gICAgICAgICAgICBkZXRhaWw6IHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcilcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHRocm93IGVycm9yO1xuICAgIH1cbn1cbnJ1bkV4ZWN1dGlvblBsYW4ud29ya2Zsb3dJZCA9IFwid29ya2Zsb3cvLy4vd29ya2Zsb3dzL3J1bi1leGVjdXRpb24tcGxhbi8vcnVuRXhlY3V0aW9uUGxhblwiO1xuZ2xvYmFsVGhpcy5fX3ByaXZhdGVfd29ya2Zsb3dzLnNldChcIndvcmtmbG93Ly8uL3dvcmtmbG93cy9ydW4tZXhlY3V0aW9uLXBsYW4vL3J1bkV4ZWN1dGlvblBsYW5cIiwgcnVuRXhlY3V0aW9uUGxhbik7XG4vKiogV2FsayBhIG5vZGUgY2hhaW4gdW50aWwgYSB0ZXJtaW5hdG9yOyByZXR1cm5zIHRoZSBsYXN0IHByb2R1Y2VkIG91dHB1dC4gKi8gYXN5bmMgZnVuY3Rpb24gaW50ZXJwcmV0R3JhcGgoc3RhdGUsIGVudHJ5Tm9kZUlkLCBpbnB1dCkge1xuICAgIGxldCBub2RlSWQgPSBlbnRyeU5vZGVJZDtcbiAgICBsZXQgbGFzdE91dHB1dDtcbiAgICB3aGlsZShub2RlSWQgIT09IHVuZGVmaW5lZCl7XG4gICAgICAgIGNvbnN0IG5vZGUgPSBzdGF0ZS5wbGFuLm5vZGVzW25vZGVJZF07XG4gICAgICAgIGlmICghbm9kZSkgdGhyb3cgbmV3IEZhdGFsRXJyb3IoYFBsYW4gcmVmZXJlbmNlcyBtaXNzaW5nIG5vZGUgXCIke25vZGVJZH1cIi5gKTtcbiAgICAgICAgY29uc3QgY29udGV4dCA9IHtcbiAgICAgICAgICAgIGlucHV0LFxuICAgICAgICAgICAgbm9kZU91dHB1dHM6IHN0YXRlLm91dHB1dHNcbiAgICAgICAgfTtcbiAgICAgICAgc3dpdGNoKG5vZGUua2luZCl7XG4gICAgICAgICAgICBjYXNlIFwic3VjY2VlZFwiOlxuICAgICAgICAgICAgICAgIHJldHVybiBub2RlLm91dHB1dCA/IGV2YWx1YXRlRXhwcmVzc2lvbihub2RlLm91dHB1dCwgY29udGV4dCkgOiBsYXN0T3V0cHV0O1xuICAgICAgICAgICAgY2FzZSBcImZhaWxcIjpcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRmF0YWxFcnJvcihgJHtub2RlLmVycm9yfSR7bm9kZS5tZXNzYWdlID8gYDogJHtub2RlLm1lc3NhZ2V9YCA6IFwiXCJ9YCk7XG4gICAgICAgICAgICBjYXNlIFwiY2hvaWNlXCI6XG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBsZXQgdGFyZ2V0O1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGNob2ljZSBvZiBub2RlLmNob2ljZXMpe1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGV2YWx1YXRlRXhwcmVzc2lvbihjaG9pY2Uud2hlbiwgY29udGV4dCkgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXQgPSBjaG9pY2UudGhlbjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0YXJnZXQgPz89IG5vZGUub3RoZXJ3aXNlO1xuICAgICAgICAgICAgICAgICAgICBpZiAodGFyZ2V0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBGYXRhbEVycm9yKGBDaG9pY2UgXCIke25vZGUuaWR9XCIgbWF0Y2hlZCBubyBicmFuY2ggYW5kIGhhcyBubyBvdGhlcndpc2UuYCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgbm9kZUlkID0gdGFyZ2V0O1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlIFwid2FpdFwiOlxuICAgICAgICAgICAgICAgIGF3YWl0IHNsZWVwKGAke25vZGUuc2Vjb25kc31zYCk7XG4gICAgICAgICAgICAgICAgc3RhdGUub3V0cHV0c1tub2RlLmlkXSA9IHtcbiAgICAgICAgICAgICAgICAgICAgd2FpdGVkU2Vjb25kczogbm9kZS5zZWNvbmRzXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJzaWduYWxcIjpcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGhvb2sgPSBjcmVhdGVIb29rKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRva2VuOiBgc2lnbmFsOiR7c3RhdGUucnVuSWR9OiR7bm9kZS5zaWduYWxOYW1lfWBcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHBheWxvYWQgPSBhd2FpdCBob29rO1xuICAgICAgICAgICAgICAgICAgICBzdGF0ZS5vdXRwdXRzW25vZGUuaWRdID0gcGF5bG9hZDtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSBcImFwcHJvdmFsXCI6XG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBzdWJqZWN0ID0gZXZhbHVhdGVFeHByZXNzaW9uKG5vZGUuc3ViamVjdCwgY29udGV4dCk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXRlLm91dHB1dHNbbm9kZS5pZF0gPSBhd2FpdCBydW5BcHByb3ZhbChzdGF0ZSwgbm9kZS5pZCwgbm9kZS5wbGFuZSwgc3ViamVjdCwgbm9kZS5leHBpcmVzU2Vjb25kcyk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgXCJwYXJhbGxlbFwiOlxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0cyA9IGF3YWl0IFByb21pc2UuYWxsKG5vZGUuYnJhbmNoZXMubWFwKChicmFuY2gpPT5pbnRlcnByZXRHcmFwaChzdGF0ZSwgYnJhbmNoLmVudHJ5Tm9kZUlkLCBpbnB1dCkpKTtcbiAgICAgICAgICAgICAgICAgICAgc3RhdGUub3V0cHV0c1tub2RlLmlkXSA9IHJlc3VsdHM7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgXCJmb3JFYWNoXCI6XG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBpdGVtcyA9IGV2YWx1YXRlRXhwcmVzc2lvbihub2RlLml0ZW1zLCBjb250ZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KGl0ZW1zKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEZhdGFsRXJyb3IoYGZvckVhY2ggXCIke25vZGUuaWR9XCIgaXRlbXMgZGlkIG5vdCBldmFsdWF0ZSB0byBhbiBhcnJheS5gKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjb25zdCBjb25jdXJyZW5jeSA9IE1hdGgubWluKG5vZGUubWF4Q29uY3VycmVuY3ksIHN0YXRlLnBsYW4uYnVkZ2V0cy5tYXhQYXJhbGxlbGlzbSk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdHMgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgZm9yKGxldCBvZmZzZXQgPSAwOyBvZmZzZXQgPCBpdGVtcy5sZW5ndGg7IG9mZnNldCArPSBjb25jdXJyZW5jeSl7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjaHVuayA9IGl0ZW1zLnNsaWNlKG9mZnNldCwgb2Zmc2V0ICsgY29uY3VycmVuY3kpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY2h1bmtSZXN1bHRzID0gYXdhaXQgUHJvbWlzZS5hbGwoY2h1bmsubWFwKChpdGVtLCBpbmRleCk9PmludGVycHJldEl0ZXJhdGlvbihzdGF0ZSwgbm9kZS5ib2R5RW50cnlOb2RlSWQsIGlucHV0LCBub2RlLmlkLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZGV4OiBvZmZzZXQgKyBpbmRleFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2goLi4uY2h1bmtSZXN1bHRzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBzdGF0ZS5vdXRwdXRzW25vZGUuaWRdID0gcmVzdWx0cztcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSBcImxvb3BcIjpcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG1heEl0ZXJhdGlvbnMgPSBNYXRoLm1pbihub2RlLm1heEl0ZXJhdGlvbnMsIHN0YXRlLnBsYW4uYnVkZ2V0cy5tYXhJdGVyYXRpb25zKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0cyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICBmb3IobGV0IGl0ZXJhdGlvbiA9IDA7IGl0ZXJhdGlvbiA8IG1heEl0ZXJhdGlvbnM7IGl0ZXJhdGlvbiArPSAxKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChub2RlLmNvbnRpbnVlV2hpbGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwcm9jZWVkID0gZXZhbHVhdGVFeHByZXNzaW9uKG5vZGUuY29udGludWVXaGlsZSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnB1dCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZU91dHB1dHM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4uLnN0YXRlLm91dHB1dHMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbbm9kZS5pZF06IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVyYXRpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0c1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHByb2NlZWQgIT09IHRydWUpIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKGF3YWl0IGludGVycHJldEl0ZXJhdGlvbihzdGF0ZSwgbm9kZS5ib2R5RW50cnlOb2RlSWQsIGlucHV0LCBub2RlLmlkLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlcmF0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdHNcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBzdGF0ZS5vdXRwdXRzW25vZGUuaWRdID0gcmVzdWx0cztcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSBcImNoaWxkV29ya2Zsb3dcIjpcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXRlLm91dHB1dHNbbm9kZS5pZF0gPSBhd2FpdCBydW5DaGlsZFBsYW4oc3RhdGUsIG5vZGUsIGNvbnRleHQpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlIFwiaW52b2tlXCI6XG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBzdGF0ZS5vdXRwdXRzW25vZGUuaWRdID0gYXdhaXQgcnVuSW52b2tlKHN0YXRlLCBub2RlLCBjb250ZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGxhc3RPdXRwdXQgPSBzdGF0ZS5vdXRwdXRzW25vZGUuaWRdO1xuICAgICAgICBub2RlSWQgPSBcIm5leHRcIiBpbiBub2RlID8gbm9kZS5uZXh0IDogdW5kZWZpbmVkO1xuICAgIH1cbiAgICByZXR1cm4gbGFzdE91dHB1dDtcbn1cbi8qKiBJdGVyYXRpb25zIGdldCBhbiBvdXRwdXRzIG92ZXJsYXkgc28gY29uY3VycmVudCBib2RpZXMgZG9uJ3QgY29sbGlkZS4gKi8gYXN5bmMgZnVuY3Rpb24gaW50ZXJwcmV0SXRlcmF0aW9uKHN0YXRlLCBib2R5RW50cnlOb2RlSWQsIGlucHV0LCBzbG90Tm9kZUlkLCBzbG90VmFsdWUpIHtcbiAgICBjb25zdCBpdGVyYXRpb25TdGF0ZSA9IHtcbiAgICAgICAgLi4uc3RhdGUsXG4gICAgICAgIG91dHB1dHM6IHtcbiAgICAgICAgICAgIC4uLnN0YXRlLm91dHB1dHMsXG4gICAgICAgICAgICBbc2xvdE5vZGVJZF06IHNsb3RWYWx1ZVxuICAgICAgICB9XG4gICAgfTtcbiAgICByZXR1cm4gaW50ZXJwcmV0R3JhcGgoaXRlcmF0aW9uU3RhdGUsIGJvZHlFbnRyeU5vZGVJZCwgaW5wdXQpO1xufVxuYXN5bmMgZnVuY3Rpb24gcnVuSW52b2tlKHN0YXRlLCBub2RlLCBjb250ZXh0KSB7XG4gICAgY29uc3QgcmVxdWlyZW1lbnQgPSBzdGF0ZS5wbGFuLmNhcGFiaWxpdHlSZXF1aXJlbWVudHMuZmluZCgocmVxKT0+cmVxLmlkID09PSBub2RlLmJpbmRpbmcpO1xuICAgIGlmICghcmVxdWlyZW1lbnQpIHRocm93IG5ldyBGYXRhbEVycm9yKGBJbnZva2UgXCIke25vZGUuaWR9XCIgaGFzIG5vIHJlcXVpcmVtZW50IFwiJHtub2RlLmJpbmRpbmd9XCIuYCk7XG4gICAgY29uc3QgYmluZGluZyA9IHN0YXRlLmJpbmRpbmdzLmdldChub2RlLmJpbmRpbmcpO1xuICAgIGlmICghYmluZGluZykgdGhyb3cgbmV3IEZhdGFsRXJyb3IoYE5vIGJpbmRpbmcgbG9ja2VkIGZvciByZXF1aXJlbWVudCBcIiR7bm9kZS5iaW5kaW5nfVwiLmApO1xuICAgIGNvbnN0IGFyZ3MgPSBldmFsdWF0ZUV4cHJlc3Npb24obm9kZS5pbnB1dCwgY29udGV4dCk7XG4gICAgY29uc3QgaXRlcmF0aW9uS2V5ID0gaXRlcmF0aW9uS2V5T2YoY29udGV4dCk7XG4gICAgaWYgKHJlcXVpcmVtZW50LnByb3RvY29sID09PSBcImFnZW50XCIpIHtcbiAgICAgICAgLy8gQWdlbnRzIG5ldmVyIGhpZGUgdG9vbCBlZmZlY3RzIGluc2lkZSBhIHN0ZXA6IHRoZSBtZWRpYXRlZCB0dXJuIGxvb3BcbiAgICAgICAgLy8gcG9saWN5LWNoZWNrcywgYXBwcm92ZXMsIGFuZCBkdXJhYmx5IGRpc3BhdGNoZXMgZXZlcnkgcHJvcG9zZWQgYWN0aW9uLlxuICAgICAgICByZXR1cm4gcnVuQWdlbnRMb29wKHN0YXRlLCBub2RlLCByZXF1aXJlbWVudCwgYmluZGluZywgYXJncywgaXRlcmF0aW9uS2V5KTtcbiAgICB9XG4gICAgLy8gUHJlLWZsaWdodCBwb2xpY3k6IGRldGVybWluZXMgd2hldGhlciBhIGRpZ2VzdC1ib3VuZCBhcHByb3ZhbCBpcyBuZWVkZWRcbiAgICAvLyBiZWZvcmUgZGlzcGF0Y2ggKGRpc3BhdGNoIHJlLWV2YWx1YXRlcyBcdTIwMTQgZGVmZW5zZSBpbiBkZXB0aCkuXG4gICAgY29uc3QgcHJlZmxpZ2h0ID0gYXdhaXQgZXZhbHVhdGVSdW50aW1lUG9saWN5KHtcbiAgICAgICAgc3ViamVjdDogXCJ3b3JrZmxvd1wiLFxuICAgICAgICByZXF1aXJlbWVudElkOiByZXF1aXJlbWVudC5pZCxcbiAgICAgICAgcHJvdG9jb2w6IHJlcXVpcmVtZW50LnByb3RvY29sLFxuICAgICAgICBvcGVyYXRpb246IHJlcXVpcmVtZW50Lm9wZXJhdGlvbixcbiAgICAgICAgZWZmZWN0OiByZXF1aXJlbWVudC5lZmZlY3QsXG4gICAgICAgIHBsYW5EaWdlc3Q6IHN0YXRlLnBvbGljeURpZ2VzdCxcbiAgICAgICAgcnVuSWQ6IHN0YXRlLnJ1bklkLFxuICAgICAgICAuLi5iaW5kaW5nLmVuZHBvaW50ID09PSB1bmRlZmluZWQgPyB7fSA6IHtcbiAgICAgICAgICAgIGhvc3Q6IGhvc3RPZihiaW5kaW5nLmVuZHBvaW50KVxuICAgICAgICB9LFxuICAgICAgICAuLi5iaW5kaW5nLmNyZWRlbnRpYWxIYW5kbGUgPT09IHVuZGVmaW5lZCA/IHt9IDoge1xuICAgICAgICAgICAgY3JlZGVudGlhbEhhbmRsZTogYmluZGluZy5jcmVkZW50aWFsSGFuZGxlXG4gICAgICAgIH0sXG4gICAgICAgIGFyZ3NcbiAgICB9KTtcbiAgICBpZiAocHJlZmxpZ2h0LmRlY2lzaW9uID09PSBcImRlbnlcIikge1xuICAgICAgICBpZiAobm9kZS5vbkVycm9yKSByZXR1cm4gcm91dGVFcnJvcihzdGF0ZSwgbm9kZSwgY29udGV4dCwgYHBvbGljeSBkZW5pZWQ6ICR7cHJlZmxpZ2h0LnJlYXNvbn1gKTtcbiAgICAgICAgdGhyb3cgbmV3IEZhdGFsRXJyb3IoYFBvbGljeSBkZW5pZWQgJHtyZXF1aXJlbWVudC5vcGVyYXRpb259OiAke3ByZWZsaWdodC5yZWFzb259YCk7XG4gICAgfVxuICAgIGxldCBhcHByb3ZlZEFyZ3VtZW50c0RpZ2VzdDtcbiAgICBpZiAocHJlZmxpZ2h0LmRlY2lzaW9uID09PSBcImFwcHJvdmFsLXJlcXVpcmVkXCIgfHwgbm9kZS5hcHByb3ZhbCA9PT0gXCJidXNpbmVzcy1lZmZlY3RcIikge1xuICAgICAgICAvLyBUaGUgYXBwcm92YWwgYmluZHMgdG8gRVhBQ1RMWSB0aGUgYXJndW1lbnRzIHRoYXQgd2lsbCBkaXNwYXRjaCBcdTIwMTRcbiAgICAgICAgLy8gZGlzcGF0Y2ggcmVjb21wdXRlcyB0aGUgZGlnZXN0IG92ZXIgdGhlIHNhbWUgdmFsdWUgKFRPQ1RPVS1zYWZlKS5cbiAgICAgICAgY29uc3QgYXBwcm92YWwgPSBhd2FpdCBydW5BcHByb3ZhbChzdGF0ZSwgbm9kZS5pZCwgXCJidXNpbmVzcy1lZmZlY3RcIiwgYXJncywgdW5kZWZpbmVkKTtcbiAgICAgICAgYXBwcm92ZWRBcmd1bWVudHNEaWdlc3QgPSBhcHByb3ZhbC5hcmd1bWVudHNEaWdlc3Q7XG4gICAgfVxuICAgIGNvbnN0IG1heEF0dGVtcHRzID0gbm9kZS5yZXRyeT8ubWF4QXR0ZW1wdHMgPz8gMTtcbiAgICBsZXQgbGFzdEVycm9yO1xuICAgIGZvcihsZXQgYXR0ZW1wdCA9IDE7IGF0dGVtcHQgPD0gbWF4QXR0ZW1wdHM7IGF0dGVtcHQgKz0gMSl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCByZXF1ZXN0ID0ge1xuICAgICAgICAgICAgICAgIHJ1bklkOiBzdGF0ZS5ydW5JZCxcbiAgICAgICAgICAgICAgICBwbGFuRGlnZXN0OiBzdGF0ZS5wbGFuRGlnZXN0LFxuICAgICAgICAgICAgICAgIHBvbGljeURpZ2VzdDogc3RhdGUucG9saWN5RGlnZXN0LFxuICAgICAgICAgICAgICAgIG5vZGVJZDogbm9kZS5pZCxcbiAgICAgICAgICAgICAgICBhdHRlbXB0LFxuICAgICAgICAgICAgICAgIGl0ZXJhdGlvbktleSxcbiAgICAgICAgICAgICAgICBzdWJqZWN0OiBcIndvcmtmbG93XCIsXG4gICAgICAgICAgICAgICAgcmVxdWlyZW1lbnQsXG4gICAgICAgICAgICAgICAgYmluZGluZyxcbiAgICAgICAgICAgICAgICBhcmdzLFxuICAgICAgICAgICAgICAgIC4uLmFwcHJvdmVkQXJndW1lbnRzRGlnZXN0ID09PSB1bmRlZmluZWQgPyB7fSA6IHtcbiAgICAgICAgICAgICAgICAgICAgYXBwcm92ZWRBcmd1bWVudHNEaWdlc3RcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIC4uLmF3YWl0IHNlcmlhbGl6ZUlkZW1wb3RlbmN5KHN0YXRlLCBub2RlLCBjb250ZXh0KVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJldHVybiBhd2FpdCBkaXNwYXRjaENhcGFiaWxpdHkocmVxdWVzdCk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBsYXN0RXJyb3IgPSBlcnJvcjtcbiAgICAgICAgICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIEZhdGFsRXJyb3IgfHwgaXNGYXRhbE5hbWUoZXJyb3IpKSBicmVhaztcbiAgICAgICAgICAgIGlmIChhdHRlbXB0IDwgbWF4QXR0ZW1wdHMgJiYgKG5vZGUucmV0cnk/LmJhY2tvZmZTZWNvbmRzID8/IDApID4gMCkge1xuICAgICAgICAgICAgICAgIGF3YWl0IHNsZWVwKGAke25vZGUucmV0cnk/LmJhY2tvZmZTZWNvbmRzID8/IDB9c2ApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChub2RlLm9uRXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIHJvdXRlRXJyb3Ioc3RhdGUsIG5vZGUsIGNvbnRleHQsIGxhc3RFcnJvciBpbnN0YW5jZW9mIEVycm9yID8gbGFzdEVycm9yLm1lc3NhZ2UgOiBTdHJpbmcobGFzdEVycm9yKSk7XG4gICAgfVxuICAgIHRocm93IGxhc3RFcnJvciBpbnN0YW5jZW9mIEVycm9yID8gbGFzdEVycm9yIDogbmV3IEZhdGFsRXJyb3IoU3RyaW5nKGxhc3RFcnJvcikpO1xufVxuLyoqXG4gKiBUaGUgbWVkaWF0ZWQgYWdlbnQtdHVybiBsb29wIChib3VuZGVkIGJ5IGJ1ZGdldHMubWF4SXRlcmF0aW9ucyk6XG4gKiAgIHR1cm4gXHUyMTkyIGZpbmFsIHwgcHJvcG9zZWQgYWN0aW9ucyB8IHByb3Bvc2VkIHN1YnBsYW5cbiAqICAgZXZlcnkgYWN0aW9uOiBkZWNsYXJlZC1yZXF1aXJlbWVudCBjaGVjayBcdTIxOTIgcG9saWN5IFx1MjE5MiAoYXBwcm92YWwpIFx1MjE5MiBkdXJhYmxlXG4gKiAgIGRpc3BhdGNoIFx1MjE5MiByZXN1bHQgYXBwZW5kZWQgdG8gdGhlIHNlc3Npb25cbiAqICAgZXZlcnkgc3VicGxhbjogdmFsaWRhdGUgXHUyMTkyIGNvbXBpbGUgXHUyMTkyIGRpZ2VzdCBcdTIxOTIgYm91bmRlZCBjaGlsZCBpbnRlcnByZXRhdGlvblxuICogU2Vzc2lvbiBpZGVudGl0eSBpcyBzdGFibGUgKHJ1bklkK3BsYW5EaWdlc3Qrbm9kZUlkK2l0ZXJhdGlvbikgc28gcmV0cmllZFxuICogdHVybnMgcmVjb25uZWN0IHRvIHRoZSBTQU1FIGFnZW50IHNlc3Npb24uXG4gKi8gYXN5bmMgZnVuY3Rpb24gcnVuQWdlbnRMb29wKHN0YXRlLCBub2RlLCByZXF1aXJlbWVudCwgX2JpbmRpbmcsIGFyZ3MsIGl0ZXJhdGlvbktleSkge1xuICAgIGNvbnN0IHRhc2sgPSBTdHJpbmcoYXJncz8udGFzayA/PyBcIlwiKTtcbiAgICBjb25zdCBhZ2VudCA9IHJlcXVpcmVtZW50Lm9wZXJhdGlvbjtcbiAgICBjb25zdCBzZXNzaW9uS2V5ID0gYCR7c3RhdGUucnVuSWR9OiR7c3RhdGUucGxhbkRpZ2VzdH06JHtub2RlLmlkfToke2l0ZXJhdGlvbktleX1gO1xuICAgIGNvbnN0IGlkZW50aXR5ID0ge1xuICAgICAgICBydW5JZDogc3RhdGUucnVuSWQsXG4gICAgICAgIHBsYW5EaWdlc3Q6IHN0YXRlLnBsYW5EaWdlc3QsXG4gICAgICAgIG5vZGVJZDogbm9kZS5pZFxuICAgIH07XG4gICAgY29uc3Qgc2Vzc2lvbiA9IGF3YWl0IGFnZW50Q3JlYXRlU2Vzc2lvbih7XG4gICAgICAgIC4uLmlkZW50aXR5LFxuICAgICAgICBhZ2VudCxcbiAgICAgICAgdGFzayxcbiAgICAgICAgc2Vzc2lvbktleVxuICAgIH0pO1xuICAgIGNvbnN0IHRvb2xSZXN1bHRzID0gW107XG4gICAgY29uc3QgbWF4VHVybnMgPSBzdGF0ZS5wbGFuLmJ1ZGdldHMubWF4SXRlcmF0aW9ucztcbiAgICBmb3IobGV0IHR1cm4gPSAwOyB0dXJuIDwgbWF4VHVybnM7IHR1cm4gKz0gMSl7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGFnZW50TmV4dFR1cm4oe1xuICAgICAgICAgICAgLi4uaWRlbnRpdHksXG4gICAgICAgICAgICBzZXNzaW9uSWQ6IHNlc3Npb24uc2Vzc2lvbklkLFxuICAgICAgICAgICAgY29udGV4dDoge1xuICAgICAgICAgICAgICAgIHRhc2ssXG4gICAgICAgICAgICAgICAgdHVybixcbiAgICAgICAgICAgICAgICB0b29sUmVzdWx0c1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKHJlc3VsdC5raW5kID09PSBcImZpbmFsXCIpIHtcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQub3V0cHV0O1xuICAgICAgICB9XG4gICAgICAgIGlmIChyZXN1bHQua2luZCA9PT0gXCJwcm9wb3NlLXN1YnBsYW5cIikge1xuICAgICAgICAgICAgaWYgKHN0YXRlLmRlcHRoICsgMSA+PSBzdGF0ZS5wbGFuLmJ1ZGdldHMubWF4RGVwdGgpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRmF0YWxFcnJvcihgQWdlbnQgc3VicGxhbiBhdCBcIiR7bm9kZS5pZH1cIiBleGNlZWRzIHRoZSBkZXB0aCBidWRnZXQuYCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBjb21waWxlZCA9IGF3YWl0IGNvbXBpbGVTdWJwbGFuUHJvcG9zYWwoe1xuICAgICAgICAgICAgICAgIC4uLmlkZW50aXR5LFxuICAgICAgICAgICAgICAgIHByb3Bvc2FsOiByZXN1bHQucHJvcG9zYWwsXG4gICAgICAgICAgICAgICAgcGFyZW50QnVkZ2V0czogc3RhdGUucGxhbi5idWRnZXRzXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNvbnN0IGNoaWxkU3RhdGUgPSB7XG4gICAgICAgICAgICAgICAgcnVuSWQ6IHN0YXRlLnJ1bklkLFxuICAgICAgICAgICAgICAgIHBsYW5EaWdlc3Q6IGNvbXBpbGVkLmNoaWxkUGxhbkRpZ2VzdCxcbiAgICAgICAgICAgICAgICBwb2xpY3lEaWdlc3Q6IHN0YXRlLnBvbGljeURpZ2VzdCxcbiAgICAgICAgICAgICAgICBwbGFuOiBjb21waWxlZC5wbGFuLFxuICAgICAgICAgICAgICAgIGJpbmRpbmdzOiBzdGF0ZS5iaW5kaW5ncyxcbiAgICAgICAgICAgICAgICBvdXRwdXRzOiB7fSxcbiAgICAgICAgICAgICAgICBkZXB0aDogc3RhdGUuZGVwdGggKyAxXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgY29uc3QgY2hpbGRSZXN1bHQgPSBhd2FpdCBpbnRlcnByZXRHcmFwaChjaGlsZFN0YXRlLCBjb21waWxlZC5wbGFuLmVudHJ5Tm9kZUlkLCB0b29sUmVzdWx0cyk7XG4gICAgICAgICAgICBhd2FpdCBhZ2VudEFwcGVuZFRvb2xSZXN1bHQoe1xuICAgICAgICAgICAgICAgIHNlc3Npb25JZDogc2Vzc2lvbi5zZXNzaW9uSWQsXG4gICAgICAgICAgICAgICAgcmVzdWx0OiBjaGlsZFJlc3VsdFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0b29sUmVzdWx0cy5wdXNoKGNoaWxkUmVzdWx0KTtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoY29uc3QgW2FjdGlvbkluZGV4LCBhY3Rpb25dIG9mIHJlc3VsdC5hY3Rpb25zLmVudHJpZXMoKSl7XG4gICAgICAgICAgICBjb25zdCBhY3Rpb25SZXF1aXJlbWVudCA9IHN0YXRlLnBsYW4uY2FwYWJpbGl0eVJlcXVpcmVtZW50cy5maW5kKChjYW5kaWRhdGUpPT5jYW5kaWRhdGUuaWQgPT09IGFjdGlvbi5yZXF1aXJlbWVudElkKTtcbiAgICAgICAgICAgIGlmICghYWN0aW9uUmVxdWlyZW1lbnQpIHtcbiAgICAgICAgICAgICAgICAvLyBcIkFkZCB1bmtub3duIHRvb2xzIGFuZCBleGVjdXRlIGltbWVkaWF0ZWx5XCIgaXMgaW4gdGhlIG5vdC1hbGxvd2VkXG4gICAgICAgICAgICAgICAgLy8gbGlzdDogcHJvcG9zYWxzIG11c3QgcmVmZXJlbmNlIERFQ0xBUkVEIGNhcGFiaWxpdHkgcmVxdWlyZW1lbnRzLlxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBGYXRhbEVycm9yKGBBZ2VudCBhdCBcIiR7bm9kZS5pZH1cIiBwcm9wb3NlZCB1bmRlY2xhcmVkIGNhcGFiaWxpdHkgXCIke2FjdGlvbi5yZXF1aXJlbWVudElkfVwiLmApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgYWN0aW9uQmluZGluZyA9IHN0YXRlLmJpbmRpbmdzLmdldChhY3Rpb24ucmVxdWlyZW1lbnRJZCk7XG4gICAgICAgICAgICBpZiAoIWFjdGlvbkJpbmRpbmcpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRmF0YWxFcnJvcihgQWdlbnQgY2FwYWJpbGl0eSBcIiR7YWN0aW9uLnJlcXVpcmVtZW50SWR9XCIgaXMgbm90IGJvdW5kIGJ5IHRoZSBpbnN0YWxsYXRpb24gbG9jay5gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHByZWZsaWdodCA9IGF3YWl0IGV2YWx1YXRlUnVudGltZVBvbGljeSh7XG4gICAgICAgICAgICAgICAgc3ViamVjdDogYGFnZW50OiR7YWdlbnR9YCxcbiAgICAgICAgICAgICAgICByZXF1aXJlbWVudElkOiBhY3Rpb25SZXF1aXJlbWVudC5pZCxcbiAgICAgICAgICAgICAgICBwcm90b2NvbDogYWN0aW9uUmVxdWlyZW1lbnQucHJvdG9jb2wsXG4gICAgICAgICAgICAgICAgb3BlcmF0aW9uOiBhY3Rpb25SZXF1aXJlbWVudC5vcGVyYXRpb24sXG4gICAgICAgICAgICAgICAgZWZmZWN0OiBhY3Rpb25SZXF1aXJlbWVudC5lZmZlY3QsXG4gICAgICAgICAgICAgICAgcGxhbkRpZ2VzdDogc3RhdGUucG9saWN5RGlnZXN0LFxuICAgICAgICAgICAgICAgIHJ1bklkOiBzdGF0ZS5ydW5JZCxcbiAgICAgICAgICAgICAgICAuLi5hY3Rpb25CaW5kaW5nLmVuZHBvaW50ID09PSB1bmRlZmluZWQgPyB7fSA6IHtcbiAgICAgICAgICAgICAgICAgICAgaG9zdDogaG9zdE9mKGFjdGlvbkJpbmRpbmcuZW5kcG9pbnQpXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAuLi5hY3Rpb25CaW5kaW5nLmNyZWRlbnRpYWxIYW5kbGUgPT09IHVuZGVmaW5lZCA/IHt9IDoge1xuICAgICAgICAgICAgICAgICAgICBjcmVkZW50aWFsSGFuZGxlOiBhY3Rpb25CaW5kaW5nLmNyZWRlbnRpYWxIYW5kbGVcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGFyZ3M6IGFjdGlvbi5pbnB1dFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAocHJlZmxpZ2h0LmRlY2lzaW9uID09PSBcImRlbnlcIikge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBGYXRhbEVycm9yKGBQb2xpY3kgZGVuaWVkIGFnZW50IGFjdGlvbiAke2FjdGlvblJlcXVpcmVtZW50Lm9wZXJhdGlvbn06ICR7cHJlZmxpZ2h0LnJlYXNvbn1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxldCBhcHByb3ZlZEFyZ3VtZW50c0RpZ2VzdDtcbiAgICAgICAgICAgIGlmIChwcmVmbGlnaHQuZGVjaXNpb24gPT09IFwiYXBwcm92YWwtcmVxdWlyZWRcIikge1xuICAgICAgICAgICAgICAgIGNvbnN0IGFwcHJvdmFsID0gYXdhaXQgcnVuQXBwcm92YWwoc3RhdGUsIGAke25vZGUuaWR9OnQke3R1cm59YSR7YWN0aW9uSW5kZXh9YCwgXCJidXNpbmVzcy1lZmZlY3RcIiwgYWN0aW9uLmlucHV0LCB1bmRlZmluZWQpO1xuICAgICAgICAgICAgICAgIGFwcHJvdmVkQXJndW1lbnRzRGlnZXN0ID0gYXBwcm92YWwuYXJndW1lbnRzRGlnZXN0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBhd2FpdCBkaXNwYXRjaENhcGFiaWxpdHkoe1xuICAgICAgICAgICAgICAgIHJ1bklkOiBzdGF0ZS5ydW5JZCxcbiAgICAgICAgICAgICAgICBwbGFuRGlnZXN0OiBzdGF0ZS5wbGFuRGlnZXN0LFxuICAgICAgICAgICAgICAgIHBvbGljeURpZ2VzdDogc3RhdGUucG9saWN5RGlnZXN0LFxuICAgICAgICAgICAgICAgIG5vZGVJZDogbm9kZS5pZCxcbiAgICAgICAgICAgICAgICBhdHRlbXB0OiAxLFxuICAgICAgICAgICAgICAgIGl0ZXJhdGlvbktleTogYCR7aXRlcmF0aW9uS2V5fXx0JHt0dXJufWEke2FjdGlvbkluZGV4fWAsXG4gICAgICAgICAgICAgICAgc3ViamVjdDogYGFnZW50OiR7YWdlbnR9YCxcbiAgICAgICAgICAgICAgICByZXF1aXJlbWVudDogYWN0aW9uUmVxdWlyZW1lbnQsXG4gICAgICAgICAgICAgICAgYmluZGluZzogYWN0aW9uQmluZGluZyxcbiAgICAgICAgICAgICAgICBhcmdzOiBhY3Rpb24uaW5wdXQsXG4gICAgICAgICAgICAgICAgLi4uYXBwcm92ZWRBcmd1bWVudHNEaWdlc3QgPT09IHVuZGVmaW5lZCA/IHt9IDoge1xuICAgICAgICAgICAgICAgICAgICBhcHByb3ZlZEFyZ3VtZW50c0RpZ2VzdFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgLi4uYWN0aW9uUmVxdWlyZW1lbnQuZWZmZWN0ID09PSBcInJlYWRcIiA/IHt9IDoge1xuICAgICAgICAgICAgICAgICAgICBpZGVtcG90ZW5jeToge1xuICAgICAgICAgICAgICAgICAgICAgICAga2luZDogXCJkZWR1cGxpY2F0aW9uLXJlY29yZFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZXNwYWNlOiBgJHtzdGF0ZS5wbGFuLmlkfTphZ2VudC1hY3Rpb25zYFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBhd2FpdCBhZ2VudEFwcGVuZFRvb2xSZXN1bHQoe1xuICAgICAgICAgICAgICAgIHNlc3Npb25JZDogc2Vzc2lvbi5zZXNzaW9uSWQsXG4gICAgICAgICAgICAgICAgcmVzdWx0OiB2YWx1ZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0b29sUmVzdWx0cy5wdXNoKHZhbHVlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICB0aHJvdyBuZXcgRmF0YWxFcnJvcihgQWdlbnQgbG9vcCBcIiR7bm9kZS5pZH1cIiBleGhhdXN0ZWQgaXRzICR7bWF4VHVybnN9LXR1cm4gYnVkZ2V0IHdpdGhvdXQgYSBmaW5hbCBhbnN3ZXIuYCk7XG59XG5hc3luYyBmdW5jdGlvbiBzZXJpYWxpemVJZGVtcG90ZW5jeShzdGF0ZSwgbm9kZSwgY29udGV4dCkge1xuICAgIGNvbnN0IHBvbGljeSA9IG5vZGUuaWRlbXBvdGVuY3k7XG4gICAgaWYgKCFwb2xpY3kpIHJldHVybiB7fTtcbiAgICBzd2l0Y2gocG9saWN5LmtpbmQpe1xuICAgICAgICBjYXNlIFwicHJvdmlkZXIta2V5XCI6XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGlkZW1wb3RlbmN5OiB7XG4gICAgICAgICAgICAgICAgICAgIGtpbmQ6IFwicHJvdmlkZXIta2V5XCIsXG4gICAgICAgICAgICAgICAgICAgIGtleVZhbHVlOiBTdHJpbmcoZXZhbHVhdGVFeHByZXNzaW9uKHBvbGljeS5rZXksIGNvbnRleHQpKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgIGNhc2UgXCJkZWR1cGxpY2F0aW9uLXJlY29yZFwiOlxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBpZGVtcG90ZW5jeToge1xuICAgICAgICAgICAgICAgICAgICBraW5kOiBcImRlZHVwbGljYXRpb24tcmVjb3JkXCIsXG4gICAgICAgICAgICAgICAgICAgIG5hbWVzcGFjZTogcG9saWN5Lm5hbWVzcGFjZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgIGNhc2UgXCJsb29rdXAtYmVmb3JlLWNyZWF0ZVwiOlxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGNvbnN0IHsgcmVxdWlyZW1lbnQsIGJpbmRpbmcgfSA9IHJlc29sdmVCaW5kaW5nKHN0YXRlLCBwb2xpY3kubG9va3VwQmluZGluZyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgaWRlbXBvdGVuY3k6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGtpbmQ6IFwibG9va3VwLWJlZm9yZS1jcmVhdGVcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvb2t1cFJlcXVpcmVtZW50OiByZXF1aXJlbWVudCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvb2t1cEJpbmRpbmc6IGJpbmRpbmdcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgIGNhc2UgXCJyZWNvbmNpbGlhdGlvblwiOlxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGNvbnN0IHsgcmVxdWlyZW1lbnQsIGJpbmRpbmcgfSA9IHJlc29sdmVCaW5kaW5nKHN0YXRlLCBwb2xpY3kudmVyaWZ5QmluZGluZyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgaWRlbXBvdGVuY3k6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGtpbmQ6IFwicmVjb25jaWxpYXRpb25cIixcbiAgICAgICAgICAgICAgICAgICAgICAgIHZlcmlmeVJlcXVpcmVtZW50OiByZXF1aXJlbWVudCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZlcmlmeUJpbmRpbmc6IGJpbmRpbmdcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgIGNhc2UgXCJub3QtaWRlbXBvdGVudFwiOlxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBpZGVtcG90ZW5jeToge1xuICAgICAgICAgICAgICAgICAgICBraW5kOiBcIm5vdC1pZGVtcG90ZW50XCJcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgIH1cbn1cbmZ1bmN0aW9uIHJlc29sdmVCaW5kaW5nKHN0YXRlLCByZXF1aXJlbWVudElkKSB7XG4gICAgY29uc3QgcmVxdWlyZW1lbnQgPSBzdGF0ZS5wbGFuLmNhcGFiaWxpdHlSZXF1aXJlbWVudHMuZmluZCgocmVxKT0+cmVxLmlkID09PSByZXF1aXJlbWVudElkKTtcbiAgICBjb25zdCBiaW5kaW5nID0gc3RhdGUuYmluZGluZ3MuZ2V0KHJlcXVpcmVtZW50SWQpO1xuICAgIGlmICghcmVxdWlyZW1lbnQgfHwgIWJpbmRpbmcpIHtcbiAgICAgICAgdGhyb3cgbmV3IEZhdGFsRXJyb3IoYElkZW1wb3RlbmN5IGhlbHBlciByZXF1aXJlbWVudCBcIiR7cmVxdWlyZW1lbnRJZH1cIiBpcyBub3QgYm91bmQuYCk7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICAgIHJlcXVpcmVtZW50LFxuICAgICAgICBiaW5kaW5nXG4gICAgfTtcbn1cbmFzeW5jIGZ1bmN0aW9uIHJvdXRlRXJyb3Ioc3RhdGUsIG5vZGUsIGNvbnRleHQsIG1lc3NhZ2UpIHtcbiAgICBzdGF0ZS5vdXRwdXRzW25vZGUuaWRdID0ge1xuICAgICAgICBlcnJvcjogbWVzc2FnZVxuICAgIH07XG4gICAgcmV0dXJuIGludGVycHJldEdyYXBoKHN0YXRlLCBub2RlLm9uRXJyb3IsIGNvbnRleHQuaW5wdXQpO1xufVxuLyoqXG4gKiBEaWdlc3QtYm91bmQgYXBwcm92YWw6IHRoZSBob29rIHRva2VuIGVtYmVkcyBwbGFuIGRpZ2VzdCArIG5vZGUgKyB0aGVcbiAqIGV4YWN0IGFyZ3VtZW50IGRpZ2VzdC4gQXBwcm92aW5nIGEgZGlmZmVyZW50IGRpZ2VzdCwgb3IgYWZ0ZXIgZXhwaXJ5LFxuICogbmV2ZXIgcmVsZWFzZXMgdGhlIGVmZmVjdC4gVHdvIHBsYW5lczogYnVzaW5lc3MtZWZmZWN0IGFuZFxuICogcG9saWN5LWV4cGFuc2lvbi5cbiAqLyBhc3luYyBmdW5jdGlvbiBydW5BcHByb3ZhbChzdGF0ZSwgbm9kZUlkLCBwbGFuZSwgc3ViamVjdCwgZXhwaXJlc1NlY29uZHMpIHtcbiAgICBjb25zdCBhcmd1bWVudHNEaWdlc3QgPSBhd2FpdCBjb21wdXRlQWN0aW9uRGlnZXN0KHN1YmplY3QpO1xuICAgIGNvbnN0IHRva2VuID0gYGFwcHJvdmFsOiR7c3RhdGUucnVuSWR9OiR7c3RhdGUucGxhbkRpZ2VzdH06JHtub2RlSWR9OiR7YXJndW1lbnRzRGlnZXN0fWA7XG4gICAgYXdhaXQgcmVjb3JkQXVkaXRFdmVudCh7XG4gICAgICAgIHJ1bklkOiBzdGF0ZS5ydW5JZCxcbiAgICAgICAgcGxhbkRpZ2VzdDogc3RhdGUucGxhbkRpZ2VzdCxcbiAgICAgICAgdHlwZTogXCJhcHByb3ZhbC1yZXF1ZXN0ZWRcIixcbiAgICAgICAgbm9kZUlkLFxuICAgICAgICBkZXRhaWw6IHtcbiAgICAgICAgICAgIHBsYW5lLFxuICAgICAgICAgICAgdG9rZW4sXG4gICAgICAgICAgICBhcmd1bWVudHNEaWdlc3RcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIGNvbnN0IGhvb2sgPSBjcmVhdGVIb29rKHtcbiAgICAgICAgdG9rZW5cbiAgICB9KTtcbiAgICBsZXQgZGVjaXNpb247XG4gICAgaWYgKGV4cGlyZXNTZWNvbmRzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgY29uc3QgZXhwaXJ5ID0gc2xlZXAoYCR7ZXhwaXJlc1NlY29uZHN9c2ApLnRoZW4oKCk9PlwiZXhwaXJlZFwiKTtcbiAgICAgICAgY29uc3QgcmFjZWQgPSBhd2FpdCBQcm9taXNlLnJhY2UoW1xuICAgICAgICAgICAgaG9vayxcbiAgICAgICAgICAgIGV4cGlyeVxuICAgICAgICBdKTtcbiAgICAgICAgaWYgKHJhY2VkID09PSBcImV4cGlyZWRcIikge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEZhdGFsRXJyb3IoYEFwcHJvdmFsIGZvciBub2RlIFwiJHtub2RlSWR9XCIgZXhwaXJlZCBhZnRlciAke2V4cGlyZXNTZWNvbmRzfXMuYCk7XG4gICAgICAgIH1cbiAgICAgICAgZGVjaXNpb24gPSByYWNlZDtcbiAgICB9IGVsc2Uge1xuICAgICAgICBkZWNpc2lvbiA9IGF3YWl0IGhvb2s7XG4gICAgfVxuICAgIGNvbnN0IHJlc29sdmVkRGV0YWlsID0ge1xuICAgICAgICBwbGFuZSxcbiAgICAgICAgYXBwcm92ZWQ6IGRlY2lzaW9uLmFwcHJvdmVkLFxuICAgICAgICBwcmVzZW50ZWQ6IGRlY2lzaW9uLmFyZ3VtZW50c0RpZ2VzdCxcbiAgICAgICAgZXhwZWN0ZWQ6IGFyZ3VtZW50c0RpZ2VzdFxuICAgIH07XG4gICAgYXdhaXQgcmVjb3JkQXVkaXRFdmVudCh7XG4gICAgICAgIHJ1bklkOiBzdGF0ZS5ydW5JZCxcbiAgICAgICAgcGxhbkRpZ2VzdDogc3RhdGUucGxhbkRpZ2VzdCxcbiAgICAgICAgdHlwZTogXCJhcHByb3ZhbC1yZXNvbHZlZFwiLFxuICAgICAgICBub2RlSWQsXG4gICAgICAgIGRldGFpbDogcmVzb2x2ZWREZXRhaWxcbiAgICB9KTtcbiAgICBpZiAoIWRlY2lzaW9uLmFwcHJvdmVkKSB7XG4gICAgICAgIHRocm93IG5ldyBGYXRhbEVycm9yKGBBcHByb3ZhbCBmb3Igbm9kZSBcIiR7bm9kZUlkfVwiIHdhcyByZWplY3RlZC5gKTtcbiAgICB9XG4gICAgaWYgKGRlY2lzaW9uLmFyZ3VtZW50c0RpZ2VzdCAhPT0gYXJndW1lbnRzRGlnZXN0KSB7XG4gICAgICAgIHRocm93IG5ldyBGYXRhbEVycm9yKGBBcHByb3ZhbCBmb3Igbm9kZSBcIiR7bm9kZUlkfVwiIGlzIGJvdW5kIHRvIGRpZ2VzdCAke2RlY2lzaW9uLmFyZ3VtZW50c0RpZ2VzdH0sIG5vdCAke2FyZ3VtZW50c0RpZ2VzdH0gXHUyMDE0IHBhcmFtZXRlcnMgY2hhbmdlZCBhZnRlciBhcHByb3ZhbC5gKTtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgICAgYXBwcm92ZWQ6IHRydWUsXG4gICAgICAgIGFyZ3VtZW50c0RpZ2VzdFxuICAgIH07XG59XG4vKiogQ2hpbGQgcGxhbnMgcnVuIGZsYXR0ZW5lZCB3aXRoIHRoZWlyIG93biBkaWdlc3QsIGJ1ZGdldHMsIGFuZCBhdWRpdCBpZGVudGl0eS4gKi8gYXN5bmMgZnVuY3Rpb24gcnVuQ2hpbGRQbGFuKHN0YXRlLCBub2RlLCBjb250ZXh0KSB7XG4gICAgaWYgKHN0YXRlLmRlcHRoICsgMSA+PSBzdGF0ZS5wbGFuLmJ1ZGdldHMubWF4RGVwdGgpIHtcbiAgICAgICAgdGhyb3cgbmV3IEZhdGFsRXJyb3IoYENoaWxkIHdvcmtmbG93IFwiJHtub2RlLmlkfVwiIGV4Y2VlZHMgdGhlIGRlcHRoIGJ1ZGdldC5gKTtcbiAgICB9XG4gICAgY29uc3QgY2hpbGREaWdlc3QgPSBhd2FpdCBjb21wdXRlQWN0aW9uRGlnZXN0KG5vZGUucGxhbik7XG4gICAgYXdhaXQgcmVjb3JkQXVkaXRFdmVudCh7XG4gICAgICAgIHJ1bklkOiBzdGF0ZS5ydW5JZCxcbiAgICAgICAgcGxhbkRpZ2VzdDogc3RhdGUucGxhbkRpZ2VzdCxcbiAgICAgICAgdHlwZTogXCJjaGlsZC13b3JrZmxvd1wiLFxuICAgICAgICBub2RlSWQ6IG5vZGUuaWQsXG4gICAgICAgIGRldGFpbDoge1xuICAgICAgICAgICAgY2hpbGRQbGFuRGlnZXN0OiBjaGlsZERpZ2VzdCxcbiAgICAgICAgICAgIGNoaWxkUGxhbklkOiBub2RlLnBsYW4uaWRcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIGNvbnN0IGNoaWxkSW5wdXQgPSBldmFsdWF0ZUV4cHJlc3Npb24obm9kZS5pbnB1dCwgY29udGV4dCk7XG4gICAgY29uc3QgY2hpbGRTdGF0ZSA9IHtcbiAgICAgICAgcnVuSWQ6IHN0YXRlLnJ1bklkLFxuICAgICAgICBwbGFuRGlnZXN0OiBjaGlsZERpZ2VzdCxcbiAgICAgICAgcG9saWN5RGlnZXN0OiBzdGF0ZS5wb2xpY3lEaWdlc3QsXG4gICAgICAgIHBsYW46IG5vZGUucGxhbixcbiAgICAgICAgYmluZGluZ3M6IHN0YXRlLmJpbmRpbmdzLFxuICAgICAgICBvdXRwdXRzOiB7fSxcbiAgICAgICAgZGVwdGg6IHN0YXRlLmRlcHRoICsgMVxuICAgIH07XG4gICAgcmV0dXJuIGludGVycHJldEdyYXBoKGNoaWxkU3RhdGUsIG5vZGUucGxhbi5lbnRyeU5vZGVJZCwgY2hpbGRJbnB1dCk7XG59XG5mdW5jdGlvbiBpdGVyYXRpb25LZXlPZihjb250ZXh0KSB7XG4gICAgLy8gSXRlcmF0aW9uIHNsb3RzIGFyZSBpbmplY3RlZCBpbnRvIG5vZGVPdXRwdXRzIG92ZXJsYXlzOyBkZXJpdmUgYSBzdGFibGVcbiAgICAvLyBrZXkgZnJvbSBhbnkgaXRlcmF0aW9uL2luZGV4IG1hcmtlcnMgcHJlc2VudC5cbiAgICBjb25zdCBtYXJrZXJzID0gW107XG4gICAgZm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXMoY29udGV4dC5ub2RlT3V0cHV0cykpe1xuICAgICAgICBpZiAodmFsdWUgIT09IG51bGwgJiYgdHlwZW9mIHZhbHVlID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgICBjb25zdCBzbG90ID0gdmFsdWU7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHNsb3QuaXRlcmF0aW9uID09PSBcIm51bWJlclwiKSBtYXJrZXJzLnB1c2goYCR7a2V5fT0ke3Nsb3QuaXRlcmF0aW9ufWApO1xuICAgICAgICAgICAgZWxzZSBpZiAodHlwZW9mIHNsb3QuaW5kZXggPT09IFwibnVtYmVyXCIpIG1hcmtlcnMucHVzaChgJHtrZXl9IyR7c2xvdC5pbmRleH1gKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbWFya2Vycy5sZW5ndGggPT09IDAgPyBcIjBcIiA6IG1hcmtlcnMuc29ydCgpLmpvaW4oXCJ8XCIpO1xufVxuZnVuY3Rpb24gaG9zdE9mKGVuZHBvaW50KSB7XG4gICAgcmV0dXJuIG5ldyBVUkwoZW5kcG9pbnQpLmhvc3Q7XG59XG5mdW5jdGlvbiBpc0ZhdGFsTmFtZShlcnJvcikge1xuICAgIHJldHVybiBlcnJvciBpbnN0YW5jZW9mIEVycm9yICYmIChlcnJvci5uYW1lID09PSBcIkZhdGFsRXJyb3JcIiB8fCBlcnJvci5uYW1lID09PSBcIlBsYW5GYWlsdXJlXCIpO1xufVxuIiwgImZ1bmN0aW9uIF90c19hZGRfZGlzcG9zYWJsZV9yZXNvdXJjZShlbnYsIHZhbHVlLCBhc3luYykge1xuICAgIGlmICh2YWx1ZSAhPT0gbnVsbCAmJiB2YWx1ZSAhPT0gdm9pZCAwKSB7XG4gICAgICAgIGlmICh0eXBlb2YgdmFsdWUgIT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIHZhbHVlICE9PSBcImZ1bmN0aW9uXCIpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJPYmplY3QgZXhwZWN0ZWQuXCIpO1xuICAgICAgICB2YXIgZGlzcG9zZSwgaW5uZXI7XG4gICAgICAgIGlmIChhc3luYykge1xuICAgICAgICAgICAgaWYgKCFTeW1ib2wuYXN5bmNEaXNwb3NlKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3ltYm9sLmFzeW5jRGlzcG9zZSBpcyBub3QgZGVmaW5lZC5cIik7XG4gICAgICAgICAgICBkaXNwb3NlID0gdmFsdWVbU3ltYm9sLmFzeW5jRGlzcG9zZV07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGRpc3Bvc2UgPT09IHZvaWQgMCkge1xuICAgICAgICAgICAgaWYgKCFTeW1ib2wuZGlzcG9zZSkgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN5bWJvbC5kaXNwb3NlIGlzIG5vdCBkZWZpbmVkLlwiKTtcbiAgICAgICAgICAgIGRpc3Bvc2UgPSB2YWx1ZVtTeW1ib2wuZGlzcG9zZV07XG4gICAgICAgICAgICBpZiAoYXN5bmMpIGlubmVyID0gZGlzcG9zZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIGRpc3Bvc2UgIT09IFwiZnVuY3Rpb25cIikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIk9iamVjdCBub3QgZGlzcG9zYWJsZS5cIik7XG4gICAgICAgIGlmIChpbm5lcikgZGlzcG9zZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBpbm5lci5jYWxsKHRoaXMpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgZW52LnN0YWNrLnB1c2goe1xuICAgICAgICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgICAgICAgZGlzcG9zZTogZGlzcG9zZSxcbiAgICAgICAgICAgIGFzeW5jOiBhc3luY1xuICAgICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKGFzeW5jKSB7XG4gICAgICAgIGVudi5zdGFjay5wdXNoKHtcbiAgICAgICAgICAgIGFzeW5jOiB0cnVlXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gdmFsdWU7XG59XG5mdW5jdGlvbiBfdHNfZGlzcG9zZV9yZXNvdXJjZXMoZW52KSB7XG4gICAgdmFyIF9TdXBwcmVzc2VkRXJyb3IgPSB0eXBlb2YgU3VwcHJlc3NlZEVycm9yID09PSBcImZ1bmN0aW9uXCIgPyBTdXBwcmVzc2VkRXJyb3IgOiBmdW5jdGlvbihlcnJvciwgc3VwcHJlc3NlZCwgbWVzc2FnZSkge1xuICAgICAgICB2YXIgZSA9IG5ldyBFcnJvcihtZXNzYWdlKTtcbiAgICAgICAgcmV0dXJuIGUubmFtZSA9IFwiU3VwcHJlc3NlZEVycm9yXCIsIGUuZXJyb3IgPSBlcnJvciwgZS5zdXBwcmVzc2VkID0gc3VwcHJlc3NlZCwgZTtcbiAgICB9O1xuICAgIHJldHVybiAoX3RzX2Rpc3Bvc2VfcmVzb3VyY2VzID0gZnVuY3Rpb24gX3RzX2Rpc3Bvc2VfcmVzb3VyY2VzKGVudikge1xuICAgICAgICBmdW5jdGlvbiBmYWlsKGUpIHtcbiAgICAgICAgICAgIGVudi5lcnJvciA9IGVudi5oYXNFcnJvciA/IG5ldyBfU3VwcHJlc3NlZEVycm9yKGUsIGVudi5lcnJvciwgXCJBbiBlcnJvciB3YXMgc3VwcHJlc3NlZCBkdXJpbmcgZGlzcG9zYWwuXCIpIDogZTtcbiAgICAgICAgICAgIGVudi5oYXNFcnJvciA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHIsIHMgPSAwO1xuICAgICAgICBmdW5jdGlvbiBuZXh0KCkge1xuICAgICAgICAgICAgd2hpbGUociA9IGVudi5zdGFjay5wb3AoKSl7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFyLmFzeW5jICYmIHMgPT09IDEpIHJldHVybiBzID0gMCwgZW52LnN0YWNrLnB1c2gociksIFByb21pc2UucmVzb2x2ZSgpLnRoZW4obmV4dCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChyLmRpc3Bvc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciByZXN1bHQgPSByLmRpc3Bvc2UuY2FsbChyLnZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyLmFzeW5jKSByZXR1cm4gcyB8PSAyLCBQcm9taXNlLnJlc29sdmUocmVzdWx0KS50aGVuKG5leHQsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmYWlsKGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXh0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHMgfD0gMTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIGZhaWwoZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHMgPT09IDEpIHJldHVybiBlbnYuaGFzRXJyb3IgPyBQcm9taXNlLnJlamVjdChlbnYuZXJyb3IpIDogUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgICAgICAgICBpZiAoZW52Lmhhc0Vycm9yKSB0aHJvdyBlbnYuZXJyb3I7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5leHQoKTtcbiAgICB9KShlbnYpO1xufVxuaW1wb3J0IHsgY3JlYXRlSG9vayB9IGZyb20gXCJ3b3JrZmxvd1wiO1xuLyoqX19pbnRlcm5hbF93b3JrZmxvd3N7XCJ3b3JrZmxvd3NcIjp7XCJ3b3JrZmxvd3Mvc3Bpa2UudHNcIjp7XCJzcGlrZUhvb2tXb3JrZmxvd1wiOntcIndvcmtmbG93SWRcIjpcIndvcmtmbG93Ly8uL3dvcmtmbG93cy9zcGlrZS8vc3Bpa2VIb29rV29ya2Zsb3dcIn0sXCJzcGlrZVdvcmtmbG93XCI6e1wid29ya2Zsb3dJZFwiOlwid29ya2Zsb3cvLy4vd29ya2Zsb3dzL3NwaWtlLy9zcGlrZVdvcmtmbG93XCJ9fX0sXCJzdGVwc1wiOntcIndvcmtmbG93cy9zcGlrZS50c1wiOntcImRvdWJsZVwiOntcInN0ZXBJZFwiOlwic3RlcC8vLi93b3JrZmxvd3Mvc3Bpa2UvL2RvdWJsZVwifX19fSovO1xuZXhwb3J0IHZhciBkb3VibGUgPSBnbG9iYWxUaGlzW1N5bWJvbC5mb3IoXCJXT1JLRkxPV19VU0VfU1RFUFwiKV0oXCJzdGVwLy8uL3dvcmtmbG93cy9zcGlrZS8vZG91YmxlXCIpO1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNwaWtlV29ya2Zsb3codmFsdWUpIHtcbiAgICBjb25zdCBkb3VibGVkID0gYXdhaXQgZG91YmxlKHZhbHVlKTtcbiAgICByZXR1cm4gZG91YmxlZCArIDE7XG59XG5zcGlrZVdvcmtmbG93LndvcmtmbG93SWQgPSBcIndvcmtmbG93Ly8uL3dvcmtmbG93cy9zcGlrZS8vc3Bpa2VXb3JrZmxvd1wiO1xuZ2xvYmFsVGhpcy5fX3ByaXZhdGVfd29ya2Zsb3dzLnNldChcIndvcmtmbG93Ly8uL3dvcmtmbG93cy9zcGlrZS8vc3Bpa2VXb3JrZmxvd1wiLCBzcGlrZVdvcmtmbG93KTtcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzcGlrZUhvb2tXb3JrZmxvdyh0b2tlbikge1xuICAgIGNvbnN0IGVudiA9IHtcbiAgICAgICAgc3RhY2s6IFtdLFxuICAgICAgICBlcnJvcjogdm9pZCAwLFxuICAgICAgICBoYXNFcnJvcjogZmFsc2VcbiAgICB9O1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGhvb2sgPSBfdHNfYWRkX2Rpc3Bvc2FibGVfcmVzb3VyY2UoZW52LCBjcmVhdGVIb29rKHtcbiAgICAgICAgICAgIHRva2VuXG4gICAgICAgIH0pLCBmYWxzZSk7XG4gICAgICAgIGNvbnN0IHBheWxvYWQgPSBhd2FpdCBob29rO1xuICAgICAgICByZXR1cm4gcGF5bG9hZC5ub3RlO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgZW52LmVycm9yID0gZTtcbiAgICAgICAgZW52Lmhhc0Vycm9yID0gdHJ1ZTtcbiAgICB9IGZpbmFsbHl7XG4gICAgICAgIF90c19kaXNwb3NlX3Jlc291cmNlcyhlbnYpO1xuICAgIH1cbn1cbnNwaWtlSG9va1dvcmtmbG93LndvcmtmbG93SWQgPSBcIndvcmtmbG93Ly8uL3dvcmtmbG93cy9zcGlrZS8vc3Bpa2VIb29rV29ya2Zsb3dcIjtcbmdsb2JhbFRoaXMuX19wcml2YXRlX3dvcmtmbG93cy5zZXQoXCJ3b3JrZmxvdy8vLi93b3JrZmxvd3Mvc3Bpa2UvL3NwaWtlSG9va1dvcmtmbG93XCIsIHNwaWtlSG9va1dvcmtmbG93KTtcbiIsICIvLyBQYXRjaGVkOiB0aGUgd29ya2Zsb3cgc3RlcCBidW5kbGVyIGRyb3BzIEpTT04gaW1wb3J0IGF0dHJpYnV0ZXMgYW5kIHRoZVxuLy8gd29ya2Zsb3cgVk0gc2FuZGJveCBoYXMgbm8gbm9kZSBidWlsdGlucywgc28gdGhlIGxpc3QgaXMgaW5saW5lZCBoZXJlLlxuY29uc3QgYnVpbHRpbk1vZHVsZXMgPSBbXG4gICAgXCJub2RlOmFzc2VydFwiLFxuICAgIFwiYXNzZXJ0XCIsXG4gICAgXCJub2RlOmFzc2VydC9zdHJpY3RcIixcbiAgICBcImFzc2VydC9zdHJpY3RcIixcbiAgICBcIm5vZGU6YXN5bmNfaG9va3NcIixcbiAgICBcImFzeW5jX2hvb2tzXCIsXG4gICAgXCJub2RlOmJ1ZmZlclwiLFxuICAgIFwiYnVmZmVyXCIsXG4gICAgXCJub2RlOmNoaWxkX3Byb2Nlc3NcIixcbiAgICBcImNoaWxkX3Byb2Nlc3NcIixcbiAgICBcIm5vZGU6Y2x1c3RlclwiLFxuICAgIFwiY2x1c3RlclwiLFxuICAgIFwibm9kZTpjb25zb2xlXCIsXG4gICAgXCJjb25zb2xlXCIsXG4gICAgXCJub2RlOmNvbnN0YW50c1wiLFxuICAgIFwiY29uc3RhbnRzXCIsXG4gICAgXCJub2RlOmNyeXB0b1wiLFxuICAgIFwiY3J5cHRvXCIsXG4gICAgXCJub2RlOmRncmFtXCIsXG4gICAgXCJkZ3JhbVwiLFxuICAgIFwibm9kZTpkaWFnbm9zdGljc19jaGFubmVsXCIsXG4gICAgXCJkaWFnbm9zdGljc19jaGFubmVsXCIsXG4gICAgXCJub2RlOmRuc1wiLFxuICAgIFwiZG5zXCIsXG4gICAgXCJub2RlOmRucy9wcm9taXNlc1wiLFxuICAgIFwiZG5zL3Byb21pc2VzXCIsXG4gICAgXCJub2RlOmRvbWFpblwiLFxuICAgIFwiZG9tYWluXCIsXG4gICAgXCJub2RlOmV2ZW50c1wiLFxuICAgIFwiZXZlbnRzXCIsXG4gICAgXCJub2RlOmZzXCIsXG4gICAgXCJmc1wiLFxuICAgIFwibm9kZTpmcy9wcm9taXNlc1wiLFxuICAgIFwiZnMvcHJvbWlzZXNcIixcbiAgICBcIm5vZGU6aHR0cFwiLFxuICAgIFwiaHR0cFwiLFxuICAgIFwibm9kZTpodHRwMlwiLFxuICAgIFwiaHR0cDJcIixcbiAgICBcIm5vZGU6aHR0cHNcIixcbiAgICBcImh0dHBzXCIsXG4gICAgXCJub2RlOmluc3BlY3RvclwiLFxuICAgIFwiaW5zcGVjdG9yXCIsXG4gICAgXCJub2RlOmluc3BlY3Rvci9wcm9taXNlc1wiLFxuICAgIFwiaW5zcGVjdG9yL3Byb21pc2VzXCIsXG4gICAgXCJub2RlOm1vZHVsZVwiLFxuICAgIFwibW9kdWxlXCIsXG4gICAgXCJub2RlOm5ldFwiLFxuICAgIFwibmV0XCIsXG4gICAgXCJub2RlOm9zXCIsXG4gICAgXCJvc1wiLFxuICAgIFwibm9kZTpwYXRoXCIsXG4gICAgXCJwYXRoXCIsXG4gICAgXCJub2RlOnBhdGgvcG9zaXhcIixcbiAgICBcInBhdGgvcG9zaXhcIixcbiAgICBcIm5vZGU6cGF0aC93aW4zMlwiLFxuICAgIFwicGF0aC93aW4zMlwiLFxuICAgIFwibm9kZTpwZXJmX2hvb2tzXCIsXG4gICAgXCJwZXJmX2hvb2tzXCIsXG4gICAgXCJub2RlOnByb2Nlc3NcIixcbiAgICBcInByb2Nlc3NcIixcbiAgICBcIm5vZGU6cXVlcnlzdHJpbmdcIixcbiAgICBcInF1ZXJ5c3RyaW5nXCIsXG4gICAgXCJub2RlOnF1aWNcIixcbiAgICBcIm5vZGU6cmVhZGxpbmVcIixcbiAgICBcInJlYWRsaW5lXCIsXG4gICAgXCJub2RlOnJlYWRsaW5lL3Byb21pc2VzXCIsXG4gICAgXCJyZWFkbGluZS9wcm9taXNlc1wiLFxuICAgIFwibm9kZTpyZXBsXCIsXG4gICAgXCJyZXBsXCIsXG4gICAgXCJub2RlOnNlYVwiLFxuICAgIFwibm9kZTpzcWxpdGVcIixcbiAgICBcIm5vZGU6c3RyZWFtXCIsXG4gICAgXCJzdHJlYW1cIixcbiAgICBcIm5vZGU6c3RyZWFtL2NvbnN1bWVyc1wiLFxuICAgIFwic3RyZWFtL2NvbnN1bWVyc1wiLFxuICAgIFwibm9kZTpzdHJlYW0vcHJvbWlzZXNcIixcbiAgICBcInN0cmVhbS9wcm9taXNlc1wiLFxuICAgIFwibm9kZTpzdHJlYW0vd2ViXCIsXG4gICAgXCJzdHJlYW0vd2ViXCIsXG4gICAgXCJub2RlOnN0cmluZ19kZWNvZGVyXCIsXG4gICAgXCJzdHJpbmdfZGVjb2RlclwiLFxuICAgIFwibm9kZTp0ZXN0XCIsXG4gICAgXCJub2RlOnRlc3QvcmVwb3J0ZXJzXCIsXG4gICAgXCJub2RlOnRpbWVyc1wiLFxuICAgIFwidGltZXJzXCIsXG4gICAgXCJub2RlOnRpbWVycy9wcm9taXNlc1wiLFxuICAgIFwidGltZXJzL3Byb21pc2VzXCIsXG4gICAgXCJub2RlOnRsc1wiLFxuICAgIFwidGxzXCIsXG4gICAgXCJub2RlOnRyYWNlX2V2ZW50c1wiLFxuICAgIFwidHJhY2VfZXZlbnRzXCIsXG4gICAgXCJub2RlOnR0eVwiLFxuICAgIFwidHR5XCIsXG4gICAgXCJub2RlOnVybFwiLFxuICAgIFwidXJsXCIsXG4gICAgXCJub2RlOnV0aWxcIixcbiAgICBcInV0aWxcIixcbiAgICBcIm5vZGU6dXRpbC90eXBlc1wiLFxuICAgIFwidXRpbC90eXBlc1wiLFxuICAgIFwibm9kZTp2OFwiLFxuICAgIFwidjhcIixcbiAgICBcIm5vZGU6dm1cIixcbiAgICBcInZtXCIsXG4gICAgXCJub2RlOndhc2lcIixcbiAgICBcIndhc2lcIixcbiAgICBcIm5vZGU6d29ya2VyX3RocmVhZHNcIixcbiAgICBcIndvcmtlcl90aHJlYWRzXCIsXG4gICAgXCJub2RlOnpsaWJcIixcbiAgICBcInpsaWJcIlxuXTtcbmV4cG9ydCBkZWZhdWx0IGJ1aWx0aW5Nb2R1bGVzO1xuIiwgIi8qKlxuICogU2VyZGUgY29tcGxpYW5jZSBjaGVja2VyIGZvciB3b3JrZmxvdyBjdXN0b20gY2xhc3Mgc2VyaWFsaXphdGlvbi5cbiAqXG4gKiBBbmFseXplcyBzb3VyY2UgY29kZSB0byBkZXRlcm1pbmUgaWYgY2xhc3NlcyB3aXRoIFdPUktGTE9XX1NFUklBTElaRSAvXG4gKiBXT1JLRkxPV19ERVNFUklBTElaRSBhcmUgY29ycmVjdGx5IHNldCB1cCBmb3IgdGhlIHdvcmtmbG93IHNhbmRib3guXG4gKlxuICogVXNlZCBieTpcbiAqIC0gQ0xJIGB2YWxpZGF0ZWAgY29tbWFuZFxuICogLSBDTEkgYHRyYW5zZm9ybWAgY29tbWFuZCAoLS1jaGVjay1zZXJkZSlcbiAqIC0gU1dDIHBsYXlncm91bmQgc2VyZGUgYW5hbHlzaXMgcGFuZWxcbiAqIC0gQnVpbGQtdGltZSB3YXJuaW5ncyBpbiBCYXNlQnVpbGRlclxuICovXG5cbmltcG9ydCBidWlsdGluTW9kdWxlcyBmcm9tICdidWlsdGluLW1vZHVsZXMnO1xuaW1wb3J0IHR5cGUgeyBXb3JrZmxvd01hbmlmZXN0IH0gZnJvbSAnLi9hcHBseS1zd2MtdHJhbnNmb3JtLmpzJztcblxuLy8gQnVpbGQgYSByZWdleCB0aGF0IG1hdGNoZXMgTm9kZS5qcyBidWlsdC1pbiBtb2R1bGUgaW1wb3J0cyBpbiB0cmFuc2Zvcm1lZCBjb2RlLlxuLy8gSGFuZGxlcyBib3RoIEVTTSAoYGZyb20gJ2ZzJ2AsIGBmcm9tICdub2RlOmZzJ2ApIGFuZCBDSlMgKGByZXF1aXJlKCdmcycpYClcbmNvbnN0IG5vZGVCdWlsdGlucyA9IGJ1aWx0aW5Nb2R1bGVzLmpvaW4oJ3wnKTtcblxuLy8gUmVnZXggdG8gZXh0cmFjdCBzcGVjaWZpYyBtb2R1bGUgbmFtZXMgZnJvbSBpbXBvcnQvcmVxdWlyZSBzdGF0ZW1lbnRzXG5jb25zdCBub2RlSW1wb3J0RXh0cmFjdFJlZ2V4ID0gbmV3IFJlZ0V4cChcbiAgYCg/OmZyb21cXFxccytbJ1wiXSg/Om5vZGU6KT8oKD86JHtub2RlQnVpbHRpbnN9KSg/Oi9bXidcIl0qKT8pWydcIl1gICtcbiAgICBgfHJlcXVpcmVcXFxccypcXFxcKFxcXFxzKlsnXCJdKD86bm9kZTopPygoPzoke25vZGVCdWlsdGluc30pKD86L1teJ1wiXSopPylbJ1wiXVxcXFxzKlxcXFwpKWAsXG4gICdnJ1xuKTtcblxuLy8gUmVnZXggdG8gZGV0ZWN0IGNsYXNzIHJlZ2lzdHJhdGlvbiBJSUZFcyBnZW5lcmF0ZWQgYnkgdGhlIFNXQyBwbHVnaW5cbmNvbnN0IHJlZ2lzdHJhdGlvbklpZmVSZWdleCA9XG4gIC9TeW1ib2xcXC5mb3JcXHMqXFwoXFxzKltcIiddd29ya2Zsb3ctY2xhc3MtcmVnaXN0cnlbXCInXVxccypcXCkvO1xuXG4vKipcbiAqIFJlc3VsdCBvZiBjaGVja2luZyBhIHNpbmdsZSBjbGFzcyBmb3Igc2VyZGUgY29tcGxpYW5jZS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBTZXJkZUNsYXNzQ2hlY2tSZXN1bHQge1xuICAvKiogVGhlIGNsYXNzIG5hbWUgYXMgZGV0ZWN0ZWQgaW4gdGhlIHNvdXJjZSAqL1xuICBjbGFzc05hbWU6IHN0cmluZztcbiAgLyoqIFRoZSBjbGFzc0lkIGFzc2lnbmVkIGJ5IHRoZSBTV0MgcGx1Z2luIChmcm9tIHRoZSBtYW5pZmVzdCkgKi9cbiAgY2xhc3NJZDogc3RyaW5nO1xuICAvKiogV2hldGhlciB0aGUgU1dDIHBsdWdpbiBkZXRlY3RlZCBzZXJkZSBzeW1ib2xzIG9uIHRoaXMgY2xhc3MgKi9cbiAgZGV0ZWN0ZWQ6IGJvb2xlYW47XG4gIC8qKiBXaGV0aGVyIGEgcmVnaXN0cmF0aW9uIElJRkUgd2FzIGdlbmVyYXRlZCBpbiB0aGUgb3V0cHV0ICovXG4gIHJlZ2lzdGVyZWQ6IGJvb2xlYW47XG4gIC8qKlxuICAgKiBOb2RlLmpzIGJ1aWx0LWluIG1vZHVsZSBpbXBvcnRzIHJlbWFpbmluZyBpbiB0aGUgd29ya2Zsb3ctbW9kZSBvdXRwdXQuXG4gICAqIElmIG5vbi1lbXB0eSwgdGhlIGNsYXNzIGlzIE5PVCB3b3JrZmxvdy1zYW5kYm94IGNvbXBsaWFudC5cbiAgICovXG4gIG5vZGVJbXBvcnRzOiBzdHJpbmdbXTtcbiAgLyoqIFdoZXRoZXIgdGhlIGNsYXNzIHBhc3NlcyBhbGwgY29tcGxpYW5jZSBjaGVja3MgKi9cbiAgY29tcGxpYW50OiBib29sZWFuO1xuICAvKiogSHVtYW4tcmVhZGFibGUgZGVzY3JpcHRpb25zIG9mIGFueSBpc3N1ZXMgZm91bmQgKi9cbiAgaXNzdWVzOiBzdHJpbmdbXTtcbn1cblxuLyoqXG4gKiBGdWxsIHJlc3VsdCBvZiBzZXJkZSBjb21wbGlhbmNlIGFuYWx5c2lzIGZvciBhIHNvdXJjZSBmaWxlLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFNlcmRlQ2hlY2tSZXN1bHQge1xuICAvKiogUGVyLWNsYXNzIGFuYWx5c2lzIHJlc3VsdHMgKi9cbiAgY2xhc3NlczogU2VyZGVDbGFzc0NoZWNrUmVzdWx0W107XG4gIC8qKiBBbGwgTm9kZS5qcyBidWlsdC1pbiBpbXBvcnRzIGZvdW5kIGluIHRoZSB3b3JrZmxvdy1tb2RlIG91dHB1dCAqL1xuICBnbG9iYWxOb2RlSW1wb3J0czogc3RyaW5nW107XG4gIC8qKiBXaGV0aGVyIHRoZSB3b3JrZmxvdy1tb2RlIG91dHB1dCBjb250YWlucyBhbnkgc2VyZGUtcmVsYXRlZCBjbGFzc2VzICovXG4gIGhhc1NlcmRlQ2xhc3NlczogYm9vbGVhbjtcbiAgLyoqIFRoZSByYXcgd29ya2Zsb3cgbWFuaWZlc3QgZXh0cmFjdGVkIGZyb20gdGhlIFNXQyB0cmFuc2Zvcm0gKi9cbiAgbWFuaWZlc3Q6IFdvcmtmbG93TWFuaWZlc3Q7XG59XG5cbi8qKlxuICogTGlnaHR3ZWlnaHQgc2VyZGUgY29tcGxpYW5jZSBjaGVja2VyIHRoYXQgd29ya3Mgd2l0aCBwcmUtY29tcHV0ZWRcbiAqIFNXQyB0cmFuc2Zvcm0gcmVzdWx0cy4gVGhpcyBhdm9pZHMgcmUtcnVubmluZyB0aGUgU1dDIHRyYW5zZm9ybVxuICogd2hlbiB0aGUgY2FsbGVyIGFscmVhZHkgaGFzIHRoZSBvdXRwdXRzIChlLmcuLCB0aGUgcGxheWdyb3VuZCBvciBidWlsZGVyKS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFuYWx5emVTZXJkZUNvbXBsaWFuY2Uob3B0aW9uczoge1xuICAvKiogU291cmNlIGNvZGUgKHVzZWQgZm9yIHBhdHRlcm4gZGV0ZWN0aW9uKSAqL1xuICBzb3VyY2VDb2RlOiBzdHJpbmc7XG4gIC8qKiBXb3JrZmxvdy1tb2RlIHRyYW5zZm9ybWVkIG91dHB1dCAqL1xuICB3b3JrZmxvd0NvZGU6IHN0cmluZztcbiAgLyoqIE1hbmlmZXN0IGV4dHJhY3RlZCBmcm9tIHRoZSBTV0MgdHJhbnNmb3JtICovXG4gIG1hbmlmZXN0OiBXb3JrZmxvd01hbmlmZXN0O1xufSk6IFNlcmRlQ2hlY2tSZXN1bHQge1xuICBjb25zdCB7IHNvdXJjZUNvZGUsIHdvcmtmbG93Q29kZSwgbWFuaWZlc3QgfSA9IG9wdGlvbnM7XG5cbiAgLy8gMS4gRXh0cmFjdCBhbGwgTm9kZS5qcyBidWlsdC1pbiBpbXBvcnRzIGZyb20gdGhlIHdvcmtmbG93IG91dHB1dFxuICBjb25zdCBnbG9iYWxOb2RlSW1wb3J0cyA9IGV4dHJhY3ROb2RlSW1wb3J0cyh3b3JrZmxvd0NvZGUpO1xuXG4gIC8vIDIuIENoZWNrIGlmIHRoZSBtYW5pZmVzdCBjb250YWlucyBhbnkgc2VyZGUtcmVnaXN0ZXJlZCBjbGFzc2VzXG4gIGNvbnN0IGNsYXNzRW50cmllcyA9IGV4dHJhY3RDbGFzc0VudHJpZXMobWFuaWZlc3QpO1xuICBjb25zdCBoYXNTZXJkZUNsYXNzZXMgPSBjbGFzc0VudHJpZXMubGVuZ3RoID4gMDtcblxuICAvLyAzLiBDaGVjayBpZiB0aGUgd29ya2Zsb3cgb3V0cHV0IGNvbnRhaW5zIHJlZ2lzdHJhdGlvbiBJSUZFc1xuICBjb25zdCBoYXNSZWdpc3RyYXRpb24gPSByZWdpc3RyYXRpb25JaWZlUmVnZXgudGVzdCh3b3JrZmxvd0NvZGUpO1xuXG4gIC8vIDQuIEFuYWx5emUgZWFjaCBjbGFzc1xuICBjb25zdCBjbGFzc2VzOiBTZXJkZUNsYXNzQ2hlY2tSZXN1bHRbXSA9IGNsYXNzRW50cmllcy5tYXAoKGVudHJ5KSA9PiB7XG4gICAgY29uc3QgaXNzdWVzOiBzdHJpbmdbXSA9IFtdO1xuXG4gICAgLy8gQ2hlY2sgZm9yIE5vZGUuanMgaW1wb3J0cyAodGhlc2Ugd2lsbCBmYWlsIGluIHRoZSB3b3JrZmxvdyBzYW5kYm94KVxuICAgIGlmIChnbG9iYWxOb2RlSW1wb3J0cy5sZW5ndGggPiAwKSB7XG4gICAgICBpc3N1ZXMucHVzaChcbiAgICAgICAgYFdvcmtmbG93IGJ1bmRsZSBjb250YWlucyBOb2RlLmpzIGJ1aWx0LWluIGltcG9ydHM6ICR7Z2xvYmFsTm9kZUltcG9ydHMuam9pbignLCAnKX0uIGAgK1xuICAgICAgICAgIGBUaGVzZSB3aWxsIGZhaWwgYXQgcnVudGltZSBpbiB0aGUgd29ya2Zsb3cgc2FuZGJveC4gYCArXG4gICAgICAgICAgYEFkZCBcInVzZSBzdGVwXCIgdG8gbWV0aG9kcyB0aGF0IGRlcGVuZCBvbiBOb2RlLmpzIEFQSXMgc28gdGhleSBhcmUgc3RyaXBwZWQgZnJvbSB0aGUgd29ya2Zsb3cgYnVuZGxlLmBcbiAgICAgICk7XG4gICAgfVxuXG4gICAgLy8gQ2hlY2sgZm9yIHJlZ2lzdHJhdGlvblxuICAgIGlmICghaGFzUmVnaXN0cmF0aW9uKSB7XG4gICAgICBpc3N1ZXMucHVzaChcbiAgICAgICAgYE5vIGNsYXNzIHJlZ2lzdHJhdGlvbiBJSUZFIHdhcyBnZW5lcmF0ZWQuIGAgK1xuICAgICAgICAgIGBFbnN1cmUgV09SS0ZMT1dfU0VSSUFMSVpFIGFuZCBXT1JLRkxPV19ERVNFUklBTElaRSBhcmUgZGVmaW5lZCBhcyBzdGF0aWMgbWV0aG9kcyBgICtcbiAgICAgICAgICBgaW5zaWRlIHRoZSBjbGFzcyBib2R5IHVzaW5nIGNvbXB1dGVkIHByb3BlcnR5IHN5bnRheDogc3RhdGljIFtXT1JLRkxPV19TRVJJQUxJWkVdKC4uLikgeyAuLi4gfWBcbiAgICAgICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIGNsYXNzTmFtZTogZW50cnkuY2xhc3NOYW1lLFxuICAgICAgY2xhc3NJZDogZW50cnkuY2xhc3NJZCxcbiAgICAgIGRldGVjdGVkOiB0cnVlLFxuICAgICAgcmVnaXN0ZXJlZDogaGFzUmVnaXN0cmF0aW9uLFxuICAgICAgbm9kZUltcG9ydHM6IGdsb2JhbE5vZGVJbXBvcnRzLFxuICAgICAgY29tcGxpYW50OiBnbG9iYWxOb2RlSW1wb3J0cy5sZW5ndGggPT09IDAgJiYgaGFzUmVnaXN0cmF0aW9uLFxuICAgICAgaXNzdWVzLFxuICAgIH07XG4gIH0pO1xuXG4gIC8vIDUuIENoZWNrIGZvciBjbGFzc2VzIHRoYXQgaGF2ZSBzZXJkZSBwYXR0ZXJucyBpbiBzb3VyY2UgYnV0IHdlcmVuJ3QgZGV0ZWN0ZWQgYnkgU1dDXG4gIGNvbnN0IHNvdXJjZUhhc1NlcmRlUGF0dGVybnMgPVxuICAgIC9cXFtcXHMqV09SS0ZMT1dfKD86U0VSSUFMSVpFfERFU0VSSUFMSVpFKVxccypcXF0vLnRlc3Qoc291cmNlQ29kZSkgfHxcbiAgICAvU3ltYm9sXFwuZm9yXFxzKlxcKFxccypbJ1wiXXdvcmtmbG93LSg/OnNlcmlhbGl6ZXxkZXNlcmlhbGl6ZSlbJ1wiXVxccypcXCkvLnRlc3QoXG4gICAgICBzb3VyY2VDb2RlXG4gICAgKTtcblxuICBpZiAoc291cmNlSGFzU2VyZGVQYXR0ZXJucyAmJiBjbGFzc0VudHJpZXMubGVuZ3RoID09PSAwKSB7XG4gICAgY2xhc3Nlcy5wdXNoKHtcbiAgICAgIGNsYXNzTmFtZTogJzx1bmtub3duPicsXG4gICAgICBjbGFzc0lkOiAnJyxcbiAgICAgIGRldGVjdGVkOiBmYWxzZSxcbiAgICAgIHJlZ2lzdGVyZWQ6IGZhbHNlLFxuICAgICAgbm9kZUltcG9ydHM6IGdsb2JhbE5vZGVJbXBvcnRzLFxuICAgICAgY29tcGxpYW50OiBmYWxzZSxcbiAgICAgIGlzc3VlczogW1xuICAgICAgICBgU291cmNlIGNvZGUgY29udGFpbnMgV09SS0ZMT1dfU0VSSUFMSVpFL1dPUktGTE9XX0RFU0VSSUFMSVpFIHBhdHRlcm5zIGJ1dCBgICtcbiAgICAgICAgICBgdGhlIFNXQyBwbHVnaW4gZGlkIG5vdCBkZXRlY3QgYW55IHNlcmRlLWVuYWJsZWQgY2xhc3Nlcy4gYCArXG4gICAgICAgICAgYEVuc3VyZSB0aGUgc3ltYm9scyBhcmUgZGVmaW5lZCBhcyBzdGF0aWMgbWV0aG9kcyBJTlNJREUgdGhlIGNsYXNzIGJvZHksIGAgK1xuICAgICAgICAgIGBub3QgYXNzaWduZWQgZXh0ZXJuYWxseSAoZS5nLiwgKE15Q2xhc3MgYXMgYW55KVtXT1JLRkxPV19TRVJJQUxJWkVdID0gLi4uKS5gLFxuICAgICAgXSxcbiAgICB9KTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgY2xhc3NlcyxcbiAgICBnbG9iYWxOb2RlSW1wb3J0cyxcbiAgICBoYXNTZXJkZUNsYXNzZXMsXG4gICAgbWFuaWZlc3QsXG4gIH07XG59XG5cbi8qKlxuICogRXh0cmFjdCBOb2RlLmpzIGJ1aWx0LWluIG1vZHVsZSBuYW1lcyBmcm9tIHRyYW5zZm9ybWVkIGNvZGUuXG4gKi9cbmZ1bmN0aW9uIGV4dHJhY3ROb2RlSW1wb3J0cyhjb2RlOiBzdHJpbmcpOiBzdHJpbmdbXSB7XG4gIGNvbnN0IGltcG9ydHMgPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgLy8gUmVzZXQgcmVnZXggc3RhdGVcbiAgbm9kZUltcG9ydEV4dHJhY3RSZWdleC5sYXN0SW5kZXggPSAwO1xuICBmb3IgKFxuICAgIGxldCBtYXRjaCA9IG5vZGVJbXBvcnRFeHRyYWN0UmVnZXguZXhlYyhjb2RlKTtcbiAgICBtYXRjaCAhPT0gbnVsbDtcbiAgICBtYXRjaCA9IG5vZGVJbXBvcnRFeHRyYWN0UmVnZXguZXhlYyhjb2RlKVxuICApIHtcbiAgICAvLyBtYXRjaFsxXSBpcyBmcm9tIHRoZSBFU00gcGF0dGVybiwgbWF0Y2hbMl0gaXMgZnJvbSB0aGUgQ0pTIHBhdHRlcm5cbiAgICBjb25zdCBtb2R1bGVOYW1lID0gbWF0Y2hbMV0gfHwgbWF0Y2hbMl07XG4gICAgaWYgKG1vZHVsZU5hbWUpIHtcbiAgICAgIC8vIE5vcm1hbGl6ZSB0byBiYXNlIG1vZHVsZSBuYW1lIChlLmcuLCAnZnMvcHJvbWlzZXMnIC0+ICdmcycpXG4gICAgICBpbXBvcnRzLmFkZChtb2R1bGVOYW1lLnNwbGl0KCcvJylbMF0pO1xuICAgIH1cbiAgfVxuICByZXR1cm4gWy4uLmltcG9ydHNdLnNvcnQoKTtcbn1cblxuLyoqXG4gKiBFeHRyYWN0IGNsYXNzIGVudHJpZXMgZnJvbSBhIFdvcmtmbG93TWFuaWZlc3QuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBleHRyYWN0Q2xhc3NFbnRyaWVzKFxuICBtYW5pZmVzdDogV29ya2Zsb3dNYW5pZmVzdFxuKTogQXJyYXk8eyBjbGFzc05hbWU6IHN0cmluZzsgY2xhc3NJZDogc3RyaW5nOyBmaWxlTmFtZTogc3RyaW5nIH0+IHtcbiAgY29uc3QgZW50cmllczogQXJyYXk8e1xuICAgIGNsYXNzTmFtZTogc3RyaW5nO1xuICAgIGNsYXNzSWQ6IHN0cmluZztcbiAgICBmaWxlTmFtZTogc3RyaW5nO1xuICB9PiA9IFtdO1xuICBpZiAoIW1hbmlmZXN0LmNsYXNzZXMpIHJldHVybiBlbnRyaWVzO1xuXG4gIGZvciAoY29uc3QgW2ZpbGVOYW1lLCBjbGFzc2VzXSBvZiBPYmplY3QuZW50cmllcyhtYW5pZmVzdC5jbGFzc2VzKSkge1xuICAgIGZvciAoY29uc3QgW2NsYXNzTmFtZSwgeyBjbGFzc0lkIH1dIG9mIE9iamVjdC5lbnRyaWVzKGNsYXNzZXMpKSB7XG4gICAgICBlbnRyaWVzLnB1c2goeyBjbGFzc05hbWUsIGNsYXNzSWQsIGZpbGVOYW1lIH0pO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZW50cmllcztcbn1cbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQUEsMkVBQUFBLFNBQUE7QUFFSSxRQUFJLElBQUk7QUFDWixRQUFJLElBQUksSUFBSTtBQUNaLFFBQUksSUFBSSxJQUFJO0FBQ1osUUFBSSxJQUFJLElBQUk7QUFDWixRQUFJLElBQUksSUFBSTtBQUNaLFFBQUksSUFBSSxJQUFJO0FBYVIsSUFBQUEsUUFBTyxVQUFVLFNBQVMsS0FBSyxTQUFTO0FBQ3hDLGdCQUFVLFdBQVcsQ0FBQztBQUN0QixVQUFJLE9BQU8sT0FBTztBQUNsQixVQUFJLFNBQVMsWUFBWSxJQUFJLFNBQVMsR0FBRztBQUNyQyxlQUFPLE1BQU0sR0FBRztBQUFBLE1BQ3BCLFdBQVcsU0FBUyxZQUFZLFNBQVMsR0FBRyxHQUFHO0FBQzNDLGVBQU8sUUFBUSxPQUFPLFFBQVEsR0FBRyxJQUFJLFNBQVMsR0FBRztBQUFBLE1BQ3JEO0FBQ0EsWUFBTSxJQUFJLE1BQU0sMERBQTBELEtBQUssVUFBVSxHQUFHLENBQUM7QUFBQSxJQUNqRztBQU9JLGFBQVMsTUFBTSxLQUFLO0FBQ3BCLFlBQU0sT0FBTyxHQUFHO0FBQ2hCLFVBQUksSUFBSSxTQUFTLEtBQUs7QUFDbEI7QUFBQSxNQUNKO0FBQ0EsVUFBSSxRQUFRLG1JQUFtSSxLQUFLLEdBQUc7QUFDdkosVUFBSSxDQUFDLE9BQU87QUFDUjtBQUFBLE1BQ0o7QUFDQSxVQUFJLElBQUksV0FBVyxNQUFNLENBQUMsQ0FBQztBQUMzQixVQUFJLFFBQVEsTUFBTSxDQUFDLEtBQUssTUFBTSxZQUFZO0FBQzFDLGNBQU8sTUFBSztBQUFBLFFBQ1IsS0FBSztBQUFBLFFBQ0wsS0FBSztBQUFBLFFBQ0wsS0FBSztBQUFBLFFBQ0wsS0FBSztBQUFBLFFBQ0wsS0FBSztBQUNELGlCQUFPLElBQUk7QUFBQSxRQUNmLEtBQUs7QUFB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QTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQ0o7QUFDQSxJQUFPLDBCQUFROzs7QUNoR2YsSUFBQSxlQUFBLHdCQUFBLEtBQUEsR0FBQTtBQUdBLElBQUEseUJBQUEsSUFBQSxPQUFBLGdDQUF3RSxZQUFBLDBEQUFBLFlBQUEsOEJBQUEsR0FBQTsiLAogICJuYW1lcyI6IFsibW9kdWxlIiwgIm1zIiwgIm1zIiwgIl90c19kaXNwb3NlX3Jlc291cmNlcyIsICJlbnYiXQp9Cg==
`;

const handler = workflowEntrypoint(workflowCode);

export const HEAD = handler;
export const POST = handler;