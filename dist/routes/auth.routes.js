"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAuthRouter = createAuthRouter;
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
function createAuthRouter(env) {
    const r = (0, express_1.Router)();
    const c = (0, auth_controller_1.createAuthController)(env);
    r.post('/register', c.register);
    r.post('/login', c.login);
    r.post('/refresh', c.refresh);
    r.post('/logout', c.logout);
    return r;
}
//# sourceMappingURL=auth.routes.js.map