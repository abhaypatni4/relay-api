import type { Role } from '@prisma/client';
import type { NextFunction, Request, Response } from 'express';
export declare function requireRole(allowed: readonly Role[]): (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=requireRole.d.ts.map