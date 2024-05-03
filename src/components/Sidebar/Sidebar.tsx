import { ReactNode, useEffect, useState } from "react";
import { GeoJsonArea } from "../GeoJsonArea";
import { PolygonEditor } from "../PolygonEditor";
import styles from "./Sidebar.module.css";
import { SiteInfo } from "../SiteInfo/SiteInfo";
import CloseIcon from "../../assets/cancel_FILL0_wght400_GRAD0_opsz24.svg";

const Sidebar = ({
    content,
    showSidebar,
    setShowSidebar,
}: {
    content: ReactNode;
    showSidebar: boolean;
    setShowSidebar: (show: boolean) => void;
}) => {
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
                    <div className={styles.content}>{content}</div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
