import { HttpBaseError } from "./httpBaseError.js";

export class BadRequestError extends HttpBaseError {
  constructor(
    message = "Bad Request",
    location = "unknown",
    code = "BAD_REQUEST",
  ) {
    super(message, location, 400, code, true);
    this.name = "BadRequestError";
  }
}

export class NotFoundError extends HttpBaseError {
  constructor(message = "Not Found", location = "unknown", code = "NOTFOUND") {
    super(message, location, 404, code, true);
    this.name = "NotFoundError";
  }
}

export class UnauthorizedError extends HttpBaseError {
  public code: string;
  constructor(
    message = "Unauthorized",
    code = "UNAUTHORIZED",
    location = "unknown",
  ) {
    super(message, location, 401, code, true);
    this.name = "UnauthorizedError";
    this.code = code;
  }
}

//I know you but not allowed.
export class ForbiddenError extends HttpBaseError {
  constructor(message = "Forbidden", location = "unknown", code = "FORBIDDEN") {
    super(message, location, 403, code, true);
    this.name = "ForbiddenError";
  }
}

export class ConflictError extends HttpBaseError {
  constructor(message = "Conflict", location = "unknown", code = "CONFLICT") {
    super(message, location, 409, code, true);
    this.name = "ConflictError";
  }
}

export class InternalServerError extends HttpBaseError {
  constructor(
    message = "Internal Server Error",
    location = "unknown",
    code = "INTERNAL_SERVER",
  ) {
    super(message, location, 500, code, false);
    this.name = "InternalServerError";
  }
}

export class DuplicateEntry extends HttpBaseError {
  constructor(
    message = "Duplicate data entry found",
    location = "unknown",
    code = "DUPLICATE_ENTRY",
  ) {
    super(message, location, 400, code, true);
    this.name = "DuplicateEntry";
  }
}

export class ExtraValidationError extends HttpBaseError {
  constructor(
    message = "Extra validation error from db",
    location = "unknown",
    code = "VALIDATION",
  ) {
    super(message, location, 400, code, true);
    this.name = "Extra validation error";
  }
}
