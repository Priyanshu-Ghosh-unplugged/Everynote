import { renderHook, act } from '@testing-library/react-hooks';
import { usePowerSync } from '../../src/hooks/usePowerSync';
import { useAuth } from '../../src/hooks/useAuth';
import { useNetworkStatus } from '../../src/hooks/useNetworkStatus';
import { useSettings } from '../../src/hooks/useSettings';
import {
  initializePowerSync,
  closePowerSync,
  createNote,
  updateNote,
  deleteNote,
  getNotes,
  createCategory,
  updateCategory,
  getCategories,
} from '../../src/services/powersync';

// Mock dependencies
jest.mock('../../src/hooks/useAuth');
jest.mock('../../src/hooks/useNetworkStatus');
jest.mock('../../src/hooks/useSettings');
jest.mock('../../src/services/powersync');

describe('usePowerSync', () => {
  const mockUser = { id: 'test-user-id', email: 'test@example.com' };
  const mockDb = {
    connect: jest.fn(),
    disconnect: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock hook dependencies
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });
    (useNetworkStatus as jest.Mock).mockReturnValue({ isConnected: true });
    (useSettings as jest.Mock).mockReturnValue({ settings: { syncEnabled: true } });

    // Mock PowerSync service
    (initializePowerSync as jest.Mock).mockResolvedValue(mockDb);
    (closePowerSync as jest.Mock).mockResolvedValue(undefined);
  });

  it('should initialize PowerSync when user is authenticated and sync is enabled', async () => {
    const { result, waitForNextUpdate } = renderHook(() => usePowerSync());

    await waitForNextUpdate();

    expect(initializePowerSync).toHaveBeenCalledWith(mockUser.id);
    expect(result.current.isInitialized).toBe(true);
    expect(result.current.error).toBe(null);
  });

  it('should not initialize PowerSync when sync is disabled', async () => {
    (useSettings as jest.Mock).mockReturnValue({ settings: { syncEnabled: false } });

    const { result } = renderHook(() => usePowerSync());

    expect(initializePowerSync).not.toHaveBeenCalled();
    expect(result.current.isInitialized).toBe(false);
  });

  it('should handle initialization error', async () => {
    const error = new Error('Initialization failed');
    (initializePowerSync as jest.Mock).mockRejectedValue(error);

    const { result, waitForNextUpdate } = renderHook(() => usePowerSync());

    await waitForNextUpdate();

    expect(result.current.isInitialized).toBe(false);
    expect(result.current.error).toBe('Initialization failed');
  });

  it('should connect/disconnect based on network status', async () => {
    const { rerender, waitForNextUpdate } = renderHook(() => usePowerSync());

    await waitForNextUpdate();

    // Initially connected
    expect(mockDb.connect).toHaveBeenCalled();

    // Simulate going offline
    (useNetworkStatus as jest.Mock).mockReturnValue({ isConnected: false });
    rerender();

    expect(mockDb.disconnect).toHaveBeenCalled();

    // Simulate going back online
    (useNetworkStatus as jest.Mock).mockReturnValue({ isConnected: true });
    rerender();

    expect(mockDb.connect).toHaveBeenCalledTimes(2);
  });

  describe('Note Operations', () => {
    const mockNote = {
      id: 'note-1',
      title: 'Test Note',
      content: 'Test Content',
      category_id: 'cat-1',
    };

    it('should create a note', async () => {
      const { result, waitForNextUpdate } = renderHook(() => usePowerSync());

      await waitForNextUpdate();

      await act(async () => {
        await result.current.addNote(mockNote);
      });

      expect(createNote).toHaveBeenCalledWith({
        ...mockNote,
        user_id: mockUser.id,
      });
    });

    it('should update a note', async () => {
      const { result, waitForNextUpdate } = renderHook(() => usePowerSync());

      await waitForNextUpdate();

      const updates = {
        id: 'note-1',
        title: 'Updated Title',
      };

      await act(async () => {
        await result.current.editNote(updates);
      });

      expect(updateNote).toHaveBeenCalledWith(updates);
    });

    it('should delete a note', async () => {
      const { result, waitForNextUpdate } = renderHook(() => usePowerSync());

      await waitForNextUpdate();

      await act(async () => {
        await result.current.removeNote('note-1');
      });

      expect(deleteNote).toHaveBeenCalledWith('note-1');
    });

    it('should fetch notes', async () => {
      const mockNotes = [
        { id: 'note-1', title: 'Note 1' },
        { id: 'note-2', title: 'Note 2' },
      ];
      (getNotes as jest.Mock).mockResolvedValue(mockNotes);

      const { result, waitForNextUpdate } = renderHook(() => usePowerSync());

      await waitForNextUpdate();

      let notes;
      await act(async () => {
        notes = await result.current.fetchNotes();
      });

      expect(getNotes).toHaveBeenCalledWith(mockUser.id);
      expect(notes).toEqual(mockNotes);
    });
  });

  describe('Category Operations', () => {
    const mockCategory = {
      id: 'cat-1',
      name: 'Test Category',
      color: '#FF0000',
    };

    it('should create a category', async () => {
      const { result, waitForNextUpdate } = renderHook(() => usePowerSync());

      await waitForNextUpdate();

      await act(async () => {
        await result.current.addCategory(mockCategory);
      });

      expect(createCategory).toHaveBeenCalledWith({
        ...mockCategory,
        user_id: mockUser.id,
      });
    });

    it('should update a category', async () => {
      const { result, waitForNextUpdate } = renderHook(() => usePowerSync());

      await waitForNextUpdate();

      const updates = {
        id: 'cat-1',
        name: 'Updated Category',
      };

      await act(async () => {
        await result.current.editCategory(updates);
      });

      expect(updateCategory).toHaveBeenCalledWith(updates);
    });

    it('should fetch categories', async () => {
      const mockCategories = [
        { id: 'cat-1', name: 'Category 1' },
        { id: 'cat-2', name: 'Category 2' },
      ];
      (getCategories as jest.Mock).mockResolvedValue(mockCategories);

      const { result, waitForNextUpdate } = renderHook(() => usePowerSync());

      await waitForNextUpdate();

      let categories;
      await act(async () => {
        categories = await result.current.fetchCategories();
      });

      expect(getCategories).toHaveBeenCalledWith(mockUser.id);
      expect(categories).toEqual(mockCategories);
    });
  });
}); 