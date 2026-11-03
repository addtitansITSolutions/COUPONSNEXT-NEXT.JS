type ErrorLogContext = {
  requestId: string;
  method: string;
  path: string;
  statusCode: number;
  code: string;
  error: unknown;
};

function serializeError(error: unknown): Record<string, unknown> {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      cause: error.cause,
      ...(error instanceof AggregateError
        ? { errors: Array.from(error.errors, serializeError) }
        : {}),
    };
  }

  if (typeof error === "object" && error !== null) {
    return {
      ...error,
      message:
        "message" in error
          ? String(error.message)
          : "Unknown error object",
      raw: String(error),
    };
  }

  return {
    message: String(error),
    value: error,
  };
}

export function logApiError({
  requestId,
  method,
  path,
  statusCode,
  code,
  error,
}: ErrorLogContext) {
  const isServerError = statusCode >= 500;
  const isDevelopment = process.env.NODE_ENV !== "production";

  if (!isServerError && !isDevelopment) {
    return;
  }

  const logEntry = {
    level: isServerError ? "error" : "warning",
    timestamp: new Date().toISOString(),
    requestId,
    method,
    path,
    statusCode,
    code,
    error: serializeError(error),
  };

  const logMessage = JSON.stringify(logEntry);

  if (isServerError) {
    console.error("[API ERROR]", logMessage);
  } else {
    console.warn("[API CLIENT ERROR]", logMessage);
  }
}