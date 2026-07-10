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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL21zQDIuMS4zL25vZGVfbW9kdWxlcy9tcy9pbmRleC5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vQHdvcmtmbG93K3V0aWxzQDQuMS4zL25vZGVfbW9kdWxlcy9Ad29ya2Zsb3cvdXRpbHMvc3JjL3RpbWUudHMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL0B3b3JrZmxvdytlcnJvcnNANC4xLjQvbm9kZV9tb2R1bGVzL0B3b3JrZmxvdy9lcnJvcnMvc3JjL2luZGV4LnRzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9Ad29ya2Zsb3crY29yZUA0LjYuMC9ub2RlX21vZHVsZXMvQHdvcmtmbG93L2NvcmUvc3JjL3N5bWJvbHMudHMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL0B3b3JrZmxvdytjb3JlQDQuNi4wL25vZGVfbW9kdWxlcy9Ad29ya2Zsb3cvY29yZS9zcmMvc2xlZXAudHMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL0B3b3JrZmxvdytjb3JlQDQuNi4wL25vZGVfbW9kdWxlcy9Ad29ya2Zsb3cvY29yZS9zcmMvd29ya2Zsb3cvZ2V0LXdvcmtmbG93LW1ldGFkYXRhLnRzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9Ad29ya2Zsb3crY29yZUA0LjYuMC9ub2RlX21vZHVsZXMvQHdvcmtmbG93L2NvcmUvc3JjL3dvcmtmbG93L2NyZWF0ZS1ob29rLnRzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS93b3JrZmxvd0A0LjYuMF9AbmVzdGpzK2NvbW1vbkAxMS4xLjI4X3JlZmxlY3QtbWV0YWRhdGFAMC4yLjJfcnhqc0A3LjguMl9fQG5lc3Rqcytjb3JlQDFfMmQwZThiODg4NWYyMDQwNDhjZjA1MjlkOGUxM2IxYzcvbm9kZV9tb2R1bGVzL3dvcmtmbG93L3NyYy9zdGRsaWIudHMiLCAiLi4vLi4vY29yZS9leHByZXNzaW9ucy9zcmMvZXZhbHVhdGUudHMiLCAic3RlcHMvZXhlY3V0b3JzLnRzIiwgIndvcmtmbG93cy9ydW4tZXhlY3V0aW9uLXBsYW4udHMiLCAid29ya2Zsb3dzL3NwaWtlLnRzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9idWlsdGluLW1vZHVsZXNANS4wLjBfcGF0Y2hfaGFzaD05MGM3MTA4YzA5MWNhNWMzYmViYTZjMjZiNzE4MzAyZTcyOGU3OGViOGJmYzNhNGVkNDkyYmMxNjU3Mzc2ZDRhL25vZGVfbW9kdWxlcy9idWlsdGluLW1vZHVsZXMvaW5kZXguanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL0B3b3JrZmxvdytidWlsZGVyc0A0LjEuMS9ub2RlX21vZHVsZXMvQHdvcmtmbG93L2J1aWxkZXJzL3NyYy9zZXJkZS1jaGVja2VyLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyIvKipcbiAqIEhlbHBlcnMuXG4gKi8gdmFyIHMgPSAxMDAwO1xudmFyIG0gPSBzICogNjA7XG52YXIgaCA9IG0gKiA2MDtcbnZhciBkID0gaCAqIDI0O1xudmFyIHcgPSBkICogNztcbnZhciB5ID0gZCAqIDM2NS4yNTtcbi8qKlxuICogUGFyc2Ugb3IgZm9ybWF0IHRoZSBnaXZlbiBgdmFsYC5cbiAqXG4gKiBPcHRpb25zOlxuICpcbiAqICAtIGBsb25nYCB2ZXJib3NlIGZvcm1hdHRpbmcgW2ZhbHNlXVxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfE51bWJlcn0gdmFsXG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXG4gKiBAdGhyb3dzIHtFcnJvcn0gdGhyb3cgYW4gZXJyb3IgaWYgdmFsIGlzIG5vdCBhIG5vbi1lbXB0eSBzdHJpbmcgb3IgYSBudW1iZXJcbiAqIEByZXR1cm4ge1N0cmluZ3xOdW1iZXJ9XG4gKiBAYXBpIHB1YmxpY1xuICovIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24odmFsLCBvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgdmFyIHR5cGUgPSB0eXBlb2YgdmFsO1xuICAgIGlmICh0eXBlID09PSAnc3RyaW5nJyAmJiB2YWwubGVuZ3RoID4gMCkge1xuICAgICAgICByZXR1cm4gcGFyc2UodmFsKTtcbiAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICdudW1iZXInICYmIGlzRmluaXRlKHZhbCkpIHtcbiAgICAgICAgcmV0dXJuIG9wdGlvbnMubG9uZyA/IGZtdExvbmcodmFsKSA6IGZtdFNob3J0KHZhbCk7XG4gICAgfVxuICAgIHRocm93IG5ldyBFcnJvcigndmFsIGlzIG5vdCBhIG5vbi1lbXB0eSBzdHJpbmcgb3IgYSB2YWxpZCBudW1iZXIuIHZhbD0nICsgSlNPTi5zdHJpbmdpZnkodmFsKSk7XG59O1xuLyoqXG4gKiBQYXJzZSB0aGUgZ2l2ZW4gYHN0cmAgYW5kIHJldHVybiBtaWxsaXNlY29uZHMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7TnVtYmVyfVxuICogQGFwaSBwcml2YXRlXG4gKi8gZnVuY3Rpb24gcGFyc2Uoc3RyKSB7XG4gICAgc3RyID0gU3RyaW5nKHN0cik7XG4gICAgaWYgKHN0ci5sZW5ndGggPiAxMDApIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgbWF0Y2ggPSAvXigtPyg/OlxcZCspP1xcLj9cXGQrKSAqKG1pbGxpc2Vjb25kcz98bXNlY3M/fG1zfHNlY29uZHM/fHNlY3M/fHN8bWludXRlcz98bWlucz98bXxob3Vycz98aHJzP3xofGRheXM/fGR8d2Vla3M/fHd8eWVhcnM/fHlycz98eSk/JC9pLmV4ZWMoc3RyKTtcbiAgICBpZiAoIW1hdGNoKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIG4gPSBwYXJzZUZsb2F0KG1hdGNoWzFdKTtcbiAgICB2YXIgdHlwZSA9IChtYXRjaFsyXSB8fCAnbXMnKS50b0xvd2VyQ2FzZSgpO1xuICAgIHN3aXRjaCh0eXBlKXtcbiAgICAgICAgY2FzZSAneWVhcnMnOlxuICAgICAgICBjYXNlICd5ZWFyJzpcbiAgICAgICAgY2FzZSAneXJzJzpcbiAgICAgICAgY2FzZSAneXInOlxuICAgICAgICBjYXNlICd5JzpcbiAgICAgICAgICAgIHJldHVybiBuICogeTtcbiAgICAgICAgY2FzZSAnd2Vla3MnOlxuICAgICAgICBjYXNlICd3ZWVrJzpcbiAgICAgICAgY2FzZSAndyc6XG4gICAgICAgICAgICByZXR1cm4gbiAqIHc7XG4gICAgICAgIGNhc2UgJ2RheXMnOlxuICAgICAgICBjYXNlICdkYXknOlxuICAgICAgICBjYXNlICdkJzpcbiAgICAgICAgICAgIHJldHVybiBuICogZDtcbiAgICAgICAgY2FzZSAnaG91cnMnOlxuICAgICAgICBjYXNlICdob3VyJzpcbiAgICAgICAgY2FzZSAnaHJzJzpcbiAgICAgICAgY2FzZSAnaHInOlxuICAgICAgICBjYXNlICdoJzpcbiAgICAgICAgICAgIHJldHVybiBuICogaDtcbiAgICAgICAgY2FzZSAnbWludXRlcyc6XG4gICAgICAgIGNhc2UgJ21pbnV0ZSc6XG4gICAgICAgIGNhc2UgJ21pbnMnOlxuICAgICAgICBjYXNlICdtaW4nOlxuICAgICAgICBjYXNlICdtJzpcbiAgICAgICAgICAgIHJldHVybiBuICogbTtcbiAgICAgICAgY2FzZSAnc2Vjb25kcyc6XG4gICAgICAgIGNhc2UgJ3NlY29uZCc6XG4gICAgICAgIGNhc2UgJ3NlY3MnOlxuICAgICAgICBjYXNlICdzZWMnOlxuICAgICAgICBjYXNlICdzJzpcbiAgICAgICAgICAgIHJldHVybiBuICogcztcbiAgICAgICAgY2FzZSAnbWlsbGlzZWNvbmRzJzpcbiAgICAgICAgY2FzZSAnbWlsbGlzZWNvbmQnOlxuICAgICAgICBjYXNlICdtc2Vjcyc6XG4gICAgICAgIGNhc2UgJ21zZWMnOlxuICAgICAgICBjYXNlICdtcyc6XG4gICAgICAgICAgICByZXR1cm4gbjtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxufVxuLyoqXG4gKiBTaG9ydCBmb3JtYXQgZm9yIGBtc2AuXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IG1zXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqLyBmdW5jdGlvbiBmbXRTaG9ydChtcykge1xuICAgIHZhciBtc0FicyA9IE1hdGguYWJzKG1zKTtcbiAgICBpZiAobXNBYnMgPj0gZCkge1xuICAgICAgICByZXR1cm4gTWF0aC5yb3VuZChtcyAvIGQpICsgJ2QnO1xuICAgIH1cbiAgICBpZiAobXNBYnMgPj0gaCkge1xuICAgICAgICByZXR1cm4gTWF0aC5yb3VuZChtcyAvIGgpICsgJ2gnO1xuICAgIH1cbiAgICBpZiAobXNBYnMgPj0gbSkge1xuICAgICAgICByZXR1cm4gTWF0aC5yb3VuZChtcyAvIG0pICsgJ20nO1xuICAgIH1cbiAgICBpZiAobXNBYnMgPj0gcykge1xuICAgICAgICByZXR1cm4gTWF0aC5yb3VuZChtcyAvIHMpICsgJ3MnO1xuICAgIH1cbiAgICByZXR1cm4gbXMgKyAnbXMnO1xufVxuLyoqXG4gKiBMb25nIGZvcm1hdCBmb3IgYG1zYC5cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gbXNcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovIGZ1bmN0aW9uIGZtdExvbmcobXMpIHtcbiAgICB2YXIgbXNBYnMgPSBNYXRoLmFicyhtcyk7XG4gICAgaWYgKG1zQWJzID49IGQpIHtcbiAgICAgICAgcmV0dXJuIHBsdXJhbChtcywgbXNBYnMsIGQsICdkYXknKTtcbiAgICB9XG4gICAgaWYgKG1zQWJzID49IGgpIHtcbiAgICAgICAgcmV0dXJuIHBsdXJhbChtcywgbXNBYnMsIGgsICdob3VyJyk7XG4gICAgfVxuICAgIGlmIChtc0FicyA+PSBtKSB7XG4gICAgICAgIHJldHVybiBwbHVyYWwobXMsIG1zQWJzLCBtLCAnbWludXRlJyk7XG4gICAgfVxuICAgIGlmIChtc0FicyA+PSBzKSB7XG4gICAgICAgIHJldHVybiBwbHVyYWwobXMsIG1zQWJzLCBzLCAnc2Vjb25kJyk7XG4gICAgfVxuICAgIHJldHVybiBtcyArICcgbXMnO1xufVxuLyoqXG4gKiBQbHVyYWxpemF0aW9uIGhlbHBlci5cbiAqLyBmdW5jdGlvbiBwbHVyYWwobXMsIG1zQWJzLCBuLCBuYW1lKSB7XG4gICAgdmFyIGlzUGx1cmFsID0gbXNBYnMgPj0gbiAqIDEuNTtcbiAgICByZXR1cm4gTWF0aC5yb3VuZChtcyAvIG4pICsgJyAnICsgbmFtZSArIChpc1BsdXJhbCA/ICdzJyA6ICcnKTtcbn1cbiIsICJpbXBvcnQgdHlwZSB7IFN0cmluZ1ZhbHVlIH0gZnJvbSAnbXMnO1xuaW1wb3J0IG1zIGZyb20gJ21zJztcblxuLyoqXG4gKiBQYXJzZXMgYSBkdXJhdGlvbiBwYXJhbWV0ZXIgKHN0cmluZywgbnVtYmVyLCBvciBEYXRlKSBhbmQgcmV0dXJucyBhIERhdGUgb2JqZWN0XG4gKiByZXByZXNlbnRpbmcgd2hlbiB0aGUgZHVyYXRpb24gc2hvdWxkIGVsYXBzZS5cbiAqXG4gKiAtIEZvciBzdHJpbmdzOiBQYXJzZXMgZHVyYXRpb24gc3RyaW5ncyBsaWtlIFwiMXNcIiwgXCI1bVwiLCBcIjFoXCIsIGV0Yy4gdXNpbmcgdGhlIGBtc2AgbGlicmFyeVxuICogLSBGb3IgbnVtYmVyczogVHJlYXRzIGFzIG1pbGxpc2Vjb25kcyBmcm9tIG5vd1xuICogLSBGb3IgRGF0ZSBvYmplY3RzOiBSZXR1cm5zIHRoZSBkYXRlIGRpcmVjdGx5IChoYW5kbGVzIGJvdGggRGF0ZSBpbnN0YW5jZXMgYW5kIGRhdGUtbGlrZSBvYmplY3RzIGZyb20gZGVzZXJpYWxpemF0aW9uKVxuICpcbiAqIEBwYXJhbSBwYXJhbSAtIFRoZSBkdXJhdGlvbiBwYXJhbWV0ZXIgKFN0cmluZ1ZhbHVlLCBEYXRlLCBvciBudW1iZXIgb2YgbWlsbGlzZWNvbmRzKVxuICogQHJldHVybnMgQSBEYXRlIG9iamVjdCByZXByZXNlbnRpbmcgd2hlbiB0aGUgZHVyYXRpb24gc2hvdWxkIGVsYXBzZVxuICogQHRocm93cyB7RXJyb3J9IElmIHRoZSBwYXJhbWV0ZXIgaXMgaW52YWxpZCBvciBjYW5ub3QgYmUgcGFyc2VkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUR1cmF0aW9uVG9EYXRlKHBhcmFtOiBTdHJpbmdWYWx1ZSB8IERhdGUgfCBudW1iZXIpOiBEYXRlIHtcbiAgaWYgKHR5cGVvZiBwYXJhbSA9PT0gJ3N0cmluZycpIHtcbiAgICBjb25zdCBkdXJhdGlvbk1zID0gbXMocGFyYW0pO1xuICAgIGlmICh0eXBlb2YgZHVyYXRpb25NcyAhPT0gJ251bWJlcicgfHwgZHVyYXRpb25NcyA8IDApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgYEludmFsaWQgZHVyYXRpb246IFwiJHtwYXJhbX1cIi4gRXhwZWN0ZWQgYSB2YWxpZCBkdXJhdGlvbiBzdHJpbmcgbGlrZSBcIjFzXCIsIFwiMW1cIiwgXCIxaFwiLCBldGMuYFxuICAgICAgKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBEYXRlKERhdGUubm93KCkgKyBkdXJhdGlvbk1zKTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgcGFyYW0gPT09ICdudW1iZXInKSB7XG4gICAgaWYgKHBhcmFtIDwgMCB8fCAhTnVtYmVyLmlzRmluaXRlKHBhcmFtKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBgSW52YWxpZCBkdXJhdGlvbjogJHtwYXJhbX0uIEV4cGVjdGVkIGEgbm9uLW5lZ2F0aXZlIGZpbml0ZSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzLmBcbiAgICAgICk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgRGF0ZShEYXRlLm5vdygpICsgcGFyYW0pO1xuICB9IGVsc2UgaWYgKFxuICAgIHBhcmFtIGluc3RhbmNlb2YgRGF0ZSB8fFxuICAgIChwYXJhbSAmJlxuICAgICAgdHlwZW9mIHBhcmFtID09PSAnb2JqZWN0JyAmJlxuICAgICAgdHlwZW9mIChwYXJhbSBhcyBhbnkpLmdldFRpbWUgPT09ICdmdW5jdGlvbicpXG4gICkge1xuICAgIC8vIEhhbmRsZSBib3RoIERhdGUgaW5zdGFuY2VzIGFuZCBkYXRlLWxpa2Ugb2JqZWN0cyAoZnJvbSBkZXNlcmlhbGl6YXRpb24pXG4gICAgcmV0dXJuIHBhcmFtIGluc3RhbmNlb2YgRGF0ZSA/IHBhcmFtIDogbmV3IERhdGUoKHBhcmFtIGFzIGFueSkuZ2V0VGltZSgpKTtcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICBgSW52YWxpZCBkdXJhdGlvbiBwYXJhbWV0ZXIuIEV4cGVjdGVkIGEgZHVyYXRpb24gc3RyaW5nLCBudW1iZXIgKG1pbGxpc2Vjb25kcyksIG9yIERhdGUgb2JqZWN0LmBcbiAgICApO1xuICB9XG59XG4iLCAiaW1wb3J0IHsgcGFyc2VEdXJhdGlvblRvRGF0ZSB9IGZyb20gJ0B3b3JrZmxvdy91dGlscyc7XG5pbXBvcnQgdHlwZSB7IFN0cnVjdHVyZWRFcnJvciB9IGZyb20gJ0B3b3JrZmxvdy93b3JsZCc7XG5pbXBvcnQgdHlwZSB7IFN0cmluZ1ZhbHVlIH0gZnJvbSAnbXMnO1xuXG5jb25zdCBCQVNFX1VSTCA9ICdodHRwczovL3VzZXdvcmtmbG93LmRldi9lcnInO1xuXG4vKipcbiAqIEBpbnRlcm5hbFxuICogQ2hlY2sgaWYgYSB2YWx1ZSBpcyBhbiBFcnJvciB3aXRob3V0IHJlbHlpbmcgb24gTm9kZS5qcyB1dGlsaXRpZXMuXG4gKiBUaGlzIGlzIG5lZWRlZCBmb3IgZXJyb3IgY2xhc3NlcyB0aGF0IGNhbiBiZSB1c2VkIGluIFZNIGNvbnRleHRzIHdoZXJlXG4gKiBOb2RlLmpzIGltcG9ydHMgYXJlIG5vdCBhdmFpbGFibGUuXG4gKi9cbmZ1bmN0aW9uIGlzRXJyb3IodmFsdWU6IHVua25vd24pOiB2YWx1ZSBpcyB7IG5hbWU6IHN0cmluZzsgbWVzc2FnZTogc3RyaW5nIH0ge1xuICByZXR1cm4gKFxuICAgIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiZcbiAgICB2YWx1ZSAhPT0gbnVsbCAmJlxuICAgICduYW1lJyBpbiB2YWx1ZSAmJlxuICAgICdtZXNzYWdlJyBpbiB2YWx1ZVxuICApO1xufVxuXG4vKipcbiAqIEBpbnRlcm5hbFxuICogQWxsIHRoZSBzbHVncyBvZiB0aGUgZXJyb3JzIHVzZWQgZm9yIGRvY3VtZW50YXRpb24gbGlua3MuXG4gKi9cbmV4cG9ydCBjb25zdCBFUlJPUl9TTFVHUyA9IHtcbiAgTk9ERV9KU19NT0RVTEVfSU5fV09SS0ZMT1c6ICdub2RlLWpzLW1vZHVsZS1pbi13b3JrZmxvdycsXG4gIFNUQVJUX0lOVkFMSURfV09SS0ZMT1dfRlVOQ1RJT046ICdzdGFydC1pbnZhbGlkLXdvcmtmbG93LWZ1bmN0aW9uJyxcbiAgU0VSSUFMSVpBVElPTl9GQUlMRUQ6ICdzZXJpYWxpemF0aW9uLWZhaWxlZCcsXG4gIFdFQkhPT0tfSU5WQUxJRF9SRVNQT05EX1dJVEhfVkFMVUU6ICd3ZWJob29rLWludmFsaWQtcmVzcG9uZC13aXRoLXZhbHVlJyxcbiAgV0VCSE9PS19SRVNQT05TRV9OT1RfU0VOVDogJ3dlYmhvb2stcmVzcG9uc2Utbm90LXNlbnQnLFxuICBGRVRDSF9JTl9XT1JLRkxPV19GVU5DVElPTjogJ2ZldGNoLWluLXdvcmtmbG93JyxcbiAgVElNRU9VVF9GVU5DVElPTlNfSU5fV09SS0ZMT1c6ICd0aW1lb3V0LWluLXdvcmtmbG93JyxcbiAgSE9PS19DT05GTElDVDogJ2hvb2stY29uZmxpY3QnLFxuICBDT1JSVVBURURfRVZFTlRfTE9HOiAnY29ycnVwdGVkLWV2ZW50LWxvZycsXG4gIFJFUExBWV9ESVZFUkdFTkNFOiAncmVwbGF5LWRpdmVyZ2VuY2UnLFxuICBTVEVQX05PVF9SRUdJU1RFUkVEOiAnc3RlcC1ub3QtcmVnaXN0ZXJlZCcsXG4gIFdPUktGTE9XX05PVF9SRUdJU1RFUkVEOiAnd29ya2Zsb3ctbm90LXJlZ2lzdGVyZWQnLFxuICBSVU5USU1FX0RFQ1JZUFRJT05fRkFJTEVEOiAncnVudGltZS1kZWNyeXB0aW9uLWZhaWxlZCcsXG59IGFzIGNvbnN0O1xuXG50eXBlIEVycm9yU2x1ZyA9ICh0eXBlb2YgRVJST1JfU0xVR1MpW2tleW9mIHR5cGVvZiBFUlJPUl9TTFVHU107XG5cbmludGVyZmFjZSBXb3JrZmxvd0Vycm9yT3B0aW9ucyBleHRlbmRzIEVycm9yT3B0aW9ucyB7XG4gIC8qKlxuICAgKiBUaGUgc2x1ZyBvZiB0aGUgZXJyb3IuIFRoaXMgd2lsbCBiZSB1c2VkIHRvIGdlbmVyYXRlIGEgbGluayB0byB0aGUgZXJyb3IgZG9jdW1lbnRhdGlvbi5cbiAgICovXG4gIHNsdWc/OiBFcnJvclNsdWc7XG59XG5cbi8qKlxuICogVGhlIGJhc2UgY2xhc3MgZm9yIGFsbCBXb3JrZmxvdy1yZWxhdGVkIGVycm9ycy5cbiAqXG4gKiBUaGlzIGVycm9yIGlzIHRocm93biBieSB0aGUgV29ya2Zsb3cgU0RLIHdoZW4gaW50ZXJuYWwgb3BlcmF0aW9ucyBmYWlsLlxuICogWW91IGNhbiB1c2UgdGhpcyBjbGFzcyB3aXRoIGBpbnN0YW5jZW9mYCB0byBjYXRjaCBhbnkgV29ya2Zsb3cgU0RLIGVycm9yLlxuICpcbiAqIEBleGFtcGxlXG4gKiBgYGB0c1xuICogdHJ5IHtcbiAqICAgYXdhaXQgZ2V0UnVuKHJ1bklkKTtcbiAqIH0gY2F0Y2ggKGVycm9yKSB7XG4gKiAgIGlmIChlcnJvciBpbnN0YW5jZW9mIFdvcmtmbG93RXJyb3IpIHtcbiAqICAgICBjb25zb2xlLmVycm9yKCdXb3JrZmxvdyBTREsgZXJyb3I6JywgZXJyb3IubWVzc2FnZSk7XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICovXG5leHBvcnQgY2xhc3MgV29ya2Zsb3dFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgcmVhZG9ubHkgY2F1c2U/OiB1bmtub3duO1xuXG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2U6IHN0cmluZywgb3B0aW9ucz86IFdvcmtmbG93RXJyb3JPcHRpb25zKSB7XG4gICAgY29uc3QgbXNnRG9jcyA9IG9wdGlvbnM/LnNsdWdcbiAgICAgID8gYCR7bWVzc2FnZX1cXG5cXG5MZWFybiBtb3JlOiAke0JBU0VfVVJMfS8ke29wdGlvbnMuc2x1Z31gXG4gICAgICA6IG1lc3NhZ2U7XG4gICAgc3VwZXIobXNnRG9jcywgeyBjYXVzZTogb3B0aW9ucz8uY2F1c2UgfSk7XG4gICAgdGhpcy5jYXVzZSA9IG9wdGlvbnM/LmNhdXNlO1xuXG4gICAgaWYgKG9wdGlvbnM/LmNhdXNlIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgIHRoaXMuc3RhY2sgPSBgJHt0aGlzLnN0YWNrfVxcbkNhdXNlZCBieTogJHtvcHRpb25zLmNhdXNlLnN0YWNrfWA7XG4gICAgfVxuICB9XG5cbiAgc3RhdGljIGlzKHZhbHVlOiB1bmtub3duKTogdmFsdWUgaXMgV29ya2Zsb3dFcnJvciB7XG4gICAgcmV0dXJuIGlzRXJyb3IodmFsdWUpICYmIHZhbHVlLm5hbWUgPT09ICdXb3JrZmxvd0Vycm9yJztcbiAgfVxufVxuXG4vKipcbiAqIFRocm93biB3aGVuIGEgd29ybGQgKHN0b3JhZ2UgYmFja2VuZCkgb3BlcmF0aW9uIGZhaWxzIHVuZXhwZWN0ZWRseS5cbiAqXG4gKiBUaGlzIGlzIHRoZSBjYXRjaC1hbGwgZXJyb3IgZm9yIHdvcmxkIGltcGxlbWVudGF0aW9ucy4gU3BlY2lmaWMsXG4gKiB3ZWxsLWtub3duIGZhaWx1cmUgbW9kZXMgaGF2ZSBkZWRpY2F0ZWQgZXJyb3IgdHlwZXMgKGUuZy5cbiAqIEVudGl0eUNvbmZsaWN0RXJyb3IsIFJ1bkV4cGlyZWRFcnJvciwgVGhyb3R0bGVFcnJvcikuIFRoaXMgZXJyb3JcbiAqIGNvdmVycyBldmVyeXRoaW5nIGVsc2Ug4oCUIHZhbGlkYXRpb24gZmFpbHVyZXMsIG1pc3NpbmcgZW50aXRpZXNcbiAqIHdpdGhvdXQgYSBkZWRpY2F0ZWQgdHlwZSwgb3IgdW5leHBlY3RlZCBIVFRQIGVycm9ycyBmcm9tIHdvcmxkLXZlcmNlbC5cbiAqL1xuZXhwb3J0IGNsYXNzIFdvcmtmbG93V29ybGRFcnJvciBleHRlbmRzIFdvcmtmbG93RXJyb3Ige1xuICBzdGF0dXM/OiBudW1iZXI7XG4gIGNvZGU/OiBzdHJpbmc7XG4gIHVybD86IHN0cmluZztcbiAgLyoqIFJldHJ5LUFmdGVyIHZhbHVlIGluIHNlY29uZHMsIHByZXNlbnQgb24gNDI5IGFuZCA0MjUgcmVzcG9uc2VzICovXG4gIHJldHJ5QWZ0ZXI/OiBudW1iZXI7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgbWVzc2FnZTogc3RyaW5nLFxuICAgIG9wdGlvbnM/OiB7XG4gICAgICBzdGF0dXM/OiBudW1iZXI7XG4gICAgICB1cmw/OiBzdHJpbmc7XG4gICAgICBjb2RlPzogc3RyaW5nO1xuICAgICAgcmV0cnlBZnRlcj86IG51bWJlcjtcbiAgICAgIGNhdXNlPzogdW5rbm93bjtcbiAgICB9XG4gICkge1xuICAgIHN1cGVyKG1lc3NhZ2UsIHtcbiAgICAgIGNhdXNlOiBvcHRpb25zPy5jYXVzZSxcbiAgICB9KTtcbiAgICB0aGlzLm5hbWUgPSAnV29ya2Zsb3dXb3JsZEVycm9yJztcbiAgICB0aGlzLnN0YXR1cyA9IG9wdGlvbnM/LnN0YXR1cztcbiAgICB0aGlzLmNvZGUgPSBvcHRpb25zPy5jb2RlO1xuICAgIHRoaXMudXJsID0gb3B0aW9ucz8udXJsO1xuICAgIHRoaXMucmV0cnlBZnRlciA9IG9wdGlvbnM/LnJldHJ5QWZ0ZXI7XG4gIH1cblxuICBzdGF0aWMgaXModmFsdWU6IHVua25vd24pOiB2YWx1ZSBpcyBXb3JrZmxvd1dvcmxkRXJyb3Ige1xuICAgIHJldHVybiBpc0Vycm9yKHZhbHVlKSAmJiB2YWx1ZS5uYW1lID09PSAnV29ya2Zsb3dXb3JsZEVycm9yJztcbiAgfVxufVxuXG4vKipcbiAqIFRocm93biB3aGVuIGEgd29ya2Zsb3cgcnVuIGZhaWxzIGR1cmluZyBleGVjdXRpb24uXG4gKlxuICogVGhpcyBlcnJvciBpbmRpY2F0ZXMgdGhhdCB0aGUgd29ya2Zsb3cgZW5jb3VudGVyZWQgYSBmYXRhbCBlcnJvciBhbmQgY2Fubm90XG4gKiBjb250aW51ZS4gSXQgaXMgdGhyb3duIHdoZW4gYXdhaXRpbmcgYHJ1bi5yZXR1cm5WYWx1ZWAgb24gYSBydW4gd2hvc2Ugc3RhdHVzXG4gKiBpcyBgJ2ZhaWxlZCdgLiBUaGUgYGNhdXNlYCBwcm9wZXJ0eSBjb250YWlucyB0aGUgdW5kZXJseWluZyBlcnJvciB3aXRoIGl0c1xuICogbWVzc2FnZSwgc3RhY2sgdHJhY2UsIGFuZCBvcHRpb25hbCBlcnJvciBjb2RlLlxuICpcbiAqIFVzZSB0aGUgc3RhdGljIGBXb3JrZmxvd1J1bkZhaWxlZEVycm9yLmlzKClgIG1ldGhvZCBmb3IgdHlwZS1zYWZlIGNoZWNraW5nXG4gKiBpbiBjYXRjaCBibG9ja3MuXG4gKlxuICogQGV4YW1wbGVcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBXb3JrZmxvd1J1bkZhaWxlZEVycm9yIH0gZnJvbSBcIndvcmtmbG93L2ludGVybmFsL2Vycm9yc1wiO1xuICpcbiAqIHRyeSB7XG4gKiAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHJ1bi5yZXR1cm5WYWx1ZTtcbiAqIH0gY2F0Y2ggKGVycm9yKSB7XG4gKiAgIGlmIChXb3JrZmxvd1J1bkZhaWxlZEVycm9yLmlzKGVycm9yKSkge1xuICogICAgIGNvbnNvbGUuZXJyb3IoYFJ1biAke2Vycm9yLnJ1bklkfSBmYWlsZWQ6YCwgZXJyb3IuY2F1c2UubWVzc2FnZSk7XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICovXG5leHBvcnQgY2xhc3MgV29ya2Zsb3dSdW5GYWlsZWRFcnJvciBleHRlbmRzIFdvcmtmbG93RXJyb3Ige1xuICBydW5JZDogc3RyaW5nO1xuICBkZWNsYXJlIGNhdXNlOiBFcnJvciAmIHsgY29kZT86IHN0cmluZyB9O1xuXG4gIGNvbnN0cnVjdG9yKHJ1bklkOiBzdHJpbmcsIGVycm9yOiBTdHJ1Y3R1cmVkRXJyb3IpIHtcbiAgICAvLyBDcmVhdGUgYSBwcm9wZXIgRXJyb3IgaW5zdGFuY2UgZnJvbSB0aGUgU3RydWN0dXJlZEVycm9yIHRvIHNldCBhcyBjYXVzZVxuICAgIC8vIE5PVEU6IGN1c3RvbSBlcnJvciB0eXBlcyBkbyBub3QgZ2V0IHNlcmlhbGl6ZWQvZGVzZXJpYWxpemVkLiBFdmVyeXRoaW5nIGlzIGFuIEVycm9yXG4gICAgY29uc3QgY2F1c2VFcnJvciA9IG5ldyBFcnJvcihlcnJvci5tZXNzYWdlKTtcbiAgICBpZiAoZXJyb3Iuc3RhY2spIHtcbiAgICAgIGNhdXNlRXJyb3Iuc3RhY2sgPSBlcnJvci5zdGFjaztcbiAgICB9XG4gICAgaWYgKGVycm9yLmNvZGUpIHtcbiAgICAgIChjYXVzZUVycm9yIGFzIGFueSkuY29kZSA9IGVycm9yLmNvZGU7XG4gICAgfVxuXG4gICAgc3VwZXIoYFdvcmtmbG93IHJ1biBcIiR7cnVuSWR9XCIgZmFpbGVkOiAke2Vycm9yLm1lc3NhZ2V9YCwge1xuICAgICAgY2F1c2U6IGNhdXNlRXJyb3IsXG4gICAgfSk7XG4gICAgdGhpcy5uYW1lID0gJ1dvcmtmbG93UnVuRmFpbGVkRXJyb3InO1xuICAgIHRoaXMucnVuSWQgPSBydW5JZDtcbiAgfVxuXG4gIHN0YXRpYyBpcyh2YWx1ZTogdW5rbm93bik6IHZhbHVlIGlzIFdvcmtmbG93UnVuRmFpbGVkRXJyb3Ige1xuICAgIHJldHVybiBpc0Vycm9yKHZhbHVlKSAmJiB2YWx1ZS5uYW1lID09PSAnV29ya2Zsb3dSdW5GYWlsZWRFcnJvcic7XG4gIH1cbn1cblxuLyoqXG4gKiBUaHJvd24gd2hlbiBhdHRlbXB0aW5nIHRvIGdldCByZXN1bHRzIGZyb20gYW4gaW5jb21wbGV0ZSB3b3JrZmxvdyBydW4uXG4gKlxuICogVGhpcyBlcnJvciBvY2N1cnMgd2hlbiB5b3UgdHJ5IHRvIGFjY2VzcyB0aGUgcmVzdWx0IG9mIGEgd29ya2Zsb3dcbiAqIHRoYXQgaXMgc3RpbGwgcnVubmluZyBvciBoYXNuJ3QgY29tcGxldGVkIHlldC5cbiAqL1xuZXhwb3J0IGNsYXNzIFdvcmtmbG93UnVuTm90Q29tcGxldGVkRXJyb3IgZXh0ZW5kcyBXb3JrZmxvd0Vycm9yIHtcbiAgcnVuSWQ6IHN0cmluZztcbiAgc3RhdHVzOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IocnVuSWQ6IHN0cmluZywgc3RhdHVzOiBzdHJpbmcpIHtcbiAgICBzdXBlcihgV29ya2Zsb3cgcnVuIFwiJHtydW5JZH1cIiBoYXMgbm90IGNvbXBsZXRlZGAsIHt9KTtcbiAgICB0aGlzLm5hbWUgPSAnV29ya2Zsb3dSdW5Ob3RDb21wbGV0ZWRFcnJvcic7XG4gICAgdGhpcy5ydW5JZCA9IHJ1bklkO1xuICAgIHRoaXMuc3RhdHVzID0gc3RhdHVzO1xuICB9XG5cbiAgc3RhdGljIGlzKHZhbHVlOiB1bmtub3duKTogdmFsdWUgaXMgV29ya2Zsb3dSdW5Ob3RDb21wbGV0ZWRFcnJvciB7XG4gICAgcmV0dXJuIGlzRXJyb3IodmFsdWUpICYmIHZhbHVlLm5hbWUgPT09ICdXb3JrZmxvd1J1bk5vdENvbXBsZXRlZEVycm9yJztcbiAgfVxufVxuXG4vKipcbiAqIFRocm93biB3aGVuIHRoZSBXb3JrZmxvdyBydW50aW1lIGVuY291bnRlcnMgYW4gaW50ZXJuYWwgZXJyb3IuXG4gKlxuICogVGhpcyBlcnJvciBpbmRpY2F0ZXMgYW4gaXNzdWUgd2l0aCB3b3JrZmxvdyBleGVjdXRpb24sIHN1Y2ggYXNcbiAqIHNlcmlhbGl6YXRpb24gZmFpbHVyZXMsIHN0YXJ0aW5nIGFuIGludmFsaWQgd29ya2Zsb3cgZnVuY3Rpb24sIG9yXG4gKiBvdGhlciBydW50aW1lIHByb2JsZW1zLlxuICovXG5leHBvcnQgY2xhc3MgV29ya2Zsb3dSdW50aW1lRXJyb3IgZXh0ZW5kcyBXb3JrZmxvd0Vycm9yIHtcbiAgY29uc3RydWN0b3IobWVzc2FnZTogc3RyaW5nLCBvcHRpb25zPzogV29ya2Zsb3dFcnJvck9wdGlvbnMpIHtcbiAgICBzdXBlcihtZXNzYWdlLCB7XG4gICAgICAuLi5vcHRpb25zLFxuICAgIH0pO1xuICAgIHRoaXMubmFtZSA9ICdXb3JrZmxvd1J1bnRpbWVFcnJvcic7XG4gIH1cblxuICBzdGF0aWMgaXModmFsdWU6IHVua25vd24pOiB2YWx1ZSBpcyBXb3JrZmxvd1J1bnRpbWVFcnJvciB7XG4gICAgcmV0dXJuIGlzRXJyb3IodmFsdWUpICYmIHZhbHVlLm5hbWUgPT09ICdXb3JrZmxvd1J1bnRpbWVFcnJvcic7XG4gIH1cbn1cblxuLyoqXG4gKiBUaHJvd24gd2hlbiB0aGUgcGVyc2lzdGVkIHdvcmtmbG93IGV2ZW50IGxvZyBjYW5ub3QgYmUgcmVwbGF5ZWQgYmVjYXVzZSBpdFxuICogY29udGFpbnMgb3JwaGFuZWQsIGR1cGxpY2F0ZSwgb3IgbWlzbWF0Y2hlZCBldmVudHMuXG4gKlxuICogVGhpcyBpcyBhIHJ1bnRpbWUvaW5mcmFzdHJ1Y3R1cmUgZmFpbHVyZSByYXRoZXIgdGhhbiB1c2VyIGNvZGUgdGhyb3dpbmcuXG4gKiBXaGVuIHRoaXMgcmVhY2hlcyBydW4gZmFpbHVyZSBoYW5kbGluZywgaXQgaXMgcmVjb3JkZWQgd2l0aCB0aGUgZGlzdGluY3RcbiAqIGBDT1JSVVBURURfRVZFTlRfTE9HYCBjb2RlIHNvIHdvcmxkcyBhbmQgYmFja2VuZHMgY2FuIHRyYWNrIGl0IHNlcGFyYXRlbHlcbiAqIGZyb20gZ2VuZXJpYyBydW50aW1lIGZhaWx1cmVzLlxuICovXG5leHBvcnQgY2xhc3MgQ29ycnVwdGVkRXZlbnRMb2dFcnJvciBleHRlbmRzIFdvcmtmbG93UnVudGltZUVycm9yIHtcbiAgY29uc3RydWN0b3IobWVzc2FnZTogc3RyaW5nLCBvcHRpb25zPzogRXJyb3JPcHRpb25zKSB7XG4gICAgc3VwZXIobWVzc2FnZSwge1xuICAgICAgLi4ub3B0aW9ucyxcbiAgICAgIHNsdWc6IEVSUk9SX1NMVUdTLkNPUlJVUFRFRF9FVkVOVF9MT0csXG4gICAgfSk7XG4gICAgdGhpcy5uYW1lID0gJ0NvcnJ1cHRlZEV2ZW50TG9nRXJyb3InO1xuICB9XG5cbiAgc3RhdGljIGlzKHZhbHVlOiB1bmtub3duKTogdmFsdWUgaXMgQ29ycnVwdGVkRXZlbnRMb2dFcnJvciB7XG4gICAgcmV0dXJuIGlzRXJyb3IodmFsdWUpICYmIHZhbHVlLm5hbWUgPT09ICdDb3JydXB0ZWRFdmVudExvZ0Vycm9yJztcbiAgfVxufVxuXG4vKipcbiAqIE9wdGlvbmFsIHN0cnVjdHVyZWQgY29udGV4dCBhdHRhY2hlZCB0byBhIHtAbGluayBSdW50aW1lRGVjcnlwdGlvbkVycm9yfSxcbiAqIGNhcnJpZWQgb3ZlciBmcm9tIHRoZSB1bmRlcmx5aW5nIGRlY3J5cHQgY2FsbCBzaXRlIHRvIGhlbHAgZGlhZ25vc2UgdGhlXG4gKiBmYWlsdXJlIHdpdGhvdXQgcG9raW5nIHRocm91Z2ggc3RhY2tzLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFJ1bnRpbWVEZWNyeXB0aW9uRXJyb3JDb250ZXh0IHtcbiAgLyoqIFRoZSBvcGVyYXRpb24gdGhhdCBmYWlsZWQg4oCUIHVzZWZ1bCB0byB0ZWxsIGVuY3J5cHQgdnMgZGVjcnlwdCBhcGFydC4gKi9cbiAgb3BlcmF0aW9uPzogJ2VuY3J5cHQnIHwgJ2RlY3J5cHQnO1xuICAvKiogQnl0ZSBsZW5ndGggb2YgdGhlIGlucHV0IHBheWxvYWQgYXQgdGhlIHRpbWUgb2YgdGhlIGZhaWx1cmUuICovXG4gIGJ5dGVMZW5ndGg/OiBudW1iZXI7XG4gIC8qKlxuICAgKiBUaGUgZmlyc3QgNCBieXRlcyBvZiB0aGUgaW5wdXQgcGF5bG9hZCwgZGVjb2RlZCBhcyBVVEYtOCBpZiBwcmludGFibGUuXG4gICAqIFVzZWZ1bCBmb3IgdGVsbGluZyBhcGFydCB0cnVuY2F0ZWQtYnV0LXZhbGlkLWxvb2tpbmcgZW5jcnlwdGVkIHBheWxvYWRzXG4gICAqIGZyb20gY29tcGxldGVseSB1bnJlbGF0ZWQgY29ycnVwdGlvbiAoZS5nLiBhbiBIVE1MIGVycm9yIHBhZ2Ugc3VyZmFjZWRcbiAgICogYXMgYSAyMDAgT0spLlxuICAgKi9cbiAgZm9ybWF0UHJlZml4Pzogc3RyaW5nO1xufVxuXG4vKipcbiAqIFRocm93biB3aGVuIHRoZSBTREsncyBidWlsdC1pbiBBRVMtR0NNIGVuY3J5cHRpb24gbGF5ZXIgZmFpbHMgdG8gZW5jcnlwdFxuICogb3IgZGVjcnlwdCBhIHdvcmtmbG93IHBheWxvYWQuXG4gKlxuICogVGhpcyBpcyBhbiBpbnRlcm5hbCBTREsgZmFpbHVyZSDigJQgdXNlciBjb2RlIG5ldmVyIGludm9rZXMgdGhlIFNESydzXG4gKiBlbmNyeXB0aW9uIHByaW1pdGl2ZXMgZGlyZWN0bHkuIENvbW1vbiBjYXVzZXM6XG4gKlxuICogLSBBIGNpcGhlcnRleHQgLyBhdXRoIHRhZyBtaXNtYXRjaCwgdHlwaWNhbGx5IHN1cmZhY2VkIGFzIHRoZSBuYXRpdmUgV2ViXG4gKiAgIENyeXB0byBgT3BlcmF0aW9uRXJyb3I6IFRoZSBvcGVyYXRpb24gZmFpbGVkIGZvciBhbiBvcGVyYXRpb24tc3BlY2lmaWNcbiAqICAgcmVhc29uYC4gVXN1YWxseSBjYXVzZWQgYnkgY2lwaGVydGV4dCBtdXRhdGlvbiBvciB0cnVuY2F0aW9uIGluIHRyYW5zaXRcbiAqICAgYmV0d2VlbiBzdG9yYWdlIGFuZCByZWFkICh0cnVuY2F0ZWQgSFRUUCByZXNwb25zZSwgZWRnZS1jYWNoZSBtaXNzXG4gKiAgIHJldHVybmluZyBhIHBhcnRpYWwgMjAwLCBwcm94eSBkcm9wIGR1cmluZyBzdHJlYW1pbmcsIGV0Yy4pLlxuICogLSBBIGtleSByZXNvbHV0aW9uIG1pc21hdGNoICh3cm9uZyBkZXBsb3ltZW50LCBtaXNzaW5nIGtleSBtYXRlcmlhbCkuXG4gKiAtIEEgbWFsZm9ybWVkIGVuY3J5cHRlZCBlbnZlbG9wZSAodG9vIHNob3J0IHRvIGNvbnRhaW4gdGhlIEdDTSBub25jZVxuICogICBhbmQgdGFnKS5cbiAqXG4gKiBFeHRlbmRzIHtAbGluayBXb3JrZmxvd1J1bnRpbWVFcnJvcn0gc28gdGhlIHJ1bi1mYWlsdXJlIGNsYXNzaWZpZXJcbiAqIHJvdXRlcyBpdCB0byBgUlVOVElNRV9FUlJPUmAuXG4gKi9cbmV4cG9ydCBjbGFzcyBSdW50aW1lRGVjcnlwdGlvbkVycm9yIGV4dGVuZHMgV29ya2Zsb3dSdW50aW1lRXJyb3Ige1xuICAvKiogT3B0aW9uYWwgc3RydWN0dXJlZCBjb250ZXh0IGFib3V0IHRoZSBmYWlsZWQgZW5jcnlwdC9kZWNyeXB0IGNhbGwuICovXG4gIHJlYWRvbmx5IGNvbnRleHQ/OiBSdW50aW1lRGVjcnlwdGlvbkVycm9yQ29udGV4dDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBtZXNzYWdlOiBzdHJpbmcsXG4gICAgb3B0aW9ucz86IEVycm9yT3B0aW9ucyAmIHsgY29udGV4dD86IFJ1bnRpbWVEZWNyeXB0aW9uRXJyb3JDb250ZXh0IH1cbiAgKSB7XG4gICAgc3VwZXIobWVzc2FnZSwge1xuICAgICAgY2F1c2U6IG9wdGlvbnM/LmNhdXNlLFxuICAgICAgc2x1ZzogRVJST1JfU0xVR1MuUlVOVElNRV9ERUNSWVBUSU9OX0ZBSUxFRCxcbiAgICB9KTtcbiAgICB0aGlzLm5hbWUgPSAnUnVudGltZURlY3J5cHRpb25FcnJvcic7XG4gICAgaWYgKG9wdGlvbnM/LmNvbnRleHQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5jb250ZXh0ID0gb3B0aW9ucy5jb250ZXh0O1xuICAgIH1cbiAgfVxuXG4gIHN0YXRpYyBpcyh2YWx1ZTogdW5rbm93bik6IHZhbHVlIGlzIFJ1bnRpbWVEZWNyeXB0aW9uRXJyb3Ige1xuICAgIHJldHVybiBpc0Vycm9yKHZhbHVlKSAmJiB2YWx1ZS5uYW1lID09PSAnUnVudGltZURlY3J5cHRpb25FcnJvcic7XG4gIH1cbn1cblxuLyoqXG4gKiBUaHJvd24gd2hlbiB0aGUgY3VycmVudCB3b3JrZmxvdyByZXBsYXkgY2Fubm90IGZvbGxvdyB0aGUgcGF0aCBkZXNjcmliZWQgYnlcbiAqIHRoZSByZWNvcmRlZCBldmVudCBsb2cuIEEgc2luZ2xlIGRpdmVyZ2VuY2UgZG9lcyBub3QgcHJvdmUgdGhhdCB0aGVcbiAqIHBlcnNpc3RlZCBoaXN0b3J5IGlzIGludmFsaWQ6IGEgc3Vic2VxdWVudCByZXBsYXkgbWF5IG9ic2VydmUgb3Igc2NoZWR1bGVcbiAqIHdvcmsgY29ycmVjdGx5LCBzbyB0aGUgcnVudGltZSBtYXkgcmVkZWxpdmVyIGJlZm9yZSBkZWNsYXJpbmcgY29ycnVwdGlvbi5cbiAqL1xuZXhwb3J0IGNsYXNzIFJlcGxheURpdmVyZ2VuY2VFcnJvciBleHRlbmRzIFdvcmtmbG93UnVudGltZUVycm9yIHtcbiAgcmVhZG9ubHkgZXZlbnRJZDogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2U6IHN0cmluZywgb3B0aW9uczogRXJyb3JPcHRpb25zICYgeyBldmVudElkOiBzdHJpbmcgfSkge1xuICAgIHN1cGVyKG1lc3NhZ2UsIHtcbiAgICAgIC4uLm9wdGlvbnMsXG4gICAgICBzbHVnOiBFUlJPUl9TTFVHUy5SRVBMQVlfRElWRVJHRU5DRSxcbiAgICB9KTtcbiAgICB0aGlzLm5hbWUgPSAnUmVwbGF5RGl2ZXJnZW5jZUVycm9yJztcbiAgICB0aGlzLmV2ZW50SWQgPSBvcHRpb25zLmV2ZW50SWQ7XG4gIH1cblxuICBzdGF0aWMgaXModmFsdWU6IHVua25vd24pOiB2YWx1ZSBpcyBSZXBsYXlEaXZlcmdlbmNlRXJyb3Ige1xuICAgIHJldHVybiBpc0Vycm9yKHZhbHVlKSAmJiB2YWx1ZS5uYW1lID09PSAnUmVwbGF5RGl2ZXJnZW5jZUVycm9yJztcbiAgfVxufVxuXG4vKipcbiAqIFRocm93biB3aGVuIGEgc3RlcCBmdW5jdGlvbiBpcyBub3QgcmVnaXN0ZXJlZCBpbiB0aGUgY3VycmVudCBkZXBsb3ltZW50LlxuICpcbiAqIFRoaXMgaXMgYW4gaW5mcmFzdHJ1Y3R1cmUgZXJyb3Ig4oCUIG5vdCBhIHVzZXIgY29kZSBlcnJvci4gSXQgdHlwaWNhbGx5IG1lYW5zXG4gKiBzb21ldGhpbmcgd2VudCB3cm9uZyB3aXRoIHRoZSBidW5kbGluZy9idWlsZCB0b29saW5nIHRoYXQgY2F1c2VkIHRoZSBzdGVwXG4gKiB0byBub3QgZ2V0IGJ1aWx0IGNvcnJlY3RseS5cbiAqXG4gKiBXaGVuIHRoaXMgaGFwcGVucywgdGhlIHN0ZXAgZmFpbHMgKGxpa2UgYSBGYXRhbEVycm9yKSBhbmQgY29udHJvbCBpcyBwYXNzZWQgYmFja1xuICogdG8gdGhlIHdvcmtmbG93IGZ1bmN0aW9uLCB3aGljaCBjYW4gb3B0aW9uYWxseSBoYW5kbGUgdGhlIGZhaWx1cmUgZ3JhY2VmdWxseS5cbiAqL1xuZXhwb3J0IGNsYXNzIFN0ZXBOb3RSZWdpc3RlcmVkRXJyb3IgZXh0ZW5kcyBXb3JrZmxvd1J1bnRpbWVFcnJvciB7XG4gIHN0ZXBOYW1lOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3Ioc3RlcE5hbWU6IHN0cmluZykge1xuICAgIHN1cGVyKFxuICAgICAgYFN0ZXAgXCIke3N0ZXBOYW1lfVwiIGlzIG5vdCByZWdpc3RlcmVkIGluIHRoZSBjdXJyZW50IGRlcGxveW1lbnQuIFRoaXMgdXN1YWxseSBpbmRpY2F0ZXMgYSBidWlsZCBvciBidW5kbGluZyBpc3N1ZSB0aGF0IGNhdXNlZCB0aGUgc3RlcCB0byBub3QgYmUgaW5jbHVkZWQgaW4gdGhlIGRlcGxveW1lbnQuYCxcbiAgICAgIHsgc2x1ZzogRVJST1JfU0xVR1MuU1RFUF9OT1RfUkVHSVNURVJFRCB9XG4gICAgKTtcbiAgICB0aGlzLm5hbWUgPSAnU3RlcE5vdFJlZ2lzdGVyZWRFcnJvcic7XG4gICAgdGhpcy5zdGVwTmFtZSA9IHN0ZXBOYW1lO1xuICB9XG5cbiAgc3RhdGljIGlzKHZhbHVlOiB1bmtub3duKTogdmFsdWUgaXMgU3RlcE5vdFJlZ2lzdGVyZWRFcnJvciB7XG4gICAgcmV0dXJuIGlzRXJyb3IodmFsdWUpICYmIHZhbHVlLm5hbWUgPT09ICdTdGVwTm90UmVnaXN0ZXJlZEVycm9yJztcbiAgfVxufVxuXG4vKipcbiAqIFRocm93biB3aGVuIGEgd29ya2Zsb3cgZnVuY3Rpb24gaXMgbm90IHJlZ2lzdGVyZWQgaW4gdGhlIGN1cnJlbnQgZGVwbG95bWVudC5cbiAqXG4gKiBUaGlzIGlzIGFuIGluZnJhc3RydWN0dXJlIGVycm9yIOKAlCBub3QgYSB1c2VyIGNvZGUgZXJyb3IuIEl0IHR5cGljYWxseSBtZWFuczpcbiAqIC0gQSBydW4gd2FzIHN0YXJ0ZWQgYWdhaW5zdCBhIGRlcGxveW1lbnQgdGhhdCBkb2VzIG5vdCBoYXZlIHRoZSB3b3JrZmxvd1xuICogICAoZS5nLiwgdGhlIHdvcmtmbG93IHdhcyByZW5hbWVkIG9yIG1vdmVkIGFuZCBhIG5ldyBydW4gdGFyZ2V0ZWQgdGhlIGxhdGVzdCBkZXBsb3ltZW50KVxuICogLSBTb21ldGhpbmcgd2VudCB3cm9uZyB3aXRoIHRoZSBidW5kbGluZy9idWlsZCB0b29saW5nIHRoYXQgY2F1c2VkIHRoZSB3b3JrZmxvd1xuICogICB0byBub3QgZ2V0IGJ1aWx0IGNvcnJlY3RseVxuICpcbiAqIFdoZW4gdGhpcyBoYXBwZW5zLCB0aGUgcnVuIGZhaWxzIHdpdGggYSBgUlVOVElNRV9FUlJPUmAgZXJyb3IgY29kZS5cbiAqL1xuZXhwb3J0IGNsYXNzIFdvcmtmbG93Tm90UmVnaXN0ZXJlZEVycm9yIGV4dGVuZHMgV29ya2Zsb3dSdW50aW1lRXJyb3Ige1xuICB3b3JrZmxvd05hbWU6IHN0cmluZztcblxuICBjb25zdHJ1Y3Rvcih3b3JrZmxvd05hbWU6IHN0cmluZykge1xuICAgIHN1cGVyKFxuICAgICAgYFdvcmtmbG93IFwiJHt3b3JrZmxvd05hbWV9XCIgaXMgbm90IHJlZ2lzdGVyZWQgaW4gdGhlIGN1cnJlbnQgZGVwbG95bWVudC4gVGhpcyB1c3VhbGx5IG1lYW5zIGEgcnVuIHdhcyBzdGFydGVkIGFnYWluc3QgYSBkZXBsb3ltZW50IHRoYXQgZG9lcyBub3QgaGF2ZSB0aGlzIHdvcmtmbG93LCBvciB0aGVyZSB3YXMgYSBidWlsZC9idW5kbGluZyBpc3N1ZS5gLFxuICAgICAgeyBzbHVnOiBFUlJPUl9TTFVHUy5XT1JLRkxPV19OT1RfUkVHSVNURVJFRCB9XG4gICAgKTtcbiAgICB0aGlzLm5hbWUgPSAnV29ya2Zsb3dOb3RSZWdpc3RlcmVkRXJyb3InO1xuICAgIHRoaXMud29ya2Zsb3dOYW1lID0gd29ya2Zsb3dOYW1lO1xuICB9XG5cbiAgc3RhdGljIGlzKHZhbHVlOiB1bmtub3duKTogdmFsdWUgaXMgV29ya2Zsb3dOb3RSZWdpc3RlcmVkRXJyb3Ige1xuICAgIHJldHVybiBpc0Vycm9yKHZhbHVlKSAmJiB2YWx1ZS5uYW1lID09PSAnV29ya2Zsb3dOb3RSZWdpc3RlcmVkRXJyb3InO1xuICB9XG59XG5cbi8qKlxuICogVGhyb3duIHdoZW4gcGVyZm9ybWluZyBvcGVyYXRpb25zIG9uIGEgd29ya2Zsb3cgcnVuIHRoYXQgZG9lcyBub3QgZXhpc3QuXG4gKlxuICogVGhpcyBlcnJvciBvY2N1cnMgd2hlbiB5b3UgY2FsbCBtZXRob2RzIG9uIGEgcnVuIG9iamVjdCAoZS5nLiBgcnVuLnN0YXR1c2AsXG4gKiBgcnVuLmNhbmNlbCgpYCwgYHJ1bi5yZXR1cm5WYWx1ZWApIGJ1dCB0aGUgdW5kZXJseWluZyBydW4gSUQgZG9lcyBub3QgbWF0Y2hcbiAqIGFueSBrbm93biB3b3JrZmxvdyBydW4uIE5vdGUgdGhhdCBgZ2V0UnVuKGlkKWAgaXRzZWxmIGlzIHN5bmNocm9ub3VzIGFuZCB3aWxsXG4gKiBub3QgdGhyb3cg4oCUIHRoaXMgZXJyb3IgaXMgcmFpc2VkIHdoZW4gc3Vic2VxdWVudCBvcGVyYXRpb25zIGRpc2NvdmVyIHRoZSBydW5cbiAqIGlzIG1pc3NpbmcuXG4gKlxuICogVXNlIHRoZSBzdGF0aWMgYFdvcmtmbG93UnVuTm90Rm91bmRFcnJvci5pcygpYCBtZXRob2QgZm9yIHR5cGUtc2FmZSBjaGVja2luZ1xuICogaW4gY2F0Y2ggYmxvY2tzLlxuICpcbiAqIEBleGFtcGxlXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgV29ya2Zsb3dSdW5Ob3RGb3VuZEVycm9yIH0gZnJvbSBcIndvcmtmbG93L2ludGVybmFsL2Vycm9yc1wiO1xuICpcbiAqIHRyeSB7XG4gKiAgIGNvbnN0IHN0YXR1cyA9IGF3YWl0IHJ1bi5zdGF0dXM7XG4gKiB9IGNhdGNoIChlcnJvcikge1xuICogICBpZiAoV29ya2Zsb3dSdW5Ob3RGb3VuZEVycm9yLmlzKGVycm9yKSkge1xuICogICAgIGNvbnNvbGUuZXJyb3IoYFJ1biAke2Vycm9yLnJ1bklkfSBkb2VzIG5vdCBleGlzdGApO1xuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGNsYXNzIFdvcmtmbG93UnVuTm90Rm91bmRFcnJvciBleHRlbmRzIFdvcmtmbG93RXJyb3Ige1xuICBydW5JZDogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKHJ1bklkOiBzdHJpbmcpIHtcbiAgICBzdXBlcihgV29ya2Zsb3cgcnVuIFwiJHtydW5JZH1cIiBub3QgZm91bmRgLCB7fSk7XG4gICAgdGhpcy5uYW1lID0gJ1dvcmtmbG93UnVuTm90Rm91bmRFcnJvcic7XG4gICAgdGhpcy5ydW5JZCA9IHJ1bklkO1xuICB9XG5cbiAgc3RhdGljIGlzKHZhbHVlOiB1bmtub3duKTogdmFsdWUgaXMgV29ya2Zsb3dSdW5Ob3RGb3VuZEVycm9yIHtcbiAgICByZXR1cm4gaXNFcnJvcih2YWx1ZSkgJiYgdmFsdWUubmFtZSA9PT0gJ1dvcmtmbG93UnVuTm90Rm91bmRFcnJvcic7XG4gIH1cbn1cblxuLyoqXG4gKiBUaHJvd24gd2hlbiBhIGhvb2sgdG9rZW4gaXMgYWxyZWFkeSBpbiB1c2UgYnkgYW5vdGhlciBhY3RpdmUgd29ya2Zsb3cgcnVuLlxuICpcbiAqIFRoaXMgaXMgYSB1c2VyIGVycm9yIOKAlCBpdCBtZWFucyB0aGUgc2FtZSBjdXN0b20gdG9rZW4gd2FzIHBhc3NlZCB0b1xuICogYGNyZWF0ZUhvb2tgIGluIHR3byBvciBtb3JlIGNvbmN1cnJlbnQgcnVucy4gVXNlIGEgdW5pcXVlIHRva2VuIHBlciBydW5cbiAqIChvciBvbWl0IHRoZSB0b2tlbiB0byBsZXQgdGhlIHJ1bnRpbWUgZ2VuZXJhdGUgb25lIGF1dG9tYXRpY2FsbHkpLlxuICovXG5leHBvcnQgY2xhc3MgSG9va0NvbmZsaWN0RXJyb3IgZXh0ZW5kcyBXb3JrZmxvd0Vycm9yIHtcbiAgdG9rZW46IHN0cmluZztcbiAgLy8gVE9ETzogTWFrZSB0aGlzIHJlcXVpcmVkIG9uY2UgYWxsIHBlcnNpc3RlZCBob29rX2NvbmZsaWN0IGV2ZW50cyBhbmQgV29ybGRcbiAgLy8gaW1wbGVtZW50YXRpb25zIGFsd2F5cyBpbmNsdWRlIHRoZSBhY3RpdmUgaG9vayBvd25lcidzIHJ1biBJRC5cbiAgY29uZmxpY3RpbmdSdW5JZD86IHN0cmluZztcblxuICBjb25zdHJ1Y3Rvcih0b2tlbjogc3RyaW5nLCBjb25mbGljdGluZ1J1bklkPzogc3RyaW5nKSB7XG4gICAgc3VwZXIoXG4gICAgICBgSG9vayB0b2tlbiBcIiR7dG9rZW59XCIgaXMgYWxyZWFkeSBpbiB1c2UgYnkgYW5vdGhlciB3b3JrZmxvdyR7Y29uZmxpY3RpbmdSdW5JZCA/IGAgKHJ1biBcIiR7Y29uZmxpY3RpbmdSdW5JZH1cIilgIDogJyd9YCxcbiAgICAgIHtcbiAgICAgICAgc2x1ZzogRVJST1JfU0xVR1MuSE9PS19DT05GTElDVCxcbiAgICAgIH1cbiAgICApO1xuICAgIHRoaXMubmFtZSA9ICdIb29rQ29uZmxpY3RFcnJvcic7XG4gICAgdGhpcy50b2tlbiA9IHRva2VuO1xuICAgIGlmIChjb25mbGljdGluZ1J1bklkICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXMuY29uZmxpY3RpbmdSdW5JZCA9IGNvbmZsaWN0aW5nUnVuSWQ7XG4gICAgfVxuICB9XG5cbiAgc3RhdGljIGlzKHZhbHVlOiB1bmtub3duKTogdmFsdWUgaXMgSG9va0NvbmZsaWN0RXJyb3Ige1xuICAgIHJldHVybiBpc0Vycm9yKHZhbHVlKSAmJiB2YWx1ZS5uYW1lID09PSAnSG9va0NvbmZsaWN0RXJyb3InO1xuICB9XG59XG5cbi8qKlxuICogVGhyb3duIHdoZW4gY2FsbGluZyBgcmVzdW1lSG9vaygpYCBvciBgcmVzdW1lV2ViaG9vaygpYCB3aXRoIGEgdG9rZW4gdGhhdFxuICogZG9lcyBub3QgbWF0Y2ggYW55IGFjdGl2ZSBob29rLlxuICpcbiAqIENvbW1vbiBjYXVzZXM6XG4gKiAtIFRoZSBob29rIGhhcyBleHBpcmVkIChwYXN0IGl0cyBUVEwpXG4gKiAtIFRoZSBob29rIHdhcyBhbHJlYWR5IGRpc3Bvc2VkIGFmdGVyIGJlaW5nIGNvbnN1bWVkXG4gKiAtIFRoZSB3b3JrZmxvdyBoYXMgbm90IHN0YXJ0ZWQgeWV0LCBzbyB0aGUgaG9vayBkb2VzIG5vdCBleGlzdFxuICpcbiAqIEEgY29tbW9uIHBhdHRlcm4gaXMgdG8gY2F0Y2ggdGhpcyBlcnJvciBhbmQgc3RhcnQgYSBuZXcgd29ya2Zsb3cgcnVuIHdoZW5cbiAqIHRoZSBob29rIGRvZXMgbm90IGV4aXN0IHlldCAodGhlIFwicmVzdW1lIG9yIHN0YXJ0XCIgcGF0dGVybikuXG4gKlxuICogVXNlIHRoZSBzdGF0aWMgYEhvb2tOb3RGb3VuZEVycm9yLmlzKClgIG1ldGhvZCBmb3IgdHlwZS1zYWZlIGNoZWNraW5nIGluXG4gKiBjYXRjaCBibG9ja3MuXG4gKlxuICogQGV4YW1wbGVcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBIb29rTm90Rm91bmRFcnJvciB9IGZyb20gXCJ3b3JrZmxvdy9pbnRlcm5hbC9lcnJvcnNcIjtcbiAqXG4gKiB0cnkge1xuICogICBhd2FpdCByZXN1bWVIb29rKHRva2VuLCBwYXlsb2FkKTtcbiAqIH0gY2F0Y2ggKGVycm9yKSB7XG4gKiAgIGlmIChIb29rTm90Rm91bmRFcnJvci5pcyhlcnJvcikpIHtcbiAqICAgICAvLyBIb29rIGRvZXNuJ3QgZXhpc3Qg4oCUIHN0YXJ0IGEgbmV3IHdvcmtmbG93IHJ1biBpbnN0ZWFkXG4gKiAgICAgYXdhaXQgc3RhcnRXb3JrZmxvdyhcIm15V29ya2Zsb3dcIiwgcGF5bG9hZCk7XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICovXG5leHBvcnQgY2xhc3MgSG9va05vdEZvdW5kRXJyb3IgZXh0ZW5kcyBXb3JrZmxvd0Vycm9yIHtcbiAgdG9rZW46IHN0cmluZztcblxuICBjb25zdHJ1Y3Rvcih0b2tlbjogc3RyaW5nKSB7XG4gICAgc3VwZXIoJ0hvb2sgbm90IGZvdW5kJywge30pO1xuICAgIHRoaXMubmFtZSA9ICdIb29rTm90Rm91bmRFcnJvcic7XG4gICAgdGhpcy50b2tlbiA9IHRva2VuO1xuICB9XG5cbiAgc3RhdGljIGlzKHZhbHVlOiB1bmtub3duKTogdmFsdWUgaXMgSG9va05vdEZvdW5kRXJyb3Ige1xuICAgIHJldHVybiBpc0Vycm9yKHZhbHVlKSAmJiB2YWx1ZS5uYW1lID09PSAnSG9va05vdEZvdW5kRXJyb3InO1xuICB9XG59XG5cbi8qKlxuICogVGhyb3duIHdoZW4gYW4gb3BlcmF0aW9uIGNvbmZsaWN0cyB3aXRoIHRoZSBjdXJyZW50IHN0YXRlIG9mIGFuIGVudGl0eS5cbiAqIFRoaXMgaW5jbHVkZXMgYXR0ZW1wdHMgdG8gbW9kaWZ5IGFuIGVudGl0eSBhbHJlYWR5IGluIGEgdGVybWluYWwgc3RhdGUsXG4gKiBjcmVhdGUgYW4gZW50aXR5IHRoYXQgYWxyZWFkeSBleGlzdHMsIG9yIGFueSBvdGhlciA0MDktc3R5bGUgY29uZmxpY3QuXG4gKlxuICogVGhlIHdvcmtmbG93IHJ1bnRpbWUgaGFuZGxlcyB0aGlzIGVycm9yIGF1dG9tYXRpY2FsbHkuIFVzZXJzIGludGVyYWN0aW5nXG4gKiB3aXRoIHdvcmxkIHN0b3JhZ2UgYmFja2VuZHMgZGlyZWN0bHkgbWF5IGVuY291bnRlciBpdC5cbiAqL1xuZXhwb3J0IGNsYXNzIEVudGl0eUNvbmZsaWN0RXJyb3IgZXh0ZW5kcyBXb3JrZmxvd1dvcmxkRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihtZXNzYWdlOiBzdHJpbmcpIHtcbiAgICBzdXBlcihtZXNzYWdlKTtcbiAgICB0aGlzLm5hbWUgPSAnRW50aXR5Q29uZmxpY3RFcnJvcic7XG4gIH1cblxuICBzdGF0aWMgaXModmFsdWU6IHVua25vd24pOiB2YWx1ZSBpcyBFbnRpdHlDb25mbGljdEVycm9yIHtcbiAgICByZXR1cm4gaXNFcnJvcih2YWx1ZSkgJiYgdmFsdWUubmFtZSA9PT0gJ0VudGl0eUNvbmZsaWN0RXJyb3InO1xuICB9XG59XG5cbi8qKlxuICogVGhyb3duIHdoZW4gYSBydW4gaXMgbm8gbG9uZ2VyIGF2YWlsYWJsZSDigJQgZWl0aGVyIGJlY2F1c2UgaXQgaGFzIGJlZW5cbiAqIGNsZWFuZWQgdXAsIGV4cGlyZWQsIG9yIGFscmVhZHkgcmVhY2hlZCBhIHRlcm1pbmFsIHN0YXRlIChjb21wbGV0ZWQvZmFpbGVkKS5cbiAqXG4gKiBUaGUgd29ya2Zsb3cgcnVudGltZSBoYW5kbGVzIHRoaXMgZXJyb3IgYXV0b21hdGljYWxseS4gVXNlcnMgaW50ZXJhY3RpbmdcbiAqIHdpdGggd29ybGQgc3RvcmFnZSBiYWNrZW5kcyBkaXJlY3RseSBtYXkgZW5jb3VudGVyIGl0LlxuICovXG5leHBvcnQgY2xhc3MgUnVuRXhwaXJlZEVycm9yIGV4dGVuZHMgV29ya2Zsb3dXb3JsZEVycm9yIHtcbiAgY29uc3RydWN0b3IobWVzc2FnZTogc3RyaW5nKSB7XG4gICAgc3VwZXIobWVzc2FnZSk7XG4gICAgdGhpcy5uYW1lID0gJ1J1bkV4cGlyZWRFcnJvcic7XG4gIH1cblxuICBzdGF0aWMgaXModmFsdWU6IHVua25vd24pOiB2YWx1ZSBpcyBSdW5FeHBpcmVkRXJyb3Ige1xuICAgIHJldHVybiBpc0Vycm9yKHZhbHVlKSAmJiB2YWx1ZS5uYW1lID09PSAnUnVuRXhwaXJlZEVycm9yJztcbiAgfVxufVxuXG4vKipcbiAqIFRocm93biB3aGVuIGFuIG9wZXJhdGlvbiBjYW5ub3QgcHJvY2VlZCBiZWNhdXNlIGEgcmVxdWlyZWQgdGltZXN0YW1wXG4gKiAoZS5nLiByZXRyeUFmdGVyKSBoYXMgbm90IGJlZW4gcmVhY2hlZCB5ZXQuXG4gKlxuICogVGhlIHdvcmtmbG93IHJ1bnRpbWUgaGFuZGxlcyB0aGlzIGVycm9yIGF1dG9tYXRpY2FsbHkuIFVzZXJzIGludGVyYWN0aW5nXG4gKiB3aXRoIHdvcmxkIHN0b3JhZ2UgYmFja2VuZHMgZGlyZWN0bHkgbWF5IGVuY291bnRlciBpdC5cbiAqXG4gKiBAcHJvcGVydHkgcmV0cnlBZnRlciAtIERlbGF5IGluIHNlY29uZHMgYmVmb3JlIHRoZSBvcGVyYXRpb24gY2FuIGJlIHJldHJpZWQuXG4gKi9cbmV4cG9ydCBjbGFzcyBUb29FYXJseUVycm9yIGV4dGVuZHMgV29ya2Zsb3dXb3JsZEVycm9yIHtcbiAgY29uc3RydWN0b3IobWVzc2FnZTogc3RyaW5nLCBvcHRpb25zPzogeyByZXRyeUFmdGVyPzogbnVtYmVyIH0pIHtcbiAgICBzdXBlcihtZXNzYWdlLCB7IHJldHJ5QWZ0ZXI6IG9wdGlvbnM/LnJldHJ5QWZ0ZXIgfSk7XG4gICAgdGhpcy5uYW1lID0gJ1Rvb0Vhcmx5RXJyb3InO1xuICB9XG5cbiAgc3RhdGljIGlzKHZhbHVlOiB1bmtub3duKTogdmFsdWUgaXMgVG9vRWFybHlFcnJvciB7XG4gICAgcmV0dXJuIGlzRXJyb3IodmFsdWUpICYmIHZhbHVlLm5hbWUgPT09ICdUb29FYXJseUVycm9yJztcbiAgfVxufVxuXG4vKipcbiAqIFRocm93biB3aGVuIGEgcmVxdWVzdCBpcyByYXRlIGxpbWl0ZWQgYnkgdGhlIHdvcmtmbG93IGJhY2tlbmQuXG4gKlxuICogVGhlIHdvcmtmbG93IHJ1bnRpbWUgaGFuZGxlcyB0aGlzIGVycm9yIGF1dG9tYXRpY2FsbHkgd2l0aCByZXRyeSBsb2dpYy5cbiAqIFVzZXJzIGludGVyYWN0aW5nIHdpdGggd29ybGQgc3RvcmFnZSBiYWNrZW5kcyBkaXJlY3RseSBtYXkgZW5jb3VudGVyIGl0XG4gKiBpZiByZXRyaWVzIGFyZSBleGhhdXN0ZWQuXG4gKlxuICogQHByb3BlcnR5IHJldHJ5QWZ0ZXIgLSBEZWxheSBpbiBzZWNvbmRzIGJlZm9yZSB0aGUgcmVxdWVzdCBjYW4gYmUgcmV0cmllZC5cbiAqL1xuZXhwb3J0IGNsYXNzIFRocm90dGxlRXJyb3IgZXh0ZW5kcyBXb3JrZmxvd1dvcmxkRXJyb3Ige1xuICByZXRyeUFmdGVyPzogbnVtYmVyO1xuXG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2U6IHN0cmluZywgb3B0aW9ucz86IHsgcmV0cnlBZnRlcj86IG51bWJlciB9KSB7XG4gICAgc3VwZXIobWVzc2FnZSk7XG4gICAgdGhpcy5uYW1lID0gJ1Rocm90dGxlRXJyb3InO1xuICAgIHRoaXMucmV0cnlBZnRlciA9IG9wdGlvbnM/LnJldHJ5QWZ0ZXI7XG4gIH1cblxuICBzdGF0aWMgaXModmFsdWU6IHVua25vd24pOiB2YWx1ZSBpcyBUaHJvdHRsZUVycm9yIHtcbiAgICByZXR1cm4gaXNFcnJvcih2YWx1ZSkgJiYgdmFsdWUubmFtZSA9PT0gJ1Rocm90dGxlRXJyb3InO1xuICB9XG59XG5cbi8qKlxuICogVGhyb3duIHdoZW4gYXdhaXRpbmcgYHJ1bi5yZXR1cm5WYWx1ZWAgb24gYSB3b3JrZmxvdyBydW4gdGhhdCB3YXMgY2FuY2VsbGVkLlxuICpcbiAqIFRoaXMgZXJyb3IgaW5kaWNhdGVzIHRoYXQgdGhlIHdvcmtmbG93IHdhcyBleHBsaWNpdGx5IGNhbmNlbGxlZCAodmlhXG4gKiBgcnVuLmNhbmNlbCgpYCkgYW5kIHdpbGwgbm90IHByb2R1Y2UgYSByZXR1cm4gdmFsdWUuIFlvdSBjYW4gY2hlY2sgZm9yXG4gKiBjYW5jZWxsYXRpb24gYmVmb3JlIGF3YWl0aW5nIHRoZSByZXR1cm4gdmFsdWUgYnkgaW5zcGVjdGluZyBgcnVuLnN0YXR1c2AuXG4gKlxuICogVXNlIHRoZSBzdGF0aWMgYFdvcmtmbG93UnVuQ2FuY2VsbGVkRXJyb3IuaXMoKWAgbWV0aG9kIGZvciB0eXBlLXNhZmVcbiAqIGNoZWNraW5nIGluIGNhdGNoIGJsb2Nrcy5cbiAqXG4gKiBAZXhhbXBsZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IFdvcmtmbG93UnVuQ2FuY2VsbGVkRXJyb3IgfSBmcm9tIFwid29ya2Zsb3cvaW50ZXJuYWwvZXJyb3JzXCI7XG4gKlxuICogdHJ5IHtcbiAqICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcnVuLnJldHVyblZhbHVlO1xuICogfSBjYXRjaCAoZXJyb3IpIHtcbiAqICAgaWYgKFdvcmtmbG93UnVuQ2FuY2VsbGVkRXJyb3IuaXMoZXJyb3IpKSB7XG4gKiAgICAgY29uc29sZS5sb2coYFJ1biAke2Vycm9yLnJ1bklkfSB3YXMgY2FuY2VsbGVkYCk7XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICovXG5leHBvcnQgY2xhc3MgV29ya2Zsb3dSdW5DYW5jZWxsZWRFcnJvciBleHRlbmRzIFdvcmtmbG93RXJyb3Ige1xuICBydW5JZDogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKHJ1bklkOiBzdHJpbmcpIHtcbiAgICBzdXBlcihgV29ya2Zsb3cgcnVuIFwiJHtydW5JZH1cIiBjYW5jZWxsZWRgLCB7fSk7XG4gICAgdGhpcy5uYW1lID0gJ1dvcmtmbG93UnVuQ2FuY2VsbGVkRXJyb3InO1xuICAgIHRoaXMucnVuSWQgPSBydW5JZDtcbiAgfVxuXG4gIHN0YXRpYyBpcyh2YWx1ZTogdW5rbm93bik6IHZhbHVlIGlzIFdvcmtmbG93UnVuQ2FuY2VsbGVkRXJyb3Ige1xuICAgIHJldHVybiBpc0Vycm9yKHZhbHVlKSAmJiB2YWx1ZS5uYW1lID09PSAnV29ya2Zsb3dSdW5DYW5jZWxsZWRFcnJvcic7XG4gIH1cbn1cblxuLyoqXG4gKiBUaHJvd24gd2hlbiBhdHRlbXB0aW5nIHRvIG9wZXJhdGUgb24gYSB3b3JrZmxvdyBydW4gdGhhdCByZXF1aXJlcyBhIG5ld2VyIFdvcmxkIHZlcnNpb24uXG4gKlxuICogVGhpcyBlcnJvciBvY2N1cnMgd2hlbiBhIHJ1biB3YXMgY3JlYXRlZCB3aXRoIGEgbmV3ZXIgc3BlYyB2ZXJzaW9uIHRoYW4gdGhlXG4gKiBjdXJyZW50IFdvcmxkIGltcGxlbWVudGF0aW9uIHN1cHBvcnRzLiBUbyByZXNvbHZlIHRoaXMsIHVwZ3JhZGUgeW91clxuICogYHdvcmtmbG93YCBwYWNrYWdlcyB0byBhIHZlcnNpb24gdGhhdCBzdXBwb3J0cyB0aGUgcmVxdWlyZWQgc3BlYyB2ZXJzaW9uLlxuICpcbiAqIFVzZSB0aGUgc3RhdGljIGBSdW5Ob3RTdXBwb3J0ZWRFcnJvci5pcygpYCBtZXRob2QgZm9yIHR5cGUtc2FmZSBjaGVja2luZyBpblxuICogY2F0Y2ggYmxvY2tzLlxuICpcbiAqIEBleGFtcGxlXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgUnVuTm90U3VwcG9ydGVkRXJyb3IgfSBmcm9tIFwid29ya2Zsb3cvaW50ZXJuYWwvZXJyb3JzXCI7XG4gKlxuICogdHJ5IHtcbiAqICAgY29uc3Qgc3RhdHVzID0gYXdhaXQgcnVuLnN0YXR1cztcbiAqIH0gY2F0Y2ggKGVycm9yKSB7XG4gKiAgIGlmIChSdW5Ob3RTdXBwb3J0ZWRFcnJvci5pcyhlcnJvcikpIHtcbiAqICAgICBjb25zb2xlLmVycm9yKFxuICogICAgICAgYFJ1biByZXF1aXJlcyBzcGVjIHYke2Vycm9yLnJ1blNwZWNWZXJzaW9ufSwgYCArXG4gKiAgICAgICBgYnV0IHdvcmxkIHN1cHBvcnRzIHYke2Vycm9yLndvcmxkU3BlY1ZlcnNpb259YFxuICogICAgICk7XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICovXG5leHBvcnQgY2xhc3MgUnVuTm90U3VwcG9ydGVkRXJyb3IgZXh0ZW5kcyBXb3JrZmxvd0Vycm9yIHtcbiAgcmVhZG9ubHkgcnVuU3BlY1ZlcnNpb246IG51bWJlcjtcbiAgcmVhZG9ubHkgd29ybGRTcGVjVmVyc2lvbjogbnVtYmVyO1xuXG4gIGNvbnN0cnVjdG9yKHJ1blNwZWNWZXJzaW9uOiBudW1iZXIsIHdvcmxkU3BlY1ZlcnNpb246IG51bWJlcikge1xuICAgIHN1cGVyKFxuICAgICAgYFJ1biByZXF1aXJlcyBzcGVjIHZlcnNpb24gJHtydW5TcGVjVmVyc2lvbn0sIGJ1dCB3b3JsZCBzdXBwb3J0cyB2ZXJzaW9uICR7d29ybGRTcGVjVmVyc2lvbn0uIGAgK1xuICAgICAgICBgUGxlYXNlIHVwZ3JhZGUgJ3dvcmtmbG93JyBwYWNrYWdlLmBcbiAgICApO1xuICAgIHRoaXMubmFtZSA9ICdSdW5Ob3RTdXBwb3J0ZWRFcnJvcic7XG4gICAgdGhpcy5ydW5TcGVjVmVyc2lvbiA9IHJ1blNwZWNWZXJzaW9uO1xuICAgIHRoaXMud29ybGRTcGVjVmVyc2lvbiA9IHdvcmxkU3BlY1ZlcnNpb247XG4gIH1cblxuICBzdGF0aWMgaXModmFsdWU6IHVua25vd24pOiB2YWx1ZSBpcyBSdW5Ob3RTdXBwb3J0ZWRFcnJvciB7XG4gICAgcmV0dXJuIGlzRXJyb3IodmFsdWUpICYmIHZhbHVlLm5hbWUgPT09ICdSdW5Ob3RTdXBwb3J0ZWRFcnJvcic7XG4gIH1cbn1cblxuLyoqXG4gKiBBIGZhdGFsIGVycm9yIGlzIGFuIGVycm9yIHRoYXQgY2Fubm90IGJlIHJldHJpZWQuXG4gKiBJdCB3aWxsIGNhdXNlIHRoZSBzdGVwIHRvIGZhaWwgYW5kIHRoZSBlcnJvciB3aWxsXG4gKiBiZSBidWJibGVkIHVwIHRvIHRoZSB3b3JrZmxvdyBsb2dpYy5cbiAqL1xuZXhwb3J0IGNsYXNzIEZhdGFsRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGZhdGFsID0gdHJ1ZTtcblxuICBjb25zdHJ1Y3RvcihtZXNzYWdlOiBzdHJpbmcpIHtcbiAgICBzdXBlcihtZXNzYWdlKTtcbiAgICB0aGlzLm5hbWUgPSAnRmF0YWxFcnJvcic7XG4gIH1cblxuICBzdGF0aWMgaXModmFsdWU6IHVua25vd24pOiB2YWx1ZSBpcyBGYXRhbEVycm9yIHtcbiAgICByZXR1cm4gaXNFcnJvcih2YWx1ZSkgJiYgdmFsdWUubmFtZSA9PT0gJ0ZhdGFsRXJyb3InO1xuICB9XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUmV0cnlhYmxlRXJyb3JPcHRpb25zIHtcbiAgLyoqXG4gICAqIFRoZSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIHRvIHdhaXQgYmVmb3JlIHJldHJ5aW5nIHRoZSBzdGVwLlxuICAgKiBDYW4gYWxzbyBiZSBhIGR1cmF0aW9uIHN0cmluZyAoZS5nLiwgXCI1c1wiLCBcIjJtXCIpIG9yIGEgRGF0ZSBvYmplY3QuXG4gICAqIElmIG5vdCBwcm92aWRlZCwgdGhlIHN0ZXAgd2lsbCBiZSByZXRyaWVkIGFmdGVyIDEgc2Vjb25kICgxMDAwIG1pbGxpc2Vjb25kcykuXG4gICAqL1xuICByZXRyeUFmdGVyPzogbnVtYmVyIHwgU3RyaW5nVmFsdWUgfCBEYXRlO1xufVxuXG4vKipcbiAqIEFuIGVycm9yIHRoYXQgY2FuIGhhcHBlbiBkdXJpbmcgYSBzdGVwIGV4ZWN1dGlvbiwgYWxsb3dpbmdcbiAqIGZvciBjb25maWd1cmF0aW9uIG9mIHRoZSByZXRyeSBiZWhhdmlvci5cbiAqL1xuZXhwb3J0IGNsYXNzIFJldHJ5YWJsZUVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICAvKipcbiAgICogVGhlIERhdGUgd2hlbiB0aGUgc3RlcCBzaG91bGQgYmUgcmV0cmllZC5cbiAgICovXG4gIHJldHJ5QWZ0ZXI6IERhdGU7XG5cbiAgY29uc3RydWN0b3IobWVzc2FnZTogc3RyaW5nLCBvcHRpb25zOiBSZXRyeWFibGVFcnJvck9wdGlvbnMgPSB7fSkge1xuICAgIHN1cGVyKG1lc3NhZ2UpO1xuICAgIHRoaXMubmFtZSA9ICdSZXRyeWFibGVFcnJvcic7XG5cbiAgICBpZiAob3B0aW9ucy5yZXRyeUFmdGVyICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXMucmV0cnlBZnRlciA9IHBhcnNlRHVyYXRpb25Ub0RhdGUob3B0aW9ucy5yZXRyeUFmdGVyKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gRGVmYXVsdCB0byAxIHNlY29uZCAoMTAwMCBtaWxsaXNlY29uZHMpXG4gICAgICB0aGlzLnJldHJ5QWZ0ZXIgPSBuZXcgRGF0ZShEYXRlLm5vdygpICsgMTAwMCk7XG4gICAgfVxuICB9XG5cbiAgc3RhdGljIGlzKHZhbHVlOiB1bmtub3duKTogdmFsdWUgaXMgUmV0cnlhYmxlRXJyb3Ige1xuICAgIHJldHVybiBpc0Vycm9yKHZhbHVlKSAmJiB2YWx1ZS5uYW1lID09PSAnUmV0cnlhYmxlRXJyb3InO1xuICB9XG59XG5cbmV4cG9ydCBjb25zdCBWRVJDRUxfNDAzX0VSUk9SX01FU1NBR0UgPVxuICAnWW91ciBjdXJyZW50IHZlcmNlbCBhY2NvdW50IGRvZXMgbm90IGhhdmUgYWNjZXNzIHRvIHRoaXMgcmVzb3VyY2UuIFVzZSBgdmVyY2VsIGxvZ2luYCBvciBgdmVyY2VsIHN3aXRjaGAgdG8gZW5zdXJlIHlvdSBhcmUgbGlua2VkIHRvIHRoZSByaWdodCBhY2NvdW50Lic7XG5cbmV4cG9ydCB7IFJVTl9FUlJPUl9DT0RFUywgdHlwZSBSdW5FcnJvckNvZGUgfSBmcm9tICcuL2Vycm9yLWNvZGVzLmpzJztcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBDcm9zcy1yZWFsbSBjbGFzcyByZWdpc3RyYXRpb25cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy9cbi8vIGBGYXRhbEVycm9yYCwgYFJldHJ5YWJsZUVycm9yYCwgYW5kIGBIb29rQ29uZmxpY3RFcnJvcmAgYXJlIG5vdCBidWlsdC1pbnMsIHNvIGRpZmZlcmVudCByZWFsbXNcbi8vIChlLmcuIHRoZSB3b3JrZmxvdyBWTSBjb250ZXh0IHZzLiB0aGUgaG9zdCBjb250ZXh0IHRoYXQgcnVucyB0aGUgcXVldWVcbi8vIGhhbmRsZXIpIGJ1bmRsZSBhbmQgbG9hZCB0aGVpciBvd24gY29waWVzIG9mIHRoaXMgbW9kdWxlIOKAlCBtZWFuaW5nIGVhY2hcbi8vIHJlYWxtIGhhcyBpdHMgb3duIGRpc3RpbmN0IGNsYXNzIGlkZW50aXR5LiBDcm9zcy1yZWFsbSBgaW5zdGFuY2VvZmAgZmFpbHNcbi8vIGJlY2F1c2UgdGhlIHByb3RvdHlwZSBjaGFpbnMgbmV2ZXIgbWVldC5cbi8vXG4vLyBUbyBsZXQgc2VyaWFsaXphdGlvbiByZXZpdmVycyByZWNvbnN0cnVjdCBhIHZhbHVlIGFzIHRoZSAqY29uc3VtZXIncypcbi8vIEZhdGFsRXJyb3IgKHNvIHVzZXItY29kZSBgZXJyIGluc3RhbmNlb2YgRmF0YWxFcnJvcmAgcGFzc2VzKSwgZWFjaCBidW5kbGVkXG4vLyBjb3B5IG9mIHRoaXMgbW9kdWxlIHNlbGYtcmVnaXN0ZXJzIGl0cyBjbGFzcyBvbiBgZ2xvYmFsVGhpc2AgdmlhIGEga25vd25cbi8vIFN5bWJvbC5mb3Iga2V5LiBSZXZpdmVycyBpbiBgQHdvcmtmbG93L2NvcmVgIGxvb2sgdXAgdGhlIGNsYXNzIHZpYSB0aGVcbi8vIGNvbnN1bWVyJ3MgZ2xvYmFsVGhpcyBhdCBoeWRyYXRpb24gdGltZS5cbi8vXG4vLyBGaXJzdCByZWdpc3RyYXRpb24gaW4gYSBnaXZlbiByZWFsbSB3aW5zLiBUaGUgZGVzY3JpcHRvciBpcyBub24td3JpdGFibGVcbi8vIGFuZCBub24tY29uZmlndXJhYmxlIHRvIG1ha2UgYWNjaWRlbnRhbCBjbG9iYmVyaW5nIGxvdWQuXG5jb25zdCBGQVRBTF9FUlJPUl9LRVkgPSBTeW1ib2wuZm9yKCdAd29ya2Zsb3cvZXJyb3JzLy9GYXRhbEVycm9yJyk7XG5jb25zdCBSRVRSWUFCTEVfRVJST1JfS0VZID0gU3ltYm9sLmZvcignQHdvcmtmbG93L2Vycm9ycy8vUmV0cnlhYmxlRXJyb3InKTtcbmNvbnN0IEhPT0tfQ09ORkxJQ1RfRVJST1JfS0VZID0gU3ltYm9sLmZvcihcbiAgJ0B3b3JrZmxvdy9lcnJvcnMvL0hvb2tDb25mbGljdEVycm9yJ1xuKTtcblxuaWYgKHR5cGVvZiBnbG9iYWxUaGlzICE9PSAndW5kZWZpbmVkJykge1xuICBpZiAoIU9iamVjdC5oYXNPd24oZ2xvYmFsVGhpcywgRkFUQUxfRVJST1JfS0VZKSkge1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShnbG9iYWxUaGlzLCBGQVRBTF9FUlJPUl9LRVksIHtcbiAgICAgIHZhbHVlOiBGYXRhbEVycm9yLFxuICAgICAgd3JpdGFibGU6IGZhbHNlLFxuICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICBjb25maWd1cmFibGU6IGZhbHNlLFxuICAgIH0pO1xuICB9XG4gIGlmICghT2JqZWN0Lmhhc093bihnbG9iYWxUaGlzLCBSRVRSWUFCTEVfRVJST1JfS0VZKSkge1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShnbG9iYWxUaGlzLCBSRVRSWUFCTEVfRVJST1JfS0VZLCB7XG4gICAgICB2YWx1ZTogUmV0cnlhYmxlRXJyb3IsXG4gICAgICB3cml0YWJsZTogZmFsc2UsXG4gICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgIGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gICAgfSk7XG4gIH1cbiAgaWYgKCFPYmplY3QuaGFzT3duKGdsb2JhbFRoaXMsIEhPT0tfQ09ORkxJQ1RfRVJST1JfS0VZKSkge1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShnbG9iYWxUaGlzLCBIT09LX0NPTkZMSUNUX0VSUk9SX0tFWSwge1xuICAgICAgdmFsdWU6IEhvb2tDb25mbGljdEVycm9yLFxuICAgICAgd3JpdGFibGU6IGZhbHNlLFxuICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICBjb25maWd1cmFibGU6IGZhbHNlLFxuICAgIH0pO1xuICB9XG59XG4iLCAiZXhwb3J0IGNvbnN0IFdPUktGTE9XX1VTRV9TVEVQID0gU3ltYm9sLmZvcignV09SS0ZMT1dfVVNFX1NURVAnKTtcbmV4cG9ydCBjb25zdCBXT1JLRkxPV19DUkVBVEVfSE9PSyA9IFN5bWJvbC5mb3IoJ1dPUktGTE9XX0NSRUFURV9IT09LJyk7XG5leHBvcnQgY29uc3QgV09SS0ZMT1dfU0xFRVAgPSBTeW1ib2wuZm9yKCdXT1JLRkxPV19TTEVFUCcpO1xuZXhwb3J0IGNvbnN0IFdPUktGTE9XX0NPTlRFWFQgPSBTeW1ib2wuZm9yKCdXT1JLRkxPV19DT05URVhUJyk7XG5leHBvcnQgY29uc3QgV09SS0ZMT1dfR0VUX1NUUkVBTV9JRCA9IFN5bWJvbC5mb3IoJ1dPUktGTE9XX0dFVF9TVFJFQU1fSUQnKTtcbmV4cG9ydCBjb25zdCBTVEFCTEVfVUxJRCA9IFN5bWJvbC5mb3IoJ1dPUktGTE9XX1NUQUJMRV9VTElEJyk7XG5leHBvcnQgY29uc3QgU1RSRUFNX05BTUVfU1lNQk9MID0gU3ltYm9sLmZvcignV09SS0ZMT1dfU1RSRUFNX05BTUUnKTtcbmV4cG9ydCBjb25zdCBTVFJFQU1fVFlQRV9TWU1CT0wgPSBTeW1ib2wuZm9yKCdXT1JLRkxPV19TVFJFQU1fVFlQRScpO1xuZXhwb3J0IGNvbnN0IFNUUkVBTV9GUkFNSU5HX1NZTUJPTCA9IFN5bWJvbC5mb3IoJ1dPUktGTE9XX1NUUkVBTV9GUkFNSU5HJyk7XG4vKipcbiAqIFN0YW1wZWQgb24gYSByZWFsIGBXcml0YWJsZVN0cmVhbWAgKHRoZSB1c2VyLXZpc2libGUgYHNlcmlhbGl6ZS53cml0YWJsZWBcbiAqIHJldHVybmVkIGZyb20gYSBzdGVwLXNpZGUgcmV2aXZlciBvciBzdGVwLWNvbnRleHQgYGdldFdyaXRhYmxlKClgKSB0b1xuICogcmVjb3JkIHRoZSBgcnVuSWRgIG9mIHRoZSB3b3JrZmxvdyBydW4gdGhhdCBvd25zIHRoZSB1bmRlcmx5aW5nIHNlcnZlclxuICogc3RyZWFtLiBVc2VkIHRvZ2V0aGVyIHdpdGggYFNUUkVBTV9OQU1FX1NZTUJPTGAuXG4gKlxuICogV2hlbiBgZ2V0RXh0ZXJuYWxSZWR1Y2Vycy5Xcml0YWJsZVN0cmVhbWAgKHRoZSBkZWh5ZHJhdGlvbiBwYXRoIHVzZWQgYnlcbiAqIGBzdGFydCgpYCkgc2VlcyBib3RoIHN5bWJvbHMgb24gYSB3cml0YWJsZSwgaXQgaW5jbHVkZXMgdGhlIGBydW5JZGAgaW5cbiAqIHRoZSBkZXNjcmlwdG9yIGl0IGVtaXRzLiBUaGUgY2hpbGQgcnVuJ3Mgc3RlcC1zaWRlIHJldml2ZXIgdGhlbiBvcGVuc1xuICogYSBzZXJ2ZXIgd3JpdGFibGUgYWdhaW5zdCB0aGUgb3JpZ2luYWwgYChydW5JZCwgbmFtZSlgIGFuZCByZXNvbHZlc1xuICogdGhhdCBydW4ncyBlbmNyeXB0aW9uIGtleSBkaXJlY3RseSDigJQgc28gdGhlIGNoaWxkJ3Mgd3JpdGVzIGxhbmQgb25cbiAqIHRoZSBwYXJlbnQncyBzdHJlYW0gYXMtaXMsIHdpdGggbm8gY2xpZW50IHByb2Nlc3MgaW4gdGhlIGxvb3AuIFRoYXRcbiAqIGtlZXBzIHRoZSBmb3J3YXJkaW5nIGFsaXZlIGZvciB0aGUgZnVsbCBsaWZldGltZSBvZiB0aGUgY2hpbGQgcnVuLFxuICogbm90IGp1c3QgZm9yIHRoZSBwYXJlbnQgc3RlcCB0aGF0IGluaXRpYXRlZCBgc3RhcnQoKWAuXG4gKi9cbmV4cG9ydCBjb25zdCBTVFJFQU1fU0VSVkVSX1JVTl9JRF9TWU1CT0wgPSBTeW1ib2wuZm9yKFxuICAnV09SS0ZMT1dfU1RSRUFNX1NFUlZFUl9SVU5fSUQnXG4pO1xuLyoqXG4gKiBTdGFtcGVkIGFsb25nc2lkZSBgU1RSRUFNX1NFUlZFUl9SVU5fSURfU1lNQk9MYCB3aGVuIHRoZSBkZXBsb3ltZW50IHRoYXRcbiAqIG93bnMgYSBmb3J3YXJkZWQgd3JpdGFibGUgc3RyZWFtIGlzIGtub3duLiBDcm9zcy1kZXBsb3ltZW50IGNvbnN1bWVycyB1c2VcbiAqIGl0IHRvIHJlc29sdmUgdGhlIG93bmluZyBydW4ncyBlbmNyeXB0aW9uIGtleSB3aXRob3V0IGxvYWRpbmcgdGhlIHJ1biBmaXJzdC5cbiAqL1xuZXhwb3J0IGNvbnN0IFNUUkVBTV9TRVJWRVJfREVQTE9ZTUVOVF9JRF9TWU1CT0wgPSBTeW1ib2wuZm9yKFxuICAnV09SS0ZMT1dfU1RSRUFNX1NFUlZFUl9ERVBMT1lNRU5UX0lEJ1xuKTtcbmV4cG9ydCBjb25zdCBCT0RZX0lOSVRfU1lNQk9MID0gU3ltYm9sLmZvcignQk9EWV9JTklUJyk7XG5leHBvcnQgY29uc3QgV0VCSE9PS19SRVNQT05TRV9XUklUQUJMRSA9IFN5bWJvbC5mb3IoXG4gICdXRUJIT09LX1JFU1BPTlNFX1dSSVRBQkxFJ1xuKTtcblxuLyoqXG4gKiBTeW1ib2wgdXNlZCB0byBzdG9yZSB0aGUgY2xhc3MgcmVnaXN0cnkgb24gZ2xvYmFsVGhpcyBpbiB3b3JrZmxvdyBtb2RlLlxuICogVGhpcyBhbGxvd3MgdGhlIGRlc2VyaWFsaXplciB0byBmaW5kIGNsYXNzZXMgYnkgY2xhc3NJZCBpbiB0aGUgVk0gY29udGV4dC5cbiAqL1xuZXhwb3J0IGNvbnN0IFdPUktGTE9XX0NMQVNTX1JFR0lTVFJZID0gU3ltYm9sLmZvcignd29ya2Zsb3ctY2xhc3MtcmVnaXN0cnknKTtcbiIsICJpbXBvcnQgdHlwZSB7IFN0cmluZ1ZhbHVlIH0gZnJvbSAnbXMnO1xuaW1wb3J0IHsgV09SS0ZMT1dfU0xFRVAgfSBmcm9tICcuL3N5bWJvbHMuanMnO1xuXG4vKipcbiAqIFNsZWVwIHdpdGhpbiBhIHdvcmtmbG93IGZvciBhIGdpdmVuIGR1cmF0aW9uLlxuICpcbiAqIFRoaXMgaXMgYSBidWlsdC1pbiBydW50aW1lIGZ1bmN0aW9uIHRoYXQgdXNlcyB0aW1lciBldmVudHMgaW4gdGhlIGV2ZW50IGxvZy5cbiAqXG4gKiBAcGFyYW0gZHVyYXRpb24gLSBUaGUgZHVyYXRpb24gdG8gc2xlZXAgZm9yLCB0aGlzIGlzIGEgc3RyaW5nIGluIHRoZSBmb3JtYXRcbiAqIG9mIGBcIjEwMDBtc1wiYCwgYFwiMXNcImAsIGBcIjFtXCJgLCBgXCIxaFwiYCwgb3IgYFwiMWRcImAuXG4gKiBAb3ZlcmxvYWRcbiAqIEByZXR1cm5zIEEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHdoZW4gdGhlIHNsZWVwIGlzIGNvbXBsZXRlLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2xlZXAoZHVyYXRpb246IFN0cmluZ1ZhbHVlKTogUHJvbWlzZTx2b2lkPjtcblxuLyoqXG4gKiBTbGVlcCB3aXRoaW4gYSB3b3JrZmxvdyB1bnRpbCBhIHNwZWNpZmljIGRhdGUuXG4gKlxuICogVGhpcyBpcyBhIGJ1aWx0LWluIHJ1bnRpbWUgZnVuY3Rpb24gdGhhdCB1c2VzIHRpbWVyIGV2ZW50cyBpbiB0aGUgZXZlbnQgbG9nLlxuICpcbiAqIEBwYXJhbSBkYXRlIC0gVGhlIGRhdGUgdG8gc2xlZXAgdW50aWwsIHRoaXMgbXVzdCBiZSBhIGZ1dHVyZSBkYXRlLlxuICogQG92ZXJsb2FkXG4gKiBAcmV0dXJucyBBIHByb21pc2UgdGhhdCByZXNvbHZlcyB3aGVuIHRoZSBzbGVlcCBpcyBjb21wbGV0ZS5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNsZWVwKGRhdGU6IERhdGUpOiBQcm9taXNlPHZvaWQ+O1xuXG4vKipcbiAqIFNsZWVwIHdpdGhpbiBhIHdvcmtmbG93IGZvciBhIGdpdmVuIGR1cmF0aW9uIGluIG1pbGxpc2Vjb25kcy5cbiAqXG4gKiBUaGlzIGlzIGEgYnVpbHQtaW4gcnVudGltZSBmdW5jdGlvbiB0aGF0IHVzZXMgdGltZXIgZXZlbnRzIGluIHRoZSBldmVudCBsb2cuXG4gKlxuICogQHBhcmFtIGR1cmF0aW9uTXMgLSBUaGUgZHVyYXRpb24gdG8gc2xlZXAgZm9yIGluIG1pbGxpc2Vjb25kcy5cbiAqIEBvdmVybG9hZFxuICogQHJldHVybnMgQSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2hlbiB0aGUgc2xlZXAgaXMgY29tcGxldGUuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzbGVlcChkdXJhdGlvbk1zOiBudW1iZXIpOiBQcm9taXNlPHZvaWQ+O1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2xlZXAocGFyYW06IFN0cmluZ1ZhbHVlIHwgRGF0ZSB8IG51bWJlcik6IFByb21pc2U8dm9pZD4ge1xuICAvLyBJbnNpZGUgdGhlIHdvcmtmbG93IFZNLCB0aGUgc2xlZXAgZnVuY3Rpb24gaXMgc3RvcmVkIGluIHRoZSBnbG9iYWxUaGlzIG9iamVjdCBiZWhpbmQgYSBzeW1ib2xcbiAgY29uc3Qgc2xlZXBGbiA9IChnbG9iYWxUaGlzIGFzIGFueSlbV09SS0ZMT1dfU0xFRVBdO1xuICBpZiAoIXNsZWVwRm4pIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2BzbGVlcCgpYCBjYW4gb25seSBiZSBjYWxsZWQgaW5zaWRlIGEgd29ya2Zsb3cgZnVuY3Rpb24nKTtcbiAgfVxuICByZXR1cm4gc2xlZXBGbihwYXJhbSk7XG59XG4iLCAiZXhwb3J0IGludGVyZmFjZSBXb3JrZmxvd01ldGFkYXRhIHtcbiAgLyoqXG4gICAqIFRoZSBuYW1lIG9mIHRoZSB3b3JrZmxvdy5cbiAgICovXG4gIHdvcmtmbG93TmFtZTogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBVbmlxdWUgaWRlbnRpZmllciBmb3IgdGhlIHdvcmtmbG93IHJ1bi5cbiAgICovXG4gIHdvcmtmbG93UnVuSWQ6IHN0cmluZztcblxuICAvKipcbiAgICogVGltZXN0YW1wIHdoZW4gdGhlIHdvcmtmbG93IHJ1biBzdGFydGVkLlxuICAgKi9cbiAgd29ya2Zsb3dTdGFydGVkQXQ6IERhdGU7XG5cbiAgLyoqXG4gICAqIFRoZSBVUkwgd2hlcmUgdGhlIHdvcmtmbG93IGNhbiBiZSB0cmlnZ2VyZWQuXG4gICAqL1xuICB1cmw6IHN0cmluZztcbn1cblxuZXhwb3J0IGNvbnN0IFdPUktGTE9XX0NPTlRFWFRfU1lNQk9MID1cbiAgLyogQF9fUFVSRV9fICovIFN5bWJvbC5mb3IoJ1dPUktGTE9XX0NPTlRFWFQnKTtcblxuZXhwb3J0IGZ1bmN0aW9uIGdldFdvcmtmbG93TWV0YWRhdGEoKTogV29ya2Zsb3dNZXRhZGF0YSB7XG4gIC8vIEluc2lkZSB0aGUgd29ya2Zsb3cgVk0sIHRoZSBjb250ZXh0IGlzIHN0b3JlZCBpbiB0aGUgZ2xvYmFsVGhpcyBvYmplY3QgYmVoaW5kIGEgc3ltYm9sXG4gIGNvbnN0IGN0eCA9IChnbG9iYWxUaGlzIGFzIGFueSlbV09SS0ZMT1dfQ09OVEVYVF9TWU1CT0xdIGFzIFdvcmtmbG93TWV0YWRhdGE7XG4gIGlmICghY3R4KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgJ2BnZXRXb3JrZmxvd01ldGFkYXRhKClgIGNhbiBvbmx5IGJlIGNhbGxlZCBpbnNpZGUgYSB3b3JrZmxvdyBvciBzdGVwIGZ1bmN0aW9uJ1xuICAgICk7XG4gIH1cbiAgcmV0dXJuIGN0eDtcbn1cbiIsICJpbXBvcnQgdHlwZSB7XG4gIEhvb2ssXG4gIEhvb2tPcHRpb25zLFxuICBSZXF1ZXN0V2l0aFJlc3BvbnNlLFxuICBXZWJob29rLFxuICBXZWJob29rT3B0aW9ucyxcbn0gZnJvbSAnLi4vY3JlYXRlLWhvb2suanMnO1xuaW1wb3J0IHsgV09SS0ZMT1dfQ1JFQVRFX0hPT0sgfSBmcm9tICcuLi9zeW1ib2xzLmpzJztcbmltcG9ydCB7IGdldFdvcmtmbG93TWV0YWRhdGEgfSBmcm9tICcuL2dldC13b3JrZmxvdy1tZXRhZGF0YS5qcyc7XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVIb29rPFQgPSBhbnk+KG9wdGlvbnM/OiBIb29rT3B0aW9ucyk6IEhvb2s8VD4ge1xuICAvLyBJbnNpZGUgdGhlIHdvcmtmbG93IFZNLCB0aGUgaG9vayBmdW5jdGlvbiBpcyBzdG9yZWQgaW4gdGhlIGdsb2JhbFRoaXMgb2JqZWN0IGJlaGluZCBhIHN5bWJvbFxuICBjb25zdCBjcmVhdGVIb29rRm4gPSAoZ2xvYmFsVGhpcyBhcyBhbnkpW1xuICAgIFdPUktGTE9XX0NSRUFURV9IT09LXG4gIF0gYXMgdHlwZW9mIGNyZWF0ZUhvb2s8VD47XG4gIGlmICghY3JlYXRlSG9va0ZuKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgJ2BjcmVhdGVIb29rKClgIGNhbiBvbmx5IGJlIGNhbGxlZCBpbnNpZGUgYSB3b3JrZmxvdyBmdW5jdGlvbidcbiAgICApO1xuICB9XG4gIHJldHVybiBjcmVhdGVIb29rRm4ob3B0aW9ucyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVXZWJob29rKFxuICBvcHRpb25zOiBXZWJob29rT3B0aW9ucyAmIHsgcmVzcG9uZFdpdGg6ICdtYW51YWwnIH1cbik6IFdlYmhvb2s8UmVxdWVzdFdpdGhSZXNwb25zZT47XG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlV2ViaG9vayhvcHRpb25zPzogV2ViaG9va09wdGlvbnMpOiBXZWJob29rPFJlcXVlc3Q+O1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVdlYmhvb2soXG4gIG9wdGlvbnM/OiBXZWJob29rT3B0aW9uc1xuKTogV2ViaG9vazxSZXF1ZXN0PiB8IFdlYmhvb2s8UmVxdWVzdFdpdGhSZXNwb25zZT4ge1xuICBjb25zdCB7IHJlc3BvbmRXaXRoLCB0b2tlbiwgLi4ucmVzdCB9ID0gKG9wdGlvbnMgPz8ge30pIGFzIFdlYmhvb2tPcHRpb25zICYge1xuICAgIHRva2VuPzogc3RyaW5nO1xuICB9O1xuXG4gIGlmICh0b2tlbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgJ2BjcmVhdGVXZWJob29rKClgIGRvZXMgbm90IGFjY2VwdCBhIGB0b2tlbmAgb3B0aW9uLiBXZWJob29rIHRva2VucyBhcmUgYWx3YXlzIHJhbmRvbWx5IGdlbmVyYXRlZC4gVXNlIGBjcmVhdGVIb29rKClgIHdpdGggYHJlc3VtZUhvb2soKWAgZm9yIGRldGVybWluaXN0aWMgdG9rZW4gcGF0dGVybnMuJ1xuICAgICk7XG4gIH1cblxuICBsZXQgbWV0YWRhdGE6IFBpY2s8V2ViaG9va09wdGlvbnMsICdyZXNwb25kV2l0aCc+IHwgdW5kZWZpbmVkO1xuICBpZiAodHlwZW9mIHJlc3BvbmRXaXRoICE9PSAndW5kZWZpbmVkJykge1xuICAgIG1ldGFkYXRhID0geyByZXNwb25kV2l0aCB9O1xuICB9XG5cbiAgY29uc3QgaG9vayA9IGNyZWF0ZUhvb2soeyAuLi5yZXN0LCBtZXRhZGF0YSwgaXNXZWJob29rOiB0cnVlIH0pIGFzXG4gICAgfCBXZWJob29rPFJlcXVlc3Q+XG4gICAgfCBXZWJob29rPFJlcXVlc3RXaXRoUmVzcG9uc2U+O1xuXG4gIGNvbnN0IHsgdXJsIH0gPSBnZXRXb3JrZmxvd01ldGFkYXRhKCk7XG4gIGhvb2sudXJsID0gYCR7dXJsfS8ud2VsbC1rbm93bi93b3JrZmxvdy92MS93ZWJob29rLyR7ZW5jb2RlVVJJQ29tcG9uZW50KGhvb2sudG9rZW4pfWA7XG5cbiAgcmV0dXJuIGhvb2s7XG59XG4iLCAiLyoqXG4gKiBUaGlzIGlzIHRoZSBcInN0YW5kYXJkIGxpYnJhcnlcIiBvZiBzdGVwcyB0aGF0IHdlIG1ha2UgYXZhaWxhYmxlIHRvIGFsbCB3b3JrZmxvdyB1c2Vycy5cbiAqIFRoZSBjYW4gYmUgaW1wb3J0ZWQgbGlrZSBzbzogYGltcG9ydCB7IGZldGNoIH0gZnJvbSAnd29ya2Zsb3cnYC4gYW5kIHVzZWQgaW4gd29ya2Zsb3cuXG4gKiBUaGUgbmVlZCB0byBiZSBleHBvcnRlZCBkaXJlY3RseSBpbiB0aGlzIHBhY2thZ2UgYW5kIGNhbm5vdCBsaXZlIGluIGBjb3JlYCB0byBwcmV2ZW50XG4gKiBjaXJjdWxhciBkZXBlbmRlbmNpZXMgcG9zdC1jb21waWxhdGlvbi5cbiAqL1xuXG4vKipcbiAqIEEgaG9pc3RlZCBgZmV0Y2goKWAgZnVuY3Rpb24gdGhhdCBpcyBleGVjdXRlZCBhcyBhIFwic3RlcFwiIGZ1bmN0aW9uLFxuICogZm9yIHVzZSB3aXRoaW4gd29ya2Zsb3cgZnVuY3Rpb25zLlxuICpcbiAqIEBzZWUgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL0ZldGNoX0FQSVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZmV0Y2goLi4uYXJnczogUGFyYW1ldGVyczx0eXBlb2YgZ2xvYmFsVGhpcy5mZXRjaD4pIHtcbiAgJ3VzZSBzdGVwJztcbiAgcmV0dXJuIGdsb2JhbFRoaXMuZmV0Y2goLi4uYXJncyk7XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBFeHByZXNzaW9uIH0gZnJvbSBcIi4vYXN0LmpzXCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgRXZhbHVhdGlvbkNvbnRleHQge1xuICByZWFkb25seSBpbnB1dDogdW5rbm93bjtcbiAgcmVhZG9ubHkgbm9kZU91dHB1dHM6IFJlYWRvbmx5PFJlY29yZDxzdHJpbmcsIHVua25vd24+Pjtcbn1cblxuZXhwb3J0IGNsYXNzIEV4cHJlc3Npb25FdmFsdWF0aW9uRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIG1lc3NhZ2U6IHN0cmluZyxcbiAgICByZWFkb25seSBleHByZXNzaW9uOiBFeHByZXNzaW9uLFxuICApIHtcbiAgICBzdXBlcihtZXNzYWdlKTtcbiAgICB0aGlzLm5hbWUgPSBcIkV4cHJlc3Npb25FdmFsdWF0aW9uRXJyb3JcIjtcbiAgfVxufVxuXG4vKipcbiAqIERldGVybWluaXN0aWMsIHRvdGFsLWJ5LWNvbnN0cnVjdGlvbiBldmFsdWF0b3IuIE1pc3NpbmcgcGF0aHMgcmFpc2UgYSB0eXBlZFxuICogRXhwcmVzc2lvbkV2YWx1YXRpb25FcnJvciAobmV2ZXIgYSBzaWxlbnQgYHVuZGVmaW5lZGApIHNvIGNvbXBpbGUtdGltZVxuICogZmlkZWxpdHkgZ2FwcyBjYW4ndCBsZWFrIGludG8gcnVudGltZSBhcyBlbXB0eSBzdHJpbmdzIG9yIG5vLW9wcy5cbiAqIFB1cmUgZGF0YS1pbi9kYXRhLW91dCBcdTIwMTQgdGhlcmUgaXMgbm8gY29kZS1leGVjdXRpb24gcGF0aCBoZXJlIGJ5IGRlc2lnbi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGV2YWx1YXRlRXhwcmVzc2lvbihleHByZXNzaW9uOiBFeHByZXNzaW9uLCBjb250ZXh0OiBFdmFsdWF0aW9uQ29udGV4dCk6IHVua25vd24ge1xuICBzd2l0Y2ggKGV4cHJlc3Npb24ua2luZCkge1xuICAgIGNhc2UgXCJsaXRlcmFsXCI6XG4gICAgICByZXR1cm4gZXhwcmVzc2lvbi52YWx1ZTtcbiAgICBjYXNlIFwiaW5wdXRcIjpcbiAgICAgIHJldHVybiByZXNvbHZlUGF0aChjb250ZXh0LmlucHV0LCBleHByZXNzaW9uLnBhdGgsIGV4cHJlc3Npb24sIFwiaW5wdXRcIik7XG4gICAgY2FzZSBcIm5vZGVPdXRwdXRcIjoge1xuICAgICAgaWYgKCEoZXhwcmVzc2lvbi5ub2RlSWQgaW4gY29udGV4dC5ub2RlT3V0cHV0cykpIHtcbiAgICAgICAgdGhyb3cgbmV3IEV4cHJlc3Npb25FdmFsdWF0aW9uRXJyb3IoXG4gICAgICAgICAgYE5vIG91dHB1dCByZWNvcmRlZCBmb3Igbm9kZSBcIiR7ZXhwcmVzc2lvbi5ub2RlSWR9XCIuYCxcbiAgICAgICAgICBleHByZXNzaW9uLFxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc29sdmVQYXRoKFxuICAgICAgICBjb250ZXh0Lm5vZGVPdXRwdXRzW2V4cHJlc3Npb24ubm9kZUlkXSxcbiAgICAgICAgZXhwcmVzc2lvbi5wYXRoLFxuICAgICAgICBleHByZXNzaW9uLFxuICAgICAgICBgbm9kZU91dHB1dCgke2V4cHJlc3Npb24ubm9kZUlkfSlgLFxuICAgICAgKTtcbiAgICB9XG4gICAgY2FzZSBcImludGVycG9sYXRlXCI6XG4gICAgICByZXR1cm4gZXhwcmVzc2lvbi5wYXJ0c1xuICAgICAgICAubWFwKChwYXJ0KSA9PiBzdHJpbmdpZnkoZXZhbHVhdGVFeHByZXNzaW9uKHBhcnQsIGNvbnRleHQpKSlcbiAgICAgICAgLmpvaW4oXCJcIik7XG4gICAgY2FzZSBcImNvbXBhcmVcIjoge1xuICAgICAgY29uc3QgbGVmdCA9IGV2YWx1YXRlRXhwcmVzc2lvbihleHByZXNzaW9uLmxlZnQsIGNvbnRleHQpO1xuICAgICAgY29uc3QgcmlnaHQgPSBldmFsdWF0ZUV4cHJlc3Npb24oZXhwcmVzc2lvbi5yaWdodCwgY29udGV4dCk7XG4gICAgICByZXR1cm4gY29tcGFyZShleHByZXNzaW9uLm9wZXJhdG9yLCBsZWZ0LCByaWdodCwgZXhwcmVzc2lvbik7XG4gICAgfVxuICAgIGNhc2UgXCJib29sZWFuXCI6IHtcbiAgICAgIGNvbnN0IHZhbHVlcyA9IGV4cHJlc3Npb24ub3BlcmFuZHMubWFwKChvcGVyYW5kKSA9PlxuICAgICAgICB0b0Jvb2xlYW4oZXZhbHVhdGVFeHByZXNzaW9uKG9wZXJhbmQsIGNvbnRleHQpLCBleHByZXNzaW9uKSxcbiAgICAgICk7XG4gICAgICBzd2l0Y2ggKGV4cHJlc3Npb24ub3BlcmF0b3IpIHtcbiAgICAgICAgY2FzZSBcImFuZFwiOlxuICAgICAgICAgIHJldHVybiB2YWx1ZXMuZXZlcnkoQm9vbGVhbik7XG4gICAgICAgIGNhc2UgXCJvclwiOlxuICAgICAgICAgIHJldHVybiB2YWx1ZXMuc29tZShCb29sZWFuKTtcbiAgICAgICAgY2FzZSBcIm5vdFwiOiB7XG4gICAgICAgICAgaWYgKHZhbHVlcy5sZW5ndGggIT09IDEpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFeHByZXNzaW9uRXZhbHVhdGlvbkVycm9yKFwibm90IHRha2VzIGV4YWN0bHkgb25lIG9wZXJhbmQuXCIsIGV4cHJlc3Npb24pO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gIXZhbHVlc1swXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgfVxuICAgIGNhc2UgXCJvYmplY3RcIjoge1xuICAgICAgY29uc3QgcmVzdWx0OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiA9IHt9O1xuICAgICAgZm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXMoZXhwcmVzc2lvbi5lbnRyaWVzKSkge1xuICAgICAgICByZXN1bHRba2V5XSA9IGV2YWx1YXRlRXhwcmVzc2lvbih2YWx1ZSwgY29udGV4dCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbiAgICBjYXNlIFwiYXJyYXlcIjpcbiAgICAgIHJldHVybiBleHByZXNzaW9uLml0ZW1zLm1hcCgoaXRlbSkgPT4gZXZhbHVhdGVFeHByZXNzaW9uKGl0ZW0sIGNvbnRleHQpKTtcbiAgfVxufVxuXG5mdW5jdGlvbiByZXNvbHZlUGF0aChcbiAgcm9vdDogdW5rbm93bixcbiAgcGF0aDogcmVhZG9ubHkgc3RyaW5nW10sXG4gIGV4cHJlc3Npb246IEV4cHJlc3Npb24sXG4gIGxhYmVsOiBzdHJpbmcsXG4pOiB1bmtub3duIHtcbiAgbGV0IGN1cnJlbnQ6IHVua25vd24gPSByb290O1xuICBmb3IgKGNvbnN0IHNlZ21lbnQgb2YgcGF0aCkge1xuICAgIGlmIChBcnJheS5pc0FycmF5KGN1cnJlbnQpICYmIC9eXFxkKyQvLnRlc3Qoc2VnbWVudCkpIHtcbiAgICAgIGN1cnJlbnQgPSBjdXJyZW50W051bWJlcihzZWdtZW50KV07XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgaWYgKGN1cnJlbnQgIT09IG51bGwgJiYgdHlwZW9mIGN1cnJlbnQgPT09IFwib2JqZWN0XCIgJiYgc2VnbWVudCBpbiAoY3VycmVudCBhcyBvYmplY3QpKSB7XG4gICAgICBjdXJyZW50ID0gKGN1cnJlbnQgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4pW3NlZ21lbnRdO1xuICAgICAgY29udGludWU7XG4gICAgfVxuICAgIHRocm93IG5ldyBFeHByZXNzaW9uRXZhbHVhdGlvbkVycm9yKFxuICAgICAgYFBhdGggJHtsYWJlbH0uJHtwYXRoLmpvaW4oXCIuXCIpfSBpcyBtaXNzaW5nIGF0IHNlZ21lbnQgXCIke3NlZ21lbnR9XCIuYCxcbiAgICAgIGV4cHJlc3Npb24sXG4gICAgKTtcbiAgfVxuICByZXR1cm4gY3VycmVudDtcbn1cblxuZnVuY3Rpb24gY29tcGFyZShcbiAgb3BlcmF0b3I6IFwiZXFcIiB8IFwibmVcIiB8IFwibHRcIiB8IFwibGVcIiB8IFwiZ3RcIiB8IFwiZ2VcIixcbiAgbGVmdDogdW5rbm93bixcbiAgcmlnaHQ6IHVua25vd24sXG4gIGV4cHJlc3Npb246IEV4cHJlc3Npb24sXG4pOiBib29sZWFuIHtcbiAgaWYgKG9wZXJhdG9yID09PSBcImVxXCIpIHJldHVybiBkZWVwRXF1YWxzKGxlZnQsIHJpZ2h0KTtcbiAgaWYgKG9wZXJhdG9yID09PSBcIm5lXCIpIHJldHVybiAhZGVlcEVxdWFscyhsZWZ0LCByaWdodCk7XG4gIGlmICh0eXBlb2YgbGVmdCA9PT0gXCJudW1iZXJcIiAmJiB0eXBlb2YgcmlnaHQgPT09IFwibnVtYmVyXCIpIHtcbiAgICBzd2l0Y2ggKG9wZXJhdG9yKSB7XG4gICAgICBjYXNlIFwibHRcIjpcbiAgICAgICAgcmV0dXJuIGxlZnQgPCByaWdodDtcbiAgICAgIGNhc2UgXCJsZVwiOlxuICAgICAgICByZXR1cm4gbGVmdCA8PSByaWdodDtcbiAgICAgIGNhc2UgXCJndFwiOlxuICAgICAgICByZXR1cm4gbGVmdCA+IHJpZ2h0O1xuICAgICAgY2FzZSBcImdlXCI6XG4gICAgICAgIHJldHVybiBsZWZ0ID49IHJpZ2h0O1xuICAgIH1cbiAgfVxuICBpZiAodHlwZW9mIGxlZnQgPT09IFwic3RyaW5nXCIgJiYgdHlwZW9mIHJpZ2h0ID09PSBcInN0cmluZ1wiKSB7XG4gICAgY29uc3Qgb3JkZXIgPSBsZWZ0IDwgcmlnaHQgPyAtMSA6IGxlZnQgPiByaWdodCA/IDEgOiAwO1xuICAgIHN3aXRjaCAob3BlcmF0b3IpIHtcbiAgICAgIGNhc2UgXCJsdFwiOlxuICAgICAgICByZXR1cm4gb3JkZXIgPCAwO1xuICAgICAgY2FzZSBcImxlXCI6XG4gICAgICAgIHJldHVybiBvcmRlciA8PSAwO1xuICAgICAgY2FzZSBcImd0XCI6XG4gICAgICAgIHJldHVybiBvcmRlciA+IDA7XG4gICAgICBjYXNlIFwiZ2VcIjpcbiAgICAgICAgcmV0dXJuIG9yZGVyID49IDA7XG4gICAgfVxuICB9XG4gIHRocm93IG5ldyBFeHByZXNzaW9uRXZhbHVhdGlvbkVycm9yKFxuICAgIGBPcmRlcmVkIGNvbXBhcmlzb24gXCIke29wZXJhdG9yfVwiIHJlcXVpcmVzIHR3byBudW1iZXJzIG9yIHR3byBzdHJpbmdzLmAsXG4gICAgZXhwcmVzc2lvbixcbiAgKTtcbn1cblxuZnVuY3Rpb24gZGVlcEVxdWFscyhsZWZ0OiB1bmtub3duLCByaWdodDogdW5rbm93bik6IGJvb2xlYW4ge1xuICBpZiAoT2JqZWN0LmlzKGxlZnQsIHJpZ2h0KSkgcmV0dXJuIHRydWU7XG4gIGlmICh0eXBlb2YgbGVmdCAhPT0gdHlwZW9mIHJpZ2h0IHx8IGxlZnQgPT09IG51bGwgfHwgcmlnaHQgPT09IG51bGwpIHJldHVybiBmYWxzZTtcbiAgaWYgKHR5cGVvZiBsZWZ0ICE9PSBcIm9iamVjdFwiKSByZXR1cm4gZmFsc2U7XG4gIHJldHVybiBKU09OLnN0cmluZ2lmeShzb3J0S2V5cyhsZWZ0KSkgPT09IEpTT04uc3RyaW5naWZ5KHNvcnRLZXlzKHJpZ2h0KSk7XG59XG5cbmZ1bmN0aW9uIHNvcnRLZXlzKHZhbHVlOiB1bmtub3duKTogdW5rbm93biB7XG4gIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkgcmV0dXJuIHZhbHVlLm1hcChzb3J0S2V5cyk7XG4gIGlmICh2YWx1ZSAhPT0gbnVsbCAmJiB0eXBlb2YgdmFsdWUgPT09IFwib2JqZWN0XCIpIHtcbiAgICByZXR1cm4gT2JqZWN0LmZyb21FbnRyaWVzKFxuICAgICAgT2JqZWN0LmVudHJpZXModmFsdWUgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4pXG4gICAgICAgIC5zb3J0KChbYV0sIFtiXSkgPT4gKGEgPCBiID8gLTEgOiBhID4gYiA/IDEgOiAwKSlcbiAgICAgICAgLm1hcCgoW2tleSwgZW50cnldKSA9PiBba2V5LCBzb3J0S2V5cyhlbnRyeSldKSxcbiAgICApO1xuICB9XG4gIHJldHVybiB2YWx1ZTtcbn1cblxuZnVuY3Rpb24gdG9Cb29sZWFuKHZhbHVlOiB1bmtub3duLCBleHByZXNzaW9uOiBFeHByZXNzaW9uKTogYm9vbGVhbiB7XG4gIGlmICh0eXBlb2YgdmFsdWUgPT09IFwiYm9vbGVhblwiKSByZXR1cm4gdmFsdWU7XG4gIHRocm93IG5ldyBFeHByZXNzaW9uRXZhbHVhdGlvbkVycm9yKFwiQm9vbGVhbiBvcGVyYXRvcnMgcmVxdWlyZSBib29sZWFuIG9wZXJhbmRzLlwiLCBleHByZXNzaW9uKTtcbn1cblxuZnVuY3Rpb24gc3RyaW5naWZ5KHZhbHVlOiB1bmtub3duKTogc3RyaW5nIHtcbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJzdHJpbmdcIikgcmV0dXJuIHZhbHVlO1xuICBpZiAodmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgIHRocm93IG5ldyBFeHByZXNzaW9uRXZhbHVhdGlvbkVycm9yKFwiQ2Fubm90IGludGVycG9sYXRlIG51bGwvdW5kZWZpbmVkLlwiLCBsaXRlcmFsT2YodmFsdWUpKTtcbiAgfVxuICBpZiAodHlwZW9mIHZhbHVlID09PSBcIm51bWJlclwiIHx8IHR5cGVvZiB2YWx1ZSA9PT0gXCJib29sZWFuXCIpIHJldHVybiBTdHJpbmcodmFsdWUpO1xuICByZXR1cm4gSlNPTi5zdHJpbmdpZnkodmFsdWUpO1xufVxuXG5mdW5jdGlvbiBsaXRlcmFsT2YodmFsdWU6IHVua25vd24pOiBFeHByZXNzaW9uIHtcbiAgcmV0dXJuIHsga2luZDogXCJsaXRlcmFsXCIsIHZhbHVlIH07XG59XG4iLCAiLyoqX19pbnRlcm5hbF93b3JrZmxvd3N7XCJzdGVwc1wiOntcInN0ZXBzL2V4ZWN1dG9ycy50c1wiOntcImNvbXB1dGVBY3Rpb25EaWdlc3RcIjp7XCJzdGVwSWRcIjpcInN0ZXAvLy4vc3RlcHMvZXhlY3V0b3JzLy9jb21wdXRlQWN0aW9uRGlnZXN0XCJ9LFwiZGlzcGF0Y2hDYXBhYmlsaXR5XCI6e1wic3RlcElkXCI6XCJzdGVwLy8uL3N0ZXBzL2V4ZWN1dG9ycy8vZGlzcGF0Y2hDYXBhYmlsaXR5XCJ9LFwiZXZhbHVhdGVSdW50aW1lUG9saWN5XCI6e1wic3RlcElkXCI6XCJzdGVwLy8uL3N0ZXBzL2V4ZWN1dG9ycy8vZXZhbHVhdGVSdW50aW1lUG9saWN5XCJ9LFwicmVhZEFydGlmYWN0XCI6e1wic3RlcElkXCI6XCJzdGVwLy8uL3N0ZXBzL2V4ZWN1dG9ycy8vcmVhZEFydGlmYWN0XCJ9LFwicmVjb3JkQXVkaXRFdmVudFwiOntcInN0ZXBJZFwiOlwic3RlcC8vLi9zdGVwcy9leGVjdXRvcnMvL3JlY29yZEF1ZGl0RXZlbnRcIn0sXCJ3cml0ZUFydGlmYWN0XCI6e1wic3RlcElkXCI6XCJzdGVwLy8uL3N0ZXBzL2V4ZWN1dG9ycy8vd3JpdGVBcnRpZmFjdFwifX19fSovO1xuZXhwb3J0IHZhciBjb21wdXRlQWN0aW9uRGlnZXN0ID0gZ2xvYmFsVGhpc1tTeW1ib2wuZm9yKFwiV09SS0ZMT1dfVVNFX1NURVBcIildKFwic3RlcC8vLi9zdGVwcy9leGVjdXRvcnMvL2NvbXB1dGVBY3Rpb25EaWdlc3RcIik7XG5jb21wdXRlQWN0aW9uRGlnZXN0Lm1heFJldHJpZXMgPSAzO1xuZXhwb3J0IHZhciByZWNvcmRBdWRpdEV2ZW50ID0gZ2xvYmFsVGhpc1tTeW1ib2wuZm9yKFwiV09SS0ZMT1dfVVNFX1NURVBcIildKFwic3RlcC8vLi9zdGVwcy9leGVjdXRvcnMvL3JlY29yZEF1ZGl0RXZlbnRcIik7XG5yZWNvcmRBdWRpdEV2ZW50Lm1heFJldHJpZXMgPSAzO1xuZXhwb3J0IHZhciBldmFsdWF0ZVJ1bnRpbWVQb2xpY3kgPSBnbG9iYWxUaGlzW1N5bWJvbC5mb3IoXCJXT1JLRkxPV19VU0VfU1RFUFwiKV0oXCJzdGVwLy8uL3N0ZXBzL2V4ZWN1dG9ycy8vZXZhbHVhdGVSdW50aW1lUG9saWN5XCIpO1xuZXZhbHVhdGVSdW50aW1lUG9saWN5Lm1heFJldHJpZXMgPSAzO1xuZXhwb3J0IHZhciByZWFkQXJ0aWZhY3QgPSBnbG9iYWxUaGlzW1N5bWJvbC5mb3IoXCJXT1JLRkxPV19VU0VfU1RFUFwiKV0oXCJzdGVwLy8uL3N0ZXBzL2V4ZWN1dG9ycy8vcmVhZEFydGlmYWN0XCIpO1xucmVhZEFydGlmYWN0Lm1heFJldHJpZXMgPSAzO1xuZXhwb3J0IHZhciB3cml0ZUFydGlmYWN0ID0gZ2xvYmFsVGhpc1tTeW1ib2wuZm9yKFwiV09SS0ZMT1dfVVNFX1NURVBcIildKFwic3RlcC8vLi9zdGVwcy9leGVjdXRvcnMvL3dyaXRlQXJ0aWZhY3RcIik7XG53cml0ZUFydGlmYWN0Lm1heFJldHJpZXMgPSAzO1xuLyoqXG4gKiBUaGUgc2luZ2xlIG1lZGlhdGVkIGRpc3BhdGNoIHBhdGggZm9yIGV2ZXJ5IGNhcGFiaWxpdHkgZWZmZWN0LlxuICogbWF4UmV0cmllcyA9IDA6IHRoZSBpbnRlcnByZXRlciBvd25zIHJldHJpZXMgcGVyIHRoZSBub2RlJ3MgUmV0cnlQb2xpY3ksXG4gKiBzbyByZXRyeSBjb3VudGluZyBzdGF5cyBkZXRlcm1pbmlzdGljIGFuZCBpZGVtcG90ZW5jeS1hd2FyZS5cbiAqLyBleHBvcnQgdmFyIGRpc3BhdGNoQ2FwYWJpbGl0eSA9IGdsb2JhbFRoaXNbU3ltYm9sLmZvcihcIldPUktGTE9XX1VTRV9TVEVQXCIpXShcInN0ZXAvLy4vc3RlcHMvZXhlY3V0b3JzLy9kaXNwYXRjaENhcGFiaWxpdHlcIik7XG5kaXNwYXRjaENhcGFiaWxpdHkubWF4UmV0cmllcyA9IDA7XG4iLCAiaW1wb3J0IHsgRmF0YWxFcnJvciwgY3JlYXRlSG9vaywgZ2V0V29ya2Zsb3dNZXRhZGF0YSwgc2xlZXAgfSBmcm9tIFwid29ya2Zsb3dcIjtcbmltcG9ydCB7IGV2YWx1YXRlRXhwcmVzc2lvbiB9IGZyb20gXCJAcXVpY2tkZXBsb3lhaS93b3JrZmxvdy1leHByZXNzaW9uc1wiO1xuaW1wb3J0IHsgY29tcHV0ZUFjdGlvbkRpZ2VzdCwgZGlzcGF0Y2hDYXBhYmlsaXR5LCBldmFsdWF0ZVJ1bnRpbWVQb2xpY3ksIHJlY29yZEF1ZGl0RXZlbnQgfSBmcm9tIFwiLi4vc3RlcHMvZXhlY3V0b3JzLmpzXCI7XG4vKipfX2ludGVybmFsX3dvcmtmbG93c3tcIndvcmtmbG93c1wiOntcIndvcmtmbG93cy9ydW4tZXhlY3V0aW9uLXBsYW4udHNcIjp7XCJydW5FeGVjdXRpb25QbGFuXCI6e1wid29ya2Zsb3dJZFwiOlwid29ya2Zsb3cvLy4vd29ya2Zsb3dzL3J1bi1leGVjdXRpb24tcGxhbi8vcnVuRXhlY3V0aW9uUGxhblwifX19fSovO1xuY2xhc3MgUGxhbkZhaWx1cmUgZXh0ZW5kcyBFcnJvciB7XG4gICAgY29kZTtcbiAgICBjb25zdHJ1Y3Rvcihjb2RlLCBtZXNzYWdlKXtcbiAgICAgICAgc3VwZXIobWVzc2FnZSksIHRoaXMuY29kZSA9IGNvZGU7XG4gICAgICAgIHRoaXMubmFtZSA9IFwiUGxhbkZhaWx1cmVcIjtcbiAgICB9XG59XG4vKipcbiAqIFRoZSBnZW5lcmljLCBwcmVjb21waWxlZCBwbGFuIGludGVycHJldGVyOiBPTkUgc3RhdGljYWxseS1jb21waWxlZFxuICogd29ya2Zsb3cgZnVuY3Rpb24gdGhhdCBpbnRlcnByZXRzIGFueSBpbW11dGFibGUgRXhlY3V0aW9uUGxhblYxLlxuICogQ29udHJvbCBmbG93IHJ1bnMgaW4gdGhlIGRldGVybWluaXN0aWMgd29ya2Zsb3cgc2FuZGJveDsgZXZlcnkgZWZmZWN0XG4gKiBkaXNwYXRjaGVzIHRocm91Z2ggdGhlIGNsb3NlZCBzdGF0aWMgZXhlY3V0b3Igc3VyZmFjZTsgYXBwcm92YWxzIGFuZFxuICogc2lnbmFscyBzdXNwZW5kIG9uIHJlYWwgV29ya2Zsb3cgU0RLIGhvb2tzOyBwYXJhbGxlbCBicmFuY2hlcyBhbmQgY2hpbGRcbiAqIHBsYW5zIHVzZSByZWFsIFNESyBjb25jdXJyZW5jeS5cbiAqLyBleHBvcnQgYXN5bmMgZnVuY3Rpb24gcnVuRXhlY3V0aW9uUGxhbihyZXF1ZXN0KSB7XG4gICAgY29uc3QgbWV0YWRhdGEgPSBnZXRXb3JrZmxvd01ldGFkYXRhKCk7XG4gICAgY29uc3QgcnVuSWQgPSBtZXRhZGF0YS53b3JrZmxvd1J1bklkO1xuICAgIGlmIChyZXF1ZXN0LmJpbmRpbmdzLnBsYW5EaWdlc3QgIT09IHJlcXVlc3QucGxhbkRpZ2VzdCkge1xuICAgICAgICB0aHJvdyBuZXcgRmF0YWxFcnJvcihgQmluZGluZyBsb2NrIHRhcmdldHMgJHtyZXF1ZXN0LmJpbmRpbmdzLnBsYW5EaWdlc3R9LCBub3QgcGxhbiAke3JlcXVlc3QucGxhbkRpZ2VzdH0uYCk7XG4gICAgfVxuICAgIGNvbnN0IHN0YXRlID0ge1xuICAgICAgICBydW5JZCxcbiAgICAgICAgcGxhbkRpZ2VzdDogcmVxdWVzdC5wbGFuRGlnZXN0LFxuICAgICAgICBwb2xpY3lEaWdlc3Q6IHJlcXVlc3QucGxhbkRpZ2VzdCxcbiAgICAgICAgcGxhbjogcmVxdWVzdC5wbGFuLFxuICAgICAgICBiaW5kaW5nczogbmV3IE1hcChyZXF1ZXN0LmJpbmRpbmdzLmJpbmRpbmdzLm1hcCgoYmluZGluZyk9PltcbiAgICAgICAgICAgICAgICBiaW5kaW5nLnJlcXVpcmVtZW50SWQsXG4gICAgICAgICAgICAgICAgYmluZGluZ1xuICAgICAgICAgICAgXSkpLFxuICAgICAgICBvdXRwdXRzOiB7fSxcbiAgICAgICAgZGVwdGg6IDBcbiAgICB9O1xuICAgIGF3YWl0IHJlY29yZEF1ZGl0RXZlbnQoe1xuICAgICAgICBydW5JZCxcbiAgICAgICAgcGxhbkRpZ2VzdDogcmVxdWVzdC5wbGFuRGlnZXN0LFxuICAgICAgICB0eXBlOiBcInJ1bi1zdGFydGVkXCIsXG4gICAgICAgIGRldGFpbDoge1xuICAgICAgICAgICAgcGxhbklkOiByZXF1ZXN0LnBsYW4uaWQsXG4gICAgICAgICAgICBuYW1lOiByZXF1ZXN0LnBsYW4ubmFtZVxuICAgICAgICB9XG4gICAgfSk7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgaW50ZXJwcmV0R3JhcGgoc3RhdGUsIHJlcXVlc3QucGxhbi5lbnRyeU5vZGVJZCwgcmVxdWVzdC5pbnB1dCk7XG4gICAgICAgIGF3YWl0IHJlY29yZEF1ZGl0RXZlbnQoe1xuICAgICAgICAgICAgcnVuSWQsXG4gICAgICAgICAgICBwbGFuRGlnZXN0OiByZXF1ZXN0LnBsYW5EaWdlc3QsXG4gICAgICAgICAgICB0eXBlOiBcInJ1bi1jb21wbGV0ZWRcIixcbiAgICAgICAgICAgIGRldGFpbDoge31cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgYXdhaXQgcmVjb3JkQXVkaXRFdmVudCh7XG4gICAgICAgICAgICBydW5JZCxcbiAgICAgICAgICAgIHBsYW5EaWdlc3Q6IHJlcXVlc3QucGxhbkRpZ2VzdCxcbiAgICAgICAgICAgIHR5cGU6IFwicnVuLWZhaWxlZFwiLFxuICAgICAgICAgICAgZGV0YWlsOiB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZTogZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICB9XG59XG5ydW5FeGVjdXRpb25QbGFuLndvcmtmbG93SWQgPSBcIndvcmtmbG93Ly8uL3dvcmtmbG93cy9ydW4tZXhlY3V0aW9uLXBsYW4vL3J1bkV4ZWN1dGlvblBsYW5cIjtcbmdsb2JhbFRoaXMuX19wcml2YXRlX3dvcmtmbG93cy5zZXQoXCJ3b3JrZmxvdy8vLi93b3JrZmxvd3MvcnVuLWV4ZWN1dGlvbi1wbGFuLy9ydW5FeGVjdXRpb25QbGFuXCIsIHJ1bkV4ZWN1dGlvblBsYW4pO1xuLyoqIFdhbGsgYSBub2RlIGNoYWluIHVudGlsIGEgdGVybWluYXRvcjsgcmV0dXJucyB0aGUgbGFzdCBwcm9kdWNlZCBvdXRwdXQuICovIGFzeW5jIGZ1bmN0aW9uIGludGVycHJldEdyYXBoKHN0YXRlLCBlbnRyeU5vZGVJZCwgaW5wdXQpIHtcbiAgICBsZXQgbm9kZUlkID0gZW50cnlOb2RlSWQ7XG4gICAgbGV0IGxhc3RPdXRwdXQ7XG4gICAgd2hpbGUobm9kZUlkICE9PSB1bmRlZmluZWQpe1xuICAgICAgICBjb25zdCBub2RlID0gc3RhdGUucGxhbi5ub2Rlc1tub2RlSWRdO1xuICAgICAgICBpZiAoIW5vZGUpIHRocm93IG5ldyBGYXRhbEVycm9yKGBQbGFuIHJlZmVyZW5jZXMgbWlzc2luZyBub2RlIFwiJHtub2RlSWR9XCIuYCk7XG4gICAgICAgIGNvbnN0IGNvbnRleHQgPSB7XG4gICAgICAgICAgICBpbnB1dCxcbiAgICAgICAgICAgIG5vZGVPdXRwdXRzOiBzdGF0ZS5vdXRwdXRzXG4gICAgICAgIH07XG4gICAgICAgIHN3aXRjaChub2RlLmtpbmQpe1xuICAgICAgICAgICAgY2FzZSBcInN1Y2NlZWRcIjpcbiAgICAgICAgICAgICAgICByZXR1cm4gbm9kZS5vdXRwdXQgPyBldmFsdWF0ZUV4cHJlc3Npb24obm9kZS5vdXRwdXQsIGNvbnRleHQpIDogbGFzdE91dHB1dDtcbiAgICAgICAgICAgIGNhc2UgXCJmYWlsXCI6XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEZhdGFsRXJyb3IoYCR7bm9kZS5lcnJvcn0ke25vZGUubWVzc2FnZSA/IGA6ICR7bm9kZS5tZXNzYWdlfWAgOiBcIlwifWApO1xuICAgICAgICAgICAgY2FzZSBcImNob2ljZVwiOlxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHRhcmdldDtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBjaG9pY2Ugb2Ygbm9kZS5jaG9pY2VzKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChldmFsdWF0ZUV4cHJlc3Npb24oY2hvaWNlLndoZW4sIGNvbnRleHQpID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0ID0gY2hvaWNlLnRoZW47XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0ID8/PSBub2RlLm90aGVyd2lzZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRhcmdldCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRmF0YWxFcnJvcihgQ2hvaWNlIFwiJHtub2RlLmlkfVwiIG1hdGNoZWQgbm8gYnJhbmNoIGFuZCBoYXMgbm8gb3RoZXJ3aXNlLmApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIG5vZGVJZCA9IHRhcmdldDtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSBcIndhaXRcIjpcbiAgICAgICAgICAgICAgICBhd2FpdCBzbGVlcChgJHtub2RlLnNlY29uZHN9c2ApO1xuICAgICAgICAgICAgICAgIHN0YXRlLm91dHB1dHNbbm9kZS5pZF0gPSB7XG4gICAgICAgICAgICAgICAgICAgIHdhaXRlZFNlY29uZHM6IG5vZGUuc2Vjb25kc1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwic2lnbmFsXCI6XG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBob29rID0gY3JlYXRlSG9vayh7XG4gICAgICAgICAgICAgICAgICAgICAgICB0b2tlbjogYHNpZ25hbDoke3N0YXRlLnJ1bklkfToke25vZGUuc2lnbmFsTmFtZX1gXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBwYXlsb2FkID0gYXdhaXQgaG9vaztcbiAgICAgICAgICAgICAgICAgICAgc3RhdGUub3V0cHV0c1tub2RlLmlkXSA9IHBheWxvYWQ7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgXCJhcHByb3ZhbFwiOlxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3ViamVjdCA9IGV2YWx1YXRlRXhwcmVzc2lvbihub2RlLnN1YmplY3QsIGNvbnRleHQpO1xuICAgICAgICAgICAgICAgICAgICBzdGF0ZS5vdXRwdXRzW25vZGUuaWRdID0gYXdhaXQgcnVuQXBwcm92YWwoc3RhdGUsIG5vZGUuaWQsIG5vZGUucGxhbmUsIHN1YmplY3QsIG5vZGUuZXhwaXJlc1NlY29uZHMpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlIFwicGFyYWxsZWxcIjpcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdHMgPSBhd2FpdCBQcm9taXNlLmFsbChub2RlLmJyYW5jaGVzLm1hcCgoYnJhbmNoKT0+aW50ZXJwcmV0R3JhcGgoc3RhdGUsIGJyYW5jaC5lbnRyeU5vZGVJZCwgaW5wdXQpKSk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXRlLm91dHB1dHNbbm9kZS5pZF0gPSByZXN1bHRzO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlIFwiZm9yRWFjaFwiOlxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaXRlbXMgPSBldmFsdWF0ZUV4cHJlc3Npb24obm9kZS5pdGVtcywgY29udGV4dCk7XG4gICAgICAgICAgICAgICAgICAgIGlmICghQXJyYXkuaXNBcnJheShpdGVtcykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBGYXRhbEVycm9yKGBmb3JFYWNoIFwiJHtub2RlLmlkfVwiIGl0ZW1zIGRpZCBub3QgZXZhbHVhdGUgdG8gYW4gYXJyYXkuYCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY29uY3VycmVuY3kgPSBNYXRoLm1pbihub2RlLm1heENvbmN1cnJlbmN5LCBzdGF0ZS5wbGFuLmJ1ZGdldHMubWF4UGFyYWxsZWxpc20pO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCByZXN1bHRzID0gW107XG4gICAgICAgICAgICAgICAgICAgIGZvcihsZXQgb2Zmc2V0ID0gMDsgb2Zmc2V0IDwgaXRlbXMubGVuZ3RoOyBvZmZzZXQgKz0gY29uY3VycmVuY3kpe1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY2h1bmsgPSBpdGVtcy5zbGljZShvZmZzZXQsIG9mZnNldCArIGNvbmN1cnJlbmN5KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNodW5rUmVzdWx0cyA9IGF3YWl0IFByb21pc2UuYWxsKGNodW5rLm1hcCgoaXRlbSwgaW5kZXgpPT5pbnRlcnByZXRJdGVyYXRpb24oc3RhdGUsIG5vZGUuYm9keUVudHJ5Tm9kZUlkLCBpbnB1dCwgbm9kZS5pZCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmRleDogb2Zmc2V0ICsgaW5kZXhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKC4uLmNodW5rUmVzdWx0cyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgc3RhdGUub3V0cHV0c1tub2RlLmlkXSA9IHJlc3VsdHM7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgXCJsb29wXCI6XG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBtYXhJdGVyYXRpb25zID0gTWF0aC5taW4obm9kZS5tYXhJdGVyYXRpb25zLCBzdGF0ZS5wbGFuLmJ1ZGdldHMubWF4SXRlcmF0aW9ucyk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdHMgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgZm9yKGxldCBpdGVyYXRpb24gPSAwOyBpdGVyYXRpb24gPCBtYXhJdGVyYXRpb25zOyBpdGVyYXRpb24gKz0gMSl7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobm9kZS5jb250aW51ZVdoaWxlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcHJvY2VlZCA9IGV2YWx1YXRlRXhwcmVzc2lvbihub2RlLmNvbnRpbnVlV2hpbGUsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5wdXQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVPdXRwdXRzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuLi5zdGF0ZS5vdXRwdXRzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW25vZGUuaWRdOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlcmF0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwcm9jZWVkICE9PSB0cnVlKSBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaChhd2FpdCBpbnRlcnByZXRJdGVyYXRpb24oc3RhdGUsIG5vZGUuYm9keUVudHJ5Tm9kZUlkLCBpbnB1dCwgbm9kZS5pZCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZXJhdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRzXG4gICAgICAgICAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgc3RhdGUub3V0cHV0c1tub2RlLmlkXSA9IHJlc3VsdHM7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgXCJjaGlsZFdvcmtmbG93XCI6XG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBzdGF0ZS5vdXRwdXRzW25vZGUuaWRdID0gYXdhaXQgcnVuQ2hpbGRQbGFuKHN0YXRlLCBub2RlLCBjb250ZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSBcImludm9rZVwiOlxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgc3RhdGUub3V0cHV0c1tub2RlLmlkXSA9IGF3YWl0IHJ1bkludm9rZShzdGF0ZSwgbm9kZSwgY29udGV4dCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBsYXN0T3V0cHV0ID0gc3RhdGUub3V0cHV0c1tub2RlLmlkXTtcbiAgICAgICAgbm9kZUlkID0gXCJuZXh0XCIgaW4gbm9kZSA/IG5vZGUubmV4dCA6IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgcmV0dXJuIGxhc3RPdXRwdXQ7XG59XG4vKiogSXRlcmF0aW9ucyBnZXQgYW4gb3V0cHV0cyBvdmVybGF5IHNvIGNvbmN1cnJlbnQgYm9kaWVzIGRvbid0IGNvbGxpZGUuICovIGFzeW5jIGZ1bmN0aW9uIGludGVycHJldEl0ZXJhdGlvbihzdGF0ZSwgYm9keUVudHJ5Tm9kZUlkLCBpbnB1dCwgc2xvdE5vZGVJZCwgc2xvdFZhbHVlKSB7XG4gICAgY29uc3QgaXRlcmF0aW9uU3RhdGUgPSB7XG4gICAgICAgIC4uLnN0YXRlLFxuICAgICAgICBvdXRwdXRzOiB7XG4gICAgICAgICAgICAuLi5zdGF0ZS5vdXRwdXRzLFxuICAgICAgICAgICAgW3Nsb3ROb2RlSWRdOiBzbG90VmFsdWVcbiAgICAgICAgfVxuICAgIH07XG4gICAgcmV0dXJuIGludGVycHJldEdyYXBoKGl0ZXJhdGlvblN0YXRlLCBib2R5RW50cnlOb2RlSWQsIGlucHV0KTtcbn1cbmFzeW5jIGZ1bmN0aW9uIHJ1bkludm9rZShzdGF0ZSwgbm9kZSwgY29udGV4dCkge1xuICAgIGNvbnN0IHJlcXVpcmVtZW50ID0gc3RhdGUucGxhbi5jYXBhYmlsaXR5UmVxdWlyZW1lbnRzLmZpbmQoKHJlcSk9PnJlcS5pZCA9PT0gbm9kZS5iaW5kaW5nKTtcbiAgICBpZiAoIXJlcXVpcmVtZW50KSB0aHJvdyBuZXcgRmF0YWxFcnJvcihgSW52b2tlIFwiJHtub2RlLmlkfVwiIGhhcyBubyByZXF1aXJlbWVudCBcIiR7bm9kZS5iaW5kaW5nfVwiLmApO1xuICAgIGNvbnN0IGJpbmRpbmcgPSBzdGF0ZS5iaW5kaW5ncy5nZXQobm9kZS5iaW5kaW5nKTtcbiAgICBpZiAoIWJpbmRpbmcpIHRocm93IG5ldyBGYXRhbEVycm9yKGBObyBiaW5kaW5nIGxvY2tlZCBmb3IgcmVxdWlyZW1lbnQgXCIke25vZGUuYmluZGluZ31cIi5gKTtcbiAgICBjb25zdCBhcmdzID0gZXZhbHVhdGVFeHByZXNzaW9uKG5vZGUuaW5wdXQsIGNvbnRleHQpO1xuICAgIGNvbnN0IGl0ZXJhdGlvbktleSA9IGl0ZXJhdGlvbktleU9mKGNvbnRleHQpO1xuICAgIC8vIFByZS1mbGlnaHQgcG9saWN5OiBkZXRlcm1pbmVzIHdoZXRoZXIgYSBkaWdlc3QtYm91bmQgYXBwcm92YWwgaXMgbmVlZGVkXG4gICAgLy8gYmVmb3JlIGRpc3BhdGNoIChkaXNwYXRjaCByZS1ldmFsdWF0ZXMgXHUyMDE0IGRlZmVuc2UgaW4gZGVwdGgpLlxuICAgIGNvbnN0IHByZWZsaWdodCA9IGF3YWl0IGV2YWx1YXRlUnVudGltZVBvbGljeSh7XG4gICAgICAgIHN1YmplY3Q6IFwid29ya2Zsb3dcIixcbiAgICAgICAgcmVxdWlyZW1lbnRJZDogcmVxdWlyZW1lbnQuaWQsXG4gICAgICAgIHByb3RvY29sOiByZXF1aXJlbWVudC5wcm90b2NvbCxcbiAgICAgICAgb3BlcmF0aW9uOiByZXF1aXJlbWVudC5vcGVyYXRpb24sXG4gICAgICAgIGVmZmVjdDogcmVxdWlyZW1lbnQuZWZmZWN0LFxuICAgICAgICBwbGFuRGlnZXN0OiBzdGF0ZS5wb2xpY3lEaWdlc3QsXG4gICAgICAgIHJ1bklkOiBzdGF0ZS5ydW5JZCxcbiAgICAgICAgLi4uYmluZGluZy5lbmRwb2ludCA9PT0gdW5kZWZpbmVkID8ge30gOiB7XG4gICAgICAgICAgICBob3N0OiBob3N0T2YoYmluZGluZy5lbmRwb2ludClcbiAgICAgICAgfSxcbiAgICAgICAgLi4uYmluZGluZy5jcmVkZW50aWFsSGFuZGxlID09PSB1bmRlZmluZWQgPyB7fSA6IHtcbiAgICAgICAgICAgIGNyZWRlbnRpYWxIYW5kbGU6IGJpbmRpbmcuY3JlZGVudGlhbEhhbmRsZVxuICAgICAgICB9LFxuICAgICAgICBhcmdzXG4gICAgfSk7XG4gICAgaWYgKHByZWZsaWdodC5kZWNpc2lvbiA9PT0gXCJkZW55XCIpIHtcbiAgICAgICAgaWYgKG5vZGUub25FcnJvcikgcmV0dXJuIHJvdXRlRXJyb3Ioc3RhdGUsIG5vZGUsIGNvbnRleHQsIGBwb2xpY3kgZGVuaWVkOiAke3ByZWZsaWdodC5yZWFzb259YCk7XG4gICAgICAgIHRocm93IG5ldyBGYXRhbEVycm9yKGBQb2xpY3kgZGVuaWVkICR7cmVxdWlyZW1lbnQub3BlcmF0aW9ufTogJHtwcmVmbGlnaHQucmVhc29ufWApO1xuICAgIH1cbiAgICBsZXQgYXBwcm92ZWRBcmd1bWVudHNEaWdlc3Q7XG4gICAgaWYgKHByZWZsaWdodC5kZWNpc2lvbiA9PT0gXCJhcHByb3ZhbC1yZXF1aXJlZFwiIHx8IG5vZGUuYXBwcm92YWwgPT09IFwiYnVzaW5lc3MtZWZmZWN0XCIpIHtcbiAgICAgICAgLy8gVGhlIGFwcHJvdmFsIGJpbmRzIHRvIEVYQUNUTFkgdGhlIGFyZ3VtZW50cyB0aGF0IHdpbGwgZGlzcGF0Y2ggXHUyMDE0XG4gICAgICAgIC8vIGRpc3BhdGNoIHJlY29tcHV0ZXMgdGhlIGRpZ2VzdCBvdmVyIHRoZSBzYW1lIHZhbHVlIChUT0NUT1Utc2FmZSkuXG4gICAgICAgIGNvbnN0IGFwcHJvdmFsID0gYXdhaXQgcnVuQXBwcm92YWwoc3RhdGUsIG5vZGUuaWQsIFwiYnVzaW5lc3MtZWZmZWN0XCIsIGFyZ3MsIHVuZGVmaW5lZCk7XG4gICAgICAgIGFwcHJvdmVkQXJndW1lbnRzRGlnZXN0ID0gYXBwcm92YWwuYXJndW1lbnRzRGlnZXN0O1xuICAgIH1cbiAgICBjb25zdCBtYXhBdHRlbXB0cyA9IG5vZGUucmV0cnk/Lm1heEF0dGVtcHRzID8/IDE7XG4gICAgbGV0IGxhc3RFcnJvcjtcbiAgICBmb3IobGV0IGF0dGVtcHQgPSAxOyBhdHRlbXB0IDw9IG1heEF0dGVtcHRzOyBhdHRlbXB0ICs9IDEpe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcmVxdWVzdCA9IHtcbiAgICAgICAgICAgICAgICBydW5JZDogc3RhdGUucnVuSWQsXG4gICAgICAgICAgICAgICAgcGxhbkRpZ2VzdDogc3RhdGUucGxhbkRpZ2VzdCxcbiAgICAgICAgICAgICAgICBwb2xpY3lEaWdlc3Q6IHN0YXRlLnBvbGljeURpZ2VzdCxcbiAgICAgICAgICAgICAgICBub2RlSWQ6IG5vZGUuaWQsXG4gICAgICAgICAgICAgICAgYXR0ZW1wdCxcbiAgICAgICAgICAgICAgICBpdGVyYXRpb25LZXksXG4gICAgICAgICAgICAgICAgc3ViamVjdDogXCJ3b3JrZmxvd1wiLFxuICAgICAgICAgICAgICAgIHJlcXVpcmVtZW50LFxuICAgICAgICAgICAgICAgIGJpbmRpbmcsXG4gICAgICAgICAgICAgICAgYXJncyxcbiAgICAgICAgICAgICAgICAuLi5hcHByb3ZlZEFyZ3VtZW50c0RpZ2VzdCA9PT0gdW5kZWZpbmVkID8ge30gOiB7XG4gICAgICAgICAgICAgICAgICAgIGFwcHJvdmVkQXJndW1lbnRzRGlnZXN0XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAuLi5hd2FpdCBzZXJpYWxpemVJZGVtcG90ZW5jeShzdGF0ZSwgbm9kZSwgY29udGV4dClcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZXR1cm4gYXdhaXQgZGlzcGF0Y2hDYXBhYmlsaXR5KHJlcXVlc3QpO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgbGFzdEVycm9yID0gZXJyb3I7XG4gICAgICAgICAgICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBGYXRhbEVycm9yIHx8IGlzRmF0YWxOYW1lKGVycm9yKSkgYnJlYWs7XG4gICAgICAgICAgICBpZiAoYXR0ZW1wdCA8IG1heEF0dGVtcHRzICYmIChub2RlLnJldHJ5Py5iYWNrb2ZmU2Vjb25kcyA/PyAwKSA+IDApIHtcbiAgICAgICAgICAgICAgICBhd2FpdCBzbGVlcChgJHtub2RlLnJldHJ5Py5iYWNrb2ZmU2Vjb25kcyA/PyAwfXNgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAobm9kZS5vbkVycm9yKSB7XG4gICAgICAgIHJldHVybiByb3V0ZUVycm9yKHN0YXRlLCBub2RlLCBjb250ZXh0LCBsYXN0RXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGxhc3RFcnJvci5tZXNzYWdlIDogU3RyaW5nKGxhc3RFcnJvcikpO1xuICAgIH1cbiAgICB0aHJvdyBsYXN0RXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGxhc3RFcnJvciA6IG5ldyBGYXRhbEVycm9yKFN0cmluZyhsYXN0RXJyb3IpKTtcbn1cbmFzeW5jIGZ1bmN0aW9uIHNlcmlhbGl6ZUlkZW1wb3RlbmN5KHN0YXRlLCBub2RlLCBjb250ZXh0KSB7XG4gICAgY29uc3QgcG9saWN5ID0gbm9kZS5pZGVtcG90ZW5jeTtcbiAgICBpZiAoIXBvbGljeSkgcmV0dXJuIHt9O1xuICAgIHN3aXRjaChwb2xpY3kua2luZCl7XG4gICAgICAgIGNhc2UgXCJwcm92aWRlci1rZXlcIjpcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgaWRlbXBvdGVuY3k6IHtcbiAgICAgICAgICAgICAgICAgICAga2luZDogXCJwcm92aWRlci1rZXlcIixcbiAgICAgICAgICAgICAgICAgICAga2V5VmFsdWU6IFN0cmluZyhldmFsdWF0ZUV4cHJlc3Npb24ocG9saWN5LmtleSwgY29udGV4dCkpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgY2FzZSBcImRlZHVwbGljYXRpb24tcmVjb3JkXCI6XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGlkZW1wb3RlbmN5OiB7XG4gICAgICAgICAgICAgICAgICAgIGtpbmQ6IFwiZGVkdXBsaWNhdGlvbi1yZWNvcmRcIixcbiAgICAgICAgICAgICAgICAgICAgbmFtZXNwYWNlOiBwb2xpY3kubmFtZXNwYWNlXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgY2FzZSBcImxvb2t1cC1iZWZvcmUtY3JlYXRlXCI6XG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgY29uc3QgeyByZXF1aXJlbWVudCwgYmluZGluZyB9ID0gcmVzb2x2ZUJpbmRpbmcoc3RhdGUsIHBvbGljeS5sb29rdXBCaW5kaW5nKTtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBpZGVtcG90ZW5jeToge1xuICAgICAgICAgICAgICAgICAgICAgICAga2luZDogXCJsb29rdXAtYmVmb3JlLWNyZWF0ZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgbG9va3VwUmVxdWlyZW1lbnQ6IHJlcXVpcmVtZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgbG9va3VwQmluZGluZzogYmluZGluZ1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgY2FzZSBcInJlY29uY2lsaWF0aW9uXCI6XG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgY29uc3QgeyByZXF1aXJlbWVudCwgYmluZGluZyB9ID0gcmVzb2x2ZUJpbmRpbmcoc3RhdGUsIHBvbGljeS52ZXJpZnlCaW5kaW5nKTtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBpZGVtcG90ZW5jeToge1xuICAgICAgICAgICAgICAgICAgICAgICAga2luZDogXCJyZWNvbmNpbGlhdGlvblwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgdmVyaWZ5UmVxdWlyZW1lbnQ6IHJlcXVpcmVtZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgdmVyaWZ5QmluZGluZzogYmluZGluZ1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgY2FzZSBcIm5vdC1pZGVtcG90ZW50XCI6XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGlkZW1wb3RlbmN5OiB7XG4gICAgICAgICAgICAgICAgICAgIGtpbmQ6IFwibm90LWlkZW1wb3RlbnRcIlxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgfVxufVxuZnVuY3Rpb24gcmVzb2x2ZUJpbmRpbmcoc3RhdGUsIHJlcXVpcmVtZW50SWQpIHtcbiAgICBjb25zdCByZXF1aXJlbWVudCA9IHN0YXRlLnBsYW4uY2FwYWJpbGl0eVJlcXVpcmVtZW50cy5maW5kKChyZXEpPT5yZXEuaWQgPT09IHJlcXVpcmVtZW50SWQpO1xuICAgIGNvbnN0IGJpbmRpbmcgPSBzdGF0ZS5iaW5kaW5ncy5nZXQocmVxdWlyZW1lbnRJZCk7XG4gICAgaWYgKCFyZXF1aXJlbWVudCB8fCAhYmluZGluZykge1xuICAgICAgICB0aHJvdyBuZXcgRmF0YWxFcnJvcihgSWRlbXBvdGVuY3kgaGVscGVyIHJlcXVpcmVtZW50IFwiJHtyZXF1aXJlbWVudElkfVwiIGlzIG5vdCBib3VuZC5gKTtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVxdWlyZW1lbnQsXG4gICAgICAgIGJpbmRpbmdcbiAgICB9O1xufVxuYXN5bmMgZnVuY3Rpb24gcm91dGVFcnJvcihzdGF0ZSwgbm9kZSwgY29udGV4dCwgbWVzc2FnZSkge1xuICAgIHN0YXRlLm91dHB1dHNbbm9kZS5pZF0gPSB7XG4gICAgICAgIGVycm9yOiBtZXNzYWdlXG4gICAgfTtcbiAgICByZXR1cm4gaW50ZXJwcmV0R3JhcGgoc3RhdGUsIG5vZGUub25FcnJvciwgY29udGV4dC5pbnB1dCk7XG59XG4vKipcbiAqIERpZ2VzdC1ib3VuZCBhcHByb3ZhbDogdGhlIGhvb2sgdG9rZW4gZW1iZWRzIHBsYW4gZGlnZXN0ICsgbm9kZSArIHRoZVxuICogZXhhY3QgYXJndW1lbnQgZGlnZXN0LiBBcHByb3ZpbmcgYSBkaWZmZXJlbnQgZGlnZXN0LCBvciBhZnRlciBleHBpcnksXG4gKiBuZXZlciByZWxlYXNlcyB0aGUgZWZmZWN0LiBUd28gcGxhbmVzOiBidXNpbmVzcy1lZmZlY3QgYW5kXG4gKiBwb2xpY3ktZXhwYW5zaW9uLlxuICovIGFzeW5jIGZ1bmN0aW9uIHJ1bkFwcHJvdmFsKHN0YXRlLCBub2RlSWQsIHBsYW5lLCBzdWJqZWN0LCBleHBpcmVzU2Vjb25kcykge1xuICAgIGNvbnN0IGFyZ3VtZW50c0RpZ2VzdCA9IGF3YWl0IGNvbXB1dGVBY3Rpb25EaWdlc3Qoc3ViamVjdCk7XG4gICAgY29uc3QgdG9rZW4gPSBgYXBwcm92YWw6JHtzdGF0ZS5ydW5JZH06JHtzdGF0ZS5wbGFuRGlnZXN0fToke25vZGVJZH06JHthcmd1bWVudHNEaWdlc3R9YDtcbiAgICBhd2FpdCByZWNvcmRBdWRpdEV2ZW50KHtcbiAgICAgICAgcnVuSWQ6IHN0YXRlLnJ1bklkLFxuICAgICAgICBwbGFuRGlnZXN0OiBzdGF0ZS5wbGFuRGlnZXN0LFxuICAgICAgICB0eXBlOiBcImFwcHJvdmFsLXJlcXVlc3RlZFwiLFxuICAgICAgICBub2RlSWQsXG4gICAgICAgIGRldGFpbDoge1xuICAgICAgICAgICAgcGxhbmUsXG4gICAgICAgICAgICB0b2tlbixcbiAgICAgICAgICAgIGFyZ3VtZW50c0RpZ2VzdFxuICAgICAgICB9XG4gICAgfSk7XG4gICAgY29uc3QgaG9vayA9IGNyZWF0ZUhvb2soe1xuICAgICAgICB0b2tlblxuICAgIH0pO1xuICAgIGxldCBkZWNpc2lvbjtcbiAgICBpZiAoZXhwaXJlc1NlY29uZHMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBjb25zdCBleHBpcnkgPSBzbGVlcChgJHtleHBpcmVzU2Vjb25kc31zYCkudGhlbigoKT0+XCJleHBpcmVkXCIpO1xuICAgICAgICBjb25zdCByYWNlZCA9IGF3YWl0IFByb21pc2UucmFjZShbXG4gICAgICAgICAgICBob29rLFxuICAgICAgICAgICAgZXhwaXJ5XG4gICAgICAgIF0pO1xuICAgICAgICBpZiAocmFjZWQgPT09IFwiZXhwaXJlZFwiKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRmF0YWxFcnJvcihgQXBwcm92YWwgZm9yIG5vZGUgXCIke25vZGVJZH1cIiBleHBpcmVkIGFmdGVyICR7ZXhwaXJlc1NlY29uZHN9cy5gKTtcbiAgICAgICAgfVxuICAgICAgICBkZWNpc2lvbiA9IHJhY2VkO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGRlY2lzaW9uID0gYXdhaXQgaG9vaztcbiAgICB9XG4gICAgY29uc3QgcmVzb2x2ZWREZXRhaWwgPSB7XG4gICAgICAgIHBsYW5lLFxuICAgICAgICBhcHByb3ZlZDogZGVjaXNpb24uYXBwcm92ZWQsXG4gICAgICAgIHByZXNlbnRlZDogZGVjaXNpb24uYXJndW1lbnRzRGlnZXN0LFxuICAgICAgICBleHBlY3RlZDogYXJndW1lbnRzRGlnZXN0XG4gICAgfTtcbiAgICBhd2FpdCByZWNvcmRBdWRpdEV2ZW50KHtcbiAgICAgICAgcnVuSWQ6IHN0YXRlLnJ1bklkLFxuICAgICAgICBwbGFuRGlnZXN0OiBzdGF0ZS5wbGFuRGlnZXN0LFxuICAgICAgICB0eXBlOiBcImFwcHJvdmFsLXJlc29sdmVkXCIsXG4gICAgICAgIG5vZGVJZCxcbiAgICAgICAgZGV0YWlsOiByZXNvbHZlZERldGFpbFxuICAgIH0pO1xuICAgIGlmICghZGVjaXNpb24uYXBwcm92ZWQpIHtcbiAgICAgICAgdGhyb3cgbmV3IEZhdGFsRXJyb3IoYEFwcHJvdmFsIGZvciBub2RlIFwiJHtub2RlSWR9XCIgd2FzIHJlamVjdGVkLmApO1xuICAgIH1cbiAgICBpZiAoZGVjaXNpb24uYXJndW1lbnRzRGlnZXN0ICE9PSBhcmd1bWVudHNEaWdlc3QpIHtcbiAgICAgICAgdGhyb3cgbmV3IEZhdGFsRXJyb3IoYEFwcHJvdmFsIGZvciBub2RlIFwiJHtub2RlSWR9XCIgaXMgYm91bmQgdG8gZGlnZXN0ICR7ZGVjaXNpb24uYXJndW1lbnRzRGlnZXN0fSwgbm90ICR7YXJndW1lbnRzRGlnZXN0fSBcdTIwMTQgcGFyYW1ldGVycyBjaGFuZ2VkIGFmdGVyIGFwcHJvdmFsLmApO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgICBhcHByb3ZlZDogdHJ1ZSxcbiAgICAgICAgYXJndW1lbnRzRGlnZXN0XG4gICAgfTtcbn1cbi8qKiBDaGlsZCBwbGFucyBydW4gZmxhdHRlbmVkIHdpdGggdGhlaXIgb3duIGRpZ2VzdCwgYnVkZ2V0cywgYW5kIGF1ZGl0IGlkZW50aXR5LiAqLyBhc3luYyBmdW5jdGlvbiBydW5DaGlsZFBsYW4oc3RhdGUsIG5vZGUsIGNvbnRleHQpIHtcbiAgICBpZiAoc3RhdGUuZGVwdGggKyAxID49IHN0YXRlLnBsYW4uYnVkZ2V0cy5tYXhEZXB0aCkge1xuICAgICAgICB0aHJvdyBuZXcgRmF0YWxFcnJvcihgQ2hpbGQgd29ya2Zsb3cgXCIke25vZGUuaWR9XCIgZXhjZWVkcyB0aGUgZGVwdGggYnVkZ2V0LmApO1xuICAgIH1cbiAgICBjb25zdCBjaGlsZERpZ2VzdCA9IGF3YWl0IGNvbXB1dGVBY3Rpb25EaWdlc3Qobm9kZS5wbGFuKTtcbiAgICBhd2FpdCByZWNvcmRBdWRpdEV2ZW50KHtcbiAgICAgICAgcnVuSWQ6IHN0YXRlLnJ1bklkLFxuICAgICAgICBwbGFuRGlnZXN0OiBzdGF0ZS5wbGFuRGlnZXN0LFxuICAgICAgICB0eXBlOiBcImNoaWxkLXdvcmtmbG93XCIsXG4gICAgICAgIG5vZGVJZDogbm9kZS5pZCxcbiAgICAgICAgZGV0YWlsOiB7XG4gICAgICAgICAgICBjaGlsZFBsYW5EaWdlc3Q6IGNoaWxkRGlnZXN0LFxuICAgICAgICAgICAgY2hpbGRQbGFuSWQ6IG5vZGUucGxhbi5pZFxuICAgICAgICB9XG4gICAgfSk7XG4gICAgY29uc3QgY2hpbGRJbnB1dCA9IGV2YWx1YXRlRXhwcmVzc2lvbihub2RlLmlucHV0LCBjb250ZXh0KTtcbiAgICBjb25zdCBjaGlsZFN0YXRlID0ge1xuICAgICAgICBydW5JZDogc3RhdGUucnVuSWQsXG4gICAgICAgIHBsYW5EaWdlc3Q6IGNoaWxkRGlnZXN0LFxuICAgICAgICBwb2xpY3lEaWdlc3Q6IHN0YXRlLnBvbGljeURpZ2VzdCxcbiAgICAgICAgcGxhbjogbm9kZS5wbGFuLFxuICAgICAgICBiaW5kaW5nczogc3RhdGUuYmluZGluZ3MsXG4gICAgICAgIG91dHB1dHM6IHt9LFxuICAgICAgICBkZXB0aDogc3RhdGUuZGVwdGggKyAxXG4gICAgfTtcbiAgICByZXR1cm4gaW50ZXJwcmV0R3JhcGgoY2hpbGRTdGF0ZSwgbm9kZS5wbGFuLmVudHJ5Tm9kZUlkLCBjaGlsZElucHV0KTtcbn1cbmZ1bmN0aW9uIGl0ZXJhdGlvbktleU9mKGNvbnRleHQpIHtcbiAgICAvLyBJdGVyYXRpb24gc2xvdHMgYXJlIGluamVjdGVkIGludG8gbm9kZU91dHB1dHMgb3ZlcmxheXM7IGRlcml2ZSBhIHN0YWJsZVxuICAgIC8vIGtleSBmcm9tIGFueSBpdGVyYXRpb24vaW5kZXggbWFya2VycyBwcmVzZW50LlxuICAgIGNvbnN0IG1hcmtlcnMgPSBbXTtcbiAgICBmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyhjb250ZXh0Lm5vZGVPdXRwdXRzKSl7XG4gICAgICAgIGlmICh2YWx1ZSAhPT0gbnVsbCAmJiB0eXBlb2YgdmFsdWUgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICAgIGNvbnN0IHNsb3QgPSB2YWx1ZTtcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygc2xvdC5pdGVyYXRpb24gPT09IFwibnVtYmVyXCIpIG1hcmtlcnMucHVzaChgJHtrZXl9PSR7c2xvdC5pdGVyYXRpb259YCk7XG4gICAgICAgICAgICBlbHNlIGlmICh0eXBlb2Ygc2xvdC5pbmRleCA9PT0gXCJudW1iZXJcIikgbWFya2Vycy5wdXNoKGAke2tleX0jJHtzbG90LmluZGV4fWApO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBtYXJrZXJzLmxlbmd0aCA9PT0gMCA/IFwiMFwiIDogbWFya2Vycy5zb3J0KCkuam9pbihcInxcIik7XG59XG5mdW5jdGlvbiBob3N0T2YoZW5kcG9pbnQpIHtcbiAgICByZXR1cm4gbmV3IFVSTChlbmRwb2ludCkuaG9zdDtcbn1cbmZ1bmN0aW9uIGlzRmF0YWxOYW1lKGVycm9yKSB7XG4gICAgcmV0dXJuIGVycm9yIGluc3RhbmNlb2YgRXJyb3IgJiYgKGVycm9yLm5hbWUgPT09IFwiRmF0YWxFcnJvclwiIHx8IGVycm9yLm5hbWUgPT09IFwiUGxhbkZhaWx1cmVcIik7XG59XG4iLCAiZnVuY3Rpb24gX3RzX2FkZF9kaXNwb3NhYmxlX3Jlc291cmNlKGVudiwgdmFsdWUsIGFzeW5jKSB7XG4gICAgaWYgKHZhbHVlICE9PSBudWxsICYmIHZhbHVlICE9PSB2b2lkIDApIHtcbiAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgdmFsdWUgIT09IFwiZnVuY3Rpb25cIikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIk9iamVjdCBleHBlY3RlZC5cIik7XG4gICAgICAgIHZhciBkaXNwb3NlLCBpbm5lcjtcbiAgICAgICAgaWYgKGFzeW5jKSB7XG4gICAgICAgICAgICBpZiAoIVN5bWJvbC5hc3luY0Rpc3Bvc2UpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJTeW1ib2wuYXN5bmNEaXNwb3NlIGlzIG5vdCBkZWZpbmVkLlwiKTtcbiAgICAgICAgICAgIGRpc3Bvc2UgPSB2YWx1ZVtTeW1ib2wuYXN5bmNEaXNwb3NlXTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZGlzcG9zZSA9PT0gdm9pZCAwKSB7XG4gICAgICAgICAgICBpZiAoIVN5bWJvbC5kaXNwb3NlKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3ltYm9sLmRpc3Bvc2UgaXMgbm90IGRlZmluZWQuXCIpO1xuICAgICAgICAgICAgZGlzcG9zZSA9IHZhbHVlW1N5bWJvbC5kaXNwb3NlXTtcbiAgICAgICAgICAgIGlmIChhc3luYykgaW5uZXIgPSBkaXNwb3NlO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2YgZGlzcG9zZSAhPT0gXCJmdW5jdGlvblwiKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiT2JqZWN0IG5vdCBkaXNwb3NhYmxlLlwiKTtcbiAgICAgICAgaWYgKGlubmVyKSBkaXNwb3NlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGlubmVyLmNhbGwodGhpcyk7XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBlbnYuc3RhY2sucHVzaCh7XG4gICAgICAgICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICAgICAgICBkaXNwb3NlOiBkaXNwb3NlLFxuICAgICAgICAgICAgYXN5bmM6IGFzeW5jXG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAoYXN5bmMpIHtcbiAgICAgICAgZW52LnN0YWNrLnB1c2goe1xuICAgICAgICAgICAgYXN5bmM6IHRydWVcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiB2YWx1ZTtcbn1cbmZ1bmN0aW9uIF90c19kaXNwb3NlX3Jlc291cmNlcyhlbnYpIHtcbiAgICB2YXIgX1N1cHByZXNzZWRFcnJvciA9IHR5cGVvZiBTdXBwcmVzc2VkRXJyb3IgPT09IFwiZnVuY3Rpb25cIiA/IFN1cHByZXNzZWRFcnJvciA6IGZ1bmN0aW9uKGVycm9yLCBzdXBwcmVzc2VkLCBtZXNzYWdlKSB7XG4gICAgICAgIHZhciBlID0gbmV3IEVycm9yKG1lc3NhZ2UpO1xuICAgICAgICByZXR1cm4gZS5uYW1lID0gXCJTdXBwcmVzc2VkRXJyb3JcIiwgZS5lcnJvciA9IGVycm9yLCBlLnN1cHByZXNzZWQgPSBzdXBwcmVzc2VkLCBlO1xuICAgIH07XG4gICAgcmV0dXJuIChfdHNfZGlzcG9zZV9yZXNvdXJjZXMgPSBmdW5jdGlvbiBfdHNfZGlzcG9zZV9yZXNvdXJjZXMoZW52KSB7XG4gICAgICAgIGZ1bmN0aW9uIGZhaWwoZSkge1xuICAgICAgICAgICAgZW52LmVycm9yID0gZW52Lmhhc0Vycm9yID8gbmV3IF9TdXBwcmVzc2VkRXJyb3IoZSwgZW52LmVycm9yLCBcIkFuIGVycm9yIHdhcyBzdXBwcmVzc2VkIGR1cmluZyBkaXNwb3NhbC5cIikgOiBlO1xuICAgICAgICAgICAgZW52Lmhhc0Vycm9yID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgciwgcyA9IDA7XG4gICAgICAgIGZ1bmN0aW9uIG5leHQoKSB7XG4gICAgICAgICAgICB3aGlsZShyID0gZW52LnN0YWNrLnBvcCgpKXtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXIuYXN5bmMgJiYgcyA9PT0gMSkgcmV0dXJuIHMgPSAwLCBlbnYuc3RhY2sucHVzaChyKSwgUHJvbWlzZS5yZXNvbHZlKCkudGhlbihuZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHIuZGlzcG9zZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJlc3VsdCA9IHIuZGlzcG9zZS5jYWxsKHIudmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHIuYXN5bmMpIHJldHVybiBzIHw9IDIsIFByb21pc2UucmVzb2x2ZShyZXN1bHQpLnRoZW4obmV4dCwgZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZhaWwoZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5leHQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgcyB8PSAxO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgZmFpbChlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocyA9PT0gMSkgcmV0dXJuIGVudi5oYXNFcnJvciA/IFByb21pc2UucmVqZWN0KGVudi5lcnJvcikgOiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICAgICAgICAgIGlmIChlbnYuaGFzRXJyb3IpIHRocm93IGVudi5lcnJvcjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV4dCgpO1xuICAgIH0pKGVudik7XG59XG5pbXBvcnQgeyBjcmVhdGVIb29rIH0gZnJvbSBcIndvcmtmbG93XCI7XG4vKipfX2ludGVybmFsX3dvcmtmbG93c3tcIndvcmtmbG93c1wiOntcIndvcmtmbG93cy9zcGlrZS50c1wiOntcInNwaWtlSG9va1dvcmtmbG93XCI6e1wid29ya2Zsb3dJZFwiOlwid29ya2Zsb3cvLy4vd29ya2Zsb3dzL3NwaWtlLy9zcGlrZUhvb2tXb3JrZmxvd1wifSxcInNwaWtlV29ya2Zsb3dcIjp7XCJ3b3JrZmxvd0lkXCI6XCJ3b3JrZmxvdy8vLi93b3JrZmxvd3Mvc3Bpa2UvL3NwaWtlV29ya2Zsb3dcIn19fSxcInN0ZXBzXCI6e1wid29ya2Zsb3dzL3NwaWtlLnRzXCI6e1wiZG91YmxlXCI6e1wic3RlcElkXCI6XCJzdGVwLy8uL3dvcmtmbG93cy9zcGlrZS8vZG91YmxlXCJ9fX19Ki87XG5leHBvcnQgdmFyIGRvdWJsZSA9IGdsb2JhbFRoaXNbU3ltYm9sLmZvcihcIldPUktGTE9XX1VTRV9TVEVQXCIpXShcInN0ZXAvLy4vd29ya2Zsb3dzL3NwaWtlLy9kb3VibGVcIik7XG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc3Bpa2VXb3JrZmxvdyh2YWx1ZSkge1xuICAgIGNvbnN0IGRvdWJsZWQgPSBhd2FpdCBkb3VibGUodmFsdWUpO1xuICAgIHJldHVybiBkb3VibGVkICsgMTtcbn1cbnNwaWtlV29ya2Zsb3cud29ya2Zsb3dJZCA9IFwid29ya2Zsb3cvLy4vd29ya2Zsb3dzL3NwaWtlLy9zcGlrZVdvcmtmbG93XCI7XG5nbG9iYWxUaGlzLl9fcHJpdmF0ZV93b3JrZmxvd3Muc2V0KFwid29ya2Zsb3cvLy4vd29ya2Zsb3dzL3NwaWtlLy9zcGlrZVdvcmtmbG93XCIsIHNwaWtlV29ya2Zsb3cpO1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNwaWtlSG9va1dvcmtmbG93KHRva2VuKSB7XG4gICAgY29uc3QgZW52ID0ge1xuICAgICAgICBzdGFjazogW10sXG4gICAgICAgIGVycm9yOiB2b2lkIDAsXG4gICAgICAgIGhhc0Vycm9yOiBmYWxzZVxuICAgIH07XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgaG9vayA9IF90c19hZGRfZGlzcG9zYWJsZV9yZXNvdXJjZShlbnYsIGNyZWF0ZUhvb2soe1xuICAgICAgICAgICAgdG9rZW5cbiAgICAgICAgfSksIGZhbHNlKTtcbiAgICAgICAgY29uc3QgcGF5bG9hZCA9IGF3YWl0IGhvb2s7XG4gICAgICAgIHJldHVybiBwYXlsb2FkLm5vdGU7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBlbnYuZXJyb3IgPSBlO1xuICAgICAgICBlbnYuaGFzRXJyb3IgPSB0cnVlO1xuICAgIH0gZmluYWxseXtcbiAgICAgICAgX3RzX2Rpc3Bvc2VfcmVzb3VyY2VzKGVudik7XG4gICAgfVxufVxuc3Bpa2VIb29rV29ya2Zsb3cud29ya2Zsb3dJZCA9IFwid29ya2Zsb3cvLy4vd29ya2Zsb3dzL3NwaWtlLy9zcGlrZUhvb2tXb3JrZmxvd1wiO1xuZ2xvYmFsVGhpcy5fX3ByaXZhdGVfd29ya2Zsb3dzLnNldChcIndvcmtmbG93Ly8uL3dvcmtmbG93cy9zcGlrZS8vc3Bpa2VIb29rV29ya2Zsb3dcIiwgc3Bpa2VIb29rV29ya2Zsb3cpO1xuIiwgIi8vIFBhdGNoZWQ6IHRoZSB3b3JrZmxvdyBzdGVwIGJ1bmRsZXIgZHJvcHMgSlNPTiBpbXBvcnQgYXR0cmlidXRlcyBhbmQgdGhlXG4vLyB3b3JrZmxvdyBWTSBzYW5kYm94IGhhcyBubyBub2RlIGJ1aWx0aW5zLCBzbyB0aGUgbGlzdCBpcyBpbmxpbmVkIGhlcmUuXG5jb25zdCBidWlsdGluTW9kdWxlcyA9IFtcbiAgICBcIm5vZGU6YXNzZXJ0XCIsXG4gICAgXCJhc3NlcnRcIixcbiAgICBcIm5vZGU6YXNzZXJ0L3N0cmljdFwiLFxuICAgIFwiYXNzZXJ0L3N0cmljdFwiLFxuICAgIFwibm9kZTphc3luY19ob29rc1wiLFxuICAgIFwiYXN5bmNfaG9va3NcIixcbiAgICBcIm5vZGU6YnVmZmVyXCIsXG4gICAgXCJidWZmZXJcIixcbiAgICBcIm5vZGU6Y2hpbGRfcHJvY2Vzc1wiLFxuICAgIFwiY2hpbGRfcHJvY2Vzc1wiLFxuICAgIFwibm9kZTpjbHVzdGVyXCIsXG4gICAgXCJjbHVzdGVyXCIsXG4gICAgXCJub2RlOmNvbnNvbGVcIixcbiAgICBcImNvbnNvbGVcIixcbiAgICBcIm5vZGU6Y29uc3RhbnRzXCIsXG4gICAgXCJjb25zdGFudHNcIixcbiAgICBcIm5vZGU6Y3J5cHRvXCIsXG4gICAgXCJjcnlwdG9cIixcbiAgICBcIm5vZGU6ZGdyYW1cIixcbiAgICBcImRncmFtXCIsXG4gICAgXCJub2RlOmRpYWdub3N0aWNzX2NoYW5uZWxcIixcbiAgICBcImRpYWdub3N0aWNzX2NoYW5uZWxcIixcbiAgICBcIm5vZGU6ZG5zXCIsXG4gICAgXCJkbnNcIixcbiAgICBcIm5vZGU6ZG5zL3Byb21pc2VzXCIsXG4gICAgXCJkbnMvcHJvbWlzZXNcIixcbiAgICBcIm5vZGU6ZG9tYWluXCIsXG4gICAgXCJkb21haW5cIixcbiAgICBcIm5vZGU6ZXZlbnRzXCIsXG4gICAgXCJldmVudHNcIixcbiAgICBcIm5vZGU6ZnNcIixcbiAgICBcImZzXCIsXG4gICAgXCJub2RlOmZzL3Byb21pc2VzXCIsXG4gICAgXCJmcy9wcm9taXNlc1wiLFxuICAgIFwibm9kZTpodHRwXCIsXG4gICAgXCJodHRwXCIsXG4gICAgXCJub2RlOmh0dHAyXCIsXG4gICAgXCJodHRwMlwiLFxuICAgIFwibm9kZTpodHRwc1wiLFxuICAgIFwiaHR0cHNcIixcbiAgICBcIm5vZGU6aW5zcGVjdG9yXCIsXG4gICAgXCJpbnNwZWN0b3JcIixcbiAgICBcIm5vZGU6aW5zcGVjdG9yL3Byb21pc2VzXCIsXG4gICAgXCJpbnNwZWN0b3IvcHJvbWlzZXNcIixcbiAgICBcIm5vZGU6bW9kdWxlXCIsXG4gICAgXCJtb2R1bGVcIixcbiAgICBcIm5vZGU6bmV0XCIsXG4gICAgXCJuZXRcIixcbiAgICBcIm5vZGU6b3NcIixcbiAgICBcIm9zXCIsXG4gICAgXCJub2RlOnBhdGhcIixcbiAgICBcInBhdGhcIixcbiAgICBcIm5vZGU6cGF0aC9wb3NpeFwiLFxuICAgIFwicGF0aC9wb3NpeFwiLFxuICAgIFwibm9kZTpwYXRoL3dpbjMyXCIsXG4gICAgXCJwYXRoL3dpbjMyXCIsXG4gICAgXCJub2RlOnBlcmZfaG9va3NcIixcbiAgICBcInBlcmZfaG9va3NcIixcbiAgICBcIm5vZGU6cHJvY2Vzc1wiLFxuICAgIFwicHJvY2Vzc1wiLFxuICAgIFwibm9kZTpxdWVyeXN0cmluZ1wiLFxuICAgIFwicXVlcnlzdHJpbmdcIixcbiAgICBcIm5vZGU6cXVpY1wiLFxuICAgIFwibm9kZTpyZWFkbGluZVwiLFxuICAgIFwicmVhZGxpbmVcIixcbiAgICBcIm5vZGU6cmVhZGxpbmUvcHJvbWlzZXNcIixcbiAgICBcInJlYWRsaW5lL3Byb21pc2VzXCIsXG4gICAgXCJub2RlOnJlcGxcIixcbiAgICBcInJlcGxcIixcbiAgICBcIm5vZGU6c2VhXCIsXG4gICAgXCJub2RlOnNxbGl0ZVwiLFxuICAgIFwibm9kZTpzdHJlYW1cIixcbiAgICBcInN0cmVhbVwiLFxuICAgIFwibm9kZTpzdHJlYW0vY29uc3VtZXJzXCIsXG4gICAgXCJzdHJlYW0vY29uc3VtZXJzXCIsXG4gICAgXCJub2RlOnN0cmVhbS9wcm9taXNlc1wiLFxuICAgIFwic3RyZWFtL3Byb21pc2VzXCIsXG4gICAgXCJub2RlOnN0cmVhbS93ZWJcIixcbiAgICBcInN0cmVhbS93ZWJcIixcbiAgICBcIm5vZGU6c3RyaW5nX2RlY29kZXJcIixcbiAgICBcInN0cmluZ19kZWNvZGVyXCIsXG4gICAgXCJub2RlOnRlc3RcIixcbiAgICBcIm5vZGU6dGVzdC9yZXBvcnRlcnNcIixcbiAgICBcIm5vZGU6dGltZXJzXCIsXG4gICAgXCJ0aW1lcnNcIixcbiAgICBcIm5vZGU6dGltZXJzL3Byb21pc2VzXCIsXG4gICAgXCJ0aW1lcnMvcHJvbWlzZXNcIixcbiAgICBcIm5vZGU6dGxzXCIsXG4gICAgXCJ0bHNcIixcbiAgICBcIm5vZGU6dHJhY2VfZXZlbnRzXCIsXG4gICAgXCJ0cmFjZV9ldmVudHNcIixcbiAgICBcIm5vZGU6dHR5XCIsXG4gICAgXCJ0dHlcIixcbiAgICBcIm5vZGU6dXJsXCIsXG4gICAgXCJ1cmxcIixcbiAgICBcIm5vZGU6dXRpbFwiLFxuICAgIFwidXRpbFwiLFxuICAgIFwibm9kZTp1dGlsL3R5cGVzXCIsXG4gICAgXCJ1dGlsL3R5cGVzXCIsXG4gICAgXCJub2RlOnY4XCIsXG4gICAgXCJ2OFwiLFxuICAgIFwibm9kZTp2bVwiLFxuICAgIFwidm1cIixcbiAgICBcIm5vZGU6d2FzaVwiLFxuICAgIFwid2FzaVwiLFxuICAgIFwibm9kZTp3b3JrZXJfdGhyZWFkc1wiLFxuICAgIFwid29ya2VyX3RocmVhZHNcIixcbiAgICBcIm5vZGU6emxpYlwiLFxuICAgIFwiemxpYlwiXG5dO1xuZXhwb3J0IGRlZmF1bHQgYnVpbHRpbk1vZHVsZXM7XG4iLCAiLyoqXG4gKiBTZXJkZSBjb21wbGlhbmNlIGNoZWNrZXIgZm9yIHdvcmtmbG93IGN1c3RvbSBjbGFzcyBzZXJpYWxpemF0aW9uLlxuICpcbiAqIEFuYWx5emVzIHNvdXJjZSBjb2RlIHRvIGRldGVybWluZSBpZiBjbGFzc2VzIHdpdGggV09SS0ZMT1dfU0VSSUFMSVpFIC9cbiAqIFdPUktGTE9XX0RFU0VSSUFMSVpFIGFyZSBjb3JyZWN0bHkgc2V0IHVwIGZvciB0aGUgd29ya2Zsb3cgc2FuZGJveC5cbiAqXG4gKiBVc2VkIGJ5OlxuICogLSBDTEkgYHZhbGlkYXRlYCBjb21tYW5kXG4gKiAtIENMSSBgdHJhbnNmb3JtYCBjb21tYW5kICgtLWNoZWNrLXNlcmRlKVxuICogLSBTV0MgcGxheWdyb3VuZCBzZXJkZSBhbmFseXNpcyBwYW5lbFxuICogLSBCdWlsZC10aW1lIHdhcm5pbmdzIGluIEJhc2VCdWlsZGVyXG4gKi9cblxuaW1wb3J0IGJ1aWx0aW5Nb2R1bGVzIGZyb20gJ2J1aWx0aW4tbW9kdWxlcyc7XG5pbXBvcnQgdHlwZSB7IFdvcmtmbG93TWFuaWZlc3QgfSBmcm9tICcuL2FwcGx5LXN3Yy10cmFuc2Zvcm0uanMnO1xuXG4vLyBCdWlsZCBhIHJlZ2V4IHRoYXQgbWF0Y2hlcyBOb2RlLmpzIGJ1aWx0LWluIG1vZHVsZSBpbXBvcnRzIGluIHRyYW5zZm9ybWVkIGNvZGUuXG4vLyBIYW5kbGVzIGJvdGggRVNNIChgZnJvbSAnZnMnYCwgYGZyb20gJ25vZGU6ZnMnYCkgYW5kIENKUyAoYHJlcXVpcmUoJ2ZzJylgKVxuY29uc3Qgbm9kZUJ1aWx0aW5zID0gYnVpbHRpbk1vZHVsZXMuam9pbignfCcpO1xuXG4vLyBSZWdleCB0byBleHRyYWN0IHNwZWNpZmljIG1vZHVsZSBuYW1lcyBmcm9tIGltcG9ydC9yZXF1aXJlIHN0YXRlbWVudHNcbmNvbnN0IG5vZGVJbXBvcnRFeHRyYWN0UmVnZXggPSBuZXcgUmVnRXhwKFxuICBgKD86ZnJvbVxcXFxzK1snXCJdKD86bm9kZTopPygoPzoke25vZGVCdWlsdGluc30pKD86L1teJ1wiXSopPylbJ1wiXWAgK1xuICAgIGB8cmVxdWlyZVxcXFxzKlxcXFwoXFxcXHMqWydcIl0oPzpub2RlOik/KCg/OiR7bm9kZUJ1aWx0aW5zfSkoPzovW14nXCJdKik/KVsnXCJdXFxcXHMqXFxcXCkpYCxcbiAgJ2cnXG4pO1xuXG4vLyBSZWdleCB0byBkZXRlY3QgY2xhc3MgcmVnaXN0cmF0aW9uIElJRkVzIGdlbmVyYXRlZCBieSB0aGUgU1dDIHBsdWdpblxuY29uc3QgcmVnaXN0cmF0aW9uSWlmZVJlZ2V4ID1cbiAgL1N5bWJvbFxcLmZvclxccypcXChcXHMqW1wiJ113b3JrZmxvdy1jbGFzcy1yZWdpc3RyeVtcIiddXFxzKlxcKS87XG5cbi8qKlxuICogUmVzdWx0IG9mIGNoZWNraW5nIGEgc2luZ2xlIGNsYXNzIGZvciBzZXJkZSBjb21wbGlhbmNlLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFNlcmRlQ2xhc3NDaGVja1Jlc3VsdCB7XG4gIC8qKiBUaGUgY2xhc3MgbmFtZSBhcyBkZXRlY3RlZCBpbiB0aGUgc291cmNlICovXG4gIGNsYXNzTmFtZTogc3RyaW5nO1xuICAvKiogVGhlIGNsYXNzSWQgYXNzaWduZWQgYnkgdGhlIFNXQyBwbHVnaW4gKGZyb20gdGhlIG1hbmlmZXN0KSAqL1xuICBjbGFzc0lkOiBzdHJpbmc7XG4gIC8qKiBXaGV0aGVyIHRoZSBTV0MgcGx1Z2luIGRldGVjdGVkIHNlcmRlIHN5bWJvbHMgb24gdGhpcyBjbGFzcyAqL1xuICBkZXRlY3RlZDogYm9vbGVhbjtcbiAgLyoqIFdoZXRoZXIgYSByZWdpc3RyYXRpb24gSUlGRSB3YXMgZ2VuZXJhdGVkIGluIHRoZSBvdXRwdXQgKi9cbiAgcmVnaXN0ZXJlZDogYm9vbGVhbjtcbiAgLyoqXG4gICAqIE5vZGUuanMgYnVpbHQtaW4gbW9kdWxlIGltcG9ydHMgcmVtYWluaW5nIGluIHRoZSB3b3JrZmxvdy1tb2RlIG91dHB1dC5cbiAgICogSWYgbm9uLWVtcHR5LCB0aGUgY2xhc3MgaXMgTk9UIHdvcmtmbG93LXNhbmRib3ggY29tcGxpYW50LlxuICAgKi9cbiAgbm9kZUltcG9ydHM6IHN0cmluZ1tdO1xuICAvKiogV2hldGhlciB0aGUgY2xhc3MgcGFzc2VzIGFsbCBjb21wbGlhbmNlIGNoZWNrcyAqL1xuICBjb21wbGlhbnQ6IGJvb2xlYW47XG4gIC8qKiBIdW1hbi1yZWFkYWJsZSBkZXNjcmlwdGlvbnMgb2YgYW55IGlzc3VlcyBmb3VuZCAqL1xuICBpc3N1ZXM6IHN0cmluZ1tdO1xufVxuXG4vKipcbiAqIEZ1bGwgcmVzdWx0IG9mIHNlcmRlIGNvbXBsaWFuY2UgYW5hbHlzaXMgZm9yIGEgc291cmNlIGZpbGUuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgU2VyZGVDaGVja1Jlc3VsdCB7XG4gIC8qKiBQZXItY2xhc3MgYW5hbHlzaXMgcmVzdWx0cyAqL1xuICBjbGFzc2VzOiBTZXJkZUNsYXNzQ2hlY2tSZXN1bHRbXTtcbiAgLyoqIEFsbCBOb2RlLmpzIGJ1aWx0LWluIGltcG9ydHMgZm91bmQgaW4gdGhlIHdvcmtmbG93LW1vZGUgb3V0cHV0ICovXG4gIGdsb2JhbE5vZGVJbXBvcnRzOiBzdHJpbmdbXTtcbiAgLyoqIFdoZXRoZXIgdGhlIHdvcmtmbG93LW1vZGUgb3V0cHV0IGNvbnRhaW5zIGFueSBzZXJkZS1yZWxhdGVkIGNsYXNzZXMgKi9cbiAgaGFzU2VyZGVDbGFzc2VzOiBib29sZWFuO1xuICAvKiogVGhlIHJhdyB3b3JrZmxvdyBtYW5pZmVzdCBleHRyYWN0ZWQgZnJvbSB0aGUgU1dDIHRyYW5zZm9ybSAqL1xuICBtYW5pZmVzdDogV29ya2Zsb3dNYW5pZmVzdDtcbn1cblxuLyoqXG4gKiBMaWdodHdlaWdodCBzZXJkZSBjb21wbGlhbmNlIGNoZWNrZXIgdGhhdCB3b3JrcyB3aXRoIHByZS1jb21wdXRlZFxuICogU1dDIHRyYW5zZm9ybSByZXN1bHRzLiBUaGlzIGF2b2lkcyByZS1ydW5uaW5nIHRoZSBTV0MgdHJhbnNmb3JtXG4gKiB3aGVuIHRoZSBjYWxsZXIgYWxyZWFkeSBoYXMgdGhlIG91dHB1dHMgKGUuZy4sIHRoZSBwbGF5Z3JvdW5kIG9yIGJ1aWxkZXIpLlxuICovXG5leHBvcnQgZnVuY3Rpb24gYW5hbHl6ZVNlcmRlQ29tcGxpYW5jZShvcHRpb25zOiB7XG4gIC8qKiBTb3VyY2UgY29kZSAodXNlZCBmb3IgcGF0dGVybiBkZXRlY3Rpb24pICovXG4gIHNvdXJjZUNvZGU6IHN0cmluZztcbiAgLyoqIFdvcmtmbG93LW1vZGUgdHJhbnNmb3JtZWQgb3V0cHV0ICovXG4gIHdvcmtmbG93Q29kZTogc3RyaW5nO1xuICAvKiogTWFuaWZlc3QgZXh0cmFjdGVkIGZyb20gdGhlIFNXQyB0cmFuc2Zvcm0gKi9cbiAgbWFuaWZlc3Q6IFdvcmtmbG93TWFuaWZlc3Q7XG59KTogU2VyZGVDaGVja1Jlc3VsdCB7XG4gIGNvbnN0IHsgc291cmNlQ29kZSwgd29ya2Zsb3dDb2RlLCBtYW5pZmVzdCB9ID0gb3B0aW9ucztcblxuICAvLyAxLiBFeHRyYWN0IGFsbCBOb2RlLmpzIGJ1aWx0LWluIGltcG9ydHMgZnJvbSB0aGUgd29ya2Zsb3cgb3V0cHV0XG4gIGNvbnN0IGdsb2JhbE5vZGVJbXBvcnRzID0gZXh0cmFjdE5vZGVJbXBvcnRzKHdvcmtmbG93Q29kZSk7XG5cbiAgLy8gMi4gQ2hlY2sgaWYgdGhlIG1hbmlmZXN0IGNvbnRhaW5zIGFueSBzZXJkZS1yZWdpc3RlcmVkIGNsYXNzZXNcbiAgY29uc3QgY2xhc3NFbnRyaWVzID0gZXh0cmFjdENsYXNzRW50cmllcyhtYW5pZmVzdCk7XG4gIGNvbnN0IGhhc1NlcmRlQ2xhc3NlcyA9IGNsYXNzRW50cmllcy5sZW5ndGggPiAwO1xuXG4gIC8vIDMuIENoZWNrIGlmIHRoZSB3b3JrZmxvdyBvdXRwdXQgY29udGFpbnMgcmVnaXN0cmF0aW9uIElJRkVzXG4gIGNvbnN0IGhhc1JlZ2lzdHJhdGlvbiA9IHJlZ2lzdHJhdGlvbklpZmVSZWdleC50ZXN0KHdvcmtmbG93Q29kZSk7XG5cbiAgLy8gNC4gQW5hbHl6ZSBlYWNoIGNsYXNzXG4gIGNvbnN0IGNsYXNzZXM6IFNlcmRlQ2xhc3NDaGVja1Jlc3VsdFtdID0gY2xhc3NFbnRyaWVzLm1hcCgoZW50cnkpID0+IHtcbiAgICBjb25zdCBpc3N1ZXM6IHN0cmluZ1tdID0gW107XG5cbiAgICAvLyBDaGVjayBmb3IgTm9kZS5qcyBpbXBvcnRzICh0aGVzZSB3aWxsIGZhaWwgaW4gdGhlIHdvcmtmbG93IHNhbmRib3gpXG4gICAgaWYgKGdsb2JhbE5vZGVJbXBvcnRzLmxlbmd0aCA+IDApIHtcbiAgICAgIGlzc3Vlcy5wdXNoKFxuICAgICAgICBgV29ya2Zsb3cgYnVuZGxlIGNvbnRhaW5zIE5vZGUuanMgYnVpbHQtaW4gaW1wb3J0czogJHtnbG9iYWxOb2RlSW1wb3J0cy5qb2luKCcsICcpfS4gYCArXG4gICAgICAgICAgYFRoZXNlIHdpbGwgZmFpbCBhdCBydW50aW1lIGluIHRoZSB3b3JrZmxvdyBzYW5kYm94LiBgICtcbiAgICAgICAgICBgQWRkIFwidXNlIHN0ZXBcIiB0byBtZXRob2RzIHRoYXQgZGVwZW5kIG9uIE5vZGUuanMgQVBJcyBzbyB0aGV5IGFyZSBzdHJpcHBlZCBmcm9tIHRoZSB3b3JrZmxvdyBidW5kbGUuYFxuICAgICAgKTtcbiAgICB9XG5cbiAgICAvLyBDaGVjayBmb3IgcmVnaXN0cmF0aW9uXG4gICAgaWYgKCFoYXNSZWdpc3RyYXRpb24pIHtcbiAgICAgIGlzc3Vlcy5wdXNoKFxuICAgICAgICBgTm8gY2xhc3MgcmVnaXN0cmF0aW9uIElJRkUgd2FzIGdlbmVyYXRlZC4gYCArXG4gICAgICAgICAgYEVuc3VyZSBXT1JLRkxPV19TRVJJQUxJWkUgYW5kIFdPUktGTE9XX0RFU0VSSUFMSVpFIGFyZSBkZWZpbmVkIGFzIHN0YXRpYyBtZXRob2RzIGAgK1xuICAgICAgICAgIGBpbnNpZGUgdGhlIGNsYXNzIGJvZHkgdXNpbmcgY29tcHV0ZWQgcHJvcGVydHkgc3ludGF4OiBzdGF0aWMgW1dPUktGTE9XX1NFUklBTElaRV0oLi4uKSB7IC4uLiB9YFxuICAgICAgKTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgY2xhc3NOYW1lOiBlbnRyeS5jbGFzc05hbWUsXG4gICAgICBjbGFzc0lkOiBlbnRyeS5jbGFzc0lkLFxuICAgICAgZGV0ZWN0ZWQ6IHRydWUsXG4gICAgICByZWdpc3RlcmVkOiBoYXNSZWdpc3RyYXRpb24sXG4gICAgICBub2RlSW1wb3J0czogZ2xvYmFsTm9kZUltcG9ydHMsXG4gICAgICBjb21wbGlhbnQ6IGdsb2JhbE5vZGVJbXBvcnRzLmxlbmd0aCA9PT0gMCAmJiBoYXNSZWdpc3RyYXRpb24sXG4gICAgICBpc3N1ZXMsXG4gICAgfTtcbiAgfSk7XG5cbiAgLy8gNS4gQ2hlY2sgZm9yIGNsYXNzZXMgdGhhdCBoYXZlIHNlcmRlIHBhdHRlcm5zIGluIHNvdXJjZSBidXQgd2VyZW4ndCBkZXRlY3RlZCBieSBTV0NcbiAgY29uc3Qgc291cmNlSGFzU2VyZGVQYXR0ZXJucyA9XG4gICAgL1xcW1xccypXT1JLRkxPV18oPzpTRVJJQUxJWkV8REVTRVJJQUxJWkUpXFxzKlxcXS8udGVzdChzb3VyY2VDb2RlKSB8fFxuICAgIC9TeW1ib2xcXC5mb3JcXHMqXFwoXFxzKlsnXCJdd29ya2Zsb3ctKD86c2VyaWFsaXplfGRlc2VyaWFsaXplKVsnXCJdXFxzKlxcKS8udGVzdChcbiAgICAgIHNvdXJjZUNvZGVcbiAgICApO1xuXG4gIGlmIChzb3VyY2VIYXNTZXJkZVBhdHRlcm5zICYmIGNsYXNzRW50cmllcy5sZW5ndGggPT09IDApIHtcbiAgICBjbGFzc2VzLnB1c2goe1xuICAgICAgY2xhc3NOYW1lOiAnPHVua25vd24+JyxcbiAgICAgIGNsYXNzSWQ6ICcnLFxuICAgICAgZGV0ZWN0ZWQ6IGZhbHNlLFxuICAgICAgcmVnaXN0ZXJlZDogZmFsc2UsXG4gICAgICBub2RlSW1wb3J0czogZ2xvYmFsTm9kZUltcG9ydHMsXG4gICAgICBjb21wbGlhbnQ6IGZhbHNlLFxuICAgICAgaXNzdWVzOiBbXG4gICAgICAgIGBTb3VyY2UgY29kZSBjb250YWlucyBXT1JLRkxPV19TRVJJQUxJWkUvV09SS0ZMT1dfREVTRVJJQUxJWkUgcGF0dGVybnMgYnV0IGAgK1xuICAgICAgICAgIGB0aGUgU1dDIHBsdWdpbiBkaWQgbm90IGRldGVjdCBhbnkgc2VyZGUtZW5hYmxlZCBjbGFzc2VzLiBgICtcbiAgICAgICAgICBgRW5zdXJlIHRoZSBzeW1ib2xzIGFyZSBkZWZpbmVkIGFzIHN0YXRpYyBtZXRob2RzIElOU0lERSB0aGUgY2xhc3MgYm9keSwgYCArXG4gICAgICAgICAgYG5vdCBhc3NpZ25lZCBleHRlcm5hbGx5IChlLmcuLCAoTXlDbGFzcyBhcyBhbnkpW1dPUktGTE9XX1NFUklBTElaRV0gPSAuLi4pLmAsXG4gICAgICBdLFxuICAgIH0pO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBjbGFzc2VzLFxuICAgIGdsb2JhbE5vZGVJbXBvcnRzLFxuICAgIGhhc1NlcmRlQ2xhc3NlcyxcbiAgICBtYW5pZmVzdCxcbiAgfTtcbn1cblxuLyoqXG4gKiBFeHRyYWN0IE5vZGUuanMgYnVpbHQtaW4gbW9kdWxlIG5hbWVzIGZyb20gdHJhbnNmb3JtZWQgY29kZS5cbiAqL1xuZnVuY3Rpb24gZXh0cmFjdE5vZGVJbXBvcnRzKGNvZGU6IHN0cmluZyk6IHN0cmluZ1tdIHtcbiAgY29uc3QgaW1wb3J0cyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICAvLyBSZXNldCByZWdleCBzdGF0ZVxuICBub2RlSW1wb3J0RXh0cmFjdFJlZ2V4Lmxhc3RJbmRleCA9IDA7XG4gIGZvciAoXG4gICAgbGV0IG1hdGNoID0gbm9kZUltcG9ydEV4dHJhY3RSZWdleC5leGVjKGNvZGUpO1xuICAgIG1hdGNoICE9PSBudWxsO1xuICAgIG1hdGNoID0gbm9kZUltcG9ydEV4dHJhY3RSZWdleC5leGVjKGNvZGUpXG4gICkge1xuICAgIC8vIG1hdGNoWzFdIGlzIGZyb20gdGhlIEVTTSBwYXR0ZXJuLCBtYXRjaFsyXSBpcyBmcm9tIHRoZSBDSlMgcGF0dGVyblxuICAgIGNvbnN0IG1vZHVsZU5hbWUgPSBtYXRjaFsxXSB8fCBtYXRjaFsyXTtcbiAgICBpZiAobW9kdWxlTmFtZSkge1xuICAgICAgLy8gTm9ybWFsaXplIHRvIGJhc2UgbW9kdWxlIG5hbWUgKGUuZy4sICdmcy9wcm9taXNlcycgLT4gJ2ZzJylcbiAgICAgIGltcG9ydHMuYWRkKG1vZHVsZU5hbWUuc3BsaXQoJy8nKVswXSk7XG4gICAgfVxuICB9XG4gIHJldHVybiBbLi4uaW1wb3J0c10uc29ydCgpO1xufVxuXG4vKipcbiAqIEV4dHJhY3QgY2xhc3MgZW50cmllcyBmcm9tIGEgV29ya2Zsb3dNYW5pZmVzdC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGV4dHJhY3RDbGFzc0VudHJpZXMoXG4gIG1hbmlmZXN0OiBXb3JrZmxvd01hbmlmZXN0XG4pOiBBcnJheTx7IGNsYXNzTmFtZTogc3RyaW5nOyBjbGFzc0lkOiBzdHJpbmc7IGZpbGVOYW1lOiBzdHJpbmcgfT4ge1xuICBjb25zdCBlbnRyaWVzOiBBcnJheTx7XG4gICAgY2xhc3NOYW1lOiBzdHJpbmc7XG4gICAgY2xhc3NJZDogc3RyaW5nO1xuICAgIGZpbGVOYW1lOiBzdHJpbmc7XG4gIH0+ID0gW107XG4gIGlmICghbWFuaWZlc3QuY2xhc3NlcykgcmV0dXJuIGVudHJpZXM7XG5cbiAgZm9yIChjb25zdCBbZmlsZU5hbWUsIGNsYXNzZXNdIG9mIE9iamVjdC5lbnRyaWVzKG1hbmlmZXN0LmNsYXNzZXMpKSB7XG4gICAgZm9yIChjb25zdCBbY2xhc3NOYW1lLCB7IGNsYXNzSWQgfV0gb2YgT2JqZWN0LmVudHJpZXMoY2xhc3NlcykpIHtcbiAgICAgIGVudHJpZXMucHVzaCh7IGNsYXNzTmFtZSwgY2xhc3NJZCwgZmlsZU5hbWUgfSk7XG4gICAgfVxuICB9XG4gIHJldHVybiBlbnRyaWVzO1xufVxuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFBQSwyRUFBQUEsU0FBQTtBQUVJLFFBQUksSUFBSTtBQUNaLFFBQUksSUFBSSxJQUFJO0FBQ1osUUFBSSxJQUFJLElBQUk7QUFDWixRQUFJLElBQUksSUFBSTtBQUNaLFFBQUksSUFBSSxJQUFJO0FBQ1osUUFBSSxJQUFJLElBQUk7QUFhUixJQUFBQSxRQUFPLFVBQVUsU0FBUyxLQUFLLFNBQVM7QUFDeEMsZ0JBQVUsV0FBVyxDQUFDO0FBQ3RCLFVBQUksT0FBTyxPQUFPO0FBQ2xCLFVBQUksU0FBUyxZQUFZLElBQUksU0FBUyxHQUFHO0FBQ3JDLGVBQU8sTUFBTSxHQUFHO0FBQUEsTUFDcEIsV0FBVyxTQUFTLFlBQVksU0FBUyxHQUFHLEdBQUc7QUFDM0MsZUFBTyxRQUFRLE9BQU8sUUFBUSxHQUFHLElBQUksU0FBUyxHQUFHO0FBQUEsTUFDckQ7QUFDQSxZQUFNLElBQUksTUFBTSwwREFBMEQsS0FBSyxVQUFVLEdBQUcsQ0FBQztBQUFBLElBQ2pHO0FBT0ksYUFBUyxNQUFNLEtBQUs7QUFDcEIsWUFBTSxPQUFPLEdBQUc7QUFDaEIsVUFBSSxJQUFJLFNBQVMsS0FBSztBQUNsQjtBQUFBLE1BQ0o7QUFDQSxVQUFJLFFBQVEsbUlBQW1JLEtBQUssR0FBRztBQUN2SixVQUFJLENBQUMsT0FBTztBQUNSO0FBQUEsTUFDSjtBQUNBLFVBQUksSUFBSSxXQUFXLE1BQU0sQ0FBQyxDQUFDO0FBQzNCLFVBQUksUUFBUSxNQUFNLENBQUMsS0FBSyxNQUFNLFlBQVk7QUFDMUMsY0FBTyxNQUFLO0FBQUEsUUFDUixLQUFLO0FBQUEsUUFDTCxLQUFLO0FBQUEsUUFDTCxLQUFLO0FBQUEsUUFDTCxLQUFLO0FBQUEsUUFDTCxLQUFLO0FBQ0QsaUJBQU8sSUFBSTtBQUFBLFFBQ2YsS0FBSztBQUFBLFFBQ0wsS0FBSztBQUFBLFFBQ0wsS0FBSztBQUNELGlCQUFPLElBQUk7QUFBQSxRQUNmLEtBQUs7QUFBQSxRQUNMLEtBQUs7QUFBQSxRQUNMLEtBQUs7QUFDRCxpQkFBTyxJQUFJO0FBQUEsUUFDZixLQUFLO0FBQUEsUUFDTCxLQUFLO0FBQUEsUUFDTCxLQUFLO0FBQUEsUUFDTCxLQUFLO0FBQUEsUUFDTCxLQUFLO0FBQ0QsaUJBQU8sSUFBSTtBQUFBLFFBQ2YsS0FBSztBQUFBLFFBQ0wsS0FBSztBQUFBLFFBQ0wsS0FBSztBQUFBLFFBQ0wsS0FBSztBQUFBLFFBQ0wsS0FBSztBQUNELGlCQUFPLElBQUk7QUFBQSxRQUNmLEtBQUs7QUFBQSxRQUNMLEtBQUs7QUFBQSxRQUNMLEtBQUs7QUFBQSxRQUNMLEtBQUs7QUFBQSxRQUNMLEtBQUs7QUFDRCxpQkFBTyxJQUFJO0FBQUEsUUFDZixLQUFLO0FBQUEsUUFDTCxLQUFLO0FBQUEsUUFDTCxLQUFLO0FBQUEsUUFDTCxLQUFLO0FBQUEsUUFDTCxLQUFLO0FBQ0QsaUJBQU87QUFBQSxRQUNYO0FBQ0ksaUJBQU87QUFBQSxNQUNmO0FBQUEsSUFDSjtBQXJEYTtBQTREVCxhQUFTLFNBQVNDLEtBQUk7QUFDdEIsVUFBSSxRQUFRLEtBQUssSUFBSUEsR0FBRTtBQUN2QixVQUFJLFNBQVMsR0FBRztBQUNaLGVBQU8sS0FBSyxNQUFNQSxNQUFLLENBQUMsSUFBSTtBQUFBLE1BQ2hDO0FBQ0EsVUFBSSxTQUFTLEdBQUc7QUFDWixlQUFPLEtBQUssTUFBTUEsTUFBSyxDQUFDLElBQUk7QUFBQSxNQUNoQztBQUNBLFVBQUksU0FBUyxHQUFHO0FBQ1osZUFBTyxLQUFLLE1BQU1BLE1BQUssQ0FBQyxJQUFJO0FBQUEsTUFDaEM7QUFDQSxVQUFJLFNBQVMsR0FBRztBQUNaLGVBQU8sS0FBSyxNQUFNQSxNQUFLLENBQUMsSUFBSTtBQUFBLE1BQ2hDO0FBQ0EsYUFBT0EsTUFBSztBQUFBLElBQ2hCO0FBZmE7QUFzQlQsYUFBUyxRQUFRQSxLQUFJO0FBQ3JCLFVBQUksUUFBUSxLQUFLLElBQUlBLEdBQUU7QUFDdkIsVUFBSSxTQUFTLEdBQUc7QUFDWixlQUFPLE9BQU9BLEtBQUksT0FBTyxHQUFHLEtBQUs7QUFBQSxNQUNyQztBQUNBLFVBQUksU0FBUyxHQUFHO0FBQ1osZUFBTyxPQUFPQSxLQUFJLE9BQU8sR0FBRyxNQUFNO0FBQUEsTUFDdEM7QUFDQSxVQUFJLFNBQVMsR0FBRztBQUNaLGVBQU8sT0FBT0EsS0FBSSxPQUFPLEdBQUcsUUFBUTtBQUFBLE1BQ3hDO0FBQ0EsVUFBSSxTQUFTLEdBQUc7QUFDWixlQUFPLE9BQU9BLEtBQUksT0FBTyxHQUFHLFFBQVE7QUFBQSxNQUN4QztBQUNBLGFBQU9BLE1BQUs7QUFBQSxJQUNoQjtBQWZhO0FBa0JULGFBQVMsT0FBT0EsS0FBSSxPQUFPLEdBQUcsTUFBTTtBQUNwQyxVQUFJLFdBQVcsU0FBUyxJQUFJO0FBQzVCLGFBQU8sS0FBSyxNQUFNQSxNQUFLLENBQUMsSUFBSSxNQUFNLFFBQVEsV0FBVyxNQUFNO0FBQUEsSUFDL0Q7QUFIYTtBQUFBO0FBQUE7OztBQ3ZJYixnQkFBZTtBQWFaLFNBQUEsb0JBQUEsT0FBQTtBQUNILE1BQU0sT0FBQSxVQUFVLFVBQW1CO0FBQzdCLFVBQUEsaUJBQWlCLFVBQUFDLFNBQUEsS0FBVTtBQUM3QixRQUFBLE9BQU0sZUFBZ0IsWUFBTyxhQUFBLEdBQUE7QUFDekIsWUFBQSxJQUFPLE1BQUEsc0JBQTJCLEtBQUEsaUVBQWlCOztBQUl2RCxXQUFDLElBQUEsS0FBQSxLQUFBLElBQUEsSUFBQSxVQUFBO2FBQ00sT0FBSSxVQUFhLFVBQUs7QUFDOUIsUUFBQSxRQUFBLEtBQUEsQ0FBQSxPQUFBLFNBQUEsS0FBQSxHQUFBO0FBQU0sWUFBSSxJQUFPLE1BQUsscUJBQWdCLEtBQUEsMERBQUE7SUFDckM7V0FDRSxJQUFNLEtBQUksS0FDUixJQUFBLElBQUEsS0FBQTthQUVILGlCQUFBLFFBQUEsU0FBQSxPQUFBLFVBQUEsWUFBQSxPQUFBLE1BQUEsWUFBQSxZQUFBO0FBRUYsV0FBQSxpQkFBQSxPQUFBLFFBQUEsSUFBQSxLQUFBLE1BQUEsUUFBQSxDQUFBO1NBQU07QUFFTCxVQUFNLElBQUEsTUFBQSxnR0FBQTs7O0FBbkJQOzs7QUNWSCxJQUFNLFdBQVc7QUFPZCxTQUFBLFFBQUEsT0FBQTtBQUNILFNBQVMsT0FBUSxVQUFjLFlBQUEsVUFBQSxRQUFBLFVBQUEsU0FBQSxhQUFBOztBQUQ1QjtBQVFGLElBQUEsY0FBQTtFQUVELDRCQUFBOzs7RUFHRyxvQ0FBQTtFQUNILDJCQUEyQjtFQUN6Qiw0QkFBNEI7RUFDNUIsK0JBQStCO0VBQy9CLGVBQUE7RUFDQSxxQkFBQTtFQUNBLG1CQUFBO0VBQ0EscUJBQUE7RUFDQSx5QkFBQTtFQUNBLDJCQUFlOzs7RUFqQ2pCOzs7Ozs7Ozs7TUFrRUcsT0FBQSxTQUFBO0lBQ0csQ0FBQTtBQUNLLFNBQWdCLFFBQUEsU0FBQTtBQUV6QixRQUFBLFNBQVksaUJBQStDLE9BQUE7QUFDekQsV0FBTSxRQUFVLEdBQUEsS0FBUyxLQUFJO2FBQUEsUUFBQSxNQUFBLEtBQUE7OztTQUc3QixHQUFNLE9BQU87QUFDYixXQUFLLFFBQVEsS0FBTyxLQUFFLE1BQU0sU0FBQTs7O0FBaVY1QixJQUFNLG9CQUFOLGNBQTRCLGNBQW1CO0VBNVpuRCxPQTRabUQ7Ozs7OztFQUtqRDtjQUNTLE9BQVEsa0JBQWdCO0FBQ2hDLFVBQUEsZUFBQSxLQUFBLDBDQUFBLG1CQUFBLFVBQUEsZ0JBQUEsT0FBQSxFQUFBLElBQUE7TUFDRixNQUFBLFlBQUE7SUFFRCxDQUFBOzs7Ozs7RUFNRztFQUNILE9BQU0sR0FBTyxPQUFBO0FBQ1gsV0FBYyxRQUFBLEtBQUEsS0FBQSxNQUFBLFNBQUE7RUFDZDs7O0VBL2FGOzs7O0VBK25CRyxZQUFBLFNBQUE7QUFDRyxVQUFPLE9BQUE7QUFDRixTQUFBLE9BQXVCO0VBQ3ZCO0VBRVQsT0FBQSxHQUFBLE9BQVk7QUFDVixXQUNFLFFBQUEsS0FBQSxLQUFBLE1BQUEsU0FBNkI7OztBQVExQixJQUFHLGlCQUFILGNBQWlCLE1BQUE7RUE5b0IxQixPQThvQjBCOzs7Ozs7RUFHekI7RUFFRCxZQUFBLFNBQUEsVUFBQSxDQUFBLEdBQUE7Ozs7QUFJRyxXQUFBLGFBQUEsb0JBQUEsUUFBQSxVQUFBO0lBQ0csT0FBTztBQUdYLFdBQVksYUFBZSxJQUFBLEtBQUEsS0FBQSxJQUFBLElBQUEsR0FBQTtJQUN6Qjs7RUFFRixPQUFDLEdBQUEsT0FBQTtBQUVELFdBQVUsUUFBYyxLQUFBLEtBQUEsTUFBQSxTQUFBOzs7SUFrQ3ZCLGtCQUFBLHVCQUFBLElBQUEsOEJBQUE7SUFFRCxzQkFBd0IsdUJBQUEsSUFBQSxrQ0FBQTs4QkFDRCx1QkFBVSxJQUFJLHFDQUFzQjtJQUMzRCxPQUFDLGVBQUEsYUFBQTtBQUNGLE1BQUEsQ0FBQSxPQUFBLE9BQUEsWUFBQSxlQUFBLEdBQUE7QUFFTSxXQUFNLGVBQUEsWUFDWCxpQkFBQTtNQUVPLE9BQUE7TUFFVCxVQUFBO01BQ0EsWUFBQTtNQUNBLGNBQUE7SUFDRSxDQUFBO0VBQ0Y7QUFDQSxNQUFBLENBQUEsT0FBQSxPQUFBLFlBQUEsbUJBQUEsR0FBQTtBQUNBLFdBQUEsZUFBQSxZQUFBLHFCQUFBO01BQ0EsT0FBQTtNQUNBLFVBQUE7TUFDRSxZQUFBO01BQ0YsY0FBQTtJQUNBLENBQUE7RUFDQTtBQUNBLE1BQUEsQ0FBQSxPQUFBLE9BQUEsWUFBQSx1QkFBQSxHQUFBO0FBQ0EsV0FBQSxlQUFBLFlBQUEseUJBQTJDO01BQ3pDLE9BQUE7TUFDRixVQUFBO01BQ0EsWUFBQTtNQUNNLGNBQWtCO0lBQ2xCLENBQUE7RUFDTjtBQUlBOzs7QUNydUJPLElBQU0sdUJBQXVCLHVCQUFPLElBQUksc0JBQXNCO0FBQzlELElBQU0saUJBQWlCLHVCQUFPLElBQUksZ0JBQWdCOzs7QUNtQ3pELGVBQXNCLE1BQU0sT0FBa0M7QUFFNUQsUUFBTSxVQUFXLFdBQW1CLGNBQWM7QUFDbEQsTUFBSSxDQUFDLFNBQVM7QUFDWixVQUFNLElBQUksTUFBTSx5REFBeUQ7RUFDM0U7QUFDQSxTQUFPLFFBQVEsS0FBSztBQUN0QjtBQVBzQjs7O0FDZmYsSUFBTSwwQkFBdUIsdUJBQUEsSUFBQSxrQkFBQTtBQUNsQyxTQUFnQixzQkFBVztBQUczQixRQUFBLE1BQUEsV0FBQSx1QkFBQTtBQUNBLE1BQUEsQ0FBQSxLQUFTO0FBQ0wsVUFBTSxJQUFDLE1BQUEsK0VBQUE7O0FBSVgsU0FBQzs7QUFUZTs7O0FDYlosU0FBVSxXQUFvQixTQUFxQjtBQUV2RCxRQUFNLGVBQWdCLFdBQ3BCLG9CQUFvQjtBQUV0QixNQUFJLENBQUMsY0FBYztBQUNqQixVQUFNLElBQUksTUFDUiw4REFBOEQ7RUFFbEU7QUFDQSxTQUFPLGFBQWEsT0FBTztBQUM3QjtBQVhnQjs7O0FDRWIsSUFBQSxRQUFBLFdBQUEsdUJBQUEsSUFBQSxtQkFBQSxDQUFBLEVBQUEsNkJBQUE7OztBQ0xHLElBQU8sNEJBQVAsY0FBeUMsTUFBSztFQUFwRCxPQUFvRDs7O0VBR3ZDO0VBRlgsWUFDRSxTQUNTLFlBQXNCO0FBRS9CLFVBQU0sT0FBTztBQUZKLFNBQUEsYUFBQTtBQUdULFNBQUssT0FBTztFQUNkOztBQVFDLFNBQUEsbUJBQUEsWUFBQSxTQUFBO0FBQ0gsVUFBTSxXQUFVLE1BQUE7SUFDZCxLQUFRO0FBQ04sYUFBSyxXQUFTO1NBQ1o7QUFDRixhQUFLLFlBQU8sUUFBQSxPQUFBLFdBQUEsTUFBQSxZQUFBLE9BQUE7U0FDVixjQUNGO0FBQ00sVUFBRSxFQUFBLFdBQVcsVUFBVSxRQUFRLGNBQWU7QUFDaEQsY0FBVSxJQUFBLDBCQUNSLGdDQUFnQyxXQUFXLE1BQVUsTUFDckQsVUFDQTtNQUNIO0FBQ0QsYUFBTyxZQUNMLFFBQVEsWUFBWSxXQUFXLE1BQy9CLEdBQUEsV0FBZSxNQUNmLFlBQ0EsY0FBYyxXQUFXLE1BQzFCLEdBQUM7SUFDSDtJQUNELEtBQUs7QUFDSCxhQUFPLFdBQVcsTUFBSyxJQUFBLENBQUEsU0FBQSxVQUFBLG1CQUFBLE1BQUEsT0FBQSxDQUFBLENBQUEsRUFBQSxLQUFBLEVBQUE7O0FBR3BCLFlBQVMsT0FBRyxtQkFBQSxXQUFBLE1BQUEsT0FBQTtBQUNmLFlBQVUsUUFBRyxtQkFBbUIsV0FBZSxPQUFFLE9BQVM7QUFDMUQsYUFBVyxRQUFHLFdBQUEsVUFBbUIsTUFBVyxPQUFPLFVBQVM7SUFDNUQ7SUFDRixLQUFDLFdBQ0Q7QUFDRSxZQUFNLFNBQVMsV0FBVyxTQUFhLElBQUMsQ0FBQSxZQUN0QyxVQUFVLG1CQUFtQixTQUFTLE9BQVEsR0FBRSxVQUNqRCxDQUFDO0FBQ0YsY0FBUSxXQUFXLFVBQVc7UUFDNUIsS0FBSztBQUNILGlCQUFPLE9BQU8sTUFBTSxPQUFTO1FBQy9CLEtBQVM7QUFDUCxpQkFBTyxPQUFXLEtBQUMsT0FBUztRQUM5QixLQUFLLE9BQ0M7QUFDRixjQUFNLE9BQUksV0FBQSxHQUFBO0FBQ1gsa0JBQUEsSUFBQSwwQkFBQSxrQ0FBQSxVQUFBO1VBQ087QUFDVCxpQkFBQSxDQUFBLE9BQUEsQ0FBQTtRQUNGO01BQ0Q7QUFDRDtJQUNEO1NBQ0UsVUFDQTtBQUNFLFlBQU0sU0FBUSxDQUFBO0FBQ2YsaUJBQUEsQ0FBQSxLQUFBLEtBQUEsS0FBQSxPQUFBLFFBQUEsV0FBQSxPQUFBLEdBQUE7QUFDTSxlQUFPLEdBQUEsSUFBQSxtQkFBQSxPQUFBLE9BQUE7TUFDZjtBQUNJLGFBQU87SUFDVjtJQUNILEtBQUE7QUFDRixhQUFBLFdBQUEsTUFBQSxJQUFBLENBQUEsU0FBQSxtQkFBQSxNQUFBLE9BQUEsQ0FBQTtFQUVEOztBQTVERztTQW1FSSxZQUFNLE1BQVcsTUFBTyxZQUFBLE9BQUE7TUFDM0IsVUFBVTthQUNSLFdBQVUsTUFBUTtRQUNsQixNQUFBLFFBQVMsT0FBQSxLQUFBLFFBQUEsS0FBQSxPQUFBLEdBQUE7QUFDVixnQkFBQSxRQUFBLE9BQUEsT0FBQSxDQUFBO0FBQ0c7O1FBRUYsWUFBUyxRQUFBLE9BQUEsWUFBQSxZQUFBLFdBQUEsU0FBQTtBQUNWLGdCQUFBLFFBQUEsT0FBQTtBQUNEO0lBSUQ7QUFDRCxVQUFPLElBQU8sMEJBQUMsUUFBQSxLQUFBLElBQUEsS0FBQSxLQUFBLEdBQUEsQ0FBQSwyQkFBQSxPQUFBLE1BQUEsVUFBQTtFQUNoQjtBQUVELFNBQVM7O0FBakJGO1NBdUJrQixRQUFPLFVBQVcsTUFBTSxPQUFPLFlBQUE7QUFDdEQsTUFBSSxhQUFhLEtBQUksUUFBQSxXQUFBLE1BQUEsS0FBQTtNQUFFLGFBQVEsS0FBVyxRQUFNLENBQUEsV0FBTyxNQUFBLEtBQUE7QUFDdkQsTUFBSSxPQUFPLFNBQVMsWUFBWSxPQUFPLFVBQVUsVUFBVTtBQUN6RCxZQUFBLFVBQWdCO01BQ2QsS0FBSztBQUNILGVBQU8sT0FBTztNQUNoQixLQUFLO0FBQ0gsZUFBTyxRQUFRO01BQ2pCLEtBQUs7QUFDSCxlQUFPLE9BQU87TUFDaEIsS0FBSztBQUNILGVBQU8sUUFBUTtJQUNuQjtFQUNGO0FBQ0EsTUFBSSxPQUFPLFNBQVMsWUFBWSxPQUFPLFVBQVUsVUFBVTtBQUN6RCxVQUFNLFFBQVEsT0FBTyxRQUFRLEtBQUssT0FBTyxRQUFRLElBQUk7QUFDckQsWUFBQSxVQUFnQjtNQUNkLEtBQUs7QUFDSCxlQUFPLFFBQVE7TUFDakIsS0FBSztBQUNILGVBQU8sU0FBUztNQUNsQixLQUFLO0FBQ0gsZUFBTyxRQUFRO01BQ2pCLEtBQUs7QUFDSCxlQUFPLFNBQVM7SUFDcEI7RUFDRjtBQUNBLFFBQU0sSUFBSSwwQkFDUix1QkFBdUIsUUFBUSwwQ0FDL0IsVUFBVTtBQUVkO0FBL0J5QjtBQWlDekIsU0FBUyxXQUFXLE1BQWUsT0FBYztBQUMvQyxNQUFJLE9BQU8sR0FBRyxNQUFNLEtBQUssRUFBQyxRQUFBO01BQUUsT0FBTyxTQUFLLE9BQUEsU0FBQSxTQUFBLFFBQUEsVUFBQSxLQUFBLFFBQUE7QUFDeEMsTUFBSSxPQUFPLFNBQVMsU0FBTyxRQUFTO1NBQWlDLEtBQU8sVUFBTSxTQUFBLElBQUEsQ0FBQSxNQUFBLEtBQUEsVUFBQSxTQUFBLEtBQUEsQ0FBQTs7QUFGM0U7U0FHdUIsU0FBTyxPQUFNO0FBQzNDLE1BQUEsTUFBTyxRQUFLLEtBQVUsRUFBQSxRQUFTLE1BQU0sSUFBSyxRQUFLO0FBQ2hELE1BQUEsVUFBQSxRQUFBLE9BQUEsVUFBQSxVQUFBO0FBRUQsV0FBUyxPQUFTLFlBQWMsT0FBQSxRQUFBLEtBQUEsRUFBQSxLQUFBLENBQUEsQ0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLE1BQUEsSUFBQSxJQUFBLEtBQUEsSUFBQSxJQUFBLElBQUEsQ0FBQSxFQUFBLElBQUEsQ0FBQSxDQUFBLEtBQUEsS0FBQSxNQUFBO01BQ3BCO01BQXVCLFNBQVUsS0FBQTtJQUN2QyxDQUFLLENBQUE7Ozs7QUFOcUI7U0FZN0IsVUFBQSxPQUFBLFlBQUE7QUFDRCxNQUFBLE9BQU8sVUFBTSxVQUFBLFFBQUE7QUFDZCxRQUFBLElBQUEsMEJBQUEsK0NBQUEsVUFBQTtBQUVEO0FBSkc7U0FLRyxVQUFPLE9BQVU7TUFBVyxPQUFPLFVBQU0sU0FBQSxRQUFBO0FBQzdDLE1BQUEsVUFBVSxRQUFBLFVBQUEsUUFBMEI7QUFDckMsVUFBQSxJQUFBLDBCQUFBLHNDQUFBLFVBQUEsS0FBQSxDQUFBO0VBRUQ7QUFDRSxNQUFJLE9BQU8sVUFBVSxZQUFRLE9BQUEsVUFBQSxVQUFBLFFBQUEsT0FBQSxLQUFBO1NBQUUsS0FBTyxVQUFNLEtBQUE7O0FBTHhDO1NBT0YsVUFBVSxPQUFBO0FBQ1osU0FBQztJQUNHLE1BQUE7SUFBeUQ7RUFDN0Q7QUFDRjtBQUpJOzs7QUMzS0csSUFBSSxzQkFBc0IsV0FBVyx1QkFBTyxJQUFJLG1CQUFtQixDQUFDLEVBQUUsOENBQThDO0FBQzNILG9CQUFvQixhQUFhO0FBQzFCLElBQUksbUJBQW1CLFdBQVcsdUJBQU8sSUFBSSxtQkFBbUIsQ0FBQyxFQUFFLDJDQUEyQztBQUNySCxpQkFBaUIsYUFBYTtBQUN2QixJQUFJLHdCQUF3QixXQUFXLHVCQUFPLElBQUksbUJBQW1CLENBQUMsRUFBRSxnREFBZ0Q7QUFDL0gsc0JBQXNCLGFBQWE7QUFDNUIsSUFBSSxlQUFlLFdBQVcsdUJBQU8sSUFBSSxtQkFBbUIsQ0FBQyxFQUFFLHVDQUF1QztBQUM3RyxhQUFhLGFBQWE7QUFDbkIsSUFBSSxnQkFBZ0IsV0FBVyx1QkFBTyxJQUFJLG1CQUFtQixDQUFDLEVBQUUsd0NBQXdDO0FBQy9HLGNBQWMsYUFBYTtBQUtoQixJQUFJLHFCQUFxQixXQUFXLHVCQUFPLElBQUksbUJBQW1CLENBQUMsRUFBRSw2Q0FBNkM7QUFDN0gsbUJBQW1CLGFBQWE7OztBQ0U1QixlQUFzQixpQkFBaUIsU0FBUztBQUNoRCxRQUFNLFdBQVcsb0JBQW9CO0FBQ3JDLFFBQU0sUUFBUSxTQUFTO0FBQ3ZCLE1BQUksUUFBUSxTQUFTLGVBQWUsUUFBUSxZQUFZO0FBQ3BELFVBQU0sSUFBSSxXQUFXLHdCQUF3QixRQUFRLFNBQVMsVUFBVSxjQUFjLFFBQVEsVUFBVSxHQUFHO0FBQUEsRUFDL0c7QUFDQSxRQUFNLFFBQVE7QUFBQSxJQUNWO0FBQUEsSUFDQSxZQUFZLFFBQVE7QUFBQSxJQUNwQixjQUFjLFFBQVE7QUFBQSxJQUN0QixNQUFNLFFBQVE7QUFBQSxJQUNkLFVBQVUsSUFBSSxJQUFJLFFBQVEsU0FBUyxTQUFTLElBQUksQ0FBQyxZQUFVO0FBQUEsTUFDbkQsUUFBUTtBQUFBLE1BQ1I7QUFBQSxJQUNKLENBQUMsQ0FBQztBQUFBLElBQ04sU0FBUyxDQUFDO0FBQUEsSUFDVixPQUFPO0FBQUEsRUFDWDtBQUNBLFFBQU0saUJBQWlCO0FBQUEsSUFDbkI7QUFBQSxJQUNBLFlBQVksUUFBUTtBQUFBLElBQ3BCLE1BQU07QUFBQSxJQUNOLFFBQVE7QUFBQSxNQUNKLFFBQVEsUUFBUSxLQUFLO0FBQUEsTUFDckIsTUFBTSxRQUFRLEtBQUs7QUFBQSxJQUN2QjtBQUFBLEVBQ0osQ0FBQztBQUNELE1BQUk7QUFDQSxVQUFNLFNBQVMsTUFBTSxlQUFlLE9BQU8sUUFBUSxLQUFLLGFBQWEsUUFBUSxLQUFLO0FBQ2xGLFVBQU0saUJBQWlCO0FBQUEsTUFDbkI7QUFBQSxNQUNBLFlBQVksUUFBUTtBQUFBLE1BQ3BCLE1BQU07QUFBQSxNQUNOLFFBQVEsQ0FBQztBQUFBLElBQ2IsQ0FBQztBQUNELFdBQU87QUFBQSxFQUNYLFNBQVMsT0FBTztBQUNaLFVBQU0saUJBQWlCO0FBQUEsTUFDbkI7QUFBQSxNQUNBLFlBQVksUUFBUTtBQUFBLE1BQ3BCLE1BQU07QUFBQSxNQUNOLFFBQVE7QUFBQSxRQUNKLFNBQVMsaUJBQWlCLFFBQVEsTUFBTSxVQUFVLE9BQU8sS0FBSztBQUFBLE1BQ2xFO0FBQUEsSUFDSixDQUFDO0FBQ0QsVUFBTTtBQUFBLEVBQ1Y7QUFDSjtBQS9DMEI7QUFnRDFCLGlCQUFpQixhQUFhO0FBQzlCLFdBQVcsb0JBQW9CLElBQUksOERBQThELGdCQUFnQjtBQUNsQyxlQUFlLGVBQWUsT0FBTyxhQUFhLE9BQU87QUFDcEksTUFBSSxTQUFTO0FBQ2IsTUFBSTtBQUNKLFNBQU0sV0FBVyxRQUFVO0FBQ3ZCLFVBQU0sT0FBTyxNQUFNLEtBQUssTUFBTSxNQUFNO0FBQ3BDLFFBQUksQ0FBQyxLQUFNLE9BQU0sSUFBSSxXQUFXLGlDQUFpQyxNQUFNLElBQUk7QUFDM0UsVUFBTSxVQUFVO0FBQUEsTUFDWjtBQUFBLE1BQ0EsYUFBYSxNQUFNO0FBQUEsSUFDdkI7QUFDQSxZQUFPLEtBQUssTUFBSztBQUFBLE1BQ2IsS0FBSztBQUNELGVBQU8sS0FBSyxTQUFTLG1CQUFtQixLQUFLLFFBQVEsT0FBTyxJQUFJO0FBQUEsTUFDcEUsS0FBSztBQUNELGNBQU0sSUFBSSxXQUFXLEdBQUcsS0FBSyxLQUFLLEdBQUcsS0FBSyxVQUFVLEtBQUssS0FBSyxPQUFPLEtBQUssRUFBRSxFQUFFO0FBQUEsTUFDbEYsS0FBSyxVQUNEO0FBQ0ksWUFBSTtBQUNKLG1CQUFXLFVBQVUsS0FBSyxTQUFRO0FBQzlCLGNBQUksbUJBQW1CLE9BQU8sTUFBTSxPQUFPLE1BQU0sTUFBTTtBQUNuRCxxQkFBUyxPQUFPO0FBQ2hCO0FBQUEsVUFDSjtBQUFBLFFBQ0o7QUFDQSxtQkFBVyxLQUFLO0FBQ2hCLFlBQUksV0FBVyxRQUFXO0FBQ3RCLGdCQUFNLElBQUksV0FBVyxXQUFXLEtBQUssRUFBRSwyQ0FBMkM7QUFBQSxRQUN0RjtBQUNBLGlCQUFTO0FBQ1Q7QUFBQSxNQUNKO0FBQUEsTUFDSixLQUFLO0FBQ0QsY0FBTSxNQUFNLEdBQUcsS0FBSyxPQUFPLEdBQUc7QUFDOUIsY0FBTSxRQUFRLEtBQUssRUFBRSxJQUFJO0FBQUEsVUFDckIsZUFBZSxLQUFLO0FBQUEsUUFDeEI7QUFDQTtBQUFBLE1BQ0osS0FBSyxVQUNEO0FBQ0ksY0FBTSxPQUFPLFdBQVc7QUFBQSxVQUNwQixPQUFPLFVBQVUsTUFBTSxLQUFLLElBQUksS0FBSyxVQUFVO0FBQUEsUUFDbkQsQ0FBQztBQUNELGNBQU0sVUFBVSxNQUFNO0FBQ3RCLGNBQU0sUUFBUSxLQUFLLEVBQUUsSUFBSTtBQUN6QjtBQUFBLE1BQ0o7QUFBQSxNQUNKLEtBQUssWUFDRDtBQUNJLGNBQU0sVUFBVSxtQkFBbUIsS0FBSyxTQUFTLE9BQU87QUFDeEQsY0FBTSxRQUFRLEtBQUssRUFBRSxJQUFJLE1BQU0sWUFBWSxPQUFPLEtBQUssSUFBSSxLQUFLLE9BQU8sU0FBUyxLQUFLLGNBQWM7QUFDbkc7QUFBQSxNQUNKO0FBQUEsTUFDSixLQUFLLFlBQ0Q7QUFDSSxjQUFNLFVBQVUsTUFBTSxRQUFRLElBQUksS0FBSyxTQUFTLElBQUksQ0FBQyxXQUFTLGVBQWUsT0FBTyxPQUFPLGFBQWEsS0FBSyxDQUFDLENBQUM7QUFDL0csY0FBTSxRQUFRLEtBQUssRUFBRSxJQUFJO0FBQ3pCO0FBQUEsTUFDSjtBQUFBLE1BQ0osS0FBSyxXQUNEO0FBQ0ksY0FBTSxRQUFRLG1CQUFtQixLQUFLLE9BQU8sT0FBTztBQUNwRCxZQUFJLENBQUMsTUFBTSxRQUFRLEtBQUssR0FBRztBQUN2QixnQkFBTSxJQUFJLFdBQVcsWUFBWSxLQUFLLEVBQUUsdUNBQXVDO0FBQUEsUUFDbkY7QUFDQSxjQUFNLGNBQWMsS0FBSyxJQUFJLEtBQUssZ0JBQWdCLE1BQU0sS0FBSyxRQUFRLGNBQWM7QUFDbkYsY0FBTSxVQUFVLENBQUM7QUFDakIsaUJBQVEsU0FBUyxHQUFHLFNBQVMsTUFBTSxRQUFRLFVBQVUsYUFBWTtBQUM3RCxnQkFBTSxRQUFRLE1BQU0sTUFBTSxRQUFRLFNBQVMsV0FBVztBQUN0RCxnQkFBTSxlQUFlLE1BQU0sUUFBUSxJQUFJLE1BQU0sSUFBSSxDQUFDLE1BQU0sVUFBUSxtQkFBbUIsT0FBTyxLQUFLLGlCQUFpQixPQUFPLEtBQUssSUFBSTtBQUFBLFlBQ3hIO0FBQUEsWUFDQSxPQUFPLFNBQVM7QUFBQSxVQUNwQixDQUFDLENBQUMsQ0FBQztBQUNQLGtCQUFRLEtBQUssR0FBRyxZQUFZO0FBQUEsUUFDaEM7QUFDQSxjQUFNLFFBQVEsS0FBSyxFQUFFLElBQUk7QUFDekI7QUFBQSxNQUNKO0FBQUEsTUFDSixLQUFLLFFBQ0Q7QUFDSSxjQUFNLGdCQUFnQixLQUFLLElBQUksS0FBSyxlQUFlLE1BQU0sS0FBSyxRQUFRLGFBQWE7QUFDbkYsY0FBTSxVQUFVLENBQUM7QUFDakIsaUJBQVEsWUFBWSxHQUFHLFlBQVksZUFBZSxhQUFhLEdBQUU7QUFDN0QsY0FBSSxLQUFLLGVBQWU7QUFDcEIsa0JBQU0sVUFBVSxtQkFBbUIsS0FBSyxlQUFlO0FBQUEsY0FDbkQ7QUFBQSxjQUNBLGFBQWE7QUFBQSxnQkFDVCxHQUFHLE1BQU07QUFBQSxnQkFDVCxDQUFDLEtBQUssRUFBRSxHQUFHO0FBQUEsa0JBQ1A7QUFBQSxrQkFDQTtBQUFBLGdCQUNKO0FBQUEsY0FDSjtBQUFBLFlBQ0osQ0FBQztBQUNELGdCQUFJLFlBQVksS0FBTTtBQUFBLFVBQzFCO0FBQ0Esa0JBQVEsS0FBSyxNQUFNLG1CQUFtQixPQUFPLEtBQUssaUJBQWlCLE9BQU8sS0FBSyxJQUFJO0FBQUEsWUFDL0U7QUFBQSxZQUNBO0FBQUEsVUFDSixDQUFDLENBQUM7QUFBQSxRQUNOO0FBQ0EsY0FBTSxRQUFRLEtBQUssRUFBRSxJQUFJO0FBQ3pCO0FBQUEsTUFDSjtBQUFBLE1BQ0osS0FBSyxpQkFDRDtBQUNJLGNBQU0sUUFBUSxLQUFLLEVBQUUsSUFBSSxNQUFNLGFBQWEsT0FBTyxNQUFNLE9BQU87QUFDaEU7QUFBQSxNQUNKO0FBQUEsTUFDSixLQUFLLFVBQ0Q7QUFDSSxjQUFNLFFBQVEsS0FBSyxFQUFFLElBQUksTUFBTSxVQUFVLE9BQU8sTUFBTSxPQUFPO0FBQzdEO0FBQUEsTUFDSjtBQUFBLElBQ1I7QUFDQSxpQkFBYSxNQUFNLFFBQVEsS0FBSyxFQUFFO0FBQ2xDLGFBQVMsVUFBVSxPQUFPLEtBQUssT0FBTztBQUFBLEVBQzFDO0FBQ0EsU0FBTztBQUNYO0FBdEg4RjtBQXVIakIsZUFBZSxtQkFBbUIsT0FBTyxpQkFBaUIsT0FBTyxZQUFZLFdBQVc7QUFDakssUUFBTSxpQkFBaUI7QUFBQSxJQUNuQixHQUFHO0FBQUEsSUFDSCxTQUFTO0FBQUEsTUFDTCxHQUFHLE1BQU07QUFBQSxNQUNULENBQUMsVUFBVSxHQUFHO0FBQUEsSUFDbEI7QUFBQSxFQUNKO0FBQ0EsU0FBTyxlQUFlLGdCQUFnQixpQkFBaUIsS0FBSztBQUNoRTtBQVQ0RjtBQVU1RixlQUFlLFVBQVUsT0FBTyxNQUFNLFNBQVM7QUFDM0MsUUFBTSxjQUFjLE1BQU0sS0FBSyx1QkFBdUIsS0FBSyxDQUFDLFFBQU0sSUFBSSxPQUFPLEtBQUssT0FBTztBQUN6RixNQUFJLENBQUMsWUFBYSxPQUFNLElBQUksV0FBVyxXQUFXLEtBQUssRUFBRSx5QkFBeUIsS0FBSyxPQUFPLElBQUk7QUFDbEcsUUFBTSxVQUFVLE1BQU0sU0FBUyxJQUFJLEtBQUssT0FBTztBQUMvQyxNQUFJLENBQUMsUUFBUyxPQUFNLElBQUksV0FBVyxzQ0FBc0MsS0FBSyxPQUFPLElBQUk7QUFDekYsUUFBTSxPQUFPLG1CQUFtQixLQUFLLE9BQU8sT0FBTztBQUNuRCxRQUFNLGVBQWUsZUFBZSxPQUFPO0FBRzNDLFFBQU0sWUFBWSxNQUFNLHNCQUFzQjtBQUFBLElBQzFDLFNBQVM7QUFBQSxJQUNULGVBQWUsWUFBWTtBQUFBLElBQzNCLFVBQVUsWUFBWTtBQUFBLElBQ3RCLFdBQVcsWUFBWTtBQUFBLElBQ3ZCLFFBQVEsWUFBWTtBQUFBLElBQ3BCLFlBQVksTUFBTTtBQUFBLElBQ2xCLE9BQU8sTUFBTTtBQUFBLElBQ2IsR0FBRyxRQUFRLGFBQWEsU0FBWSxDQUFDLElBQUk7QUFBQSxNQUNyQyxNQUFNLE9BQU8sUUFBUSxRQUFRO0FBQUEsSUFDakM7QUFBQSxJQUNBLEdBQUcsUUFBUSxxQkFBcUIsU0FBWSxDQUFDLElBQUk7QUFBQSxNQUM3QyxrQkFBa0IsUUFBUTtBQUFBLElBQzlCO0FBQUEsSUFDQTtBQUFBLEVBQ0osQ0FBQztBQUNELE1BQUksVUFBVSxhQUFhLFFBQVE7QUFDL0IsUUFBSSxLQUFLLFFBQVMsUUFBTyxXQUFXLE9BQU8sTUFBTSxTQUFTLGtCQUFrQixVQUFVLE1BQU0sRUFBRTtBQUM5RixVQUFNLElBQUksV0FBVyxpQkFBaUIsWUFBWSxTQUFTLEtBQUssVUFBVSxNQUFNLEVBQUU7QUFBQSxFQUN0RjtBQUNBLE1BQUk7QUFDSixNQUFJLFVBQVUsYUFBYSx1QkFBdUIsS0FBSyxhQUFhLG1CQUFtQjtBQUduRixVQUFNLFdBQVcsTUFBTSxZQUFZLE9BQU8sS0FBSyxJQUFJLG1CQUFtQixNQUFNLE1BQVM7QUFDckYsOEJBQTBCLFNBQVM7QUFBQSxFQUN2QztBQUNBLFFBQU0sY0FBYyxLQUFLLE9BQU8sZUFBZTtBQUMvQyxNQUFJO0FBQ0osV0FBUSxVQUFVLEdBQUcsV0FBVyxhQUFhLFdBQVcsR0FBRTtBQUN0RCxRQUFJO0FBQ0EsWUFBTSxVQUFVO0FBQUEsUUFDWixPQUFPLE1BQU07QUFBQSxRQUNiLFlBQVksTUFBTTtBQUFBLFFBQ2xCLGNBQWMsTUFBTTtBQUFBLFFBQ3BCLFFBQVEsS0FBSztBQUFBLFFBQ2I7QUFBQSxRQUNBO0FBQUEsUUFDQSxTQUFTO0FBQUEsUUFDVDtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQSxHQUFHLDRCQUE0QixTQUFZLENBQUMsSUFBSTtBQUFBLFVBQzVDO0FBQUEsUUFDSjtBQUFBLFFBQ0EsR0FBRyxNQUFNLHFCQUFxQixPQUFPLE1BQU0sT0FBTztBQUFBLE1BQ3REO0FBQ0EsYUFBTyxNQUFNLG1CQUFtQixPQUFPO0FBQUEsSUFDM0MsU0FBUyxPQUFPO0FBQ1osa0JBQVk7QUFDWixVQUFJLGlCQUFpQixjQUFjLFlBQVksS0FBSyxFQUFHO0FBQ3ZELFVBQUksVUFBVSxnQkFBZ0IsS0FBSyxPQUFPLGtCQUFrQixLQUFLLEdBQUc7QUFDaEUsY0FBTSxNQUFNLEdBQUcsS0FBSyxPQUFPLGtCQUFrQixDQUFDLEdBQUc7QUFBQSxNQUNyRDtBQUFBLElBQ0o7QUFBQSxFQUNKO0FBQ0EsTUFBSSxLQUFLLFNBQVM7QUFDZCxXQUFPLFdBQVcsT0FBTyxNQUFNLFNBQVMscUJBQXFCLFFBQVEsVUFBVSxVQUFVLE9BQU8sU0FBUyxDQUFDO0FBQUEsRUFDOUc7QUFDQSxRQUFNLHFCQUFxQixRQUFRLFlBQVksSUFBSSxXQUFXLE9BQU8sU0FBUyxDQUFDO0FBQ25GO0FBckVlO0FBc0VmLGVBQWUscUJBQXFCLE9BQU8sTUFBTSxTQUFTO0FBQ3RELFFBQU0sU0FBUyxLQUFLO0FBQ3BCLE1BQUksQ0FBQyxPQUFRLFFBQU8sQ0FBQztBQUNyQixVQUFPLE9BQU8sTUFBSztBQUFBLElBQ2YsS0FBSztBQUNELGFBQU87QUFBQSxRQUNILGFBQWE7QUFBQSxVQUNULE1BQU07QUFBQSxVQUNOLFVBQVUsT0FBTyxtQkFBbUIsT0FBTyxLQUFLLE9BQU8sQ0FBQztBQUFBLFFBQzVEO0FBQUEsTUFDSjtBQUFBLElBQ0osS0FBSztBQUNELGFBQU87QUFBQSxRQUNILGFBQWE7QUFBQSxVQUNULE1BQU07QUFBQSxVQUNOLFdBQVcsT0FBTztBQUFBLFFBQ3RCO0FBQUEsTUFDSjtBQUFBLElBQ0osS0FBSyx3QkFDRDtBQUNJLFlBQU0sRUFBRSxhQUFhLFFBQVEsSUFBSSxlQUFlLE9BQU8sT0FBTyxhQUFhO0FBQzNFLGFBQU87QUFBQSxRQUNILGFBQWE7QUFBQSxVQUNULE1BQU07QUFBQSxVQUNOLG1CQUFtQjtBQUFBLFVBQ25CLGVBQWU7QUFBQSxRQUNuQjtBQUFBLE1BQ0o7QUFBQSxJQUNKO0FBQUEsSUFDSixLQUFLLGtCQUNEO0FBQ0ksWUFBTSxFQUFFLGFBQWEsUUFBUSxJQUFJLGVBQWUsT0FBTyxPQUFPLGFBQWE7QUFDM0UsYUFBTztBQUFBLFFBQ0gsYUFBYTtBQUFBLFVBQ1QsTUFBTTtBQUFBLFVBQ04sbUJBQW1CO0FBQUEsVUFDbkIsZUFBZTtBQUFBLFFBQ25CO0FBQUEsTUFDSjtBQUFBLElBQ0o7QUFBQSxJQUNKLEtBQUs7QUFDRCxhQUFPO0FBQUEsUUFDSCxhQUFhO0FBQUEsVUFDVCxNQUFNO0FBQUEsUUFDVjtBQUFBLE1BQ0o7QUFBQSxFQUNSO0FBQ0o7QUEvQ2U7QUFnRGYsU0FBUyxlQUFlLE9BQU8sZUFBZTtBQUMxQyxRQUFNLGNBQWMsTUFBTSxLQUFLLHVCQUF1QixLQUFLLENBQUMsUUFBTSxJQUFJLE9BQU8sYUFBYTtBQUMxRixRQUFNLFVBQVUsTUFBTSxTQUFTLElBQUksYUFBYTtBQUNoRCxNQUFJLENBQUMsZUFBZSxDQUFDLFNBQVM7QUFDMUIsVUFBTSxJQUFJLFdBQVcsbUNBQW1DLGFBQWEsaUJBQWlCO0FBQUEsRUFDMUY7QUFDQSxTQUFPO0FBQUEsSUFDSDtBQUFBLElBQ0E7QUFBQSxFQUNKO0FBQ0o7QUFWUztBQVdULGVBQWUsV0FBVyxPQUFPLE1BQU0sU0FBUyxTQUFTO0FBQ3JELFFBQU0sUUFBUSxLQUFLLEVBQUUsSUFBSTtBQUFBLElBQ3JCLE9BQU87QUFBQSxFQUNYO0FBQ0EsU0FBTyxlQUFlLE9BQU8sS0FBSyxTQUFTLFFBQVEsS0FBSztBQUM1RDtBQUxlO0FBV1gsZUFBZSxZQUFZLE9BQU8sUUFBUSxPQUFPLFNBQVMsZ0JBQWdCO0FBQzFFLFFBQU0sa0JBQWtCLE1BQU0sb0JBQW9CLE9BQU87QUFDekQsUUFBTSxRQUFRLFlBQVksTUFBTSxLQUFLLElBQUksTUFBTSxVQUFVLElBQUksTUFBTSxJQUFJLGVBQWU7QUFDdEYsUUFBTSxpQkFBaUI7QUFBQSxJQUNuQixPQUFPLE1BQU07QUFBQSxJQUNiLFlBQVksTUFBTTtBQUFBLElBQ2xCLE1BQU07QUFBQSxJQUNOO0FBQUEsSUFDQSxRQUFRO0FBQUEsTUFDSjtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDSjtBQUFBLEVBQ0osQ0FBQztBQUNELFFBQU0sT0FBTyxXQUFXO0FBQUEsSUFDcEI7QUFBQSxFQUNKLENBQUM7QUFDRCxNQUFJO0FBQ0osTUFBSSxtQkFBbUIsUUFBVztBQUM5QixVQUFNLFNBQVMsTUFBTSxHQUFHLGNBQWMsR0FBRyxFQUFFLEtBQUssTUFBSSxTQUFTO0FBQzdELFVBQU0sUUFBUSxNQUFNLFFBQVEsS0FBSztBQUFBLE1BQzdCO0FBQUEsTUFDQTtBQUFBLElBQ0osQ0FBQztBQUNELFFBQUksVUFBVSxXQUFXO0FBQ3JCLFlBQU0sSUFBSSxXQUFXLHNCQUFzQixNQUFNLG1CQUFtQixjQUFjLElBQUk7QUFBQSxJQUMxRjtBQUNBLGVBQVc7QUFBQSxFQUNmLE9BQU87QUFDSCxlQUFXLE1BQU07QUFBQSxFQUNyQjtBQUNBLFFBQU0saUJBQWlCO0FBQUEsSUFDbkI7QUFBQSxJQUNBLFVBQVUsU0FBUztBQUFBLElBQ25CLFdBQVcsU0FBUztBQUFBLElBQ3BCLFVBQVU7QUFBQSxFQUNkO0FBQ0EsUUFBTSxpQkFBaUI7QUFBQSxJQUNuQixPQUFPLE1BQU07QUFBQSxJQUNiLFlBQVksTUFBTTtBQUFBLElBQ2xCLE1BQU07QUFBQSxJQUNOO0FBQUEsSUFDQSxRQUFRO0FBQUEsRUFDWixDQUFDO0FBQ0QsTUFBSSxDQUFDLFNBQVMsVUFBVTtBQUNwQixVQUFNLElBQUksV0FBVyxzQkFBc0IsTUFBTSxpQkFBaUI7QUFBQSxFQUN0RTtBQUNBLE1BQUksU0FBUyxvQkFBb0IsaUJBQWlCO0FBQzlDLFVBQU0sSUFBSSxXQUFXLHNCQUFzQixNQUFNLHdCQUF3QixTQUFTLGVBQWUsU0FBUyxlQUFlLDRDQUF1QztBQUFBLEVBQ3BLO0FBQ0EsU0FBTztBQUFBLElBQ0gsVUFBVTtBQUFBLElBQ1Y7QUFBQSxFQUNKO0FBQ0o7QUF0RG1CO0FBdURrRSxlQUFlLGFBQWEsT0FBTyxNQUFNLFNBQVM7QUFDbkksTUFBSSxNQUFNLFFBQVEsS0FBSyxNQUFNLEtBQUssUUFBUSxVQUFVO0FBQ2hELFVBQU0sSUFBSSxXQUFXLG1CQUFtQixLQUFLLEVBQUUsNkJBQTZCO0FBQUEsRUFDaEY7QUFDQSxRQUFNLGNBQWMsTUFBTSxvQkFBb0IsS0FBSyxJQUFJO0FBQ3ZELFFBQU0saUJBQWlCO0FBQUEsSUFDbkIsT0FBTyxNQUFNO0FBQUEsSUFDYixZQUFZLE1BQU07QUFBQSxJQUNsQixNQUFNO0FBQUEsSUFDTixRQUFRLEtBQUs7QUFBQSxJQUNiLFFBQVE7QUFBQSxNQUNKLGlCQUFpQjtBQUFBLE1BQ2pCLGFBQWEsS0FBSyxLQUFLO0FBQUEsSUFDM0I7QUFBQSxFQUNKLENBQUM7QUFDRCxRQUFNLGFBQWEsbUJBQW1CLEtBQUssT0FBTyxPQUFPO0FBQ3pELFFBQU0sYUFBYTtBQUFBLElBQ2YsT0FBTyxNQUFNO0FBQUEsSUFDYixZQUFZO0FBQUEsSUFDWixjQUFjLE1BQU07QUFBQSxJQUNwQixNQUFNLEtBQUs7QUFBQSxJQUNYLFVBQVUsTUFBTTtBQUFBLElBQ2hCLFNBQVMsQ0FBQztBQUFBLElBQ1YsT0FBTyxNQUFNLFFBQVE7QUFBQSxFQUN6QjtBQUNBLFNBQU8sZUFBZSxZQUFZLEtBQUssS0FBSyxhQUFhLFVBQVU7QUFDdkU7QUExQm9HO0FBMkJwRyxTQUFTLGVBQWUsU0FBUztBQUc3QixRQUFNLFVBQVUsQ0FBQztBQUNqQixhQUFXLENBQUMsS0FBSyxLQUFLLEtBQUssT0FBTyxRQUFRLFFBQVEsV0FBVyxHQUFFO0FBQzNELFFBQUksVUFBVSxRQUFRLE9BQU8sVUFBVSxVQUFVO0FBQzdDLFlBQU0sT0FBTztBQUNiLFVBQUksT0FBTyxLQUFLLGNBQWMsU0FBVSxTQUFRLEtBQUssR0FBRyxHQUFHLElBQUksS0FBSyxTQUFTLEVBQUU7QUFBQSxlQUN0RSxPQUFPLEtBQUssVUFBVSxTQUFVLFNBQVEsS0FBSyxHQUFHLEdBQUcsSUFBSSxLQUFLLEtBQUssRUFBRTtBQUFBLElBQ2hGO0FBQUEsRUFDSjtBQUNBLFNBQU8sUUFBUSxXQUFXLElBQUksTUFBTSxRQUFRLEtBQUssRUFBRSxLQUFLLEdBQUc7QUFDL0Q7QUFaUztBQWFULFNBQVMsT0FBTyxVQUFVO0FBQ3RCLFNBQU8sSUFBSSxJQUFJLFFBQVEsRUFBRTtBQUM3QjtBQUZTO0FBR1QsU0FBUyxZQUFZLE9BQU87QUFDeEIsU0FBTyxpQkFBaUIsVUFBVSxNQUFNLFNBQVMsZ0JBQWdCLE1BQU0sU0FBUztBQUNwRjtBQUZTOzs7QUNuYlQsU0FBUyw0QkFBNEIsS0FBSyxPQUFPLE9BQU87QUFDcEQsTUFBSSxVQUFVLFFBQVEsVUFBVSxRQUFRO0FBQ3BDLFFBQUksT0FBTyxVQUFVLFlBQVksT0FBTyxVQUFVLFdBQVksT0FBTSxJQUFJLFVBQVUsa0JBQWtCO0FBQ3BHLFFBQUksU0FBUztBQUNiLFFBQUksT0FBTztBQUNQLFVBQUksQ0FBQyxPQUFPLGFBQWMsT0FBTSxJQUFJLFVBQVUscUNBQXFDO0FBQ25GLGdCQUFVLE1BQU0sT0FBTyxZQUFZO0FBQUEsSUFDdkM7QUFDQSxRQUFJLFlBQVksUUFBUTtBQUNwQixVQUFJLENBQUMsT0FBTyxRQUFTLE9BQU0sSUFBSSxVQUFVLGdDQUFnQztBQUN6RSxnQkFBVSxNQUFNLE9BQU8sT0FBTztBQUM5QixVQUFJLE1BQU8sU0FBUTtBQUFBLElBQ3ZCO0FBQ0EsUUFBSSxPQUFPLFlBQVksV0FBWSxPQUFNLElBQUksVUFBVSx3QkFBd0I7QUFDL0UsUUFBSSxNQUFPLFdBQVUsa0NBQVc7QUFDNUIsVUFBSTtBQUNBLGNBQU0sS0FBSyxJQUFJO0FBQUEsTUFDbkIsU0FBUyxHQUFHO0FBQ1IsZUFBTyxRQUFRLE9BQU8sQ0FBQztBQUFBLE1BQzNCO0FBQUEsSUFDSixHQU5xQjtBQU9yQixRQUFJLE1BQU0sS0FBSztBQUFBLE1BQ1g7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0osQ0FBQztBQUFBLEVBQ0wsV0FBVyxPQUFPO0FBQ2QsUUFBSSxNQUFNLEtBQUs7QUFBQSxNQUNYLE9BQU87QUFBQSxJQUNYLENBQUM7QUFBQSxFQUNMO0FBQ0EsU0FBTztBQUNYO0FBaENTO0FBaUNULFNBQVMsc0JBQXNCLEtBQUs7QUFDaEMsTUFBSSxtQkFBbUIsT0FBTyxvQkFBb0IsYUFBYSxrQkFBa0IsU0FBUyxPQUFPLFlBQVksU0FBUztBQUNsSCxRQUFJLElBQUksSUFBSSxNQUFNLE9BQU87QUFDekIsV0FBTyxFQUFFLE9BQU8sbUJBQW1CLEVBQUUsUUFBUSxPQUFPLEVBQUUsYUFBYSxZQUFZO0FBQUEsRUFDbkY7QUFDQSxVQUFRLHdCQUF3QixnQ0FBU0MsdUJBQXNCQyxNQUFLO0FBQ2hFLGFBQVMsS0FBSyxHQUFHO0FBQ2IsTUFBQUEsS0FBSSxRQUFRQSxLQUFJLFdBQVcsSUFBSSxpQkFBaUIsR0FBR0EsS0FBSSxPQUFPLDBDQUEwQyxJQUFJO0FBQzVHLE1BQUFBLEtBQUksV0FBVztBQUFBLElBQ25CO0FBSFM7QUFJVCxRQUFJLEdBQUcsSUFBSTtBQUNYLGFBQVMsT0FBTztBQUNaLGFBQU0sSUFBSUEsS0FBSSxNQUFNLElBQUksR0FBRTtBQUN0QixZQUFJO0FBQ0EsY0FBSSxDQUFDLEVBQUUsU0FBUyxNQUFNLEVBQUcsUUFBTyxJQUFJLEdBQUdBLEtBQUksTUFBTSxLQUFLLENBQUMsR0FBRyxRQUFRLFFBQVEsRUFBRSxLQUFLLElBQUk7QUFDckYsY0FBSSxFQUFFLFNBQVM7QUFDWCxnQkFBSSxTQUFTLEVBQUUsUUFBUSxLQUFLLEVBQUUsS0FBSztBQUNuQyxnQkFBSSxFQUFFLE1BQU8sUUFBTyxLQUFLLEdBQUcsUUFBUSxRQUFRLE1BQU0sRUFBRSxLQUFLLE1BQU0sU0FBUyxHQUFHO0FBQ3ZFLG1CQUFLLENBQUM7QUFDTixxQkFBTyxLQUFLO0FBQUEsWUFDaEIsQ0FBQztBQUFBLFVBQ0wsTUFBTyxNQUFLO0FBQUEsUUFDaEIsU0FBUyxHQUFHO0FBQ1IsZUFBSyxDQUFDO0FBQUEsUUFDVjtBQUFBLE1BQ0o7QUFDQSxVQUFJLE1BQU0sRUFBRyxRQUFPQSxLQUFJLFdBQVcsUUFBUSxPQUFPQSxLQUFJLEtBQUssSUFBSSxRQUFRLFFBQVE7QUFDL0UsVUFBSUEsS0FBSSxTQUFVLE9BQU1BLEtBQUk7QUFBQSxJQUNoQztBQWpCUztBQWtCVCxXQUFPLEtBQUs7QUFBQSxFQUNoQixHQXpCZ0MsMEJBeUI3QixHQUFHO0FBQ1Y7QUEvQlM7QUFrQ0YsSUFBSSxTQUFTLFdBQVcsdUJBQU8sSUFBSSxtQkFBbUIsQ0FBQyxFQUFFLGlDQUFpQztBQUNqRyxlQUFzQixjQUFjLE9BQU87QUFDdkMsUUFBTSxVQUFVLE1BQU0sT0FBTyxLQUFLO0FBQ2xDLFNBQU8sVUFBVTtBQUNyQjtBQUhzQjtBQUl0QixjQUFjLGFBQWE7QUFDM0IsV0FBVyxvQkFBb0IsSUFBSSw4Q0FBOEMsYUFBYTtBQUM5RixlQUFzQixrQkFBa0IsT0FBTztBQUMzQyxRQUFNLE1BQU07QUFBQSxJQUNSLE9BQU8sQ0FBQztBQUFBLElBQ1IsT0FBTztBQUFBLElBQ1AsVUFBVTtBQUFBLEVBQ2Q7QUFDQSxNQUFJO0FBQ0EsVUFBTSxPQUFPLDRCQUE0QixLQUFLLFdBQVc7QUFBQSxNQUNyRDtBQUFBLElBQ0osQ0FBQyxHQUFHLEtBQUs7QUFDVCxVQUFNLFVBQVUsTUFBTTtBQUN0QixXQUFPLFFBQVE7QUFBQSxFQUNuQixTQUFTLEdBQUc7QUFDUixRQUFJLFFBQVE7QUFDWixRQUFJLFdBQVc7QUFBQSxFQUNuQixVQUFFO0FBQ0UsMEJBQXNCLEdBQUc7QUFBQSxFQUM3QjtBQUNKO0FBbEJzQjtBQW1CdEIsa0JBQWtCLGFBQWE7QUFDL0IsV0FBVyxvQkFBb0IsSUFBSSxrREFBa0QsaUJBQWlCOzs7QUM1RnRHLElBQU0saUJBQWlCO0FBQUEsRUFDbkI7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFDSjtBQUNBLElBQU8sMEJBQVE7OztBQ2hHZixJQUFBLGVBQUEsd0JBQUEsS0FBQSxHQUFBO0FBR0EsSUFBQSx5QkFBQSxJQUFBLE9BQUEsZ0NBQXdFLFlBQUEsMERBQUEsWUFBQSw4QkFBQSxHQUFBOyIsCiAgIm5hbWVzIjogWyJtb2R1bGUiLCAibXMiLCAibXMiLCAiX3RzX2Rpc3Bvc2VfcmVzb3VyY2VzIiwgImVudiJdCn0K
`;

const handler = workflowEntrypoint(workflowCode);

export const HEAD = handler;
export const POST = handler;