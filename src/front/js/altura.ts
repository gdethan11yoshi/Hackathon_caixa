export interface FloorEstimate {
    altitude: number | null;
    floor: number | null;
    accuracy: number | null;
}

export class AltitudeEstimator {
    // Altura estimada de un piso (en metros). Ajustar si es necesario.
    private readonly floorHeight = 3.0;
    // Número de muestras para suavizar la lectura
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
            console.warn('La API de Geolocalización no está soportada.');
            return;
        }

        this.watchId = navigator.geolocation.watchPosition(
            (pos) => {
                const { altitude, altitudeAccuracy } = pos.coords;

                // Si el dispositivo no da altitud, no podemos hacer nada
                if (altitude == null) return;

                // Establecer la altitud base en la primera lectura válida
                if (this.baseAltitude == null) {
                    this.baseAltitude = altitude;
                }

                // Añadir al buffer de suavizado
                this.altitudeBuffer.push(altitude);
                if (this.altitudeBuffer.length > this.smoothSize) {
                    this.altitudeBuffer.shift(); // Eliminar la más antigua
                }

                // Calcular la media del buffer
                const smoothedAltitude =
                    this.altitudeBuffer.reduce((a, b) => a + b, 0) / this.altitudeBuffer.length;

                // Altitud relativa a la primera lectura
                const relativeAltitude = smoothedAltitude - (this.baseAltitude ?? 0);

                // Estimar el piso
                const floor = Math.round(relativeAltitude / this.floorHeight);

                this.latestEstimate = {
                    altitude: relativeAltitude,
                    floor,
                    accuracy: altitudeAccuracy ?? null,
                };

                // Enviar actualización
                if (this.onUpdate) {
                    this.onUpdate(this.latestEstimate);
                }
            },
            (err) => console.error('Error de Geolocalización:', err.message),
            {
                enableHighAccuracy: true, // Pedir la máxima precisión
                maximumAge: 2000,
                timeout: 10000
            }
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