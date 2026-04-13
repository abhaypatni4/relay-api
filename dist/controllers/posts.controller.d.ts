import type { Request, Response } from 'express';
export declare const postsController: {
    create: (req: Request, res: Response) => Promise<void>;
    seen: (req: Request, res: Response) => Promise<void>;
    list: (req: Request, res: Response) => Promise<void>;
    getById: (req: Request, res: Response) => Promise<void>;
    acknowledge: (req: Request, res: Response) => Promise<void>;
    nudge: (req: Request, res: Response) => Promise<void>;
    delete: (req: Request, res: Response) => Promise<void>;
};
//# sourceMappingURL=posts.controller.d.ts.map