const REDACTED = "[REDACTED]";

/**
 * Replace every occurrence of the given secret values in a string. Used at
 * every output boundary (plans, logs, audit events, errors) so secret
 * material never leaves the process even when embedded in third-party text.
 */
export function redactSecrets(text: string, secrets: Iterable<string>): string {
  let output = text;
  for (const secret of secrets) {
    if (!secret || secret.length < 4) continue;
    output = output.split(secret).join(REDACTED);
  }
  return output;
}

/** Deep-redact secret values anywhere inside a JSON-serializable value. */
export function redactSecretsDeep<T>(value: T, secrets: Iterable<string>): T {
  const list = [...secrets].filter((secret) => secret.length >= 4);
  if (list.length === 0) return value;
  return JSON.parse(redactSecrets(JSON.stringify(value), list)) as T;
}
