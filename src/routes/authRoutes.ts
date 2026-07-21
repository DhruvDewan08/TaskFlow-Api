import express, { Request, Response, NextFunction } from 'express'
import { validate } from '../middleware/validate.js'
import { registerSchema, loginSchema, refreshSchema } from '../schemas/authSchemas.js'
import {
  registerUser,
  loginUser,
  refreshTokens,
  logoutUser,
} from '../services/authService.js'

const router = express.Router()

function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next)
  }
}

router.post(
  '/register',
  validate(registerSchema),
  asyncHandler(async (req, res) => {
    const tokens = await registerUser(req.body)
    res.status(201).json(tokens)
  }),
)

router.post(
  '/login',
  validate(loginSchema),
  asyncHandler(async (req, res) => {
    const tokens = await loginUser(req.body)
    res.json(tokens)
  }),
)

router.post(
  '/refresh',
  validate(refreshSchema),
  asyncHandler(async (req, res) => {
    const tokens = await refreshTokens(req.body.refreshToken)
    res.json(tokens)
  }),
)

router.post(
  '/logout',
  validate(refreshSchema),
  asyncHandler(async (req, res) => {
    await logoutUser(req.body.refreshToken)
    res.json({ message: 'Logged out successfully' })
  }),
)

export default router
