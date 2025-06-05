import { useState, useEffect } from 'react';
import { getDatabase, powerSync } from '../services/database';
import { SQLTransaction, SQLResultSet, SQLError } from '../types';

export interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  created_at: string;
  updated_at: string;
}

export const useNotes = (category?: string) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const query = category && category !== 'All'
        ? 'SELECT * FROM notes WHERE category = ? ORDER BY updated_at DESC'
        : 'SELECT * FROM notes ORDER BY updated_at DESC';
      
      const params = category && category !== 'All' ? [category] : [];
      
      const db = getDatabase();
      db.transaction((tx: SQLTransaction) => {
        tx.executeSql(
          query,
          params,
          (_: SQLTransaction, { rows: { _array } }: SQLResultSet) => {
            setNotes(_array as Note[]);
            setError(null);
          },
          (_: SQLTransaction, error: SQLError) => {
            setError(error.message);
            return false;
          }
        );
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const addNote = async (note: Omit<Note, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const id = Date.now().toString();
      const now = new Date().toISOString();
      
      await powerSync.execute(
        'INSERT INTO notes (id, title, content, category, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
        [id, note.title, note.content, note.category, now, now]
      );
      fetchNotes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const updateNote = async (id: string, note: Partial<Note>) => {
    try {
      const now = new Date().toISOString();
      const updates: string[] = [];
      const values: any[] = [];

      if (note.title !== undefined) {
        updates.push('title = ?');
        values.push(note.title);
      }
      if (note.content !== undefined) {
        updates.push('content = ?');
        values.push(note.content);
      }
      if (note.category !== undefined) {
        updates.push('category = ?');
        values.push(note.category);
      }
      updates.push('updated_at = ?');
      values.push(now);
      values.push(id);

      await powerSync.execute(
        `UPDATE notes SET ${updates.join(', ')} WHERE id = ?`,
        values
      );
      fetchNotes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const deleteNote = async (id: string) => {
    try {
      await powerSync.execute(
        'DELETE FROM notes WHERE id = ?',
        [id]
      );
      fetchNotes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [category]);

  return {
    notes,
    loading,
    error,
    addNote,
    updateNote,
    deleteNote,
    refreshNotes: fetchNotes,
  };
}; 