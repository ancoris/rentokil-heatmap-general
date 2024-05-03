import { useState, useEffect, type FunctionComponent } from "react";
import { getFeatureById } from "../geoJsonUtils";
import { toLatLng } from "../mapUtils";
import { PolygonArea } from "../PolygonArea";

type GeoJsonAreaProps = {
    featureIds: string[];
    prefix: string;
};

export const GeoJsonArea: FunctionComponent<GeoJsonAreaProps> = ({
    featureIds,
    prefix,
}) => {
    const [polyPaths, setPolyPaths] = useState<
        (google.maps.LatLng[] | google.maps.MVCArray<google.maps.LatLng>)[][]
    >([]);

    useEffect(() => {
        setPolyPaths(
            featureIds
                .map(getFeatureById)
                .filter(Boolean)
                .map((feature) =>
                    feature.geometry.coordinates.map((coord: number[][]) =>
                        coord.map(toLatLng),
                    ),
                ),
        );
    }, [featureIds]);

    return <PolygonArea {...{ prefix, polyPaths }} />;
};
