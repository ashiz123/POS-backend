export class HttpBaseError extends Error {
  statusCode: number;
  expose: boolean;
  type: string;
  location: string;
  code: string;

  constructor(
    message: string,
    location: string,
    statusCode: number,
    code: string,
    expose: boolean = false,
  ) {
    super(message);
    this.location = location;
    this.statusCode = statusCode;
    this.expose = expose;
    this.code = code;
    this.type = "baseError"; //safer approach than just checking instance only

    Object.setPrototypeOf(this, new.target.prototype);
  }
}
