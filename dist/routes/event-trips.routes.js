"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEventTripsRouter = createEventTripsRouter;
const express_1 = require("express");
const availability_controller_1 = require("../controllers/availability.controller");
const predeparture_controller_1 = require("../controllers/predeparture.controller");
const trip_documents_controller_1 = require("../controllers/trip-documents.controller");
const trip_emergency_controller_1 = require("../controllers/trip-emergency.controller");
const trips_controller_1 = require("../controllers/trips.controller");
const authenticate_1 = require("../middleware/authenticate");
const requireEventTeamMember_1 = require("../middleware/requireEventTeamMember");
const requireRole_1 = require("../middleware/requireRole");
function createEventTripsRouter(env) {
    const r = (0, express_1.Router)();
    const auth = (0, authenticate_1.authenticateMiddleware)(env);
    const member = [auth, requireEventTeamMember_1.requireEventTeamMember];
    r.post('/:eventId/availability/open', ...member, (0, requireRole_1.requireRole)(['coordinator', 'coach']), availability_controller_1.availabilityController.open);
    r.get('/:eventId/availability', ...member, availability_controller_1.availabilityController.get);
    r.post('/:eventId/availability/submit', ...member, (0, requireRole_1.requireRole)(['player']), availability_controller_1.availabilityController.submit);
    r.patch('/:eventId/availability/:submissionId/operational', ...member, (0, requireRole_1.requireRole)(['coordinator', 'coach', 'staff']), availability_controller_1.availabilityController.patchOperational);
    r.post('/:eventId/availability/lock', ...member, (0, requireRole_1.requireRole)(['coordinator', 'coach']), availability_controller_1.availabilityController.lock);
    r.post('/:eventId/availability/notify', ...member, (0, requireRole_1.requireRole)(['coordinator', 'coach']), availability_controller_1.availabilityController.notify);
    r.post('/:eventId/cancel', ...member, (0, requireRole_1.requireRole)(['coordinator']), trips_controller_1.tripsController.cancelTrip);
    r.post('/:eventId/postpone', ...member, (0, requireRole_1.requireRole)(['coordinator']), trips_controller_1.tripsController.postpone);
    r.get('/:eventId/trip', ...member, trips_controller_1.tripsController.getTrip);
    r.patch('/:eventId/trip/itinerary', ...member, (0, requireRole_1.requireRole)(['coordinator']), trips_controller_1.tripsController.patchItinerary);
    r.post('/:eventId/trip/itinerary/acknowledge', ...member, (0, requireRole_1.requireRole)(['player']), trips_controller_1.tripsController.acknowledgeItinerary);
    r.get('/:eventId/trip/squad', ...member, trips_controller_1.tripsController.getSquad);
    r.patch('/:eventId/trip/squad', ...member, (0, requireRole_1.requireRole)(['coordinator']), trips_controller_1.tripsController.patchSquad);
    r.post('/:eventId/trip/publish', ...member, (0, requireRole_1.requireRole)(['coordinator']), trips_controller_1.tripsController.publish);
    r.get('/:eventId/trip/predeparture', ...member, (0, requireRole_1.requireRole)(['coordinator']), predeparture_controller_1.preDepartureController.get);
    r.patch('/:eventId/trip/predeparture', ...member, (0, requireRole_1.requireRole)(['coordinator']), predeparture_controller_1.preDepartureController.patch);
    r.get('/:eventId/trip/squad/:memberId/emergency', ...member, trip_emergency_controller_1.tripEmergencyController.getEmergencyInfo);
    // Document checklist
    r.get('/:eventId/trip/documents', ...member, trip_documents_controller_1.tripDocumentsController.list);
    r.post('/:eventId/trip/documents', ...member, (0, requireRole_1.requireRole)(['coordinator']), trip_documents_controller_1.tripDocumentsController.addItem);
    r.post('/:eventId/trip/documents/:itemId/confirm', ...member, trip_documents_controller_1.tripDocumentsController.confirm);
    r.delete('/:eventId/trip/documents/:itemId', ...member, (0, requireRole_1.requireRole)(['coordinator']), trip_documents_controller_1.tripDocumentsController.deleteItem);
    r.post('/:eventId/trip/documents/remind', ...member, (0, requireRole_1.requireRole)(['coordinator']), trip_documents_controller_1.tripDocumentsController.remind);
    return r;
}
//# sourceMappingURL=event-trips.routes.js.map