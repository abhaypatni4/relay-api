"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerRoutes = registerRoutes;
const auth_routes_1 = require("./auth.routes");
const demo_routes_1 = require("./demo.routes");
const event_trips_routes_1 = require("./event-trips.routes");
const invitations_public_routes_1 = require("./invitations.public.routes");
const protected_routes_1 = require("./protected.routes");
const teams_routes_1 = require("./teams.routes");
const users_routes_1 = require("./users.routes");
const health_routes_1 = require("./health.routes");
function registerRoutes(app, env) {
    app.use('/health', health_routes_1.healthRouter);
    app.use('/auth', (0, auth_routes_1.createAuthRouter)(env));
    app.use('/invitations', (0, invitations_public_routes_1.createInvitationsPublicRouter)(env));
    app.use('/teams', (0, teams_routes_1.createTeamsRouter)(env));
    app.use('/events', (0, event_trips_routes_1.createEventTripsRouter)(env));
    app.use('/users', (0, users_routes_1.createUsersRouter)(env));
    if (process.env.NODE_ENV !== 'production') {
        app.use((0, demo_routes_1.createDemoRouter)(env));
    }
    app.use((0, protected_routes_1.createProtectedDemoRouter)(env));
}
//# sourceMappingURL=index.js.map