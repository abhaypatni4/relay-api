"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.availabilityController = void 0;
const zod_1 = require("zod");
const availability_serializer_1 = require("../serializers/availability.serializer");
const availability_service_1 = require("../services/availability.service");
const analytics_service_1 = require("../services/analytics.service");
const prisma_1 = require("../db/prisma");
const submitBody = zod_1.z.object({
    availabilityStatus: zod_1.z.enum(['available', 'limited', 'unavailable']),
    note: zod_1.z.string().max(120).optional().nullable(),
});
const operationalBody = zod_1.z.object({
    operationalStatus: zod_1.z.enum([
        'selected',
        'notSelected',
        'traveling',
        'medicallyRestricted',
        'unassigned',
    ]),
});
exports.availabilityController = {
    open: async (req, res) => {
        if (!req.member || !req.eventRow) {
            res.status(500).json({ error: 'Missing context' });
            return;
        }
        const eventId = req.eventRow.id;
        const out = await (0, availability_service_1.openAvailabilityWindow)(eventId, req.member.id, req.eventRow.name);
        if (!out.ok) {
            if (out.code === 'EVENT_NOT_FOUND') {
                res.status(404).json({ error: 'Not found' });
                return;
            }
            res.status(409).json({ error: 'Availability window already open for this event' });
            return;
        }
        res.status(201).json({ windowId: out.windowId });
    },
    get: async (req, res) => {
        if (!req.member || !req.eventRow) {
            res.status(500).json({ error: 'Missing context' });
            return;
        }
        const eventId = req.eventRow.id;
        const member = req.member;
        const role = member.role;
        const window = await prisma_1.prisma.availabilityWindow.findUnique({ where: { eventId } });
        if (!window) {
            res.json({ window: null, submissions: [] });
            return;
        }
        const rows = await (0, availability_service_1.loadSubmissionsForWindow)(window.id);
        let filtered = rows;
        if (role === 'player' || role === 'staff') {
            filtered = rows.filter((r) => r.teamMemberId === member.id);
        }
        const selectionNotificationsSent = Boolean(window.selectionNotificationsSentAt);
        const submissions = filtered.map((r) => {
            const sr = (0, availability_service_1.toSubmissionRow)(r);
            return (0, availability_serializer_1.serializeAvailabilitySubmission)(role, {
                id: sr.id,
                teamMemberId: sr.teamMemberId,
                memberName: sr.memberName,
                memberRole: sr.memberRole,
                availabilityStatus: sr.availabilityStatus,
                note: sr.note,
                operationalStatus: sr.operationalStatus,
                operationalStatusSetBy: sr.operationalStatusSetBy,
                submittedAt: sr.submittedAt,
                updatedAt: sr.updatedAt,
                selectionNotificationSentAt: sr.selectionNotificationSentAt,
            }, { selectionNotificationsSent });
        });
        res.json({
            window: (0, availability_serializer_1.serializeAvailabilityWindow)(window),
            submissions,
        });
    },
    submit: async (req, res) => {
        if (!req.member || !req.eventRow) {
            res.status(500).json({ error: 'Missing context' });
            return;
        }
        const parsed = submitBody.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ error: 'Invalid body' });
            return;
        }
        const note = parsed.data.note?.trim() ? parsed.data.note.trim() : null;
        const out = await (0, availability_service_1.submitAvailability)(req.eventRow.id, req.member.id, {
            availabilityStatus: parsed.data.availabilityStatus,
            note,
        });
        if (!out.ok) {
            if (out.code === 'NO_WINDOW') {
                res.status(404).json({ error: 'Not found' });
                return;
            }
            if (out.code === 'LOCKED') {
                res.status(400).json({ error: 'Availability is now locked. Your response was not saved.' });
                return;
            }
            res.status(403).json({ error: 'Forbidden' });
            return;
        }
        res.status(200).json({ ok: true });
    },
    patchOperational: async (req, res) => {
        if (!req.member || !req.eventRow) {
            res.status(500).json({ error: 'Missing context' });
            return;
        }
        const submissionIdRaw = req.params.submissionId;
        const submissionId = Array.isArray(submissionIdRaw) ? submissionIdRaw[0] : submissionIdRaw;
        if (!submissionId) {
            res.status(400).json({ error: 'submissionId required' });
            return;
        }
        const parsed = operationalBody.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ error: 'Invalid body' });
            return;
        }
        const out = await (0, availability_service_1.patchOperationalStatus)(req.eventRow.id, submissionId, req.member.role, req.member.id, parsed.data.operationalStatus);
        if (!out.ok) {
            if (out.code === 'NOT_FOUND') {
                res.status(404).json({ error: 'Not found' });
                return;
            }
            res.status(403).json({ error: 'Forbidden' });
            return;
        }
        res.status(200).json({ ok: true });
    },
    lock: async (req, res) => {
        if (!req.eventRow) {
            res.status(500).json({ error: 'Missing context' });
            return;
        }
        const out = await (0, availability_service_1.lockAvailabilityWindow)(req.eventRow.id, req.eventRow.name);
        if (!out.ok) {
            res.status(404).json({ error: 'Not found' });
            return;
        }
        res.status(200).json({ ok: true });
    },
    notify: async (req, res) => {
        if (!req.eventRow) {
            res.status(500).json({ error: 'Missing context' });
            return;
        }
        const counts = await (0, availability_service_1.sendSelectionNotifications)(req.eventRow.id, req.eventRow.name);
        (0, analytics_service_1.trackServerEvent)('selection_notifications_sent', {
            selectedCount: counts.selected,
            notSelectedCount: counts.notSelected,
            teamId: req.eventRow.teamId,
        });
        res.status(200).json(counts);
    },
};
//# sourceMappingURL=availability.controller.js.map