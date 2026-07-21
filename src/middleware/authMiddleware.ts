import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

interface JwtPayload {
  id: number
}

function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const token = req.headers['authorization']

  if (!token) {
    res.status(401).json({ message: 'No token provided' })
    return
  }

  jwt.verify(token, process.env.JWT_SECRET as string, (err, decoded) => {
    if (err) {
      res.status(401).json({ message: 'Invalid token' })
      return
    }
    req.userId = (decoded as JwtPayload).id
    next()
  })
}

export default authMiddleware
