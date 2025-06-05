import { PowerSyncDatabase, Schema, ColumnType } from '@powersync/react-native';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { getSecureValue, setSecureValue } from '../utils/secureStorage';

// Define the schema for our database
export const schema: Schema = {
  version: 1,
  tables: [
    {
      name: 'notes',
      columns: [
        { name: 'id', type: ColumnType.TEXT, primaryKey: true },
        { name: 'title', type: ColumnType.TEXT, nullable: false },
        { name: 'content', type: ColumnType.TEXT, nullable: false },
        { name: 'category_id', type: ColumnType.TEXT, nullable: false },
        { name: 'created_at', type: ColumnType.INTEGER, nullable: false },
        { name: 'updated_at', type: ColumnType.INTEGER, nullable: false },
        { name: 'deleted_at', type: ColumnType.INTEGER, nullable: true },
        { name: 'user_id', type: ColumnType.TEXT, nullable: false },
        { name: 'is_pinned', type: ColumnType.INTEGER, defaultValue: 0 },
        { name: 'is_archived', type: ColumnType.INTEGER, defaultValue: 0 },
        { name: 'sync_status', type: ColumnType.TEXT, defaultValue: 'pending' },
      ],
      indexes: [
        { name: 'idx_notes_user_id', columns: ['user_id'] },
        { name: 'idx_notes_category', columns: ['category_id'] },
        { name: 'idx_notes_created', columns: ['created_at'] },
        { name: 'idx_notes_sync', columns: ['sync_status'] },
      ],
      foreignKeys: [
        {
          columns: ['category_id'],
          reference: {
            table: 'categories',
            columns: ['id'],
          },
          onDelete: 'SET NULL',
        },
      ],
    },
    {
      name: 'categories',
      columns: [
        { name: 'id', type: ColumnType.TEXT, primaryKey: true },
        { name: 'name', type: ColumnType.TEXT, nullable: false },
        { name: 'color', type: ColumnType.TEXT, nullable: false },
        { name: 'created_at', type: ColumnType.INTEGER, nullable: false },
        { name: 'updated_at', type: ColumnType.INTEGER, nullable: false },
        { name: 'user_id', type: ColumnType.TEXT, nullable: false },
        { name: 'sync_status', type: ColumnType.TEXT, defaultValue: 'pending' },
      ],
      indexes: [
        { name: 'idx_categories_user_id', columns: ['user_id'] },
        { name: 'idx_categories_sync', columns: ['sync_status'] },
      ],
    },
  ],
};

// Get the database file path
const getDatabasePath = async () => {
  const dbName = 'everynote_kapybara.db';
  if (Platform.OS === 'ios') {
    return `${FileSystem.documentDirectory}${dbName}`;
  }
  return `${FileSystem.documentDirectory}${dbName}`;
};

// Initialize PowerSync database with proper error handling and encryption
export const initPowerSync = async (userId: string) => {
  try {
    const dbPath = await getDatabasePath();
    
    // Get or generate encryption key
    let encryptionKey = await getSecureValue('db_encryption_key');
    if (!encryptionKey) {
      encryptionKey = await generateEncryptionKey();
      await setSecureValue('db_encryption_key', encryptionKey);
    }

    const db = new PowerSyncDatabase({
      schema,
      database: {
        name: dbPath,
        encryptionKey,
      },
      sync: {
        endpoint: process.env.EXPO_PUBLIC_POWERSYNC_URL,
        token: process.env.EXPO_PUBLIC_POWERSYNC_TOKEN,
        userId,
        retryStrategy: {
          maxRetries: 3,
          backoffMs: 1000,
        },
        conflictResolution: {
          strategy: 'server-wins',
        },
      },
    });

    await db.init();
    return db;
  } catch (error) {
    console.error('Failed to initialize PowerSync:', error);
    throw new Error('Database initialization failed. Please try again.');
  }
};

// Generate a secure encryption key
const generateEncryptionKey = async () => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}; 