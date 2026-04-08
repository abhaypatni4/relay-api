"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUsersRouter = createUsersRouter;
const express_1 = require("express");
const users_controller_1 = require("../controllers/users.controller");
const authenticate_1 = require("../middleware/authenticate");
function createUsersRouter(env) {
    const r = (0, express_1.Router)();
    const auth = (0, authenticate_1.authenticateMiddleware)(env);
    r.get('/me', auth, users_controller_1.usersController.getMe);
    r.patch('/me', auth, users_controller_1.usersController.patchMe);
    r.patch('/me/emergency-info', auth, users_controller_1.usersController.patchEmergencyInfo);
    r.post('/me/emergency-info/remind-later', auth, users_controller_1.usersController.deferEmergencyReminder);
    r.patch('/me/push-token', auth, users_controller_1.usersController.patchPushToken);
    r.get('/me/notification-preferences', auth, users_controller_1.usersController.getNotificationPreferences);
    r.patch('/me/notification-preferences', auth, users_controller_1.usersController.patchNotificationPreferences);
    r.delete('/me', auth, users_controller_1.usersController.deleteMe);
    return r;
}
//# sourceMappingURL=users.routes.js.map