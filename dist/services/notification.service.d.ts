import type { Env } from '../config/env';
/**
 * Every push must include deepLink in `data` for mobile deep routing (docs).
 */
export interface PushNotificationPayload {
    title: string;
    body: string;
    data: {
        deepLink: string;
        [key: string]: string;
    };
}
export declare function canSendNotification(userId: string, notificationType: string): Promise<boolean>;
export declare function initFirebaseIfConfigured(env: Env): void;
export declare function sendToDevice(pushToken: string, notification: PushNotificationPayload): Promise<void>;
export declare function sendToMultiple(pushTokens: string[], notification: PushNotificationPayload): Promise<void>;
//# sourceMappingURL=notification.service.d.ts.map