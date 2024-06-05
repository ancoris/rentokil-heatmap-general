import { ReactNode, useState, FunctionComponent } from "react";
import styles from "./Avatar.module.scss";
import { List } from "../List/List";

interface AvatarProps {
    image: string;
    options?: ReactNode[];
}

export const Avatar: FunctionComponent<AvatarProps> = ({
    image,
    options = [],
}: AvatarProps) => {
    const [showMenu, setShowMenu] = useState<boolean>(false);

    const handleMenu = () => {
        console.log("clicked")
        setShowMenu(!showMenu);
    };

    return (
        <div className={styles.avatarDropdown}>
            <img
                className={styles.avatarImage}
                src={image}
                alt="Avatar"
                onClick={handleMenu}
            />
            {showMenu && (
                <div className={styles.avatarDropdownContent}>
                    <div className={styles.avatarDropdownContentInner}>
                        <List children={options} />
                    </div>
                </div>
            )}
        </div>
    );
};
