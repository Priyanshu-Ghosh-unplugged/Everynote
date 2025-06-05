import { useRef, useCallback } from 'react';
import { Animated, Easing } from 'react-native';

export const useAnimation = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const fadeIn = useCallback((duration: number = 300) => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const fadeOut = useCallback((duration: number = 300) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const scaleIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      damping: 10,
      mass: 1,
      stiffness: 100,
    }).start();
  }, [scaleAnim]);

  const scaleOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0,
      useNativeDriver: true,
      damping: 10,
      mass: 1,
      stiffness: 100,
    }).start();
  }, [scaleAnim]);

  const slideIn = useCallback((duration: number = 300) => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration,
      useNativeDriver: true,
      easing: Easing.out(Easing.cubic),
    }).start();
  }, [slideAnim]);

  const slideOut = useCallback((duration: number = 300) => {
    Animated.timing(slideAnim, {
      toValue: 100,
      duration,
      useNativeDriver: true,
      easing: Easing.in(Easing.cubic),
    }).start();
  }, [slideAnim]);

  const resetAnimations = useCallback(() => {
    fadeAnim.setValue(0);
    scaleAnim.setValue(1);
    slideAnim.setValue(0);
  }, [fadeAnim, scaleAnim, slideAnim]);

  return {
    fadeAnim,
    scaleAnim,
    slideAnim,
    fadeIn,
    fadeOut,
    scaleIn,
    scaleOut,
    slideIn,
    slideOut,
    resetAnimations,
  };
}; 