"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUser = registerUser;
exports.loginUser = loginUser;
exports.refreshAccessToken = refreshAccessToken;
exports.logoutWithRefreshToken = logoutWithRefreshToken;
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma_1 = require("../db/prisma");
const jwt_1 = require("../utils/jwt");
const token_hash_1 = require("../utils/token-hash");
const BCRYPT_ROUNDS = 12;
const REFRESH_MS = 30 * 24 * 60 * 60 * 1000;
async function issueTokensForUser(env, user) {
    const rawRefresh = (0, token_hash_1.generateRefreshTokenRaw)();
    const tokenHash = (0, token_hash_1.hashToken)(rawRefresh);
    const expiresAt = new Date(Date.now() + REFRESH_MS);
    await prisma_1.prisma.refreshToken.create({
        data: {
            userId: user.id,
            tokenHash,
            expiresAt,
        },
    });
    return {
        accessToken: (0, jwt_1.signAccessToken)(env, { userId: user.id, email: user.email }),
        refreshToken: rawRefresh,
        expiresInSeconds: 15 * 60,
    };
}
async function registerUser(env, input) {
    const passwordHash = await bcrypt_1.default.hash(input.password, BCRYPT_ROUNDS);
    const emailRaw = input.email?.toLowerCase().trim();
    const phoneRaw = input.phone?.trim();
    const email = emailRaw && emailRaw.length > 0 ? emailRaw : null;
    const phone = phoneRaw && phoneRaw.length > 0 ? phoneRaw : null;
    const user = await prisma_1.prisma.user.create({
        data: {
            name: input.name.trim(),
            email,
            phone,
            passwordHash,
        },
    });
    const tokens = await issueTokensForUser(env, user);
    return { user, tokens };
}
async function loginUser(env, input) {
    const email = input.email?.toLowerCase().trim();
    const phone = input.phone?.trim();
    const user = await prisma_1.prisma.user.findFirst({
        where: {
            OR: [...(email ? [{ email }] : []), ...(phone ? [{ phone }] : [])],
        },
    });
    if (!user?.passwordHash) {
        throw new Error('Invalid credentials');
    }
    const ok = await bcrypt_1.default.compare(input.password, user.passwordHash);
    if (!ok) {
        throw new Error('Invalid credentials');
    }
    const tokens = await issueTokensForUser(env, user);
    return { user, tokens };
}
async function refreshAccessToken(env, rawRefreshToken) {
    const tokenHash = (0, token_hash_1.hashToken)(rawRefreshToken);
    const record = await prisma_1.prisma.refreshToken.findUnique({
        where: { tokenHash },
        include: { user: true },
    });
    if (!record || record.revokedAt || record.expiresAt < new Date()) {
        throw new Error('Invalid refresh token');
    }
    return {
        accessToken: (0, jwt_1.signAccessToken)(env, {
            userId: record.user.id,
            email: record.user.email,
        }),
        expiresInSeconds: 15 * 60,
    };
}
async function logoutWithRefreshToken(rawRefreshToken) {
    const tokenHash = (0, token_hash_1.hashToken)(rawRefreshToken);
    await prisma_1.prisma.refreshToken.updateMany({
        where: { tokenHash, revokedAt: null },
        data: { revokedAt: new Date() },
    });
}
//# sourceMappingURL=auth.service.js.map