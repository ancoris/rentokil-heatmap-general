import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import ThemeProvider from "./context/ThemeContext.tsx";
import ThemeType from "./context/ThemeTypes.ts";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <ThemeProvider initialValue={ThemeType.Dark}>
            <App />
        </ThemeProvider>
    </React.StrictMode>,
);
