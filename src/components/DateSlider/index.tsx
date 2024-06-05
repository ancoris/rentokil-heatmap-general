import {
    type FunctionComponent,
    type CSSProperties,
    type SetStateAction,
    type Dispatch,
    useState,
} from "react";
import styles from "./DateSlider.module.css";

type DateSliderProps = {
    setDatasetLayerVisible: Dispatch<SetStateAction<boolean>>;
    setTimeSliderValue: Dispatch<SetStateAction<number>>;
    heatmapVisible: boolean;
};

export const DateSlider: FunctionComponent<DateSliderProps> = ({
    setDatasetLayerVisible,
    setTimeSliderValue,
    heatmapVisible,
}) => {
    const [animationIntervalId, setAnimationIntervalId] = useState<
        number | null
    >(null);
    let timeoutId: number;
    const handleTimeChange = (
        setTimeoutForDatasetLaterVisibility = true,
    ): void => {
        if (timeoutId) {
            window.clearTimeout(timeoutId);
        }
        setDatasetLayerVisible(false);
        const timeSlider = document.getElementById(
            "timeSlider",
        ) as HTMLInputElement;
        const timeSliderValue = parseInt(timeSlider.value);
        if (timeSliderValue > 90) {
            timeSlider.classList.add(styles.forecast);
        } else {
            timeSlider.classList.remove(styles.forecast);
        }
        (timeSlider.nextElementSibling as HTMLOutputElement).value = daysAgo(
            90 - timeSliderValue,
        );
        (timeSlider.parentNode as HTMLDivElement).style.setProperty(
            "--val",
            timeSliderValue.toString(),
        );
        if (setTimeoutForDatasetLaterVisibility) {
            timeoutId = window.setTimeout(() => {
                setDatasetLayerVisible(true);
            }, 350);
        }
        setTimeSliderValue(timeSliderValue);
    };

    const daysAgo = (days: number): string => {
        const dayMultiplier = 5; // each step on the range slider is 5 days
        const dt = Intl.DateTimeFormat("en-US", {
            day: "numeric",
            month: "short",
            year: "numeric",
        }).format(Date.now() - days * dayMultiplier * 24 * 60 * 60 * 1000);
        return days >= 0 ? dt : `AI Forecast: ${dt}`;
    };

    const playAnimation = (intervalId: number) => {
        const timeSlider = document.getElementById(
            "timeSlider",
        ) as HTMLInputElement;
        const timeSliderValue = parseInt(timeSlider.value);
        if (timeSliderValue < 100) {
            timeSlider.value = (timeSliderValue + 1).toString();
            handleTimeChange(false);
        } else if (intervalId) {
            window.clearInterval(intervalId);
            setAnimationIntervalId(null);
            handleTimeChange();
        }
    };

    const toggleAnimation = () => {
        if (animationIntervalId) {
            window.clearInterval(animationIntervalId);
            setAnimationIntervalId(null);
            handleTimeChange();
        } else {
            let intervalId: number;
            intervalId = window.setInterval(() => {
                playAnimation(intervalId);
            }, 200);
            setAnimationIntervalId(intervalId);
        }
    };
    const resetSlider = (resetVal: number): void => {
        const timeSlider = document.getElementById(
            "timeSlider",
        ) as HTMLInputElement;
        timeSlider.value = resetVal.toString();
        handleTimeChange();
    };

    return (
        <div
            className={`${styles.timeSliderContainer} ${
                heatmapVisible ? styles.visible : styles.hidden
            }`}
        >
            <div className={styles.timeSliderWrapper}>
                <input
                    type="range"
                    id="timeSlider"
                    name="timeSlider"
                    min={0}
                    max={100}
                    defaultValue={90}
                    step={1}
                    list="markers"
                    onChange={() => {
                        return handleTimeChange();
                    }}
                />
                <output htmlFor="timeSlider">{daysAgo(0)}</output>
                <label htmlFor="timeSlider">
                    <strong className={styles.date}>Date</strong>
                    <div className={styles.labels} aria-hidden="true">
                        <span style={{ "--i": 0 } as CSSProperties}>
                            {daysAgo(90 - 0)}
                        </span>
                        <span style={{ "--i": 3 } as CSSProperties}>
                            {daysAgo(90 - 30)}
                        </span>
                        <span style={{ "--i": 6 } as CSSProperties}>
                            {daysAgo(90 - 60)}
                        </span>
                        <span style={{ "--i": 9 } as CSSProperties}>Today</span>
                        <span style={{ "--i": 10 } as CSSProperties}>
                            AI Forecast
                        </span>
                    </div>
                </label>
                <datalist id="markers">
                    <option value="0" label={daysAgo(90 - 0)}></option>
                    <option value="30" label={daysAgo(90 - 30)}></option>
                    <option value="60" label={daysAgo(90 - 60)}></option>
                    <option value="90" label="Today"></option>
                    <option value="100" label="AI Forecast"></option>
                </datalist>
            </div>
            <div className={styles.timeSliderBtns}>
                <button
                    onClick={() => {
                        resetSlider(0);
                    }}
                >
                    ⏮️
                </button>
                <button onClick={toggleAnimation}>
                    {animationIntervalId ? "⏸️" : "▶️"}
                </button>
                <button
                    onClick={() => {
                        resetSlider(100);
                    }}
                >
                    ⏭️
                </button>
                <button
                    onClick={() => {
                        resetSlider(90);
                    }}
                >
                    🔄
                </button>
            </div>
        </div>
    );
};
