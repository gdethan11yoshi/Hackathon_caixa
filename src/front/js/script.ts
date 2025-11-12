import * as THREE from 'three';
import { AltitudeEstimator } from './altura';
import {
    locar,
    renderer,
    scene,
    camera,
    deviceOrientationControls,
} from './ar';
import { MarkerManager } from './marcadores';
import { CAMPUS_LOCATIONS, LocationType } from './ubicaciones';

// --- DOM Setup ---
const liveViewDOM = document.getElementById('liveViewSection');
if (liveViewDOM) {
    liveViewDOM.appendChild(renderer.domElement);
}
// Referencias a elementos de la UI de Live View
const alturaHeader = document.getElementById('header-altura');
const directionHeader = document.getElementById('header-direction');
const liveViewSection = document.getElementById('liveViewSection'); // Usado en el bucle

// Botones de filtro de marcadores
const btnBuildings = document.getElementById('buildingsTgl');
const btnPois = document.getElementById('poisTgl');
const btnEvents = document.getElementById('eventTgl');


// --- Estimación de Altura y Piso ---
// Se exporta para que main.ts lo pueda importar
export const estimator = new AltitudeEstimator(({ floor }) => {
    if (alturaHeader) {
        alturaHeader.textContent = floor !== null ? String(floor) : '-';
    }
});


// --- Gestión de Marcadores AR ---
const markerManager = new MarkerManager(locar, scene);
let markersAdded = false;

locar.on('gpsupdate', async () => {
    if (!markersAdded) {
        console.log('GPS fijado. Añadiendo marcadores...');
        for (const location of CAMPUS_LOCATIONS) {
            try { await markerManager.addLocation(location); }
            catch (error) { console.error(`Fallo al añadir ${location.name}:`, error); }
        }
        markersAdded = true;
    }
});

locar.on('gpserror', (error: any) => {
    console.error('Error de GPS:', error);
    if (alturaHeader && alturaHeader.textContent === '-') {
        alturaHeader.textContent = `Error GPS`;
    }
});


// --- Controles de Visibilidad de Marcadores (Filtros) ---
const visibilityState = {
    [LocationType.MAIN]: true,
    [LocationType.POI]: true,
    [LocationType.EVENTS]: false
};

function updateButtonVisual(button: HTMLElement | null, isActive: boolean): void {
    if (button) { button.style.opacity = isActive ? '1.0' : '0.5'; }
}

function setupMarkerToggleControls(): void {
    if (btnBuildings) {
        btnBuildings.addEventListener('click', () => {
            visibilityState[LocationType.MAIN] = !visibilityState[LocationType.MAIN];
            markerManager.toggleLocationType(LocationType.MAIN, visibilityState[LocationType.MAIN]);
            updateButtonVisual(btnBuildings, visibilityState[LocationType.MAIN]);
        });
    }
    if (btnPois) {
        btnPois.addEventListener('click', () => {
            visibilityState[LocationType.POI] = !visibilityState[LocationType.POI];
            markerManager.toggleLocationType(LocationType.POI, visibilityState[LocationType.POI]);
            updateButtonVisual(btnPois, visibilityState[LocationType.POI]);
        });
    }
    if (btnEvents) {
        btnEvents.addEventListener('click', () => {
            visibilityState[LocationType.EVENTS] = !visibilityState[LocationType.EVENTS];
            markerManager.toggleLocationType(LocationType.EVENTS, visibilityState[LocationType.EVENTS]);
            updateButtonVisual(btnEvents, visibilityState[LocationType.EVENTS]);
        });
    }
    updateButtonVisual(btnBuildings, visibilityState[LocationType.MAIN]);
    updateButtonVisual(btnPois, visibilityState[LocationType.POI]);
    updateButtonVisual(btnEvents, visibilityState[LocationType.EVENTS]);
}

setupMarkerToggleControls();


// --- Bucle de Renderizado ---
function getCardinalDirection(angle: number): string {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
    const normalizedAngle = (angle + 360) % 360;
    const index = Math.floor((normalizedAngle + 22.5) / 45) % 8;
    return directions[index];
}

const cameraDirection = new THREE.Vector3();

renderer.setAnimationLoop(() => {
    // Solo actualizar la brújula y la dirección si estamos en Live View
    if (liveViewSection?.classList.contains('active')) {

        deviceOrientationControls.update(); // Actualizar giroscopio

        if (directionHeader) { // Actualizar texto de dirección
            camera.getWorldDirection(cameraDirection);
            const angleRad = Math.atan2(cameraDirection.x, cameraDirection.z);
            const angleDeg = THREE.MathUtils.radToDeg(angleRad);
            const cardinal = getCardinalDirection(angleDeg);
            const displayAngle = ((angleDeg + 360) % 360).toFixed(0);
            directionHeader.textContent = `${cardinal} (${displayAngle}°)`;
        }
    }

    // Renderizar la escena (esto se hace siempre,
    // pero solo es visible en la pestaña de Live View)
    renderer.render(scene, camera);
});