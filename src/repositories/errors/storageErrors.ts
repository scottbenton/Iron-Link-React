export enum StorageErrorCodes {
  NotFound = "NOT_FOUND",
  PermissionDenied = "PERMISSION_DENIED",
  Unauthenticated = "UNAUTHENTICATED",
  FileFailedToUpload = "FILE_FAILED_TO_UPLOAD",
  Unknown = "UNKNOWN",
}

export class StorageError extends Error {
  code: StorageErrorCodes;
  originalMessage?: string;

  constructor(
    message: string,
    code: StorageErrorCodes,
    originalMessage?: string,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.originalMessage = originalMessage;
  }
}

export class NotFoundError extends StorageError {
  constructor(message: string, originalMessage?: string) {
    super(message, StorageErrorCodes.NotFound, originalMessage);
  }
}

export class PermissionDeniedError extends StorageError {
  constructor(message: string, originalMessage?: string) {
    super(message, StorageErrorCodes.PermissionDenied, originalMessage);
  }
}

export class UnauthenticatedError extends StorageError {
  constructor(message: string, originalMessage?: string) {
    super(message, StorageErrorCodes.Unauthenticated, originalMessage);
  }
}

export class FileFailedToUploadError extends StorageError {
  constructor(message: string, originalMessage?: string) {
    super(message, StorageErrorCodes.FileFailedToUpload, originalMessage);
  }
}

export class UnknownError extends StorageError {
  constructor(message: string, originalMessage?: string) {
    super(message, StorageErrorCodes.Unknown, originalMessage);
  }
}

export function convertUnknownErrorToStorageError(
  error: unknown,
  message: string,
): StorageError {
  if (error instanceof Error) {
    return new UnknownError(message, error.message);
  } else {
    return new UnknownError(message);
  }
}
