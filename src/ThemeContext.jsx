import React, { useState, useEffect } from 'react';
import { createTheme } from '@mui/material/styles';
import { ThemeContext } from './ThemeContext.js';

// Add this import for Capacitor bridge
let SystemBar;
try {
  // Only import if running in a Capacitor environment
  SystemBar = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.SystemBar;
} catch {
  // Ignore error if Capacitor is not available
}

export function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(true);



  // Update Android system bar style if bridge is available
  useEffect(() => {
    if (SystemBar && SystemBar.setSystemBarStyle) {
      SystemBar.setSystemBarStyle({ mode: darkMode ? 'dark' : 'light' });
    }
  }, [darkMode]);



  // Create theme based on darkMode
  const theme = createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: '#2196f3',
      },
      secondary: {
        main: '#ff9800',
      },
      background: {
        default: '#121212',
        paper: '#1e1e1e',
      },
      text: {
        primary: '#ffffff',
        secondary: '#b0b0b0',
      },
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: '#1e1e1e',
            color: '#ffffff',
          },
        },
      },
    },
  });

  const value = {
    darkMode,
    theme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
} 