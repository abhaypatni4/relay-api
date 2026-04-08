"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashToken = hashToken;
exports.generateRefreshTokenRaw = generateRefreshTokenRaw;
const node_crypto_1 = require("node:crypto");
function hashToken(raw) {
    return (0, node_crypto_1.createHash)('sha256').update(raw).digest('hex');
}
function generateRefreshTokenRaw() {
    return (0, node_crypto_1.randomBytes)(48).toString('base64url');
}
//# sourceMappingURL=token-hash.js.map