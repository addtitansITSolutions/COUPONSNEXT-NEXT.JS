type ApiErrorResponse = {
  message?: string;
  details?: Record<string, string[]>;
};

export function getApiErrorMessageOnUi( data: ApiErrorResponse, fallbackMessage: string ): string {
  if (data.details && typeof data.details === "object") {
    const validationMessages = Object.values(data.details)
      .flat()
      .filter(
        (message): message is string =>
          typeof message === "string" && message.trim().length > 0
      );

    if (validationMessages.length > 0) {
      return validationMessages.join("\n");
    }
  }

  return data.message || fallbackMessage;
}