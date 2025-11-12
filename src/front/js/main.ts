import './script';
import { estimator } from './script';
import { startCamera, stopCamera, locar, deviceOrientationControls } from './ar';
import { mapView } from './map';

const navButtons = document.querySelectorAll<HTMLButtonElement>('.nav-btn');
const sections = document.querySelectorAll<HTMLElement>('.section-container');
const botMenu = document.getElementById('botMenu') as HTMLElement;
const body = document.body;

const menuLiveElems = document.getElementsByClassName('menusLiveView');
const menuMapElems = document.getElementsByClassName('menusMapView');

const liveViewId = 'liveViewSection';
const mapID = 'mapSection';

if (!menuLiveElems || !botMenu || !menuMapElems) {
    console.error('Missing required DOM elements');
}

function showSection(targetId: string | null): void {
    if (!targetId) return;

    // Toggle active sections
    sections.forEach((sec) => {
        sec.classList.toggle('active', sec.id === targetId);
    });

    if (targetId === liveViewId) {
        // Iterar sobre los elementos con la clase del menu Live
        for (const elem of menuLiveElems) {
            // Si este existe seleccionarlo y mostrarlo
            if (elem && elem.id) {
                const target = document.getElementById(elem.id);
                if (target) target.style.display = 'block';
            }
        }
        for (const elem of menuMapElems) {
            if (elem && elem.id) {
                const target = document.getElementById(elem.id);
                if (target) target.style.display = 'none';
            }
        }
        // Cambiar el color de la barra inferior
        botMenu.classList.add('darkbg-lightfr');
        botMenu.classList.remove('lightbg-darkfr');

        // Quitar el padding para contenedores de pantalla completa
        body.classList.remove('bot-padd');
        body.classList.add('no-bot-padd');

        // Iniciar todos los elementos necesarios
        startCamera();
        locar.startGps();
        estimator.start();
        deviceOrientationControls.init();
    } else if (targetId === mapID) {
        for (const elem of menuLiveElems) {
            if (elem && elem.id) {
                const target = document.getElementById(elem.id);
                if (target) target.style.display = 'none';
            }
        }
        for (const elem of menuMapElems) {
            if (elem && elem.id) {
                const target = document.getElementById(elem.id);
                if (target) target.style.display = 'block';
            }
        }
        botMenu.classList.add('darkbg-lightfr');
        botMenu.classList.remove('lightbg-darkfr');
        body.classList.remove('bot-padd');
        body.classList.add('no-bot-padd');

        // Invalidar el mapa precargado (resetearlo)
        mapView.invalidateSize();

        // Desconectar camara para ahorra energía y mejorar rendimiento
        stopCamera();
        locar.stopGps();
        estimator.stop();
        deviceOrientationControls.disconnect();
    } else {
        for (const elem of menuLiveElems) {
            if (elem && elem.id) {
                const target = document.getElementById(elem.id);
                if (target) target.style.display = 'none';
            }
        }
        for (const elem of menuMapElems) {
            if (elem && elem.id) {
                const target = document.getElementById(elem.id);
                if (target) target.style.display = 'none';
            }
        }
        botMenu.classList.remove('darkbg-lightfr');
        botMenu.classList.add('lightbg-darkfr');
        body.classList.remove('no-bot-padd');
        body.classList.add('bot-padd');

        stopCamera();
        locar.stopGps();
        estimator.stop();
        deviceOrientationControls.disconnect();
    }
}

// Attach navigation events
navButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
        const targ = btn.getAttribute('data-target');
        showSection(targ);
    });
});

// Initialize default section
showSection('homeSection');