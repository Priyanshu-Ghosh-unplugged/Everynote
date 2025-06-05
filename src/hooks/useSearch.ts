import { useState, useCallback } from 'react';
import { getDatabase } from '../services/database';
import { SQLTransaction, SQLResultSet, SQLError } from '../types';
import { Note } from './useNotes';

export const useSearch = () => {
  const [results, setResults] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchNotes = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const searchQuery = `%${query}%`;
      const db = getDatabase();

      db.transaction((tx: SQLTransaction) => {
        tx.executeSql(
          `SELECT * FROM notes 
           WHERE title LIKE ? OR content LIKE ?
           ORDER BY updated_at DESC`,
          [searchQuery, searchQuery],
          (_: SQLTransaction, { rows: { _array } }: SQLResultSet) => {
            setResults(_array as Note[]);
          },
          (_: SQLTransaction, error: SQLError) => {
            setError(error.message);
            return false;
          }
        );
      });
    } catch (err) {
      console.error('Error searching notes:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while searching');
    } finally {
      setLoading(false);
    }
  }, []);

  const clearSearch = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return {
    results,
    loading,
    error,
    searchNotes,
    clearSearch,
  };
}; 