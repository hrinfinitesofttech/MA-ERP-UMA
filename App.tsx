import React, { useState } from 'react';
import { View } from 'react-native';
import { AnimatedSplash } from './src/components/common/AnimatedSplash';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './src/context/ThemeContext';
import { AuthProvider } from './src/context/AuthContext';
import { NotificationsProvider } from './src/context/NotificationsContext';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1 }}>
      <ThemeProvider>
        <AuthProvider>
          <NotificationsProvider>
            <AppNavigator />
          </NotificationsProvider>
        </AuthProvider>
      </ThemeProvider>
      {showSplash && <AnimatedSplash onFinish={() => setShowSplash(false)} />}
      </View>
    </SafeAreaProvider>
  );
}
