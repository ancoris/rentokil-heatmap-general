export const toLatLngLiteral = (
    point: number[],
): { lat: number; lng: number } => {
    return {
        lat: point[1],
        lng: point[0],
    };
};
