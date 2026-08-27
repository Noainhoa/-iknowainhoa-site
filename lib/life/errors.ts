import type { AuthError, PostgrestError } from "@supabase/supabase-js";

export type LifeSupabaseFailure = {
  message: string;
  code?: string;
  status?: number;
  hint?: string;
  details?: string;
};

export class LifeOperationError extends Error {
  readonly operation: string;
  readonly failure: LifeSupabaseFailure;
  readonly data: unknown;

  constructor(operation: string, failure: LifeSupabaseFailure, data: unknown = null) {
    const codeSuffix = failure.code ? ` [${failure.code}]` : "";
    super(`[${operation}] ${failure.message}${codeSuffix}`);
    this.name = "LifeOperationError";
    this.operation = operation;
    this.failure = failure;
    this.data = data;
  }
}

function fromPostgrestError(error: PostgrestError): LifeSupabaseFailure {
  return {
    message: error.message,
    code: error.code,
    hint: error.hint,
    details: error.details,
  };
}

function fromAuthError(error: AuthError): LifeSupabaseFailure {
  return {
    message: error.message,
    code: error.code,
    status: error.status,
  };
}

function isPostgrestError(error: PostgrestError | AuthError): error is PostgrestError {
  return "details" in error || "hint" in error;
}

export function toLifeSupabaseFailure(error: unknown): LifeSupabaseFailure {
  if (error instanceof LifeOperationError) {
    return error.failure;
  }

  if (error && typeof error === "object" && "message" in error) {
    const candidate = error as PostgrestError | AuthError | LifeSupabaseFailure;
    if (isPostgrestError(candidate as PostgrestError)) {
      return fromPostgrestError(candidate as PostgrestError);
    }
    if ("status" in candidate && "code" in candidate && !("details" in candidate)) {
      return fromAuthError(candidate as AuthError);
    }
    return {
      message: String(candidate.message),
      code: "code" in candidate ? String(candidate.code) : undefined,
      status: "status" in candidate ? Number(candidate.status) : undefined,
      hint: "hint" in candidate ? String(candidate.hint) : undefined,
      details: "details" in candidate ? String(candidate.details) : undefined,
    };
  }

  return { message: String(error) };
}

export function logLifeOperation(
  operation: string,
  payload: {
    ok: boolean;
    userId?: string;
    supabaseUrl?: string;
    data?: unknown;
    count?: number | null;
    error?: unknown;
    status?: number;
    extra?: Record<string, unknown>;
  }
): void {
  const failure = payload.error ? toLifeSupabaseFailure(payload.error) : undefined;
  console.error("[life]", {
    operation,
    ok: payload.ok,
    userId: payload.userId,
    supabaseUrl: payload.supabaseUrl,
    count: payload.count,
    data: payload.data,
    status: payload.status ?? failure?.status,
    code: failure?.code,
    message: failure?.message,
    hint: failure?.hint,
    details: failure?.details,
    ...payload.extra,
  });
}

export function failLifeOperation(
  operation: string,
  error: PostgrestError | AuthError,
  data: unknown = null,
  status?: number
): never {
  const failure = isPostgrestError(error) ? fromPostgrestError(error) : fromAuthError(error);
  if (status !== undefined) {
    failure.status = status;
  }
  logLifeOperation(operation, { ok: false, data, error: failure, status });
  throw new LifeOperationError(operation, failure, data);
}

export function formatLifeErrorForPanel(error: unknown, context?: Record<string, string>): string {
  const lines: string[] = [];

  if (error instanceof LifeOperationError) {
    lines.push(`Operation: ${error.operation}`);
    lines.push(`Message: ${error.failure.message}`);
    if (error.failure.code) lines.push(`Code: ${error.failure.code}`);
    if (error.failure.status !== undefined) lines.push(`Status: ${error.failure.status}`);
    if (error.failure.hint) lines.push(`Hint: ${error.failure.hint}`);
    if (error.failure.details) lines.push(`Details: ${error.failure.details}`);
    if (error.data !== null && error.data !== undefined) {
      lines.push(`Data: ${JSON.stringify(error.data)}`);
    }
  } else {
    const failure = toLifeSupabaseFailure(error);
    lines.push(`Message: ${failure.message}`);
    if (failure.code) lines.push(`Code: ${failure.code}`);
    if (failure.status !== undefined) lines.push(`Status: ${failure.status}`);
    if (failure.hint) lines.push(`Hint: ${failure.hint}`);
    if (failure.details) lines.push(`Details: ${failure.details}`);
  }

  if (context) {
    lines.push("");
    lines.push("Context:");
    for (const [key, value] of Object.entries(context)) {
      lines.push(`${key}: ${value}`);
    }
  }

  return lines.join("\n");
}
