"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInvitationsPublicRouter = createInvitationsPublicRouter;
const express_1 = require("express");
const invitations_controller_1 = require("../controllers/invitations.controller");
const authenticate_1 = require("../middleware/authenticate");
function createInvitationsPublicRouter(env) {
    const r = (0, express_1.Router)();
    const auth = (0, authenticate_1.authenticateMiddleware)(env);
    r.post('/:token/accept', auth, invitations_controller_1.invitationsController.accept);
    r.get('/:token', invitations_controller_1.invitationsController.validatePublic);
    return r;
}
//# sourceMappingURL=invitations.public.routes.js.map