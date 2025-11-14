export const LocationType = {
    MAIN: 'main',
    POI: 'poi',
    EVENTS: 'events'
} as const;

export type LocationType = typeof LocationType[keyof typeof LocationType];

export interface Location {
    id: string;
    name: string;
    description: string;
    type: LocationType;
    latitude: number;
    longitude: number;
    altitude?: number;
    color?: number;
    modelPath?: string;
    scale?: number;
    floor?: number;
    icon?: string;
}

export const CAMPUS_LOCATIONS: Location[] = [
    {
        id: 'main-1',
        name: 'Edificio Sabatini',
        description: 'Main administrative building',
        type: LocationType.MAIN,
        latitude: 40.333231,
        longitude: -3.765953,
        color: 0x0066cc,
        scale: 15
    },
    {
        id: 'main-2',
        name: 'Biblioteca',
        description: 'Central library',
        type: LocationType.MAIN,
        latitude: 40.332213,
        longitude: -3.766940,
        color: 0x0066cc,
        scale: 15
    },
    {
        id: 'poi-1',
        name: 'Auditorio',
        description: 'Main Hall',
        type: LocationType.POI,
        latitude: 40.332836,
        longitude: -3.764695,
        color: 0xff9900,
        icon: 'BOOK',
        scale: 10
    },
    {
        id: 'poi-2',
        name: 'Cafetería Sabatini',
        description: 'Second cafeteria building',
        type: LocationType.POI,
        latitude: 40.332121,
        longitude: -3.767444,
        color: 0xff9900,
        icon: 'CUP',
        scale: 10
    },
    {
        id: 'event-1',
        name: 'Using std::cpp',
        description: 'Main CPP event in Spain',
        type: LocationType.EVENTS,
        latitude: 40.332442,
        longitude: -3.764585,
        color: 0xff0066,
        icon: 'EVENT',
        scale: 12
    }
];

export function getLocationsByType(type: LocationType): Location[] {
    return CAMPUS_LOCATIONS.filter(loc => loc.type === type);
}

export function getLocationById(id: string): Location | undefined {
    return CAMPUS_LOCATIONS.find(loc => loc.id === id);
}

export function calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    const R = 6371e3;
    const phi1 = lat1 * Math.PI / 180;
    const phi2 = lat2 * Math.PI / 180;
    const deltaPhi = (lat2 - lat1) * Math.PI / 180;
    const deltaLambda = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(deltaPhi/2) * Math.sin(deltaPhi/2) +
        Math.cos(phi1) * Math.cos(phi2) *
        Math.sin(deltaLambda/2) * Math.sin(deltaLambda/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
}