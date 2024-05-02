import geoJson from "../assets/export.geojson";

export const ID_ATTRIBUTE_NAME = "@id";

export const featureIdIsRentokilCustomer = (featureId: string): boolean => {
    return Number(featureId.slice(-1)) % 3 === 0;
};

export const getFeatureById = (featureId: string): unknown => {
    const foundFeature = geoJson.features.find(
        (feature) => feature.properties[ID_ATTRIBUTE_NAME] === featureId,
    );
    if (foundFeature?.geometry?.type === "Polygon") {
        // "Multi-polygon" and "point" are not supported in this example.
        return foundFeature;
    }
    return undefined;
};
