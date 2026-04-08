import type { Env } from '../config/env';
export declare function startJobInfrastructure(env: Env): void;
export declare function stopJobInfrastructure(): void;
export declare function enqueueTestJob(): Promise<void>;
export declare function enqueueEmergencyInfoReminder(userId: string): Promise<void>;
//# sourceMappingURL=index.d.ts.map