import { ReactNode, FunctionComponent } from "react";
import styles from "./ListItem.module.scss";

interface ListItemProps {
    label?: string;
    icon?: ReactNode;
    hideLabel?: boolean;
    hideIcon?: boolean;
    onClick: () => void;
}

export const ListItem: FunctionComponent<ListItemProps> = ({
    label,
    icon,
    hideLabel = false,
    hideIcon = true,
    onClick,
}: ListItemProps) => {
    return (
        <button
            className={styles.listItemOuter}
            type="button"
            onClick={onClick}
        >
            <div className={styles.listItemContent}>
                {!hideIcon && (
                    <span className={styles.listItemIconContainer}>{icon}</span>
                )}
                {!hideLabel && (
                    <span className={styles.listItemLabelContainer}>
                        {label}
                    </span>
                )}
            </div>
        </button>
    );
};
