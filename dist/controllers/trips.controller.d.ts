import type { Request, Response } from 'express';
export declare const tripsController: {
    cancelTrip: (req: Request, res: Response) => Promise<void>;
    getTrip: (req: Request, res: Response) => Promise<void>;
    patchItinerary: (req: Request, res: Response) => Promise<void>;
    getSquad: (req: Request, res: Response) => Promise<void>;
    patchSquad: (req: Request, res: Response) => Promise<void>;
    acknowledgeItinerary: (req: Request, res: Response) => Promise<void>;
    publish: (req: Request, res: Response) => Promise<void>;
    postpone: (req: Request, res: Response) => Promise<void>;
};
//# sourceMappingURL=trips.controller.d.ts.map