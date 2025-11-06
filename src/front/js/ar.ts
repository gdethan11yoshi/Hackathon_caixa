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

const cam = new LocAR.Webcam({ video: { facingMode: 'environment' } });

cam.on('webcamstarted', (ev: any) => {
    scene.background = ev.texture;
});

cam.on('webcamerror', (error: any) => {
    alert(`Camera error: ${error.message}`);
});

export const deviceOrientationControls = new LocAR.DeviceOrientationControls(camera);

deviceOrientationControls.on('deviceorientationgranted', (ev: any) => {
    ev.target.connect();
});

deviceOrientationControls.on('deviceorientationerror', (error: any) => {
    alert(`Orientation error: ${error.message}`);
});

deviceOrientationControls.init();

locar.on('gpserror', (error: any) => {
    alert(`GPS error: ${error.code}`);
});