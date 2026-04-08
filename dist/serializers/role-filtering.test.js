"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const availability_serializer_1 = require("./availability.serializer");
const member_serializer_1 = require("./member.serializer");
(0, vitest_1.describe)('serializeTeamMember', () => {
    const row = {
        id: 'tm1',
        userId: 'u1',
        teamId: 't1',
        role: 'player',
        onboardingState: 'active',
        jerseyNumber: null,
        customRoleLabel: null,
        invitedAt: new Date(),
        joinedAt: new Date(),
        name: 'P',
        email: 'p@x.com',
        phone: null,
        emergencyContactName: 'E',
        emergencyContactPhone: '1',
        emergencyAllergyAlert: null,
        emergencyStaffNote: null,
        emergencyInfoUpdatedAt: new Date(),
    };
    (0, vitest_1.it)('omits emergencyInfo for player viewer', () => {
        const json = JSON.stringify((0, member_serializer_1.serializeTeamMember)('player', row));
        (0, vitest_1.expect)(json).not.toContain('emergencyInfo');
        (0, vitest_1.expect)(json).not.toContain('emergencyContactName');
    });
    (0, vitest_1.it)('includes emergencyInfo for coach viewer', () => {
        const out = (0, member_serializer_1.serializeTeamMember)('coach', row);
        (0, vitest_1.expect)(out.emergencyInfo).toBeDefined();
    });
});
(0, vitest_1.describe)('serializeAvailabilitySubmission', () => {
    const row = {
        id: 'a1',
        teamMemberId: 'tm1',
        memberName: 'P',
        availabilityStatus: 'available',
        note: null,
        operationalStatus: 'medicallyRestricted',
        operationalStatusSetBy: 'x',
        submittedAt: new Date(),
        updatedAt: new Date(),
        selectionNotificationSentAt: null,
    };
    (0, vitest_1.it)('omits operational fields and medicallyRestricted for player viewer', () => {
        const out = (0, availability_serializer_1.serializeAvailabilitySubmission)('player', row, { selectionNotificationsSent: true });
        const json = JSON.stringify(out);
        (0, vitest_1.expect)(json).not.toContain('operationalStatus');
        (0, vitest_1.expect)(json).not.toContain('operationalStatusSetBy');
        (0, vitest_1.expect)(json).not.toContain('medicallyRestricted');
        (0, vitest_1.expect)(out.selectionOutcome).toBe('notSelected');
    });
    (0, vitest_1.it)('includes operationalStatus for coach viewer', () => {
        const out = (0, availability_serializer_1.serializeAvailabilitySubmission)('coach', row);
        (0, vitest_1.expect)(out.operationalStatus).toBe('medicallyRestricted');
    });
});
//# sourceMappingURL=role-filtering.test.js.map