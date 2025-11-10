import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Create OSM tile layer
const osmUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const osmAttrib = '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const osm = L.tileLayer(osmUrl, {
    maxZoom: 19,
    attribution: osmAttrib,
});

export const map = L.map('mapSection', {
    center: [40.332554, -3.765760], // UC3M Leganés Campus
    zoom: 17,
    layers: [osm],
    zoomControl: false,
});