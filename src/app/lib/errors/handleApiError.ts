import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";
import { JsonWebTokenError, TokenExpiredError, } from "jsonwebtoken";
import { ApiError } from "./ApiError";
import { logApiError } from "./errorLogger";

type ErrorResponse = {
  success: false;
  message: string;
  code: string;
  statusCode: number;
  requestId: string;
  details?: unknown;
};

function createErrorResponse(
  statusCode: number,
  message: string,
  code: string,
  requestId: string,
  details?: unknown
) {
  const body: ErrorResponse = {
    success: false,
    message,
    code,
    statusCode,
    requestId,
    ...(details !== undefined ? { details } : {}),
  };

  return NextResponse.json(body, {
    status: statusCode,
    headers: {
      "Cache-Control": "no-store",
      "X-Request-ID": requestId,
    },
  });
}

function isDuplicateKeyError(
  error: unknown
): error is { code: number; keyValue?: Record<string, unknown> } {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 11000
  );
}

function getDuplicateKeyMessage(
  error: { keyValue?: Record<string, unknown> }
) {
  const field = Object.keys(error.keyValue ?? {})[0];

  const messages: Record<string, string> = {
    email: "An account with this email already exists",
    slug: "This slug is already in use",
  };

  if (field && messages[field]) {
    return messages[field];
  }

  return "A record with these details already exists";
}

export function handleApiError(
  error: unknown,
  request?: Request
) {
  const requestId =
    request?.headers.get("x-request-id") || crypto.randomUUID();

  const method = request?.method || "UNKNOWN";
  const path = request
    ? new URL(request.url).pathname
    : "UNKNOWN";

  let statusCode = 500;
  let message = "Internal server error";
  let code = "INTERNAL_SERVER_ERROR";
  let details: unknown;

  if (error instanceof ApiError) {
    statusCode = error.statusCode;
    message = error.message;
    code = error.code;
    details = error.details;
  } else if (error instanceof z.ZodError) {
    statusCode = 400;
    message = "Request validation failed";
    code = "VALIDATION_ERROR";
    details = z.flattenError(error).fieldErrors;
  } else if (error instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = "Database validation failed";
    code = "DATABASE_VALIDATION_ERROR";
    details = Object.fromEntries(
      Object.entries(error.errors).map(([field, fieldError]) => [
        field,
        fieldError.message,
      ])
    );
  } else if (error instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = "Invalid value provided";
    code = "INVALID_DATABASE_VALUE";
  } else if (isDuplicateKeyError(error)) {
    statusCode = 409;
    message = getDuplicateKeyMessage(error);
    code = "DUPLICATE_RESOURCE";
  } else if (
    error instanceof TokenExpiredError ||
    error instanceof JsonWebTokenError
  ) {
    statusCode = 401;
    message = "Your session is invalid or has expired";
    code = "INVALID_TOKEN";
  } else if (error instanceof SyntaxError) {
    // Use this for malformed JSON parsed from a request body.
    statusCode = 400;
    message = "Invalid JSON in request body";
    code = "INVALID_JSON";
  }

  logApiError({
    requestId,
    method,
    path,
    statusCode,
    code,
    error,
  });

  return createErrorResponse(
    statusCode,
    message,
    code,
    requestId,
    details
  );
}