import type { NextFunction, Request, Response } from 'express';
/**
 * Requires :eventId. Loads event and verifies active team membership on event.teamId.
 */
export declare function requireEventTeamMember(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=requireEventTeamMember.d.ts.map