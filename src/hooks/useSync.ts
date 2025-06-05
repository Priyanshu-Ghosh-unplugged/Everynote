import { useState, useEffect } from 'react';
import { PowerSyncDatabase, Schema, Table, column, AbstractPowerSyncDatabase, ColumnType } from '@powersync/react-native';
import { useSettings } from './useSettings';
import { PowerSyncBackendConnector } from '@powersync/react-native';
import * as FileSystem from 'expo-file-system';

interface User {
  id: string;
  email: string;
  name: string;
  photo?: string;
}

interface SyncState {
  isSyncing: boolean;
  lastSyncTime: Date | null;
  error: string | null;
}

interface PowerSyncConfig {
  endpoint: string;
  token: string;
}

const getPowerSyncConfig = (): PowerSyncConfig => {
  const endpoint = process.env.EXPO_PUBLIC_POWERSYNC_ENDPOINT;
  const token = process.env.EXPO_PUBLIC_POWERSYNC_TOKEN;

  if (!endpoint) {
    throw new Error('PowerSync endpoint is not configured. Please add EXPO_PUBLIC_POWERSYNC_ENDPOINT to your environment variables.');
  }

  if (!token) {
    throw new Error('PowerSync token is not configured. Please add EXPO_PUBLIC_POWERSYNC_TOKEN to your environment variables.');
  }

  return { endpoint, token };
};

export const useSync = (user: User | null): SyncState => {
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { settings } = useSettings();

  const connector: PowerSyncBackendConnector = {
    async fetchCredentials(): Promise<{ token: string; endpoint: string }> {
      if (!user) {
        throw new Error('User must be authenticated to sync');
      }
      
      try {
        const { endpoint, token } = getPowerSyncConfig();
        
        // Validate the token format
        if (!token.match(/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/)) {
          throw new Error('Invalid PowerSync token format');
        }

        return { token, endpoint };
      } catch (error) {
        console.error('Failed to fetch PowerSync credentials:', error);
        throw error;
      }
    },

    async uploadData(database: AbstractPowerSyncDatabase): Promise<void> {
      if (!user) {
        throw new Error('User must be authenticated to upload data');
      }

      try {
        const { endpoint, token } = getPowerSyncConfig();
        const response = await fetch(`${endpoint}/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
            data: await database.getAll(),
          }),
        });

        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`);
        }
      } catch (error) {
        console.error('Failed to upload data:', error);
        throw error;
      }
    }
  };

  useEffect(() => {
    if (!user || !settings.syncEnabled) {
      return;
    }

    const startSync = async (): Promise<void> => {
      try {
        setIsSyncing(true);
        setError(null);
        
        const AppSchema = new Schema({
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
        });

        const dbPath = `${FileSystem.documentDirectory}everynote_kapybara.db`;
        const db = new PowerSyncDatabase({
          schema: AppSchema,
          database: {
            name: dbPath,
          },
          sync: {
            endpoint: process.env.EXPO_PUBLIC_POWERSYNC_URL ?? '',
            token: process.env.EXPO_PUBLIC_POWERSYNC_TOKEN ?? '',
            userId: user.id,
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
        await db.connect(connector);
        setLastSyncTime(new Date());
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to sync';
        setError(errorMessage);
        console.error('Sync error:', error);
      } finally {
        setIsSyncing(false);
      }
    };

    void startSync();
  }, [user, settings.syncEnabled]);

  return {
    isSyncing,
    lastSyncTime,
    error,
  };
}; 