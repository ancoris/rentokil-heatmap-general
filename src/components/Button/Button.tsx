import { ReactNode, FunctionComponent } from "react";
import styles from "./Button.module.scss";
import { ButtonType } from "./ButtonTypes";

interface ButtonProps {
    type?: ButtonType;
    label?: string;
    icon?: ReactNode;
    hideLabel?: boolean;
    hideIcon?: boolean;
    onClick: () => void;
}

export const Button: FunctionComponent<ButtonProps> = ({
    type = ButtonType.Action,
    label,
    icon,
    hideLabel = false,
    hideIcon = true,
    onClick,
}: ButtonProps) => {
    let buttonClass;
    switch (type) {
        case ButtonType.Action:
            buttonClass = styles.actionOuter;
            break;
        case ButtonType.Send:
            buttonClass = styles.sendOuter;
            break;
        case ButtonType.Suggestion:
            buttonClass = styles.suggestionOuter;
            break;
    }

    return (
        <button className={buttonClass} type="button" onClick={onClick}>
            <div
                className={
                    hideLabel
                        ? styles.buttonContentNoText
                        : styles.buttonContent
                }
            >
                {!hideIcon && (
                    <span className={styles.iconContainer}>{icon}</span>
                )}
                {!hideLabel && (
                    <span className={styles.labelContainer}>{label}</span>
                )}
            </div>
        </button>
    );
};
