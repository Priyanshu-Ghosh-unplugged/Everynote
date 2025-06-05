/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect, useState, useRef } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { initPowerSync } from './src/config/powersync';
import AppNavigator from './src/navigation/AppNavigator';
import { configureGoogleSignIn } from './src/config/google';
import { initDatabase } from './src/services/database';
import { useSettings } from './src/hooks/useSettings';
import { useBiometrics } from './src/hooks/useBiometrics';
import { NetworkStatusBar } from './src/components/NetworkStatusBar';
import { View, ActivityIndicator, StyleSheet, Text, TouchableOpacity, AppState, AppStateStatus } from 'react-native';
import { COLORS } from './src/constants/theme';
import Toast from 'react-native-toast-message';
import { GlobalErrorBoundary } from './src/components/GlobalErrorBoundary';
import usePushNotifications from './src/hooks/usePushNotifications';

const App = () => {
  const { settings, updateSettings } = useSettings();
  const { biometricState, checkBiometrics, authenticate } = useBiometrics();
  const [isBiometricAuthenticated, setIsBiometricAuthenticated] = useState(false);
  const [biometricLoading, setBiometricLoading] = useState(true);
  const [biometricError, setBiometricError] = useState<string | null>(null);

  const appState = useRef(AppState.currentState);

  useEffect(() => {
    configureGoogleSignIn();
    initDatabase();
  }, []);

  const handleBiometricCheck = async () => {
    if (!settings.biometricEnabled) {
      setIsBiometricAuthenticated(true);
      setBiometricLoading(false);
      setBiometricError(null);
      return;
    }

    setBiometricLoading(true);
    setBiometricError(null);

    const available = await checkBiometrics();

    if (available && biometricState.enrolled) {
      const authenticated = await authenticate('Authenticate to access app');
      setIsBiometricAuthenticated(authenticated);
      if (!authenticated) {
         setBiometricError('Biometric authentication failed. Please try again.');
      } else {
         setBiometricError(null); // Clear error on success
      }
    } else {
      // If biometrics enabled but not available or enrolled, prevent access
      setIsBiometricAuthenticated(false); 
       if (!available) {
        setBiometricError('Biometric authentication is not available on this device.');
      } else if (!biometricState.enrolled) {
        setBiometricError('Please set up biometrics in your device settings to enable this feature.');
         // Optionally disable the setting if not enrolled and cannot authenticate
        if (settings.biometricEnabled) {
            // This might be better handled by informing the user in settings and not auto-disabling
           // updateSettings({ biometricEnabled: false });
        }
      }
    }
    setBiometricLoading(false);
  };

  useEffect(() => {
    handleBiometricCheck();
  }, [settings.biometricEnabled, biometricState.available, biometricState.enrolled]); // Re-run if biometric state changes

   useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active' &&
        settings.biometricEnabled
      ) {
        console.log('App has come to the foreground - triggering biometric check');
        // Trigger re-authentication check when app comes to foreground
        // We can reuse the existing handleBiometricCheck logic or a simplified version
         handleBiometricCheck();
      }

      appState.current = nextAppState;
    };

    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      appStateSubscription.remove();
    };
  }, [settings.biometricEnabled, biometricState.available, biometricState.enrolled, authenticate, checkBiometrics]); // Dependencies for the effect

  const retryBiometricAuthentication = async () => {
      setBiometricLoading(true);
      setBiometricError(null);
       const authenticated = await authenticate('Authenticate to access app');
       setIsBiometricAuthenticated(authenticated);
       if (!authenticated) {
           setBiometricError('Biometric authentication failed. Please try again.');
       } else {
           setBiometricError(null); // Clear error on success
       }
       setBiometricLoading(false);
  };

  // Initialize push notifications
  usePushNotifications();

  if (biometricLoading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        {settings.biometricEnabled && <Text style={styles.loadingText}>Authenticating...</Text>}
      </View>
    );
  }

  if (!isBiometricAuthenticated && settings.biometricEnabled) {
      // Handle case where authentication failed and setting is enabled
      return (
          <View style={styles.centeredContainer}>
              <Text style={styles.errorText}>{biometricError || 'Biometric authentication is required to access the app.'}</Text>
               {biometricState.available && biometricState.enrolled && settings.biometricEnabled && (
                 <TouchableOpacity style={styles.retryButton} onPress={retryBiometricAuthentication}>
                    <Text style={styles.retryButtonText}>Retry Authentication</Text>
                 </TouchableOpacity>
               )}
          </View>
      );
  }

  return (
    <GlobalErrorBoundary>
      <SafeAreaProvider>
        <NetworkStatusBar />
        <AppNavigator />
        <Toast />
      </SafeAreaProvider>
    </GlobalErrorBoundary>
  );
};

const styles = StyleSheet.create({
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 20,
  },
   loadingText: {
    marginTop: 10,
    color: COLORS.text,
   },
   errorText: {
     marginTop: 10,
     color: COLORS.error,
     textAlign: 'center',
     marginHorizontal: 20,
     fontSize: 16,
   },
   retryButton: {
     marginTop: 20,
     backgroundColor: COLORS.primary,
     paddingVertical: 10,
     paddingHorizontal: 20,
     borderRadius: 8,
   },
    retryButtonText: {
      color: COLORS.background,
      fontSize: 16,
      fontWeight: 'bold',
    },
});

export default App;
