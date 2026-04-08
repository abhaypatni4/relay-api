import type { NextFunction, Request, Response } from 'express';
/**
 * Requires :teamId route param. Attaches active team membership only (pending → 403).
 */
export declare function requireTeamMember(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=requireTeamMember.d.ts.map