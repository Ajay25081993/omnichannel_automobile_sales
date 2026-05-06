export function errorHandler(err, _req, res, _next) {
  console.error(err)
  let status = err.status || 500
  if (err.name === 'ValidationError' || err.name === 'CastError') {
    status = 400
  }
  const message =
    status === 500 && process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message || 'Something went wrong'
  res.status(status).json({
    error: message,
    ...(err.details ? { details: err.details } : {}),
  })
}
