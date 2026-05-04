export function notFound(req, res, next) {
  res.status(404).json({ message: "Route not found" });
}

export function errorHandler(err, req, res, next) {
  console.error('🔴 ERROR:', err);
  console.error('Stack:', err.stack);
  res.status(500).json({
    message: err.message || "Server error",
    error: process.env.NODE_ENV === 'development' ? err.toString() : undefined
  });
}
