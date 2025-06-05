import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { useNetworkStatus } from './useNetworkStatus';
import { useSettings } from './useSettings';
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
} from '../services/powersync';
import { PowerSyncDatabase } from '@powersync/react-native';

export const usePowerSync = () => {
  const { user } = useAuth();
  const { isConnected } = useNetworkStatus();
  const { settings } = useSettings();
  const [db, setDb] = useState<PowerSyncDatabase | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize PowerSync when user is authenticated
  useEffect(() => {
    const init = async () => {
      if (user && settings.syncEnabled) {
        try {
          const powerSyncDb = await initializePowerSync(user.id);
          setDb(powerSyncDb);
          setIsInitialized(true);
          setError(null);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to initialize sync');
          setIsInitialized(false);
        }
      }
    };

    init();

    return () => {
      if (db) {
        closePowerSync();
        setDb(null);
        setIsInitialized(false);
      }
    };
  }, [user, settings.syncEnabled]);

  // Handle sync status based on network connectivity
  useEffect(() => {
    if (db) {
      if (isConnected && settings.syncEnabled) {
        db.connect({
          endpoint: process.env.POWERSYNC_URL || 'https://your-powersync-endpoint.com',
          token: process.env.POWERSYNC_TOKEN || 'your-token',
        });
      } else {
        db.disconnect();
      }
    }
  }, [db, isConnected, settings.syncEnabled]);

  const handleNoteOperation = useCallback(async <T>(
    operation: () => Promise<T>,
    errorMessage: string
  ): Promise<T> => {
    if (!isInitialized || !settings.syncEnabled) {
      throw new Error('Sync is not enabled or initialized');
    }

    try {
      return await operation();
    } catch (err) {
      const message = err instanceof Error ? err.message : errorMessage;
      setError(message);
      throw err;
    }
  }, [isInitialized, settings.syncEnabled]);

  // Note operations
  const addNote = useCallback(async (note: {
    id: string;
    title: string;
    content: string;
    category_id: string;
  }) => {
    if (!user) throw new Error('User not authenticated');
    return handleNoteOperation(
      () => createNote({ ...note, user_id: user.id }),
      'Failed to create note'
    );
  }, [user, handleNoteOperation]);

  const editNote = useCallback(async (note: {
    id: string;
    title?: string;
    content?: string;
    category_id?: string;
    is_pinned?: boolean;
    is_archived?: boolean;
  }) => {
    return handleNoteOperation(
      () => updateNote(note),
      'Failed to update note'
    );
  }, [handleNoteOperation]);

  const removeNote = useCallback(async (noteId: string) => {
    return handleNoteOperation(
      () => deleteNote(noteId),
      'Failed to delete note'
    );
  }, [handleNoteOperation]);

  const fetchNotes = useCallback(async () => {
    if (!user) throw new Error('User not authenticated');
    return handleNoteOperation(
      () => getNotes(user.id),
      'Failed to fetch notes'
    );
  }, [user, handleNoteOperation]);

  // Category operations
  const addCategory = useCallback(async (category: {
    id: string;
    name: string;
    color: string;
  }) => {
    if (!user) throw new Error('User not authenticated');
    return handleNoteOperation(
      () => createCategory({ ...category, user_id: user.id }),
      'Failed to create category'
    );
  }, [user, handleNoteOperation]);

  const editCategory = useCallback(async (category: {
    id: string;
    name?: string;
    color?: string;
  }) => {
    return handleNoteOperation(
      () => updateCategory(category),
      'Failed to update category'
    );
  }, [handleNoteOperation]);

  const fetchCategories = useCallback(async () => {
    if (!user) throw new Error('User not authenticated');
    return handleNoteOperation(
      () => getCategories(user.id),
      'Failed to fetch categories'
    );
  }, [user, handleNoteOperation]);

  return {
    isInitialized,
    error,
    addNote,
    editNote,
    removeNote,
    fetchNotes,
    addCategory,
    editCategory,
    fetchCategories,
  };
}; 