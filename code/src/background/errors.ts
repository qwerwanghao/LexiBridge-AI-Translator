export class APIError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data?: unknown,
  ) {
    super(`API Error: ${status} ${statusText}`);
    this.name = 'APIError';
  }
}

export class TimeoutError extends Error {
  constructor(message = 'Request timed out') {
    super(message);
    this.name = 'TimeoutError';
  }
}

export class StorageError extends Error {
  constructor(
    message: string,
    public key?: string,
  ) {
    super(`Storage Error: ${message}`);
    this.name = 'StorageError';
  }
}
