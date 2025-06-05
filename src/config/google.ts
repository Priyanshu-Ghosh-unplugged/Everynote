import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { Platform } from 'react-native';

const getGoogleClientId = () => {
  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
  const androidClientId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;

  if (!webClientId) {
    throw new Error('Google Web Client ID is not configured. Please add EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID to your environment variables.');
  }

  if (Platform.OS === 'ios' && !iosClientId) {
    throw new Error('Google iOS Client ID is not configured. Please add EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID to your environment variables.');
  }

  if (Platform.OS === 'android' && !androidClientId) {
    throw new Error('Google Android Client ID is not configured. Please add EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID to your environment variables.');
  }

  return {
    webClientId,
    iosClientId,
    androidClientId,
  };
};

export const configureGoogleSignIn = () => {
  try {
    const { webClientId, iosClientId } = getGoogleClientId();

    GoogleSignin.configure({
      webClientId,
      iosClientId,
      offlineAccess: true, // Enable offline access for refresh tokens
      forceCodeForRefreshToken: true, // Force code for refresh token
    });
  } catch (error) {
    console.error('Failed to configure Google Sign-In:', error);
    throw error;
  }
}; 