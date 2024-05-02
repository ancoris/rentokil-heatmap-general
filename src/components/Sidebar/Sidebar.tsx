import { useEffect, useState } from "react";
import { GeoJsonArea } from "../GeoJsonArea";
import { PolygonEditor } from "../PolygonEditor";
import styles from "./Sidebar.module.css";
import { SiteInfo } from "../SiteInfo/SiteInfo";

const Sidebar = ({
    lastClickedFeatureIds,
}: {
    lastClickedFeatureIds: string[];
}) => {
    const [showSidebar, setShowSidebar] = useState(false);

    useEffect(() => {
        setShowSidebar(lastClickedFeatureIds?.length > 0);
    }, [lastClickedFeatureIds]);

    return (
        <div className={styles.outer}>
            <div
                className={`${styles.sidebar} ${
                    showSidebar ? styles.sidebarActive : ""
                }`}
            >
                <div className={styles.inner}>
                    <div className={styles.actions}>
                        <button
                            className={styles.hideIcon}
                            onClick={() => {
                                setShowSidebar(false);
                            }}
                        >
                            X
                        </button>
                    </div>
                    <div className={styles.content}>
                        <PolygonEditor {...{ lastClickedFeatureIds }} />
                        <GeoJsonArea
                            {...{
                                featureIds: lastClickedFeatureIds,
                                prefix: "Original",
                            }}
                        />
                        <SiteInfo />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
