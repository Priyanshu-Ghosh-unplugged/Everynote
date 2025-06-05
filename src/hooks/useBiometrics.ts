import { useState, useCallback } from 'react';
import ReactNativeBiometrics, { BiometryTypes, BiometryType } from 'react-native-biometrics';

export interface BiometricState {
  available: boolean;
  type: typeof BiometryTypes[keyof typeof BiometryTypes] | null;
  enrolled: boolean;
}

export const useBiometrics = () => {
  const [biometricState, setBiometricState] = useState<BiometricState>({
    available: false,
    type: null,
    enrolled: false,
  });

  const rnBiometrics = new ReactNativeBiometrics();

  const checkBiometrics = useCallback(async () => {
    try {
      const { available, biometryType } = await rnBiometrics.isSensorAvailable();

      let enrolled = false;
      if (available) {
        // Attempt a simple prompt to check if biometrics are enrolled
        // This is a common way to check enrollment as there isn't a direct method
        try {
          const { success } = await rnBiometrics.simplePrompt({
            promptMessage: 'Check if biometrics are enrolled', // A less intrusive message
            cancelButtonText: 'Cancel',
          });
           enrolled = success; // If prompt is successful, assume enrolled
        } catch (promptError) {
           console.log('Biometric prompt failed during enrollment check:', promptError);
           // If prompt fails (e.g., no biometrics enrolled, user cancels), enrolled is false
           enrolled = false;
        }
      }

      setBiometricState({
        available,
        type: biometryType === undefined ? null : biometryType,
        enrolled,
      });

      return available && enrolled;
    } catch (error) {
      console.error('Error checking biometrics availability and enrollment:', error);
      setBiometricState({
        available: false,
        type: null,
        enrolled: false,
      });
      return false;
    }
  }, []);

  const authenticate = useCallback(async (promptMessage: string = 'Authenticate to continue') => {
    try {
      const { success } = await rnBiometrics.simplePrompt({
        promptMessage,
        cancelButtonText: 'Cancel',
      });
      return success;
    } catch (error) {
      console.error('Error during biometric authentication:', error);
      return false;
    }
  }, []);

  const createKeys = useCallback(async () => {
    try {
      const { publicKey } = await rnBiometrics.createKeys();
      return publicKey;
    } catch (error) {
      console.error('Error creating biometric keys:', error);
      return null;
    }
  }, []);

  const deleteKeys = useCallback(async () => {
    try {
      await rnBiometrics.deleteKeys();
      return true;
    } catch (error) {
      console.error('Error deleting biometric keys:', error);
      return false;
    }
  }, []);

  return {
    biometricState,
    checkBiometrics,
    authenticate,
    createKeys,
    deleteKeys,
  };
}; 