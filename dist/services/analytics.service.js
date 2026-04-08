"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackServerEvent = trackServerEvent;
function trackServerEvent(eventName, properties) {
    // Thin wrapper for analytics vendor wiring (Segment/Amplitude/Mixpanel).
    // Kept intentionally minimal during MVP freeze.
    console.log('[server-analytics]', eventName, properties);
}
//# sourceMappingURL=analytics.service.js.map