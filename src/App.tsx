import { useState, useMemo, useEffect, useCallback } from "react";
import "./App.css";
import { ID_ATTRIBUTE_NAME, Map } from "./components/Map";
import geoJson from "./assets/export.geojson";
import { PrimaryNavigation } from "./components/PrimaryNavigation";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import Sidebar from "./components/Sidebar/Sidebar";

const SQUARE_METRES_TO_SQUARE_FEET_FACTOR = 10.7639;

function App() {
    const [showSidebar, setShowSidebar] = useState(false);
    const app = initializeApp({
        apiKey: "AIzaSyBWjMNpB8OfCyVhcARQUMBh9bDzrcxBOpc",
        authDomain: "rentokil-map-area-mini-hack.firebaseapp.com",
        projectId: "rentokil-map-area-mini-hack",
        storageBucket: "rentokil-map-area-mini-hack.appspot.com",
        messagingSenderId: "622316479711",
        appId: "1:622316479711:web:76f9c31911ffd9284df56a",
        measurementId: "G-R1Y623L7QJ",
    });
    getAnalytics(app);

    const [lastClickedFeatureIds, setLastClickedFeatureIds] = useState<
        string[]
    >([]);
    const [displayArea, setDisplayArea] = useState<string>("");

    const MemoizedMap = useMemo(() => {
        return <Map {...{ setLastClickedFeatureIds }} />;
    }, [setLastClickedFeatureIds]);

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

    const setShow = (show: boolean) => setShowSidebar(show);

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
                    if (lastClickedFeatureIds?.length > 0) {
                        setShow(true);
                    }
                }
            })
            .catch((error: unknown) => {
                console.error("Error importing geometry library: ", error);
            });
    }, [lastClickedFeatureIds, getAreaSqMeters]);

    return (
        <>
            <PrimaryNavigation />
            <Sidebar
                content={
                    <div>
                        {lastClickedFeatureIds?.length > 0
                            ? `Area: ${displayArea} square foot.`
                            : "Please select a bulding to see its area."}
                    </div>
                }
                showSidebar={showSidebar}
                setShow={setShow}
            />
            {MemoizedMap}
        </>
    );
}

export default App;
