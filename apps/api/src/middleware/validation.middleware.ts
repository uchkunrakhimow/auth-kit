import type { Request, Response, NextFunction } from "express";
import type { ZodType } from "zod";
import type { core } from "zod";
import { ZodError } from "zod";

export const validate = (schema: ZodType) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        params: req.params,
        query: req.query,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: "Validation error",
          errors: error.issues.map((err: core.$ZodIssue) => ({
            path: err.path.join("."),
            message: err.message,
          })),
        });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  };
};
