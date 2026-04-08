import type { Request, Response } from 'express';
export declare const usersController: {
    getMe: (req: Request, res: Response) => Promise<void>;
    patchMe: (req: Request, res: Response) => Promise<void>;
    patchEmergencyInfo: (req: Request, res: Response) => Promise<void>;
    deferEmergencyReminder: (req: Request, res: Response) => Promise<void>;
    patchPushToken: (req: Request, res: Response) => Promise<void>;
    getNotificationPreferences: (req: Request, res: Response) => Promise<void>;
    patchNotificationPreferences: (req: Request, res: Response) => Promise<void>;
    deleteMe: (req: Request, res: Response) => Promise<void>;
};
//# sourceMappingURL=users.controller.d.ts.map