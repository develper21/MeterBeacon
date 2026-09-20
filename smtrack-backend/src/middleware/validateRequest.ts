import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { AppError } from './errorHandler';

export const validateRequest = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if ('body' in schema.shape || 'query' in schema.shape || 'params' in schema.shape) {
        await schema.parseAsync({
          body: req.body,
          query: req.query,
          params: req.params,
        });
      } else {
        req.body = await schema.parseAsync(req.body);
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessage = error.errors.map((e) => `${e.path.join('.') || 'field'}: ${e.message}`).join(', ');
        return next(new AppError(errorMessage, 400));
      }
      next(error);
    }
  };
};
