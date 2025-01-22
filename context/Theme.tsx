"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext<{ theme: string; toggleTheme: () => void } | undefined>(undefined);

export function ThemeProvider({ children, initialTheme = "light" }: { children: React.ReactNode; initialTheme?: string }) {
  const [theme, setTheme] = useState(initialTheme);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");

    // Set cookie with "forever" expiration date (one year in the future)
    const expires = new Date();
    expires.setFullYear(expires.getFullYear() + 1); // Set cookie expiration to 1 year from now

    document.cookie = `theme=${newTheme}; path=/; expires=${expires.toUTCString()}; SameSite=Strict`;
  };

  useEffect(() => {
    // Check if there's an existing theme in cookies, otherwise use the passed initialTheme
    const getCookie = (name: string) => {
      const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
      if (match) return match[2];
      return null;
    };

    const savedTheme = getCookie("theme");
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    } else {
      document.documentElement.classList.toggle("dark", initialTheme === "dark");
    }
  }, [initialTheme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
