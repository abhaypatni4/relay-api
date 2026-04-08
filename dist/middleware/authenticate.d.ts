import type { NextFunction, Request, Response } from 'express';
import type { Env } from '../config/env';
export declare function authenticateMiddleware(env: Env): (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=authenticate.d.ts.map