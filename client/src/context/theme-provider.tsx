'use client';

import * as React from 'react';
import { ThemeContext,type ThemeContextType } from './theme-context';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = React.useState<ThemeContextType['theme']>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as ThemeContextType['theme'];
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return savedTheme || (systemPrefersDark ? 'dark' : 'light');
    }
    return 'light';
  });

  const toggleTheme = () => {
    setTheme(prevTheme => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newTheme);
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
      return newTheme;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
