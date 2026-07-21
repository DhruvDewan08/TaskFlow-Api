// Extends the Express Request interface globally to include userId
// This is set by authMiddleware after JWT verification
declare global {
  namespace Express {
    interface Request {
      userId?: number
    }
  }
}

export {}
