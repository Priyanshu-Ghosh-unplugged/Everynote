import { useState, useEffect } from 'react';
import { getDatabase, powerSync } from '../services/database';
import { SQLTransaction, SQLResultSet, SQLError } from '../types';

export interface Category {
  id: string;
  name: string;
  color: string;
  created_at: string;
}

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const db = getDatabase();
      db.transaction((tx: SQLTransaction) => {
        tx.executeSql(
          'SELECT * FROM categories ORDER BY name ASC',
          [],
          (_: SQLTransaction, { rows: { _array } }: SQLResultSet) => {
            setCategories(_array as Category[]);
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

  const addCategory = async (category: Omit<Category, 'id' | 'created_at'>) => {
    try {
      const id = Date.now().toString();
      const now = new Date().toISOString();
      
      await powerSync.execute(
        'INSERT INTO categories (id, name, color, created_at) VALUES (?, ?, ?, ?)',
        [id, category.name, category.color, now]
      );
      fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const updateCategory = async (id: string, category: Partial<Category>) => {
    try {
      const updates: string[] = [];
      const values: any[] = [];

      if (category.name !== undefined) {
        updates.push('name = ?');
        values.push(category.name);
      }
      if (category.color !== undefined) {
        updates.push('color = ?');
        values.push(category.color);
      }
      values.push(id);

      await powerSync.execute(
        `UPDATE categories SET ${updates.join(', ')} WHERE id = ?`,
        values
      );
      fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await powerSync.execute(
        'DELETE FROM categories WHERE id = ?',
        [id]
      );
      fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    loading,
    error,
    addCategory,
    updateCategory,
    deleteCategory,
    refreshCategories: fetchCategories,
  };
}; 