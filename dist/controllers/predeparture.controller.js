"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.preDepartureController = void 0;
const zod_1 = require("zod");
const predeparture_service_1 = require("../services/predeparture.service");
const patchBody = zod_1.z.object({
    items: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string().trim().min(1).optional(),
        label: zod_1.z.string().trim().min(1),
        isComplete: zod_1.z.boolean(),
    })),
});
exports.preDepartureController = {
    get: async (req, res) => {
        const raw = req.params.eventId;
        const eventId = Array.isArray(raw) ? raw[0] : raw;
        if (!eventId || !req.member) {
            res.status(400).json({ error: 'Invalid request' });
            return;
        }
        if (req.member.role !== 'coordinator') {
            res.status(403).json({ error: 'Forbidden' });
            return;
        }
        const out = await (0, predeparture_service_1.getPreDeparture)(eventId);
        if (!out) {
            res.status(404).json({ error: 'Not found' });
            return;
        }
        res.status(200).json(out);
    },
    patch: async (req, res) => {
        const raw = req.params.eventId;
        const eventId = Array.isArray(raw) ? raw[0] : raw;
        if (!eventId || !req.member) {
            res.status(400).json({ error: 'Invalid request' });
            return;
        }
        if (req.member.role !== 'coordinator') {
            res.status(403).json({ error: 'Forbidden' });
            return;
        }
        const parsed = patchBody.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ error: 'Invalid body' });
            return;
        }
        const out = await (0, predeparture_service_1.patchPreDepartureCustomItems)(eventId, parsed.data.items);
        if (!out.ok) {
            if (out.code === 'TOO_MANY') {
                res.status(400).json({ error: 'Maximum 5 custom items allowed' });
                return;
            }
            res.status(404).json({ error: 'Not found' });
            return;
        }
        res.status(200).json({ ok: true });
    },
};
//# sourceMappingURL=predeparture.controller.js.map