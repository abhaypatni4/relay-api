"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDemoRouter = createDemoRouter;
const express_1 = require("express");
const demo_controller_1 = require("../controllers/demo.controller");
const authenticate_1 = require("../middleware/authenticate");
const requireTeamMember_1 = require("../middleware/requireTeamMember");
function createDemoRouter(env) {
    const r = (0, express_1.Router)();
    const auth = (0, authenticate_1.authenticateMiddleware)(env);
    r.get('/teams/:teamId/demo/member', auth, requireTeamMember_1.requireTeamMember, demo_controller_1.demoController.sampleMember);
    r.get('/teams/:teamId/demo/availability', auth, requireTeamMember_1.requireTeamMember, demo_controller_1.demoController.sampleAvailability);
    return r;
}
//# sourceMappingURL=demo.routes.js.map