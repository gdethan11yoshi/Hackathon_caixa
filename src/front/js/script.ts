import * as THREE from 'three';
//import { AltitudeEstimator } from './altura';
import { locar, renderer, scene, camera, deviceOrientationControls } from './ar';
import { MarkerManager } from './marcadores';
import { CAMPUS_LOCATIONS, LocationType } from './ubicaciones';

const liveViewDOM = document.getElementById('liveViewSection');
if (liveViewDOM) {
    liveViewDOM.appendChild(renderer.domElement);
} else {
    console.error('No Live View container found');
}

const alturaHeader = document.getElementById('header-altura');
const directionHeader = document.getElementById('header-direction');

const btnDirections = document.getElementById('btn-directions') as HTMLInputElement;
const btnBuildings = document.getElementById('btn-buildings') as HTMLInputElement;
const btnCafeterias = document.getElementById('btn-cafeterias') as HTMLInputElement;

/*
const estimator = new AltitudeEstimator(({ altitude, floor, accuracy }) => {
    if (alturaHeader) {
        const altText = altitude !== null ? altitude.toFixed(1) : '---';
        const floorText = floor !== null ? String(floor) : '---';
        const accText = accuracy !== null ? accuracy.toFixed(1) : '---';
        alturaHeader.textContent = `Alt: ${altText}m | Floor: ${floorText} | Accuracy: ${accText}m`;
    }
});*/

const markerManager = new MarkerManager(locar, scene);

let markersAdded = false;

locar.on('gpsupdate', async (ev: any) => {
    if (!markersAdded) {
        console.log('GPS locked. Adding location markers...');

        for (const location of CAMPUS_LOCATIONS) {
            try {
                await markerManager.addLocation(location);
                console.log(`Added marker: ${location.name}`);
            } catch (error) {
                console.error(`Failed to add marker for ${location.name}:`, error);
            }
        }

        markersAdded = true;
    }

    console.log(ev);
});

locar.on('gpserror', (error: any) => {
    console.error('GPS Error:', error);
    if (alturaHeader) {
        alturaHeader.textContent = `GPS Error: ${error.code}`;
    }
});

locar.startGps();

function setupToggleControls(): void {
    if (btnDirections) {
        btnDirections.addEventListener('change', (e) => {
            const target = e.target as HTMLInputElement;
            markerManager.toggleLocationType(LocationType.MAIN, target.checked);
            console.log(`Main buildings: ${target.checked ? 'visible' : 'hidden'}`);
        });
    }

    if (btnBuildings) {
        btnBuildings.addEventListener('change', (e) => {
            const target = e.target as HTMLInputElement;
            markerManager.toggleLocationType(LocationType.POI, target.checked);
            console.log(`POI: ${target.checked ? 'visible' : 'hidden'}`);
        });
    }

    if (btnCafeterias) {
        btnCafeterias.addEventListener('change', (e) => {
            const target = e.target as HTMLInputElement;
            markerManager.toggleLocationType(LocationType.EVENTS, target.checked);
            console.log(`Events: ${target.checked ? 'visible' : 'hidden'}`);
        });
    }
}

setupToggleControls();

const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(10, 10, 10);
scene.add(directionalLight);

function getCardinalDirection(angle: number): string {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    // Normalize angle to 0-360, then find the correct slice
    const normalizedAngle = (angle + 360) % 360;
    // Each slice is 45 degrees. Add 22.5 to center the slices.
    const index = Math.floor((normalizedAngle + 22.5) / 45) % 8;
    return directions[index];
}

const cameraDirection = new THREE.Vector3();

renderer.setAnimationLoop(() => {
    deviceOrientationControls.update();

    if (directionHeader) {
        // Get the normalized direction vector the camera is looking at
        camera.getWorldDirection(cameraDirection);

        // Calculate the angle in the horizontal (XZ) plane
        // atan2(x, z) gives the angle in radians from the +Z axis
        const angleRad = Math.atan2(cameraDirection.x, cameraDirection.z);

        // Convert radians to degrees
        const angleDeg = THREE.MathUtils.radToDeg(angleRad);

        // Get the cardinal direction (e.g., "N", "SW")
        const cardinal = getCardinalDirection(angleDeg);

        // Normalize angle to 0-360 for display
        const displayAngle = ((angleDeg + 360) % 360).toFixed(0);

        // Update the header text
        directionHeader.textContent = `${cardinal} (${displayAngle}°)`;
    }

    renderer.render(scene, camera);
});

console.log('CampusNav AR initialized');
console.log(`Loaded ${CAMPUS_LOCATIONS.length} locations`);
console.log('Waiting for GPS lock...');