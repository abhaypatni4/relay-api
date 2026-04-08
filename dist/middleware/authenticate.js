"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateMiddleware = authenticateMiddleware;
const jwt_1 = require("../utils/jwt");
function authenticateMiddleware(env) {
    return (req, res, next) => {
        const header = req.headers.authorization;
        if (!header?.startsWith('Bearer ')) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const token = header.slice('Bearer '.length).trim();
        if (!token) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        try {
            const payload = (0, jwt_1.verifyAccessToken)(env, token);
            req.user = {
                userId: payload.sub,
                email: payload.email,
            };
            next();
        }
        catch {
            res.status(401).json({ error: 'Unauthorized' });
        }
    };
}
//# sourceMappingURL=authenticate.js.map