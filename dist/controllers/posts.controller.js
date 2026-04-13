"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postsController = void 0;
const zod_1 = require("zod");
const post_serializer_1 = require("../serializers/post.serializer");
const analytics_service_1 = require("../services/analytics.service");
const posts_service_1 = require("../services/posts.service");
const createBody = zod_1.z.object({
    type: zod_1.z.enum(['scheduleUpdate', 'travelInfo', 'generalAnnouncement', 'urgentAlert']),
    content: zod_1.z.string().max(500),
    recipientGroup: zod_1.z.enum(['fullTeam', 'travelingSquad', 'players', 'coaches', 'staff', 'coachingStaff', 'allStaff']),
    eventId: zod_1.z.string().optional().nullable(),
    isUrgent: zod_1.z.boolean().optional(),
    isDraft: zod_1.z.boolean().optional().default(false),
});
exports.postsController = {
    create: async (req, res) => {
        console.log('[posts controller] req.member:', req.member);
        console.log('[posts controller] teamId param:', req.params.teamId);
        if (!req.member) {
            res.status(500).json({ error: 'Missing context' });
            return;
        }
        const parsed = createBody.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ error: 'Invalid body' });
            return;
        }
        const role = req.member.role;
        if (!(role === 'coordinator' || role === 'coach')) {
            res.status(403).json({ error: 'Forbidden' });
            return;
        }
        try {
            const out = await (0, posts_service_1.createPost)(req.member.teamId, req.member.id, {
                type: parsed.data.type,
                content: parsed.data.content,
                recipientGroup: parsed.data.recipientGroup,
                eventId: parsed.data.eventId ?? null,
                isUrgent: parsed.data.isUrgent,
                isDraft: parsed.data.isDraft,
            });
            res.status(201).json({ postId: out.postId, recipientCount: out.recipientCount });
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : 'UNKNOWN';
            if (msg === 'NO_ACTIVE_TRIP') {
                res.status(400).json({ error: 'No active trip found for traveling squad targeting' });
                return;
            }
            if (msg === 'INVALID_CONTENT') {
                res.status(400).json({ error: 'Content is required and must be 500 characters or fewer' });
                return;
            }
            res.status(500).json({ error: 'Failed to create post' });
        }
    },
    seen: async (req, res) => {
        if (!req.member) {
            res.status(500).json({ error: 'Missing context' });
            return;
        }
        const raw = req.params.postId;
        const postId = Array.isArray(raw) ? raw[0] : raw;
        if (!postId) {
            res.status(400).json({ error: 'postId required' });
            return;
        }
        const out = await (0, posts_service_1.markPostSeen)(req.member.teamId, postId, req.member.id);
        if (out.kind === 'not_found') {
            res.status(404).json({ error: 'Not found' });
            return;
        }
        if (out.kind === 'forbidden') {
            res.status(403).json({ error: 'Forbidden' });
            return;
        }
        res.status(200).json({ ok: true });
    },
    list: async (req, res) => {
        if (!req.member) {
            res.status(500).json({ error: 'Missing context' });
            return;
        }
        const rows = (await (0, posts_service_1.listPostsForMember)(req.member.teamId, req.member));
        res.json({ posts: rows.map((p) => (0, post_serializer_1.serializePost)(p)) });
    },
    getById: async (req, res) => {
        if (!req.member) {
            res.status(500).json({ error: 'Missing context' });
            return;
        }
        const raw = req.params.postId;
        const postId = Array.isArray(raw) ? raw[0] : raw;
        if (!postId) {
            res.status(400).json({ error: 'postId required' });
            return;
        }
        const out = await (0, posts_service_1.getPostForMember)(req.member.teamId, postId, req.member);
        if (out.kind === 'not_found') {
            res.status(404).json({ error: 'Not found' });
            return;
        }
        if (out.kind === 'forbidden') {
            res.status(403).json({ error: 'Forbidden' });
            return;
        }
        res.json({ post: (0, post_serializer_1.serializePost)(out.post) });
    },
    acknowledge: async (req, res) => {
        if (!req.member) {
            res.status(500).json({ error: 'Missing context' });
            return;
        }
        const raw = req.params.postId;
        const postId = Array.isArray(raw) ? raw[0] : raw;
        if (!postId) {
            res.status(400).json({ error: 'postId required' });
            return;
        }
        const out = await (0, posts_service_1.acknowledgePost)(req.member.teamId, postId, req.member.id);
        if (out.kind === 'not_found') {
            res.status(404).json({ error: 'Not found' });
            return;
        }
        if (out.kind === 'forbidden') {
            res.status(403).json({ error: 'Forbidden' });
            return;
        }
        if (out.kind === 'not_required') {
            res.status(400).json({ error: 'Acknowledgment is not required for this post' });
            return;
        }
        res.status(200).json({ ok: true });
    },
    nudge: async (req, res) => {
        if (!req.member) {
            res.status(500).json({ error: 'Missing context' });
            return;
        }
        const raw = req.params.postId;
        const postId = Array.isArray(raw) ? raw[0] : raw;
        if (!postId) {
            res.status(400).json({ error: 'postId required' });
            return;
        }
        const out = await (0, posts_service_1.sendNudge)(req.member.teamId, postId, req.member.role);
        if (out.kind === 'not_found') {
            res.status(404).json({ error: 'Not found' });
            return;
        }
        if (out.kind === 'forbidden') {
            res.status(403).json({ error: 'Forbidden' });
            return;
        }
        if (out.kind === 'not_required') {
            res.status(400).json({ error: 'Nudges are only valid for acknowledgment-required posts' });
            return;
        }
        (0, analytics_service_1.trackServerEvent)('nudge_sent', {
            overdueCount: out.nudgedCount,
            teamId: req.member.teamId,
            postId,
        });
        res.status(200).json({ nudgedCount: out.nudgedCount });
    },
    delete: async (req, res) => {
        if (!req.member) {
            res.status(500).json({ error: 'Missing context' });
            return;
        }
        const raw = req.params.postId;
        const postId = Array.isArray(raw) ? raw[0] : raw;
        if (!postId) {
            res.status(400).json({ error: 'postId required' });
            return;
        }
        const out = await (0, posts_service_1.deletePost)(req.member.teamId, postId, req.member);
        if (out.kind === 'not_found') {
            res.status(404).json({ error: 'Not found' });
            return;
        }
        if (out.kind === 'forbidden') {
            res.status(403).json({ error: 'Forbidden' });
            return;
        }
        res.status(200).json({ ok: true, notified: out.notified });
    },
};
//# sourceMappingURL=posts.controller.js.map