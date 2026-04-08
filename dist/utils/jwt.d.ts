import type { Env } from '../config/env';
export interface AccessTokenPayload {
    sub: string;
    email: string | null;
    typ: 'access';
}
export declare function signAccessToken(env: Env, payload: {
    userId: string;
    email: string | null;
}): string;
export declare function verifyAccessToken(env: Env, token: string): AccessTokenPayload;
//# sourceMappingURL=jwt.d.ts.map