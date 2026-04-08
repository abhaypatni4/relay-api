"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tripDocumentsController = void 0;
const zod_1 = require("zod");
const trip_documents_service_1 = require("../services/trip-documents.service");
const addBody = zod_1.z
    .object({
    name: zod_1.z.string().trim().min(1),
    applicability: zod_1.z.enum(['allPlayers', 'travelingSquad', 'specific']),
    specificMemberIds: zod_1.z.array(zod_1.z.string().trim().min(1)).optional(),
})
    .strict();
exports.tripDocumentsController = {
    addItem: async (req, res) => {
        if (!req.member || !req.eventRow) {
            res.status(500).json({ error: 'Missing context' });
            return;
        }
        if (req.eventRow.type !== 'trip') {
            res.status(400).json({ error: 'Not a trip event' });
            return;
        }
        const parsed = addBody.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ error: 'Invalid body' });
            return;
        }
        const applicability = parsed.data.applicability;
        const specificMemberIds = applicability === 'specific' ? parsed.data.specificMemberIds ?? [] : [];
        if (applicability === 'specific' && specificMemberIds.length === 0) {
            res.status(400).json({ error: 'specificMemberIds required for applicability=specific' });
            return;
        }
        const out = await (0, trip_documents_service_1.addChecklistItem)(req.eventRow.id, req.member.id, {
            name: parsed.data.name,
            applicability,
            specificMemberIds,
        });
        if (!out.ok) {
            if (out.code === 'NOT_FOUND') {
                res.status(404).json({ error: 'Not found' });
                return;
            }
            res.status(403).json({ error: 'Forbidden' });
            return;
        }
        res.status(201).json({ itemId: out.itemId });
    },
    list: async (req, res) => {
        if (!req.member || !req.eventRow) {
            res.status(500).json({ error: 'Missing context' });
            return;
        }
        if (req.eventRow.type !== 'trip') {
            res.status(400).json({ error: 'Not a trip event' });
            return;
        }
        const out = await (0, trip_documents_service_1.listChecklistItems)(req.eventRow.id, req.member);
        if (!out.ok) {
            res.status(404).json({ error: 'Not found' });
            return;
        }
        res.status(200).json(out.body);
    },
    confirm: async (req, res) => {
        if (!req.member || !req.eventRow) {
            res.status(500).json({ error: 'Missing context' });
            return;
        }
        const raw = req.params.itemId;
        const itemId = Array.isArray(raw) ? raw[0] : raw;
        if (!itemId) {
            res.status(400).json({ error: 'itemId required' });
            return;
        }
        const out = await (0, trip_documents_service_1.confirmChecklistItem)(req.eventRow.id, itemId, req.member.id);
        if (!out.ok) {
            if (out.code === 'NOT_FOUND') {
                res.status(404).json({ error: 'Not found' });
                return;
            }
            if (out.code === 'NOT_APPLICABLE') {
                res.status(400).json({ error: 'You are not applicable for this item' });
                return;
            }
            res.status(403).json({ error: 'Forbidden' });
            return;
        }
        res.status(200).json({ ok: true });
    },
    deleteItem: async (req, res) => {
        if (!req.member || !req.eventRow) {
            res.status(500).json({ error: 'Missing context' });
            return;
        }
        const raw = req.params.itemId;
        const itemId = Array.isArray(raw) ? raw[0] : raw;
        if (!itemId) {
            res.status(400).json({ error: 'itemId required' });
            return;
        }
        const out = await (0, trip_documents_service_1.deleteChecklistItem)(req.eventRow.id, req.member.role, itemId);
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
    remind: async (req, res) => {
        if (!req.member || !req.eventRow) {
            res.status(500).json({ error: 'Missing context' });
            return;
        }
        if (req.member.role !== 'coordinator') {
            res.status(403).json({ error: 'Forbidden' });
            return;
        }
        const out = await (0, trip_documents_service_1.remindOutstandingMembers)(req.eventRow.id, req.eventRow.name);
        if (!out.ok) {
            res.status(404).json({ error: 'Not found' });
            return;
        }
        res.status(200).json({ remindedCount: out.remindedCount });
    },
};
//# sourceMappingURL=trip-documents.controller.js.map