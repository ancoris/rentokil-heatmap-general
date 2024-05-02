const RED = "#ED1C24"; // AKA RENTOKIL_RED
const AMBER = "#FFBF00";
const GREEN = "#008000";

const STYLE_DEFAULT = {
    strokeWeight: 2.0,
    strokeOpacity: 1.0,
    fillOpacity: 0.3,
};

export const STYLE_CUSTOMER = {
    ...STYLE_DEFAULT,
    strokeColor: GREEN,
    fillColor: GREEN,
};

export const STYLE_NON_CUSTOMER = {
    ...STYLE_DEFAULT,
    strokeColor: AMBER,
    fillColor: AMBER,
};

export const STYLE_CLICKED = {
    fillColor: RED,
    fillOpacity: 0.5,
};

export const STYLE_MOUSE_MOVE = {
    strokeWeight: 4.0,
    strokeColor: RED,
};

export const DEFAULT_HEATMAP_RADIUS = 30;

export const START_POSITION = { lat: 40.735657, lng: -74.172363 }; // Newark, NJ

export const toLatLng = (point: number[]): google.maps.LatLng => {
    return new google.maps.LatLng(point[1], point[0]);
};
