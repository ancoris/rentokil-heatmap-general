import { useEffect, useState } from "react";
import { GeoJsonArea } from "../GeoJsonArea";
import { PolygonEditor } from "../PolygonEditor";
import styles from "./Sidebar.module.css";
import { SiteInfo } from "../SiteInfo/SiteInfo";
import CloseIcon from "../../assets/cancel_FILL0_wght400_GRAD0_opsz24.svg";

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
                            className={styles.hideButton}
                            onClick={() => {
                                setShowSidebar(false);
                            }}
                        >
                            <img
                                className={styles.hideIcon}
                                src={CloseIcon}
                                alt="close"
                            />
                        </button>
                    </div>
                    <div className={styles.content}>
                        <div className={styles.areaCalc}>
                            <PolygonEditor {...{ lastClickedFeatureIds }} />
                        </div>
                        <GeoJsonArea
                            {...{
                                featureIds: lastClickedFeatureIds,
                                prefix: "Original",
                            }}
                        />
                        <SiteInfo
                            lastClickedFeatureIds={lastClickedFeatureIds}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
