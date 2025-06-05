import SQLite, { SQLiteDatabase } from 'react-native-sqlite-storage';
import { PowerSyncDatabase } from '@powersync/react-native';
import { SQLTransaction } from '../types';
import { getSecureValue } from '../utils/secureStorage';

// Initialize SQLite
SQLite.enablePromise(true);

let database: SQLiteDatabase | null = null;

// Initialize database tables and return the database instance
export const initDatabase = async (): Promise<SQLiteDatabase> => {
  if (database) {
    return database;
  }

  try {
    const db = await SQLite.openDatabase({
      name: 'notes.db',
      location: 'default',
    });
    database = db;

    await db.transaction((tx: SQLTransaction) => {
      // Create notes table with proper constraints
      tx.executeSql(`
        CREATE TABLE IF NOT EXISTS notes (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          content TEXT NOT NULL,
          category_id TEXT NOT NULL,
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL,
          deleted_at INTEGER,
          user_id TEXT NOT NULL,
          is_pinned INTEGER DEFAULT 0,
          is_archived INTEGER DEFAULT 0,
          sync_status TEXT DEFAULT 'pending',
          FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
        );
      `);

      // Create categories table with proper constraints
      tx.executeSql(`
        CREATE TABLE IF NOT EXISTS categories (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          color TEXT NOT NULL,
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL,
          user_id TEXT NOT NULL,
          sync_status TEXT DEFAULT 'pending'
        );
      `);

      // Create indexes for better performance
      tx.executeSql('CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);');
      tx.executeSql('CREATE INDEX IF NOT EXISTS idx_notes_category ON notes(category_id);');
      tx.executeSql('CREATE INDEX IF NOT EXISTS idx_notes_created ON notes(created_at);');
      tx.executeSql('CREATE INDEX IF NOT EXISTS idx_notes_sync ON notes(sync_status);');
      tx.executeSql('CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);');
      tx.executeSql('CREATE INDEX IF NOT EXISTS idx_categories_sync ON categories(sync_status);');

      // Insert default categories if they don't exist
      tx.executeSql(`
        INSERT OR IGNORE INTO categories (id, name, color, created_at, updated_at, user_id)
        VALUES 
          ('1', 'All', '#000000', strftime('%s', 'now'), strftime('%s', 'now'), 'system'),
          ('2', 'Work', '#FF3B30', strftime('%s', 'now'), strftime('%s', 'now'), 'system'),
          ('3', 'Personal', '#34C759', strftime('%s', 'now'), strftime('%s', 'now'), 'system'),
          ('4', 'Ideas', '#007AFF', strftime('%s', 'now'), strftime('%s', 'now'), 'system');
      `);
    });

    return db;
  } catch (error) {
    console.error('Error initializing database:', error);
    throw new Error('Failed to initialize database. Please try again.');
  }
};

// Get database instance with error handling
export const getDatabase = (): SQLiteDatabase => {
  if (!database) {
    throw new Error('Database not initialized. Please call initDatabase first.');
  }
  return database;
};

// Helper function to execute database operations with proper error handling
export const executeQuery = async <T>(
  query: string,
  params: any[] = []
): Promise<T[]> => {
  try {
    const db = getDatabase();
    const [results] = await db.executeSql(query, params);
    const items: T[] = [];
    for (let i = 0; i < results.rows.length; i++) {
      items.push(results.rows.item(i));
    }
    return items;
  } catch (error) {
    console.error('Error executing query:', error);
    throw new Error('Database operation failed. Please try again.');
  }
};

// Helper function to execute database transactions
export const executeTransaction = async <T>(
  callback: (tx: SQLTransaction) => Promise<T>
): Promise<T> => {
  try {
    const db = getDatabase();
    let result: T;
    await db.transaction(async (tx) => {
      result = await callback(tx);
    });
    return result!;
  } catch (error) {
    console.error('Error executing transaction:', error);
    throw new Error('Database transaction failed. Please try again.');
  }
}; 