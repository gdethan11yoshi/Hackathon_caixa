import * as THREE from 'three';
import * as LocAR from 'locar';
import {type Location, LocationType } from './ubicaciones';

export interface ARMarker {
    location: Location;
    mesh: THREE.Object3D;
    label?: THREE.Sprite;
    visible: boolean;
}

export class MarkerManager {
    private markers: Map<string, ARMarker> = new Map();
    private locar: LocAR.LocationBased;
    private scene: THREE.Scene;

    private visibilityState: Map<LocationType, boolean> = new Map([
        [LocationType.MAIN, true],
        [LocationType.POI, true],
        [LocationType.EVENTS, false]
    ]);

    constructor(locar: LocAR.LocationBased, scene: THREE.Scene) {
        this.locar = locar;
        this.scene = scene;
    }

    public async addLocation(location: Location): Promise<void> {
        // Crear el marcador (el cono)
        const mesh = this.createDefaultMarker(location);

        // Crear la etiqueta de texto
        const label = this.createTextLabel(location.name, location.icon);

        // Posicionar la etiqueta justo encima de la base del cono
        const coneHeight = location.scale || 10;
        label.position.y = coneHeight + 5; // Altura del cono + 5 unidades de padding

        // Agruparlos y añadirlos a la escena
        const group = new THREE.Group();
        group.add(mesh);
        group.add(label);

        this.locar.add(
            group,
            location.longitude,
            location.latitude,
            location.altitude || 0
        );

        const marker: ARMarker = {
            location,
            mesh: group,
            label,
            visible: this.visibilityState.get(location.type) || false
        };

        this.markers.set(location.id, marker);
        this.updateMarkerVisibility(location.id);
    }

    /**
     * Crea el marcador visual simple: un cono apuntando hacia abajo.
     */
    private createDefaultMarker(location: Location): THREE.Object3D {
        const color = location.color || 0x0066cc;
        const height = location.scale || 10; // Usamos 'scale' como la altura
        const radius = height * 0.4; // Radio un poco menos de la mitad de la altura

        // Geometría de Cono (radio, altura, segmentos)
        const coneGeom = new THREE.ConeGeometry(radius, height, 8);
        const coneMat = new THREE.MeshBasicMaterial({
            color,
            transparent: true,
            opacity: 0.8
        });
        const cone = new THREE.Mesh(coneGeom, coneMat);

        // Posicionar el cono para que su punta (vértice) esté en y=0
        // Por defecto, el centro del cono está en y=0, así que lo subimos la mitad de su altura.
        cone.position.y = height * 0.5;

        return cone;
    }

    /**
     * Crea la etiqueta de texto.
     */
    private createTextLabel(text: string, icon?: string): THREE.Sprite {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        if (!context) {
            throw new Error('Could not get 2D context for canvas');
        }

        canvas.width = 512;
        canvas.height = 128;

        // Fondo semi-transparente
        context.fillStyle = 'rgba(0, 0, 0, 0.7)';
        context.beginPath();
        context.roundRect(0, 0, canvas.width, canvas.height, 20);
        context.fill();

        // Texto
        context.fillStyle = '#ffffff';
        context.font = 'bold 48px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';

        const displayText = icon ? `[${icon}] ${text}` : text;
        context.fillText(displayText, canvas.width / 2, canvas.height / 2);

        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true
        });
        const sprite = new THREE.Sprite(material);
        sprite.scale.set(20, 5, 1);

        // La posición Y se establece en addLocation()

        return sprite;
    }

    public toggleLocationType(type: LocationType, visible: boolean): void {
        this.visibilityState.set(type, visible);

        this.markers.forEach((marker, id) => {
            if (marker.location.type === type) {
                this.updateMarkerVisibility(id);
            }
        });
    }

    private updateMarkerVisibility(markerId: string): void {
        const marker = this.markers.get(markerId);
        if (!marker) return;

        const shouldBeVisible = this.visibilityState.get(marker.location.type) || false;
        marker.mesh.visible = shouldBeVisible;
        if (marker.label) {
            marker.label.visible = shouldBeVisible;
        }
    }

    public removeMarker(locationId: string): void {
        const marker = this.markers.get(locationId);
        if (marker) {
            this.scene.remove(marker.mesh);
            this.markers.delete(locationId);
        }
    }

    public clearAll(): void {
        this.markers.forEach((marker) => {
            this.scene.remove(marker.mesh);
        });
        this.markers.clear();
    }

    public getMarkers(): Map<string, ARMarker> {
        return this.markers;
    }
}