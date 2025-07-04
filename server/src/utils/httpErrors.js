class HttpError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

class BadRequest extends HttpError {
  constructor(message = 'Bad Request') {
    super(400, message);
  }
}

class Unauthorized extends HttpError {
  constructor(message = 'Unauthorized') {
    super(401, message);
  }
}

class Forbidden extends HttpError {
  constructor(message = 'Forbidden') {
    super(403, message);
  }
}

class NotFound extends HttpError {
  constructor(message = 'Not Found') {
    super(404, message);
  }
}

class Conflict extends HttpError {
  constructor(message = 'Conflict') {
    super(409, message);
  }
}

module.exports = {
  HttpError,
  BadRequest,
  Unauthorized,
  Forbidden,
  NotFound,
  Conflict,
};
