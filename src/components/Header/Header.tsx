import { ReactNode, FunctionComponent } from "react";
import styles from "./Header.module.scss";

interface HeaderProps {
    logo?: ReactNode;
    title?: string;
}

export const Header: FunctionComponent<HeaderProps> = ({
    logo,
    title,
}: HeaderProps) => {
    return (
        <div className={styles.headerOuter}>
            <div className={styles.headerInner}>
                <span className={styles.logoContainer}>{logo}</span>
                <span className={styles.titleContainer}>{title}</span>
                <span className={styles.actionsContainer}></span>
            </div>
        </div>
    );
};