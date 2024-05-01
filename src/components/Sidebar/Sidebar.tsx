import { ReactNode } from "react";
import styles from "./Sidebar.module.css";

const Sidebar = ({
    content,
    showSidebar,
    setShow,
}: {
    content: ReactNode;
    showSidebar: boolean;
    setShow: (show: boolean) => void;
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
                    <div className={styles.content}>{content}</div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
