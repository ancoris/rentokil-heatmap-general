import styles from "./PrimaryNavigation.module.css";

const PrimaryNavigation = () => {

    return (
        <div role='banner'>
            <div className={styles.outer}>
                <div className={styles.topNavBar}>
                </div>
                <div className={styles.bottomNavBar}>
                </div>
            </div>

            <div className={styles.logoContainer}>
                    <div className={styles.logoTitleContainer}>
                            <img
                                src={`src/assets/logo_top.png`}
                            />
               </div>
        </div>
 </div>
    );
};

export default PrimaryNavigation;
