// This middleware handles requests for routes that don't exist (404 Not Found)
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error); // Passes the error to the next middleware (errorHandler)
};

// This is the main error handling middleware. It catches all errors thrown in your application.
const errorHandler = (err, req, res, next) => {
  // Sometimes an error might come through with a 200 status code, this ensures it's at least a 500
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // Specific check for Mongoose's "CastError" (e.g., an invalid ObjectId)
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = 'Resource not found';
  }

  // Send a clean JSON response instead of an HTML error page
  res.status(statusCode).json({
    message: message,
    // In development mode, also send the stack trace for easier debugging
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

export { notFound, errorHandler };

