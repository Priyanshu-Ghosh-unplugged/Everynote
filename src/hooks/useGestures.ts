import { useCallback } from 'react';
import {
  GestureResponderEvent,
  PanResponder,
  PanResponderGestureState,
  PanResponderInstance,
} from 'react-native';

interface GestureCallbacks {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onTap?: () => void;
  onLongPress?: () => void;
}

export const useGestures = (callbacks: GestureCallbacks) => {
  const handlePanResponderMove = useCallback((
    _: GestureResponderEvent,
    gestureState: PanResponderGestureState
  ) => {
    const { dx, dy } = gestureState;
    const SWIPE_THRESHOLD = 50;

    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > SWIPE_THRESHOLD) {
        callbacks.onSwipeRight?.();
      } else if (dx < -SWIPE_THRESHOLD) {
        callbacks.onSwipeLeft?.();
      }
    } else {
      if (dy > SWIPE_THRESHOLD) {
        callbacks.onSwipeDown?.();
      } else if (dy < -SWIPE_THRESHOLD) {
        callbacks.onSwipeUp?.();
      }
    }
  }, [callbacks]);

  const panResponder: PanResponderInstance = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      // Handle tap gesture
      callbacks.onTap?.();
    },
    onPanResponderMove: handlePanResponderMove,
    onPanResponderRelease: () => {
      // Handle long press gesture
      callbacks.onLongPress?.();
    },
  });

  return {
    panResponder,
  };
}; 