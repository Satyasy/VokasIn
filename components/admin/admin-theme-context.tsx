"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type AdminTheme = "dark" | "light";

interface AdminThemeContextType {
  theme: AdminTheme;
  toggleTheme: () => void;
  collapsed: boolean;
  toggleSidebar: () => void;
}

const AdminThemeContext = createContext<AdminThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = "vokasin_admin_theme";
const SIDEBAR_STORAGE_KEY = "vokasin_admin_sidebar_collapsed";

export function AdminThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<AdminTheme>("dark");
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as AdminTheme | null;
      if (savedTheme === "light" || savedTheme === "dark") {
        setTheme(savedTheme);
      }
      const savedCollapsed = localStorage.getItem(SIDEBAR_STORAGE_KEY);
      if (savedCollapsed !== null) {
        setCollapsed(savedCollapsed === "true");
      }
    } catch {
      // localStorage fallback
    }
    setMounted(true);
  }, []);

  function toggleTheme() {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      try {
        localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch {}
      return next;
    });
  }

  function toggleSidebar() {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
      } catch {}
      return next;
    });
  }

  return (
    <AdminThemeContext.Provider value={{ theme, toggleTheme, collapsed, toggleSidebar }}>
      <div
        className={`admin-shell min-h-screen transition-colors duration-200 ${
          theme === "dark" ? "dark bg-slime-lime-950 text-neutral-100" : "bg-neutral-50 text-neutral-900"
        }`}
      >
        {children}
      </div>
    </AdminThemeContext.Provider>
  );
}

export function useAdminTheme() {
  const context = useContext(AdminThemeContext);
  if (!context) {
    throw new Error("useAdminTheme must be used within an AdminThemeProvider");
  }
  return context;
}
