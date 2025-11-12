import * as THREE from 'three';
import * as LocAR from 'locar';

export const camera = new THREE.PerspectiveCamera(
    80,
    window.innerWidth / window.innerHeight,
    0.001,
    1000
);

export const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

export const scene = new THREE.Scene();
export const locar = new LocAR.LocationBased(scene, camera);

window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

// --- Cámara ---

// 'cam' solo existirá cuando el toggle esté "ON"
export let cam: LocAR.Webcam | null = null;
const constraints = { video: { facingMode: 'environment' } };

export function startCamera() {
    // Si la cámara ya existe, no hacer nada
    if (cam) return;

    // Crear la cámara
    cam = new LocAR.Webcam(constraints);

    // Añadir los listeners al nuevo objeto 'cam'
    cam.on('webcamstarted', (ev: any) => {
        scene.background = ev.texture;
    });

    cam.on('webcamerror', (error: any) => {
        alert(`Error de camara: ${error.message}`);
        stopCamera(); // Si hay error, la destruimos
    });
}

export function stopCamera() {
    // Si la cámara existe, destruirla
    if (cam) {
        cam.dispose();
        cam = null;
        console.log('Camara parada');
    }

    // Restaurar el fondo oscuro
    scene.background = new THREE.Color(0x48e5c2);
}


// --- Orientación ---
// (Esta parte no cambia)
export const deviceOrientationControls = new LocAR.DeviceOrientationControls(camera);

deviceOrientationControls.on('deviceorientationgranted', (ev: any) => {
    ev.target.connect();
});

deviceOrientationControls.on('deviceorientationerror', (error: any) => {
    alert(`Error de orientación: ${error.message}`);
});

locar.on('gpserror', (error: any) => {
    alert(`Error de GPS: ${error.code}`);
});