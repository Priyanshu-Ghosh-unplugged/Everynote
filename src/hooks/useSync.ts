import { useState, useEffect } from 'react';
import { PowerSyncDatabase, Schema, Table, column, AbstractPowerSyncDatabase } from '@powersync/react-native';
import { useSettings } from './useSettings';
import { PowerSyncBackendConnector } from '@powersync/react-native';
import * as FileSystem from 'expo-file-system';
import { openDatabaseSync } from 'expo-sqlite';
import { getSecureValue, setSecureValue } from '../utils/secureStorage';
import * as Crypto from 'expo-crypto';

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

const generateEncryptionKey = async (): Promise<string> => {
  const randomBytes = await Crypto.getRandomBytesAsync(32);
  return Buffer.from(randomBytes).toString('base64');
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
            data: await database.getAll('SELECT * FROM notes'),
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
          notes: new Table({
            id: column.text,
            title: column.text,
            content: column.text,
            category_id: column.text,
            created_at: column.integer,
            updated_at: column.integer,
            deleted_at: column.integer,
            user_id: column.text,
            is_pinned: column.integer,
            is_archived: column.integer,
            sync_status: column.text,
          }),
          categories: new Table({
            id: column.text,
            name: column.text,
            color: column.text,
            created_at: column.integer,
            updated_at: column.integer,
            user_id: column.text,
            sync_status: column.text,
          }),
        });

        const dbPath = `${FileSystem.documentDirectory}everynote_kapybara.db`;
        
        // Get or generate encryption key
        let encryptionKey = await getSecureValue('db_encryption_key');
        if (!encryptionKey) {
          encryptionKey = await generateEncryptionKey();
          await setSecureValue('db_encryption_key', encryptionKey);
        }

        const db = new PowerSyncDatabase({
          schema: AppSchema,
          database: openDatabaseSync(dbPath),
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