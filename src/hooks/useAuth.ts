import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { User } from '../types';

WebBrowser.maybeCompleteAuthSession();

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: process.env.EXPO_GOOGLE_CLIENT_ID,
    iosClientId: process.env.IOS_GOOGLE_CLIENT_ID,
    androidClientId: process.env.ANDROID_GOOGLE_CLIENT_ID,
    webClientId: process.env.WEB_GOOGLE_CLIENT_ID,
  });

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      handleGoogleSignIn(authentication?.accessToken);
    }
  }, [response]);

  const loadUser = async () => {
    try {
      const userJson = await AsyncStorage.getItem('user');
      if (userJson) {
        setUser(JSON.parse(userJson));
      }
    } catch (err) {
      console.error('Error loading user:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async (accessToken: string | undefined) => {
    if (!accessToken) {
      setError('No access token received');
      return;
    }

    try {
      const response = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const userData = await response.json();
      if (!userData.id || !userData.email || !userData.name) {
        throw new Error('Invalid user data received');
      }

      const user: User = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        photo: userData.picture,
      };

      await AsyncStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      setError(null);
    } catch (err) {
      setError('Failed to get user info');
      console.error('Google Sign-In Error:', err);
    }
  };

  const signInWithGoogle = async () => {
    try {
      await promptAsync();
    } catch (err) {
      setError('Google sign-in failed');
      console.error('Google Sign-In Error:', err);
    }
  };

  const signInWithApple = async () => {
    // Placeholder for Apple Sign-In
    console.log('Apple Sign-In not implemented');
  };

  const signOut = async () => {
    try {
      await AsyncStorage.removeItem('user');
      setUser(null);
    } catch (err) {
      setError('Failed to sign out');
      console.error('Sign-Out Error:', err);
    }
  };

  const updateUserProfile = async (userId: string, updates: Partial<User>) => {
    try {
      if (!user) {
        throw new Error('No user logged in');
      }
      const updatedUser = { ...user, ...updates };
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (err) {
      setError('Failed to update profile');
      console.error('Profile Update Error:', err);
    }
  };

  return {
    user,
    loading,
    error,
    signInWithGoogle,
    signInWithApple,
    signOut,
    updateUserProfile,
  };
}; 