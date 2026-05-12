import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { AppProvider } from './src/context/AppContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';
import { checkPinExists } from './src/utils/storage';
import { colors as fallbackColors } from './src/theme';

function AppShell() {
  const { theme } = useTheme();
  const colors = theme?.colors ?? fallbackColors;
  const [loading, setLoading] = useState(true);
  const [pinSetup, setPinSetup] = useState(false);

  useEffect(() => {
    const init = async () => {
      const exists = await checkPinExists();
      setPinSetup(exists);
      setLoading(false);
    };
    init();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <AppProvider>
      <AppNavigator pinSetup={pinSetup} />
    </AppProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppShell />
    </ThemeProvider>
  );
}
