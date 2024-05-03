import { type Dispatch, type SetStateAction } from "react";
import PolygonArea from "../PolygonArea";
import styles from "./Sidebar.module.css";
import { SiteInfo } from "../SiteInfo/SiteInfo";
import CloseIcon from "../../assets/cancel_FILL0_wght400_GRAD0_opsz24.svg";

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
                            className={styles.hideButton}
                            onClick={() => {
                                setShow(false);
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
                            <PolygonArea
                                {...{ lastClickedFeatureIds, setShow }}
                            />
                        </div>
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
