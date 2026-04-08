"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signAccessToken = signAccessToken;
exports.verifyAccessToken = verifyAccessToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function signAccessToken(env, payload) {
    const body = {
        sub: payload.userId,
        email: payload.email,
        typ: 'access',
    };
    return jsonwebtoken_1.default.sign(body, env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
}
function verifyAccessToken(env, token) {
    const decoded = jsonwebtoken_1.default.verify(token, env.JWT_ACCESS_SECRET);
    if (typeof decoded !== 'object' ||
        decoded === null ||
        !('typ' in decoded) ||
        decoded.typ !== 'access' ||
        !('sub' in decoded) ||
        typeof decoded.sub !== 'string') {
        throw new Error('Invalid access token');
    }
    const email = 'email' in decoded && (decoded.email === null || typeof decoded.email === 'string')
        ? decoded.email
        : null;
    return { sub: decoded.sub, email, typ: 'access' };
}
//# sourceMappingURL=jwt.js.map