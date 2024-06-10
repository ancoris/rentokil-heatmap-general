import { useEffect, useState } from "react";
import "./App.css";
import styles from "./App.module.scss";
import { Map } from "./components/Map";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import Sidebar from "./components/Sidebar/Sidebar";
import { PolygonEditor } from "./components/PolygonEditor";
import { GeoJsonArea } from "./components/GeoJsonArea";
import { SiteInfo } from "./components/SiteInfo/SiteInfo";
import { AtRiskList } from "./components/AtRiskList/AtRiskList";
import { Header } from "./components/Header/Header";
import Logo from "../src/assets/ancoris-logo.svg" assert { type: "png" };

const enum InfoType {
    siteInfo = "siteInfo",
    atRiskInfo = "atRiskInfo",
}

function App() {
    const [lastClickedFeatureIds, setLastClickedFeatureIds] = useState<
        string[]
    >([]);
    const [map, setMap] = useState<google.maps.Map | null>(null);

    const app = initializeApp({
        apiKey: "AIzaSyD7EmsrEvkdxUffWtw0amCJiKVKmqp8DZ4",
        authDomain: "anc-generic-heatmap.firebaseapp.com",
        projectId: "anc-generic-heatmap",
        storageBucket: "anc-generic-heatmap.appspot.com",
        messagingSenderId: "522511250804",
        appId: "1:522511250804:web:f1c2c5c4cb3327cd13e821",
    });
    getAnalytics(app);
    const [showSidebar, setShowSidebar] = useState(false);
    const [activeInfoType, setActiveInfoType] = useState(InfoType.siteInfo);

    useEffect(() => {
        if (lastClickedFeatureIds?.length > 0) {
            setShowSidebar(true);
            setActiveInfoType(InfoType.siteInfo);
        } else {
            if (activeInfoType == InfoType.siteInfo) {
                setShowSidebar(false);
            }
        }
    }, [lastClickedFeatureIds]);

    const handleAtRisk = () => {
        setShowSidebar(true);
        setActiveInfoType(InfoType.atRiskInfo);
        setLastClickedFeatureIds([]);
    };

    const siteDetails = () => {
        return (
            <>
                <div className={styles.areaCalc}>
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

    const handleAtRiskBuildingClick = (
        featureId: string,
        coord: google.maps.LatLng,
    ) => {
        setLastClickedFeatureIds([featureId]);
        map?.panTo(coord);
        map?.setZoom(19);
    };

    return (
        <>
            <div className={styles.top}>
                <Header
                    logo={
                        <img
                        src={Logo}
                        alt="Ancoris Logo"
                    />
                    }
                    title="Heatmap"
                />
            </div>
            <Sidebar
                content={
                    activeInfoType == InfoType.siteInfo ? (
                        siteDetails()
                    ) : (
                        <AtRiskList handleClick={handleAtRiskBuildingClick} />
                    )
                }
                showSidebar={showSidebar}
                setShowSidebar={setShowSidebar}
            />
            <Map
                {...{ lastClickedFeatureIds, setLastClickedFeatureIds }}
                handleAtRiskButton={handleAtRisk}
                setMap={setMap}
            />
        </>
    );
}

export default App;
