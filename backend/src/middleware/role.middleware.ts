import { Request, Response, NextFunction } from "express";

export function roleGuard(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = (req as any).user?.role;

    if (!userRole) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    if (!roles.includes(userRole)) {
      return res.status(403).json({
        message: "Forbidden",
      });
    }

    next();
  };
}