class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode; //this is to set the status code of the error
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error"; //this is to set the status of the error based on the status code
    this.isOperational = true; //this is to set the error as operational error
    Error.captureStackTrace(this, this.constructor); //this is to capture the stack trace of the error
  }
}
module.exports = AppError; //this is to export the appError class for use in other files