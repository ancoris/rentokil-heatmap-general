import { useState, useMemo, useEffect } from "react";
import "./App.css";
import { Map } from "./components/Map";
import PrimaryNavigation from "./PrimaryNavigation.tsx";

function App() {
    const [featureArea, setFeatureArea] = useState<number>(0);
    const [displayArea, setDisplayArea] = useState<string>("");
    const MemoizedMap = useMemo(() => {
        return <Map {...{ setFeatureArea }} />;
    }, [setFeatureArea]);

    useEffect(() => {
        console.log("Feature Area: ", featureArea);
        setDisplayArea(
            new Intl.NumberFormat("en-GB", {
                // style: "unit",
                // unit: "area-square-foot",
                style: "decimal",
                unitDisplay: "short",
            }).format(featureArea),
        );
    }, [featureArea]);

    return (
        <>
            <PrimaryNavigation/>
            <div>Feature Area: {displayArea} square foot.</div>
            {MemoizedMap}
        </>
    );
}

export default App;
