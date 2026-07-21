import { Request, Response, NextFunction } from 'express'
import { verifyAccessToken } from '../lib/tokens.js'

function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization

  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ message: 'No token provided' })
    return
  }

  const token = header.slice(7)

  try {
    const payload = verifyAccessToken(token)
    req.userId = payload.sub
    next()
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' })
  }
}

export default authMiddleware
