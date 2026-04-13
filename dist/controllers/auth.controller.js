"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAuthController = createAuthController;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const auth_service_1 = require("../services/auth.service");
const registerBody = zod_1.z
    .object({
    name: zod_1.z.string().trim().min(1),
    email: zod_1.z.email().optional(),
    phone: zod_1.z.string().trim().min(8).optional(),
    password: zod_1.z.string().min(8),
    invitationToken: zod_1.z.string().trim().optional(),
})
    .refine((d) => Boolean(d.email ?? d.phone), { message: 'email or phone required' });
const loginBody = zod_1.z
    .object({
    email: zod_1.z.email().optional(),
    phone: zod_1.z.string().trim().optional(),
    password: zod_1.z.string().min(1),
})
    .refine((d) => Boolean(d.email ?? d.phone), { message: 'email or phone required' });
const refreshBody = zod_1.z.object({
    refreshToken: zod_1.z.string().min(1),
});
function createAuthController(env) {
    return {
        register: async (req, res) => {
            console.log('[register] hit', req.body);
            try {
                const parsed = registerBody.safeParse(req.body);
                if (!parsed.success) {
                    res.status(400).json({ error: 'Invalid body' });
                    return;
                }
                const { invitationToken: _t, ...registerInput } = parsed.data;
                void _t;
                const { user, tokens } = await (0, auth_service_1.registerUser)(env, registerInput);
                res.status(201).json({
                    user: { id: user.id, name: user.name, email: user.email, phone: user.phone },
                    accessToken: tokens.accessToken,
                    refreshToken: tokens.refreshToken,
                    expiresIn: tokens.expiresInSeconds,
                });
            }
            catch (e) {
                const message = e instanceof Error ? e.message : String(e);
                const stack = e instanceof Error ? e.stack : undefined;
                console.log('[register] error', message, stack);
                if (e instanceof client_1.Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
                    const target = e.meta?.target?.join(',') ?? '';
                    if (target.includes('email')) {
                        res.status(409).json({ error: 'Email already registered' });
                        return;
                    }
                    if (target.includes('phone')) {
                        res.status(409).json({ error: 'Phone number already registered' });
                        return;
                    }
                    res.status(409).json({ error: 'Email or phone already registered' });
                    return;
                }
                if (env.NODE_ENV === 'development') {
                    res.status(400).json({ error: message });
                    return;
                }
                res.status(400).json({ error: 'Registration failed' });
            }
        },
        login: async (req, res) => {
            const parsed = loginBody.safeParse(req.body);
            if (!parsed.success) {
                res.status(400).json({ error: 'Invalid body' });
                return;
            }
            try {
                const { user, tokens } = await (0, auth_service_1.loginUser)(env, parsed.data);
                res.status(200).json({
                    user: { id: user.id, name: user.name, email: user.email, phone: user.phone },
                    accessToken: tokens.accessToken,
                    refreshToken: tokens.refreshToken,
                    expiresIn: tokens.expiresInSeconds,
                });
            }
            catch {
                res.status(401).json({ error: 'Invalid credentials' });
            }
        },
        refresh: async (req, res) => {
            const parsed = refreshBody.safeParse(req.body);
            if (!parsed.success) {
                res.status(400).json({ error: 'Invalid body' });
                return;
            }
            try {
                const out = await (0, auth_service_1.refreshAccessToken)(env, parsed.data.refreshToken);
                res.status(200).json({
                    accessToken: out.accessToken,
                    expiresIn: out.expiresInSeconds,
                });
            }
            catch {
                res.status(401).json({ error: 'Invalid refresh token' });
            }
        },
        logout: async (req, res) => {
            const parsed = refreshBody.safeParse(req.body);
            if (!parsed.success) {
                res.status(400).json({ error: 'Invalid body' });
                return;
            }
            await (0, auth_service_1.logoutWithRefreshToken)(parsed.data.refreshToken);
            res.status(204).send();
        },
    };
}
//# sourceMappingURL=auth.controller.js.map