"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.demoController = void 0;
const availability_serializer_1 = require("../serializers/availability.serializer");
const member_serializer_1 = require("../serializers/member.serializer");
/**
 * Demo-only handlers to exercise serializers (M0-T05). Protected by auth + team + role.
 */
exports.demoController = {
    sampleMember: (req, res) => {
        const member = req.member;
        if (!member) {
            res.status(500).json({ error: 'Missing member context' });
            return;
        }
        const viewerRole = member.role;
        const tid = req.params.teamId;
        const teamId = Array.isArray(tid) ? tid[0] : tid;
        const row = {
            id: 'tm_demo',
            userId: 'u_demo',
            teamId: teamId ?? 'team_demo',
            role: 'player',
            onboardingState: 'active',
            jerseyNumber: '12',
            customRoleLabel: null,
            invitedAt: new Date(),
            joinedAt: new Date(),
            name: 'Demo Player',
            email: 'demo@example.com',
            phone: null,
            emergencyContactName: 'Parent',
            emergencyContactPhone: '+15550001',
            emergencyAllergyAlert: 'nuts',
            emergencyStaffNote: null,
            emergencyInfoUpdatedAt: new Date(),
        };
        res.json((0, member_serializer_1.serializeTeamMember)(viewerRole, row));
    },
    sampleAvailability: (req, res) => {
        const member = req.member;
        if (!member) {
            res.status(500).json({ error: 'Missing member context' });
            return;
        }
        const viewerRole = member.role;
        const row = {
            id: 'as_demo',
            teamMemberId: 'tm_demo',
            memberName: 'Demo Player',
            availabilityStatus: 'available',
            note: null,
            operationalStatus: 'medicallyRestricted',
            operationalStatusSetBy: 'tm_staff',
            submittedAt: new Date(),
            updatedAt: new Date(),
            selectionNotificationSentAt: null,
        };
        res.json((0, availability_serializer_1.serializeAvailabilitySubmission)(viewerRole, row));
    },
};
//# sourceMappingURL=demo.controller.js.map