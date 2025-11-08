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
        latitude: 40.3333,
        longitude: -3.7667,
        color: 0x0066cc,
        scale: 15
    },
    {
        id: 'main-2',
        name: 'Biblioteca',
        description: 'Central library',
        type: LocationType.MAIN,
        latitude: 40.3335,
        longitude: -3.7665,
        color: 0x0066cc,
        scale: 15
    },
    {
        id: 'poi-1',
        name: 'Cafeteria Principal',
        description: 'Main cafeteria',
        type: LocationType.POI,
        latitude: 40.3334,
        longitude: -3.7668,
        color: 0xff9900,
        icon: 'CAFE',
        scale: 10
    },
    {
        id: 'poi-2',
        name: 'Laboratorio de Informatica',
        description: 'Computer lab',
        type: LocationType.POI,
        latitude: 40.3336,
        longitude: -3.7666,
        color: 0xff9900,
        icon: 'LAB',
        scale: 10
    },
    {
        id: 'event-1',
        name: 'Feria de Empleo',
        description: 'Job fair - Today 10:00-18:00',
        type: LocationType.EVENTS,
        latitude: 40.3332,
        longitude: -3.7669,
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