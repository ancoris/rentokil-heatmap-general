import { ReactNode, FunctionComponent } from "react";
import styles from "./List.module.scss";

interface ListProps {
    children: ReactNode[];
    hasDividers?: boolean;
}

export const List: FunctionComponent<ListProps> = ({
    children = [],
    hasDividers = true,
}: ListProps) => {
    const options = children.map((child, index) => {
        const className =
            index > 0 && hasDividers
                ? styles.listItemWithSeparator
                : styles.listItemNoSeparator;
        return (
            <span key={index} className={className}>
                {child}
            </span>
        );
    });
    return <div className={styles.listContent}>{options}</div>;
};
