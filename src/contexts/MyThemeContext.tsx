import { AppTheme, darkTheme, lightTheme } from "@/theme";
import { createContext, useContext, useEffect, useState } from "react";
import { Appearance } from "react-native";

const MyThemeContext = createContext<AppTheme | undefined>(undefined);

interface ThemeProviderProps {
   children: React.ReactNode;
}

export const MyThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
   const [colorScheme, setColorScheme] = useState(Appearance.getColorScheme());

   useEffect(() => {
      const subscription = Appearance.addChangeListener(({ colorScheme }) => {
         setColorScheme(colorScheme);
      });

      return () => subscription.remove();
   }, []);

   const currentTheme = colorScheme === 'dark' ? darkTheme : lightTheme;

   return (
      <MyThemeContext.Provider value={currentTheme} >
         {children}
      </MyThemeContext.Provider>
   );
}

export const useMyTheme = (): AppTheme => {
   const theme = useContext(MyThemeContext);

   if (!theme) {
      throw new Error('useMyTheme must be used within a MyThemeProvider');
   }

   return theme;
}