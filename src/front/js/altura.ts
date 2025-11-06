export interface FloorEstimate {
    altitude: number | null;
    floor: number | null;
    accuracy: number | null;
}

export class AltitudeEstimator {
    private readonly floorHeight = 3.0;
    private readonly smoothSize = 5;
    private altitudeBuffer: number[] = [];
    private baseAltitude: number | null = null;
    private watchId: number | null = null;
    private onUpdate?: (data: FloorEstimate) => void;
    private latestEstimate: FloorEstimate = {
        altitude: null,
        floor: null,
        accuracy: null
    };

    constructor(onUpdate?: (data: FloorEstimate) => void) {
        this.onUpdate = onUpdate;
    }

    public start(): void {
        if (!('geolocation' in navigator)) {
            console.warn('Geolocation API not supported in this browser.');
            return;
        }

        this.watchId = navigator.geolocation.watchPosition(
            (pos) => {
                const { altitude, altitudeAccuracy } = pos.coords;
                if (altitude == null) return;

                if (this.baseAltitude == null) {
                    this.baseAltitude = altitude;
                }

                this.altitudeBuffer.push(altitude);
                if (this.altitudeBuffer.length > this.smoothSize) {
                    this.altitudeBuffer.shift();
                }

                const smoothedAltitude =
                    this.altitudeBuffer.reduce((a, b) => a + b, 0) / this.altitudeBuffer.length;
                const relativeAltitude = smoothedAltitude - (this.baseAltitude ?? 0);
                const floor = Math.round(relativeAltitude / this.floorHeight);

                this.latestEstimate = {
                    altitude: relativeAltitude,
                    floor,
                    accuracy: altitudeAccuracy ?? null,
                };

                if (this.onUpdate) {
                    this.onUpdate(this.latestEstimate);
                }
            },
            (err) => console.error('Geolocation error:', err.message),
            { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 }
        );
    }

    public stop(): void {
        if (this.watchId != null) {
            navigator.geolocation.clearWatch(this.watchId);
        }
        this.watchId = null;
    }

    public getAltitude(): FloorEstimate {
        return this.latestEstimate;
    }
}