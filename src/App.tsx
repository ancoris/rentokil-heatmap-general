import { useState, useMemo, useEffect } from "react";
import "./App.css";
import { ID_ATTRIBUTE_NAME, Map } from "./components/Map";
import geoJson from "./assets/export.geojson" assert { type: "json" };
import PrimaryNavigation from "./PrimaryNavigation.tsx";

function App() {
    const [lastClickedFeatureIds, setLastClickedFeatureIds] = useState<
        string[]
    >([]);
    const [featureArea, setFeatureArea] = useState<number>(0);
    const [displayArea, setDisplayArea] = useState<string>("");
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const MemoizedMap = useMemo(() => {
        return (
            <Map {...{ setFeatureArea, setLastClickedFeatureIds, setMap }} />
        );
    }, [setFeatureArea, setLastClickedFeatureIds, setMap]);

    useEffect(() => {
        console.log("Feature Area: ", featureArea);
        setDisplayArea(
            new Intl.NumberFormat("en-GB", {
                // This is an official unit type but ECMAScript doesn't support
                // this particular unit yet.Currently, it only supports a subset
                // of units.
                // style: "unit",
                // unit: "area-square-foot",
                style: "decimal",
                unitDisplay: "short",
            }).format(featureArea),
        );
    }, [featureArea]);

    const getArea = (coordinates: number[][][]): number => {
        return 99;
    };

    useEffect(() => {
        if (geoJson) {
            setFeatureArea(
                lastClickedFeatureIds
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
                            return getArea(foundFeature.geometry.coordinates);
                        }
                        return 0;
                    })
                    .reduce((acc, curr) => {
                        return acc + curr;
                    }, 0),
            );
        }
    }, [geoJson, lastClickedFeatureIds]);

    return (
        <>
            <PrimaryNavigation />
            <div>
                {lastClickedFeatureIds?.length > 0
                    ? `Feature Area: ${displayArea} square foot.`
                    : "Please select a bulding to see its area."}
            </div>
            {MemoizedMap}
        </>
    );
}

export default App;
