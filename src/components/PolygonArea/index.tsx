import {
    useState,
    useCallback,
    useEffect,
    type FunctionComponent,
    type Dispatch,
    type SetStateAction,
} from "react";
import { ID_ATTRIBUTE_NAME } from "../Map";
import geoJson from "../../assets/export.geojson";

const SQUARE_METRES_TO_SQUARE_FEET_FACTOR = 10.7639;

type PolygonAreaProps = {
    lastClickedFeatureIds: string[];
    setShow: Dispatch<SetStateAction<boolean>>;
};

const PolygonArea: FunctionComponent<PolygonAreaProps> = ({
    lastClickedFeatureIds,
    setShow,
}) => {
    const [displayArea, setDisplayArea] = useState<string>("");
    const toLatLngLiteral = (point: number[]): { lat: number; lng: number } => {
        return {
            lat: point[1],
            lng: point[0],
        };
    };

    const getAreaSqMeters = useCallback(
        (
            spherical: typeof google.maps.geometry.spherical,
            coordinates: number[][][],
        ): number => {
            return coordinates
                .map((coords) =>
                    spherical.computeArea(coords.map(toLatLngLiteral)),
                )
                .reduce((acc, curr) => acc + curr, 0);
        },
        [],
    );

    useEffect(() => {
        (
            google.maps.importLibrary(
                "geometry",
            ) as Promise<google.maps.GeometryLibrary>
        )
            .then((lib) => {
                if (lib.spherical && geoJson) {
                    const featureAreaSquareMetres = lastClickedFeatureIds
                        .map((clickedId) => {
                            const foundFeature = geoJson.features.find(
                                (feature) =>
                                    feature.properties[ID_ATTRIBUTE_NAME] ===
                                    clickedId,
                            );
                            if (
                                foundFeature &&
                                foundFeature.geometry.type === "Polygon"
                            ) {
                                // Multi-polygon is not supported in this example.
                                return getAreaSqMeters(
                                    lib.spherical,
                                    foundFeature.geometry.coordinates,
                                );
                            }
                            return 0;
                        })
                        .reduce((acc, curr) => acc + curr, 0);
                    setDisplayArea(
                        new Intl.NumberFormat("en-US", {
                            // This is an official unit type but ECMAScript doesn't support
                            // this particular unit yet.Currently, it only supports a subset
                            // of units.
                            // style: "unit",
                            // unit: "area-square-foot",
                            style: "decimal",
                            unitDisplay: "short",
                        }).format(
                            Math.ceil(
                                featureAreaSquareMetres *
                                    SQUARE_METRES_TO_SQUARE_FEET_FACTOR,
                            ),
                        ),
                    );
                    setShow(lastClickedFeatureIds?.length > 0);
                }
            })
            .catch((error: unknown) => {
                console.error("Error importing geometry library: ", error);
            });
    }, [lastClickedFeatureIds, getAreaSqMeters]);
    return (
        <div>
            {lastClickedFeatureIds?.length > 0
                ? `Area: ${displayArea} square foot`
                : "Please select a bulding to see its area"}
        </div>
    );
};

export default PolygonArea;
