import React, { createContext, useContext, useState, ReactNode } from "react";

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  theme: Theme;
}

interface Theme {
  colors: {
    background: string;
    surface: string;
    primary: string;
    secondary: string;
    text: string;
    textSecondary: string;
    border: string;
    shadow: string;
  };
}

const lightTheme: Theme = {
  colors: {
    background: "#f8f9fa",
    surface: "#ffffff",
    primary: "#e94560",
    secondary: "#0f3460",
    text: "#333333",
    textSecondary: "#666666",
    border: "#e0e0e0",
    shadow: "#000000",
  },
};

const darkTheme: Theme = {
  colors: {
    background: "#1a1a2e",
    surface: "#16213e",
    primary: "#e94560",
    secondary: "#0f3460",
    text: "#ffffff",
    textSecondary: "#cccccc",
    border: "#0f3460",
    shadow: "#000000",
  },
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
