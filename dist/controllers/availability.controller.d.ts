import type { Request, Response } from 'express';
export declare const availabilityController: {
    open: (req: Request, res: Response) => Promise<void>;
    get: (req: Request, res: Response) => Promise<void>;
    submit: (req: Request, res: Response) => Promise<void>;
    patchOperational: (req: Request, res: Response) => Promise<void>;
    lock: (req: Request, res: Response) => Promise<void>;
    notify: (req: Request, res: Response) => Promise<void>;
};
//# sourceMappingURL=availability.controller.d.ts.map