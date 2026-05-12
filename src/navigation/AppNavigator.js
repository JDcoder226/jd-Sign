import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { colors as fallbackColors } from '../theme';

import PinSetupScreen from '../screens/PinSetupScreen';
import PinLockScreen from '../screens/PinLockScreen';
import HomeScreen from '../screens/HomeScreen';
import GeneratorScreen from '../screens/GeneratorScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator({ pinSetup }) {
  const { isUnlocked } = useApp();
  const { theme } = useTheme();
  const colors = theme?.colors ?? fallbackColors;
  const initialRouteName = !pinSetup ? 'PinSetup' : isUnlocked ? 'Home' : 'PinLock';

  return (
    <NavigationContainer>
      <Stack.Navigator
        key={`${pinSetup}-${isUnlocked}`}
        initialRouteName={initialRouteName}
        screenOptions={{
          headerStyle: { backgroundColor: colors.bg },
          headerTintColor: colors.accent,
          headerTitleStyle: { color: colors.text, fontSize: 18, fontWeight: '600' },
          headerShadowVisible: false,
          headerBackTitle: '',
          animationEnabled: true,
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        {!pinSetup ? (
          <Stack.Screen
            name="PinSetup"
            component={PinSetupScreen}
            options={{ headerShown: false }}
          />
        ) : (
          <>
            <Stack.Screen
              name="PinLock"
              component={PinLockScreen}
              options={{ headerShown: false, animationEnabled: false }}
            />
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Generator"
              component={GeneratorScreen}
              options={{ title: 'Détails du Service' }}
            />
            <Stack.Screen
              name="Settings"
              component={SettingsScreen}
              options={{ title: 'Paramètres' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
