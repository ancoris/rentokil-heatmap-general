import styles from "./PrimaryNavigation.module.css";
import logo from "../../assets/logo_top.png" assert { type: "png" };

export const PrimaryNavigation = () => {
    return (
        <div role="banner" className={styles.banner}>
            <div className={styles.outer}>
                <div className={styles.topNavBar}></div>
                <div className={styles.bottomNavBar}></div>
            </div>

            <div className={styles.logoContainer}>
                <div className={styles.logoTitleContainer}>
                    <img src={logo} />
                </div>
            </div>
        </div>
    );
};
