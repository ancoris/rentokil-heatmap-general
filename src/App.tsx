import { useState, useMemo } from "react";
import "./App.css";
import { Map } from "./components/Map";

function App() {
    const [featureArea, setFeatureArea] = useState<number>(0);
    const MemoizedMap = useMemo(() => {
        return <Map {...{ setFeatureArea }} />;
    }, [setFeatureArea]);

    return (
        <>
            <div>Feature Area: {featureArea} Square Feet.</div>
            {MemoizedMap}
        </>
    );
}

export default App;
