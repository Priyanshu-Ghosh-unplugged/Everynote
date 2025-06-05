import { renderHook } from '@testing-library/react-hooks';
import { useNetworkStatus } from '../../src/hooks/useNetworkStatus';
import NetInfo from '@react-native-community/netinfo';

// Mock NetInfo
jest.mock('@react-native-community/netinfo');

describe('useNetworkStatus', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test('should initialize with default values', () => {
    const { result } = renderHook(() => useNetworkStatus());

    expect(result.current).toEqual({
      isConnected: true,
      isInternetReachable: true,
      type: 'unknown',
      details: null,
    });
  });

  test('should update when network state changes', () => {
    const mockNetInfoState = {
      isConnected: false,
      isInternetReachable: false,
      type: 'none',
      details: null,
    };

    // Mock the fetch method
    (NetInfo.fetch as jest.Mock).mockResolvedValue(mockNetInfoState);

    // Mock the addEventListener method
    let listenerCallback: ((state: any) => void) | null = null;
    (NetInfo.addEventListener as jest.Mock).mockImplementation((callback) => {
      listenerCallback = callback;
      return () => {}; // Return unsubscribe function
    });

    const { result } = renderHook(() => useNetworkStatus());

    // Simulate network state change
    if (listenerCallback) {
      listenerCallback(mockNetInfoState);
    }

    expect(result.current).toEqual(mockNetInfoState);
  });

  test('should handle network state with null values', () => {
    const mockNetInfoState = {
      isConnected: null,
      isInternetReachable: null,
      type: 'unknown',
      details: null,
    };

    (NetInfo.fetch as jest.Mock).mockResolvedValue(mockNetInfoState);

    let listenerCallback: ((state: any) => void) | null = null;
    (NetInfo.addEventListener as jest.Mock).mockImplementation((callback) => {
      listenerCallback = callback;
      return () => {};
    });

    const { result } = renderHook(() => useNetworkStatus());

    if (listenerCallback) {
      listenerCallback(mockNetInfoState);
    }

    expect(result.current.isConnected).toBe(false); // Should default to false when null
    expect(result.current.isInternetReachable).toBe(null);
    expect(result.current.type).toBe('unknown');
  });

  test('should clean up event listener on unmount', () => {
    const unsubscribe = jest.fn();
    (NetInfo.addEventListener as jest.Mock).mockReturnValue(unsubscribe);

    const { unmount } = renderHook(() => useNetworkStatus());

    unmount();

    expect(unsubscribe).toHaveBeenCalled();
  });
}); 