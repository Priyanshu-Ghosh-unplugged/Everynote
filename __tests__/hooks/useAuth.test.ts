import { renderHook, act } from '@testing-library/react-hooks';
import { useAuth } from '../../src/hooks/useAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { initDatabase } from '../../src/services/database';

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage');
jest.mock('@react-native-google-signin/google-signin');
jest.mock('../../src/services/database');

describe('useAuth', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    (AsyncStorage.getItem as jest.Mock).mockClear();
    (AsyncStorage.setItem as jest.Mock).mockClear();
    (AsyncStorage.removeItem as jest.Mock).mockClear();
    (GoogleSignin.hasPlayServices as jest.Mock).mockClear();
    (GoogleSignin.signIn as jest.Mock).mockClear();
    (GoogleSignin.signOut as jest.Mock).mockClear();
    (initDatabase as jest.Mock).mockClear();

    // Default mock implementations
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null); // No saved user by default
    (GoogleSignin.hasPlayServices as jest.Mock).mockResolvedValue(true);
    (GoogleSignin.configure as jest.Mock).mockImplementation(() => {}); // Mock configure
    (initDatabase as jest.Mock).mockResolvedValue(undefined);
  });

  test('should initialize with loading true and no user', () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.user).toBe(null);
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBe(null);
  });

  test('should check for existing user session on mount', async () => {
    const mockUser = { id: '123', email: 'test@example.com', name: 'Test User' };
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockUser));

    const { result, waitForNextUpdate } = renderHook(() => useAuth());

    await waitForNextUpdate(); // Wait for checkUserSession to complete

    expect(result.current.loading).toBe(false);
    expect(result.current.user).toEqual(mockUser);
    expect(AsyncStorage.getItem).toHaveBeenCalledWith('user');
  });

  test('should sign in with Google successfully', async () => {
    const googleUserInfo = {
      id: 'google-123',
      user: {
        email: 'google@example.com',
        name: 'Google User',
        photo: 'photo.jpg',
      },
    };
    (GoogleSignin.signIn as jest.Mock).mockResolvedValue(googleUserInfo);

    const { result, waitForNextUpdate } = renderHook(() => useAuth());

    await act(async () => {
      result.current.signInWithGoogle();
    });

    // Wait for loading to become false after sign in
    await waitForNextUpdate();

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.user).toEqual({
      id: googleUserInfo.id,
      email: googleUserInfo.user.email,
      name: googleUserInfo.user.name,
      photo: googleUserInfo.user.photo,
    });
    expect(GoogleSignin.hasPlayServices).toHaveBeenCalled();
    expect(GoogleSignin.signIn).toHaveBeenCalled();
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      'user',
      JSON.stringify({
         id: googleUserInfo.id,
         email: googleUserInfo.user.email,
         name: googleUserInfo.user.name,
         photo: googleUserInfo.user.photo,
      }),
    );
    expect(initDatabase).toHaveBeenCalled();
  });

  test('should handle Google sign-in failure', async () => {
    const errorMessage = 'Google sign in failed';
    (GoogleSignin.hasPlayServices as jest.Mock).mockRejectedValue(new Error(errorMessage));

    const { result, waitForNextUpdate } = renderHook(() => useAuth());

    await act(async () => {
      result.current.signInWithGoogle();
    });

    // Wait for loading to become false after sign in attempt
    await waitForNextUpdate();

    expect(result.current.loading).toBe(false);
    expect(result.current.user).toBe(null);
    expect(result.current.error).toBe(errorMessage);
    expect(GoogleSignin.hasPlayServices).toHaveBeenCalled();
    expect(GoogleSignin.signIn).not.toHaveBeenCalled(); // Should not call signIn if hasPlayServices fails
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    expect(initDatabase).not.toHaveBeenCalled();
  });

  test('should sign out successfully', async () => {
    // Start with a logged-in user
    const mockUser = { id: '123', email: 'test@example.com', name: 'Test User' };
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockUser));

    const { result, waitForNextUpdate } = renderHook(() => useAuth());

    await waitForNextUpdate(); // Wait for initial session check

    expect(result.current.user).toEqual(mockUser); // Verify user is initially loaded

    await act(async () => {
      result.current.signOut();
    });

     // Wait for loading to become false after sign out
     await waitForNextUpdate();

    expect(result.current.loading).toBe(false);
    expect(result.current.user).toBe(null);
    expect(result.current.error).toBe(null);
    expect(GoogleSignin.signOut).toHaveBeenCalled();
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('user');
  });

  test('should handle sign out failure', async () => {
     // Start with a logged-in user
    const mockUser = { id: '123', email: 'test@example.com', name: 'Test User' };
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockUser));

    const { result, waitForNextUpdate } = renderHook(() => useAuth());

    await waitForNextUpdate(); // Wait for initial session check

    expect(result.current.user).toEqual(mockUser); // Verify user is initially loaded

    const errorMessage = 'Sign out failed';
    (GoogleSignin.signOut as jest.Mock).mockRejectedValue(new Error(errorMessage));

    await act(async () => {
      result.current.signOut();
    });

    // Wait for loading to become false after sign out attempt
    await waitForNextUpdate();

    expect(result.current.loading).toBe(false);
    // Depending on desired behavior, user might remain if sign out fails.
    // Current implementation sets user to null regardless of GoogleSignin.signOut result.
    expect(result.current.user).toBe(null);
    expect(result.current.error).toBe(errorMessage);
    expect(GoogleSignin.signOut).toHaveBeenCalled();
    // AsyncStorage.removeItem might still be called even if GoogleSignin.signOut fails,
    // depending on the implementation logic. Assuming it is called in a finally or after signOut attempt.
     expect(AsyncStorage.removeItem).toHaveBeenCalledWith('user');
  });
}); 