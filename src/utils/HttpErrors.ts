export class HTTPClientError extends Error {
  public statusCode: any;

  constructor(message: any) {
    if (message instanceof Error) {
      super(message.message);
      this.stack = message.stack;
    } else {
      if (message instanceof Object) {
        super(JSON.stringify(message));
      } else {
        super(message);
      }
      Error.captureStackTrace(this, this.constructor);
    }
    this.name = this.constructor.name;
  }
}

export class HTTP400Error extends HTTPClientError {
  constructor(message = "Bad Request") {
    super(message);
    this.statusCode = 400;
  }
}

export class HTTP401Error extends HTTPClientError {
  constructor(message = "Unauthorized") {
    super(message);
    this.statusCode = 401;
  }
}

export class HTTP403Error extends HTTPClientError {
  constructor(message = "Forbidden") {
    super(message);
    this.statusCode = 403;
  }
}

export class HTTP404Error extends HTTPClientError {
  constructor(message = "Record not found") {
    super(message);
    this.statusCode = 404;
  }
}

export class HTTP406Error extends HTTPClientError {
  constructor(message = "SyntaxError") {
    super(message);
    this.statusCode = 406;
  }
}

export class HTTP409Error extends HTTPClientError {
  constructor(message = "Conflict") {
    super(message);
    this.statusCode = 409;
  }
}
