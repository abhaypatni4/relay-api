"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = requireRole;
function requireRole(allowed) {
    return (req, res, next) => {
        if (!req.member) {
            res.status(500).json({ error: 'Member context missing' });
            return;
        }
        if (!allowed.includes(req.member.role)) {
            res.status(403).json({ error: 'Forbidden' });
            return;
        }
        next();
    };
}
//# sourceMappingURL=requireRole.js.map