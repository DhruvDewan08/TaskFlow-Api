import { Request, Response, NextFunction } from 'express'
import { ZodSchema, ZodError } from 'zod'

type ValidationTarget = 'body' | 'query' | 'params'

export function validate(schema: ZodSchema, target: ValidationTarget = 'body') {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req[target])
      req[target] = parsed
      next()
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(400).json({
          message: 'Validation failed',
          errors: err.issues.map((issue) => ({
            path: issue.path.join('.'),
            message: issue.message,
          })),
        })
        return
      }
      next(err)
    }
  }
}
