import { type Dispatch, type SetStateAction } from "react";
import PolygonArea from "../PolygonArea";
import styles from "./Sidebar.module.css";
import { SiteInfo } from "../SiteInfo/SiteInfo";

const Sidebar = ({
    lastClickedFeatureIds,
    showSidebar,
    setShow,
}: {
    lastClickedFeatureIds: string[];
    showSidebar: boolean;
    setShow: Dispatch<SetStateAction<boolean>>;
}) => {
    return (
        <div className={styles.outer}>
            <div
                className={showSidebar ? styles.sidebarActive : styles.sidebar}
            >
                <div className={styles.inner}>
                    <div className={styles.actions}>
                        <button
                            className={styles.hideIcon}
                            onClick={() => {
                                setShow(false);
                            }}
                        >
                            X
                        </button>
                    </div>
                    <div className={styles.content}>
                        <PolygonArea {...{ lastClickedFeatureIds, setShow }} />
                        <SiteInfo />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
