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
        const mesh = this.createDefaultMarker(location);
        const label = this.createTextLabel(location.name, location.icon);

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

    private createDefaultMarker(location: Location): THREE.Object3D {
        const group = new THREE.Group();
        const color = location.color || 0x0066cc;
        const scale = location.scale || 10;

        const cylinderGeom = new THREE.CylinderGeometry(
            scale * 0.3,
            scale * 0.3,
            scale * 2,
            8
        );
        const cylinderMat = new THREE.MeshBasicMaterial({
            color,
            transparent: true,
            opacity: 0.8
        });
        const cylinder = new THREE.Mesh(cylinderGeom, cylinderMat);
        cylinder.position.y = scale;
        group.add(cylinder);

        const coneGeom = new THREE.ConeGeometry(scale * 0.5, scale, 8);
        const coneMat = new THREE.MeshBasicMaterial({ color });
        const cone = new THREE.Mesh(coneGeom, coneMat);
        cone.position.y = scale * 2 + scale * 0.5;
        group.add(cone);

        this.addPulseAnimation(group);

        return group;
    }

    private createTextLabel(text: string, icon?: string): THREE.Sprite {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        if (!context) {
            throw new Error('Could not get 2D context for canvas');
        }

        canvas.width = 512;
        canvas.height = 128;

        context.fillStyle = 'rgba(0, 0, 0, 0.7)';
        context.beginPath();
        context.roundRect(0, 0, canvas.width, canvas.height, 20);
        context.fill();

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
        sprite.position.y = 30;

        return sprite;
    }

    private addPulseAnimation(object: THREE.Object3D): void {
        const originalScale = object.scale.clone();
        let time = Math.random() * Math.PI * 2;

        const animate = () => {
            time += 0.02;
            const pulse = 1 + Math.sin(time) * 0.1;
            object.scale.set(
                originalScale.x * pulse,
                originalScale.y * pulse,
                originalScale.z * pulse
            );
            requestAnimationFrame(animate);
        };
        animate();
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