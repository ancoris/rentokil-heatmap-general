import { useEffect, useState, useContext } from "react";
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
import { Avatar } from "./components/Avatar/Avatar";
import { ListItem } from "./components/ListItem/ListItem";
import { ThemeContext } from "./context/ThemeContext";
import ThemeType from "./context/ThemeTypes";
import Menu from "./assets/menu.svg";
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
    const { setTheme } = useContext(ThemeContext);

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

    const options = [
        <ListItem
            key="light"
            label="Light theme"
            onClick={() => {
                setTheme(ThemeType.Light);
                console.log(ThemeType.Light);
            }}
        />,
        <ListItem
            key="dark"
            label="Dark theme"
            onClick={() => {
                setTheme(ThemeType.Dark);
                console.log(ThemeType.Dark);
            }}
        />,
    ];

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
                    title="Rentokil Heatmap"
                    avatar={<Avatar image={Menu} options={options} />}
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
