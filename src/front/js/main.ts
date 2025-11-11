import './script';
import type { Map } from 'leaflet';
import { map } from './map';

document.addEventListener('DOMContentLoaded', () => {
    const navButtons = document.querySelectorAll<HTMLButtonElement>('.nav-btn');
    const sections = document.querySelectorAll<HTMLElement>('.section-container');
    const menuLiveElems = document.getElementsByClassName('menusLiveView');
    const menuMapElems = document.getElementsByClassName('liveView');
    const botMenu = document.getElementById('botMenu') as HTMLElement;
    const body = document.body;

    const liveViewId = 'liveViewSection';
    const mapID = 'mapSection';

    if (!menuLiveElems || !botMenu || !menuMapElems) {
        console.error('Missing required DOM elements');
        return;
    }

    function showSection(targetId: string | null): void {
        if (!targetId) return;

        // Toggle active sections
        sections.forEach((sec) => {
            sec.classList.toggle('active', sec.id === targetId);
        });

        if (targetId === liveViewId) {
            for (let elem in menuLiveElems) elem.style.display = 'block';
            menuLive.
            menuMap.style.display = 'none';
            botMenu.classList.add('darkbg-lightfr');
            botMenu.classList.remove('lightbg-darkfr');
            body.classList.remove('bot-padd');
            body.classList.add('no-bot-padd');
        } else if (targetId === mapID) {
            // Map mode
            menuLive.style.display = 'none';
            menuMap.style.display = 'block';
            botMenu.classList.add('darkbg-lightfr');
            botMenu.classList.remove('lightbg-darkfr');
            body.classList.remove('bot-padd');
            body.classList.add('no-bot-padd');
            // Invalidate Leaflet map size when showing
            (map as Map).invalidateSize();
        } else {
            // Other sections
            menuLive.style.display = 'none';
            menuMap.style.display = 'none';
            botMenu.classList.remove('darkbg-lightfr');
            botMenu.classList.add('lightbg-darkfr');
            body.classList.remove('no-bot-padd');
            body.classList.add('bot-padd');
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
});
