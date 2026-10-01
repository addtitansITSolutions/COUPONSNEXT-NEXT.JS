// type ErrorLogContext = {
//   requestId: string;
//   method: string;
//   path: string;
//   statusCode: number;
//   code: string;
//   error: unknown;
// };

// export function logApiError({
//   requestId,
//   method,
//   path,
//   statusCode,
//   code,
//   error,
// }: ErrorLogContext) {
//   const isServerError = statusCode >= 500;

//   // Avoid logging routine client errors unnecessarily.
//   if (!isServerError) {
//     return;
//   }

//   const errorDetails =
//     error instanceof Error
//       ? {
//           name: error.name,
//           message: error.message,
//           stack: error.stack,
//         }
//       : {
//           message: String(error),
//         };

//   console.error(
//     JSON.stringify({
//       level: "error",
//       timestamp: new Date().toISOString(),
//       requestId,
//       method,
//       path,
//       statusCode,
//       code,
//       error: errorDetails,
//     })
//   );
// }





type ErrorLogContext = {
  requestId: string;
  method: string;
  path: string;
  statusCode: number;
  code: string;
  error: unknown;
};

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

  // In production, only log server errors.
  // In development, also log client errors for debugging.
  if (!isServerError && !isDevelopment) {
    return;
  }

  const errorDetails =
    error instanceof Error
      ? {
          name: error.name,
          message: error.message,
          ...(isServerError ? { stack: error.stack } : {}),
        }
      : {
          message: String(error),
        };

  const logEntry = {
    timestamp: new Date().toISOString(),
    requestId,
    method,
    path,
    statusCode,
    code,
    error: errorDetails,
  };

  if (isServerError) {
    console.error(
      "[API ERROR]",
      JSON.stringify(logEntry)
    );
  } else {
    console.warn(
      "[API CLIENT ERROR]",
      JSON.stringify(logEntry)
    );
  }
}