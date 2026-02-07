import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { Appearance, ColorSchemeName } from "react-native";
import { Colors } from "./Colors";

interface ThemeContextProps {
    theme: typeof Colors.light;
    colorScheme: ColorSchemeName;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextProps>({
    theme: Colors.light,
    colorScheme: "light",
    toggleTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const systemColorScheme = Appearance.getColorScheme();
    const [colorScheme, setColorScheme] = useState<ColorSchemeName>(systemColorScheme);
    const [theme, setTheme] = useState(systemColorScheme === "dark" ? Colors.dark : Colors.light);

    useEffect(() => {
        const listener = Appearance.addChangeListener(({ colorScheme }) => {
            setColorScheme(colorScheme);
            setTheme(colorScheme === "dark" ? Colors.dark : Colors.light);
        });
        return () => listener.remove();
    }, []);

    const toggleTheme = () => {
        if (colorScheme === "dark") {
            setColorScheme("light");
            setTheme(Colors.light);
        } else {
            setColorScheme("dark");
            setTheme(Colors.dark);
        }
    };

    return (
        <ThemeContext.Provider value={{ theme, colorScheme, toggleTheme }}>{children}</ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
