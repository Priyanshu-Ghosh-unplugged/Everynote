import { PowerSyncDatabase, Schema, Table, column } from '@powersync/react-native';
import { openDatabaseSync } from 'expo-sqlite';
import { User } from '../types';

let powerSyncDb: PowerSyncDatabase | null = null;

// Define PowerSync Schema
const AppSchema = new Schema({
  notes: new Table({
    id: column.text.primaryKey(),
    user_id: column.text,
    category_id: column.text,
    title: column.text,
    content: column.text,
    is_pinned: column.integer.default(0),
    is_archived: column.integer.default(0),
    metadata: column.text,
    created_at: column.integer,
    updated_at: column.integer,
  }),
  categories: new Table({
    id: column.text.primaryKey(),
    user_id: column.text,
    name: column.text,
    color: column.text,
    created_at: column.integer,
    updated_at: column.integer,
  }),
});

export const initializePowerSync = async (userId: string) => {
  if (powerSyncDb) {
    return powerSyncDb;
  }

  powerSyncDb = new PowerSyncDatabase({
    schema: AppSchema,
    database: {
      name: 'everynote_kapybara',
    },
    sync: {
      endpoint: process.env.POWERSYNC_URL || 'https://your-powersync-endpoint.com',
      token: process.env.POWERSYNC_TOKEN || 'your-token',
      userId,
    },
  });

  await powerSyncDb.init();
  return powerSyncDb;
};

export const closePowerSync = async () => {
  if (powerSyncDb) {
    await powerSyncDb.disconnect();
    powerSyncDb = null;
  }
};

// Note operations
export const createNote = async (note: {
  id: string;
  user_id: string;
  category_id?: string;
  title: string;
  content: string;
  is_pinned?: boolean;
  is_archived?: boolean;
  metadata?: string;
}) => {
  if (!powerSyncDb) throw new Error('PowerSync not initialized');

  const now = new Date().toISOString();
  await powerSyncDb.execute(
    `INSERT INTO notes (id, user_id, category_id, title, content, is_pinned, is_archived, metadata, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      note.id,
      note.user_id,
      note.category_id || null,
      note.title,
      note.content,
      note.is_pinned ? 1 : 0,
      note.is_archived ? 1 : 0,
      note.metadata || null,
      now,
      now,
    ]
  );
};

export const updateNote = async (note: {
  id: string;
  title?: string;
  content?: string;
  category_id?: string;
  is_pinned?: boolean;
  is_archived?: boolean;
  metadata?: string;
}) => {
  if (!powerSyncDb) throw new Error('PowerSync not initialized');

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
  if (note.category_id !== undefined) {
    updates.push('category_id = ?');
    values.push(note.category_id);
  }
  if (note.is_pinned !== undefined) {
    updates.push('is_pinned = ?');
    values.push(note.is_pinned ? 1 : 0);
  }
  if (note.is_archived !== undefined) {
    updates.push('is_archived = ?');
    values.push(note.is_archived ? 1 : 0);
  }
  if (note.metadata !== undefined) {
    updates.push('metadata = ?');
    values.push(note.metadata);
  }

  updates.push('updated_at = ?');
  values.push(new Date().toISOString());
  values.push(note.id);

  await powerSyncDb.execute(
    `UPDATE notes SET ${updates.join(', ')} WHERE id = ?`,
    values
  );
};

export const deleteNote = async (noteId: string) => {
  if (!powerSyncDb) throw new Error('PowerSync not initialized');
  await powerSyncDb.execute('DELETE FROM notes WHERE id = ?', [noteId]);
};

export const getNotes = async (userId: string) => {
  if (!powerSyncDb) throw new Error('PowerSync not initialized');
  return powerSyncDb.getAll(
    'SELECT * FROM notes WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  );
};

// Category operations
export const createCategory = async (category: {
  id: string;
  user_id: string;
  name: string;
  color: string;
}) => {
  if (!powerSyncDb) throw new Error('PowerSync not initialized');

  const now = new Date().toISOString();
  await powerSyncDb.execute(
    `INSERT INTO categories (id, user_id, name, color, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [category.id, category.user_id, category.name, category.color, now, now]
  );
};

export const updateCategory = async (category: {
  id: string;
  name?: string;
  color?: string;
}) => {
  if (!powerSyncDb) throw new Error('PowerSync not initialized');

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

  updates.push('updated_at = ?');
  values.push(new Date().toISOString());
  values.push(category.id);

  await powerSyncDb.execute(
    `UPDATE categories SET ${updates.join(', ')} WHERE id = ?`,
    values
  );
};

export const getCategories = async (userId: string) => {
  if (!powerSyncDb) throw new Error('PowerSync not initialized');
  return powerSyncDb.getAll(
    'SELECT * FROM categories WHERE user_id = ? ORDER BY name ASC',
    [userId]
  );
}; 