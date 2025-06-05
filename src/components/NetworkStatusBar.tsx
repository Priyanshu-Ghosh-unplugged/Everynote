import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { COLORS, SPACING, FONTS } from '../constants/theme';
import Icon from 'react-native-vector-icons/Ionicons';

export const NetworkStatusBar = () => {
  const networkStatus = useNetworkStatus();
  const [slideAnim] = React.useState(new Animated.Value(-50));

  React.useEffect(() => {
    if (!networkStatus.isConnected) {
      // Slide in when offline
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    } else {
      // Slide out when online
      Animated.spring(slideAnim, {
        toValue: -50,
        useNativeDriver: true,
      }).start();
    }
  }, [networkStatus.isConnected]);

  if (networkStatus.isConnected) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Icon name="cloud-offline" size={20} color={COLORS.background} />
      <Text style={styles.text}>You're offline</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.error,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xs,
    zIndex: 1000,
  },
  text: {
    ...FONTS.medium,
    color: COLORS.background,
    marginLeft: SPACING.xs,
    fontSize: 14,
  },
}); 