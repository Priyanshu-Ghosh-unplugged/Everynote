import { useCallback } from 'react';
import ReactNativeHapticFeedback, {
  HapticFeedbackTypes,
  HapticOptions,
} from 'react-native-haptic-feedback';

const hapticOptions: HapticOptions = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

export const useHaptics = () => {
  const trigger = useCallback((type: HapticFeedbackTypes) => {
    ReactNativeHapticFeedback.trigger(type, hapticOptions);
  }, []);

  const light = useCallback(() => {
    trigger(HapticFeedbackTypes.soft);
  }, [trigger]);

  const medium = useCallback(() => {
    trigger(HapticFeedbackTypes.medium);
  }, [trigger]);

  const heavy = useCallback(() => {
    trigger(HapticFeedbackTypes.heavy);
  }, [trigger]);

  const success = useCallback(() => {
    trigger(HapticFeedbackTypes.success);
  }, [trigger]);

  const warning = useCallback(() => {
    trigger(HapticFeedbackTypes.warning);
  }, [trigger]);

  const error = useCallback(() => {
    trigger(HapticFeedbackTypes.error);
  }, [trigger]);

  const selection = useCallback(() => {
    trigger(HapticFeedbackTypes.selection);
  }, [trigger]);

  return {
    trigger,
    light,
    medium,
    heavy,
    success,
    warning,
    error,
    selection,
  };
}; 