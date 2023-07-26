export enum ERROR_TYPES {
  MISSING_API_KEYS = "MISSING_API_KEYS",
  API_NETWORK_ERROR = "API_NETWORK_ERROR",
  API_RESPONSE_ERROR = "API_RESPONSE_ERROR",
  LIB_PARSE_ERROR = "LIB_PARSE_ERROR",
}

export class ConnectorError extends Error {
  public type: ERROR_TYPES;
  public originalError?: Error;

  constructor(type: ERROR_TYPES, message?: string, originalError?: any) {
    super(message ?? type);
    this.type = type;
    this.originalError = originalError;
  }
}
