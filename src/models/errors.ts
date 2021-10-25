
export enum RpcErrors {
  /** standard JSON-RPC error codes: */
  INTERNAL_SERVER_ERROR = -32603,
  INVALID_PARAMS = -32602,

  GENERIC__NOT_FOUND = -404,
}

/**
 * With accordance to JSON-RPC 2.0 Specification
 */
export class ErrorJsonRpc extends Error{
  constructor(
    public code: number = RpcErrors.INTERNAL_SERVER_ERROR,
    public message: string,
    public data: any = null,
    public statusCode = 500
  ) {
    super(`${code} ${message}`);
  }
}



export class ErrorJsonRpcNotFound extends ErrorJsonRpc{
  constructor(
    public code: number = RpcErrors.GENERIC__NOT_FOUND,
    public message: string = 'Resource not found',
    public data: any = null,
  ) {
    super(code, message, data, 404);
  }
}
