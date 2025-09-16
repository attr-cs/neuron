// src/components/theme-provider.jsx
'use client';

import { createContext, useContext, useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { themeState } from '@/store/atoms';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const theme = useRecoilValue(themeState);

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    document.body.className = ''; // reset any old classes
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);