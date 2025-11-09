import * as LEAF from 'leaflet';
import leganes_map from '../public/plano-leganes.jpg';

// 920 x 869
const imgW = 920;
const imgH = 869;
const imageBounds: LEAF.LatLngBoundsExpression = [
    [0, 0],
    [imgH, imgW],
];

const map = LEAF.map('mapSection', {
    crs: LEAF.CRS.Simple,
    minZoom: -1
});

LEAF.imageOverlay(leganes_map, imageBounds).addTo(map);

map.fitBounds(imageBounds);