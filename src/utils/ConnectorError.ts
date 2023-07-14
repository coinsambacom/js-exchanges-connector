export enum ERROR_TYPES {
  API_NETWORK_ERROR = "api network error",
  API_RESPONSE_ERROR = "api response error",
  LIB_PARSE_ERROR = "lib parse error",
}

export class ConnectorError extends Error {
  public type: ERROR_TYPES;
  public originalError?: any;

  constructor(type: ERROR_TYPES, message?: string, originalError?: any) {
    super(message);
    this.type = type;
    this.originalError = originalError;
  }
}
