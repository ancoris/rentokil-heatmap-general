import { ReactNode, FunctionComponent } from "react";
import styles from "./Header.module.scss";

interface HeaderProps {
    logo?: ReactNode;
    title?: string;
    actions?: ReactNode;
    avatar?: ReactNode;
}

export const Header: FunctionComponent<HeaderProps> = ({
    logo,
    title,
    avatar,
}: HeaderProps) => {
    return (
        <div className={styles.headerOuter}>
            <div className={styles.headerInner}>
                <span className={styles.logoContainer}>{logo}</span>
                <span className={styles.titleContainer}>{title}</span>
                <span className={styles.actionsContainer}>
                    {avatar}
                </span>
            </div>
        </div>
    );
};