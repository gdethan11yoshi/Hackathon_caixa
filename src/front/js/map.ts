import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const btnCentrar = document.getElementById('alignMap');

// Crear capa OSM con el mapa
const osmUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const osmAttrib = '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const osm = L.tileLayer(osmUrl, {
    maxZoom: 19,
    attribution: osmAttrib,
});

export const mapView = L.map('mapSection', {
    center: [40.332554, -3.765760], // UC3M Leganés Campus
    zoom: 17,
    layers: [osm],
    zoomControl: false,
    trackResize: true,
});

if (btnCentrar) {
    btnCentrar.addEventListener("click", () => {
        mapView.flyTo([40.332554, -3.765760], 17);
    })
}