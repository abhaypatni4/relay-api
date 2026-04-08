import type { User } from '@prisma/client';
import type { Env } from '../config/env';
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresInSeconds: number;
}
export declare function registerUser(env: Env, input: {
    name: string;
    email?: string;
    phone?: string;
    password: string;
}): Promise<{
    user: User;
    tokens: AuthTokens;
}>;
export declare function loginUser(env: Env, input: {
    email?: string;
    phone?: string;
    password: string;
}): Promise<{
    user: User;
    tokens: AuthTokens;
}>;
export declare function refreshAccessToken(env: Env, rawRefreshToken: string): Promise<{
    accessToken: string;
    expiresInSeconds: number;
}>;
export declare function logoutWithRefreshToken(rawRefreshToken: string): Promise<void>;
//# sourceMappingURL=auth.service.d.ts.map