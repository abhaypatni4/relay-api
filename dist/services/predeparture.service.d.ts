interface FixedItem {
    key: 'squadConfirmed' | 'documentsCollected' | 'itineraryAcknowledged' | 'emergencyInfoOnFile';
    label: string;
    currentCount: number;
    totalCount: number;
    isComplete: boolean;
}
export declare function getPreDeparture(eventId: string): Promise<{
    fixedItems: FixedItem[];
    customItems: {
        id: string;
        label: string;
        isComplete: boolean;
    }[];
} | null>;
export declare function patchPreDepartureCustomItems(eventId: string, items: {
    id?: string;
    label: string;
    isComplete: boolean;
}[]): Promise<{
    ok: false;
    code: "NOT_FOUND";
} | {
    ok: false;
    code: "TOO_MANY";
} | {
    ok: true;
    code?: undefined;
}>;
export {};
//# sourceMappingURL=predeparture.service.d.ts.map