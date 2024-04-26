import { useState, useMemo, useEffect } from "react";
import "./App.css";
import { Map } from "./components/Map";

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

    return (
        <>
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
