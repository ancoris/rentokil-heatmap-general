import React, {
    createContext,
    useEffect,
    useState,
    FunctionComponent,
} from "react";
import ThemeType from "./ThemeTypes";

interface ContextProps {
    themeType: ThemeType;
    setTheme: (themeType: ThemeType) => void;
}

export const ThemeContext = createContext<ContextProps>({
    themeType: ThemeType.Dark,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    setTheme: () => {},
});

interface Props {
    children?: React.ReactNode;
    initialValue: ThemeType;
}

const ThemeProvider: FunctionComponent<Props> = ({
    children,
    initialValue,
}) => {
    const [themeType, setThemeType] = useState(initialValue);

    const handleThemeChange = (themeType: ThemeType) => {
        document.documentElement.setAttribute("data-theme", themeType);
        console.log(document.documentElement)
        setThemeType(themeType);
    };

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", themeType);
    }, [themeType]);

    return (
        <ThemeContext.Provider
            value={{
                themeType: themeType,
                setTheme: handleThemeChange,
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
};

export default ThemeProvider;
