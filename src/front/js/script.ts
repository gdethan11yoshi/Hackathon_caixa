import * as THREE from 'three';
//import { AltitudeEstimator } from './altura';
import { locar, renderer, scene, camera, deviceOrientationControls } from './ar';
import { MarkerManager } from './marcadores';
import { CAMPUS_LOCATIONS, LocationType } from './ubicaciones';

const liveViewDOM = document.getElementById('liveViewSection');
if (liveViewDOM) liveViewDOM.appendChild(renderer.domElement);

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
        });
    }

    if (btnBuildings) {
        btnBuildings.addEventListener('change', (e) => {
            const target = e.target as HTMLInputElement;
            markerManager.toggleLocationType(LocationType.POI, target.checked);
        });
    }

    if (btnCafeterias) {
        btnCafeterias.addEventListener('change', (e) => {
            const target = e.target as HTMLInputElement;
            markerManager.toggleLocationType(LocationType.EVENTS, target.checked);
        });
    }
}

setupToggleControls();

function getCardinalDirection(angle: number): string {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
    // Normalizar ángulo a 0-360
    const normalizedAngle = (angle + 360) % 360;
    // Cada cacho es de 45º, además le añadimos la mitad
    const index = Math.floor((normalizedAngle + 22.5) / 45) % 8;
    return directions[index];
}

const cameraDirection = new THREE.Vector3();

renderer.setAnimationLoop(() => {
    deviceOrientationControls.update();

    if (directionHeader) {
        // Dirección normalizada a la que se setá mirando
        camera.getWorldDirection(cameraDirection);

        // Calcular el ángulo de visión del dispositivo
        const angleRad = Math.atan2(cameraDirection.x, cameraDirection.z);

        // Convertir a radianes
        const angleDeg = THREE.MathUtils.radToDeg(angleRad);

        // Sacar las coordenadas cardinales dado el ángulo
        const cardinal = getCardinalDirection(angleDeg);

        // Normalizar a 360 para mostrar en el dispositivo
        const displayAngle = ((angleDeg + 360) % 360).toFixed(0);

        // Actualizar cabecera de la interfaz
        directionHeader.textContent = `${cardinal} (${displayAngle}°)`;
    }

    renderer.render(scene, camera);
});
