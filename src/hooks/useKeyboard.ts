import { useState, useEffect } from 'react';
import { Keyboard, KeyboardEvent, Platform } from 'react-native';

export const useKeyboard = () => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      handleKeyboardShow
    );
    const hideSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      handleKeyboardHide
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const handleKeyboardShow = (event: KeyboardEvent) => {
    setKeyboardHeight(event.endCoordinates.height);
    setIsKeyboardVisible(true);
  };

  const handleKeyboardHide = () => {
    setKeyboardHeight(0);
    setIsKeyboardVisible(false);
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return {
    keyboardHeight,
    isKeyboardVisible,
    dismissKeyboard,
  };
}; 