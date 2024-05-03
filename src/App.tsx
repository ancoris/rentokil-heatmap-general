import { useEffect, useState } from "react";
import "./App.css";
import { Map } from "./components/Map";
import { PrimaryNavigation } from "./components/PrimaryNavigation";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import Sidebar from "./components/Sidebar/Sidebar";
import { PolygonEditor } from "./components/PolygonEditor";
import { GeoJsonArea } from "./components/GeoJsonArea";
import { SiteInfo } from "./components/SiteInfo/SiteInfo";

function App() {
    const [lastClickedFeatureIds, setLastClickedFeatureIds] = useState<
        string[]
    >([]);
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
    const [showSidebar, setShowSidebar] = useState(false);

    useEffect(() => {
        setShowSidebar(lastClickedFeatureIds?.length > 0);
    }, [lastClickedFeatureIds]);

    const siteDetails = () => {
        return (
            <>
                <div className="areaCalc">
                    <PolygonEditor {...{ lastClickedFeatureIds }} />
                    <GeoJsonArea
                        {...{
                            featureIds: lastClickedFeatureIds,
                            prefix: "Original",
                        }}
                    />
                </div>
                <SiteInfo lastClickedFeatureIds={lastClickedFeatureIds} />
            </>
        );
    };

    return (
        <>
            <PrimaryNavigation />
            <Sidebar
                content={siteDetails()}
                showSidebar={showSidebar}
                setShowSidebar={setShowSidebar}
            />
            <Map {...{ lastClickedFeatureIds, setLastClickedFeatureIds }} />
        </>
    );
}

export default App;
