import './script';
import type { Map } from 'leaflet';
import { map } from './map';

document.addEventListener('DOMContentLoaded', () => {
    const navButtons = document.querySelectorAll<HTMLButtonElement>('.nav-btn');
    const sections = document.querySelectorAll<HTMLElement>('.section-container');
    const topMenu = document.getElementById('topMenu') as HTMLElement;
    const botMenu = document.getElementById('botMenu') as HTMLElement;
    const body = document.body;

    const liveViewId = 'liveViewSection';
    const mapID = 'mapSection';

    if (!topMenu || !botMenu) {
        console.error('Missing required DOM elements: topMenu or botMenu');
        return;
    }

    function showSection(targetId: string | null): void {
        if (!targetId) return;

        // Toggle active sections
        sections.forEach((sec) => {
            sec.classList.toggle('active', sec.id === targetId);
        });

        if (targetId === liveViewId) {
            // Live view mode
            topMenu.style.display = 'block';
            botMenu.classList.add('darkbg-lightfr');
            botMenu.classList.remove('lightbg-darkfr');
            body.classList.remove('bot-padd');
            body.classList.add('no-bot-padd');
        } else if (targetId === mapID) {
            // Map mode
            topMenu.style.display = 'none';
            botMenu.classList.add('darkbg-lightfr');
            botMenu.classList.remove('lightbg-darkfr');
            body.classList.remove('bot-padd');
            body.classList.add('no-bot-padd');
            // Invalidate Leaflet map size when showing
            (map as Map).invalidateSize();
        } else {
            // Other sections
            topMenu.style.display = 'none';
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
