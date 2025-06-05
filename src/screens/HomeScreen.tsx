import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Text,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { RootStackParamList } from '../navigation/types';
import { COLORS, SPACING, FONTS } from '../constants/theme';
import { useCategories, Category } from '../hooks/useCategories';
import { SearchBar } from '../components/SearchBar';
import { CategorySelector } from '../components/CategorySelector';
import { NoteCard } from '../components/NoteCard';
import { useSync } from '../hooks/useSync';
import { useAuth } from '../hooks/useAuth';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { useTheme } from '../context/ThemeContext';
import { usePowerSync } from '../hooks/usePowerSync';
import { IconButton } from '../components/IconButton';
import Toast from 'react-native-toast-message';
import { Note } from '../types';
import Icon from 'react-native-vector-icons/Ionicons';

const avatar = require('../assets/avatar-placeholder.png');

type HomeScreenNavigationProp = DrawerNavigationProp<RootStackParamList, 'Home'>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { theme } = useTheme();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { categories } = useCategories();
  const { user } = useAuth();
  const { isSyncing, lastSyncTime, error: syncError } = useSync(user);
  const networkState = useNetworkStatus();
  const { fetchNotes, removeNote } = usePowerSync();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const allCategory: Category = {
    id: 'all',
    name: 'All',
    color: COLORS.primary,
    created_at: '',
  };

  const filteredNotes = notes.filter(note => {
    const matchesCategory = selectedCategory === 'All' || note.category === selectedCategory;
    const matchesSearch =
      note.title.toLowerCase().includes(search.toLowerCase()) ||
      note.content.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  useEffect(() => {
    loadNotes();
  }, [fetchNotes]);

  const loadNotes = async () => {
    try {
      setIsLoading(true);
      const fetchedNotes = await fetchNotes();
      setNotes(fetchedNotes as Note[]);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error loading notes',
        text2: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await removeNote(noteId);
      Toast.show({
        type: 'success',
        text1: 'Note deleted',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error deleting note',
        text2: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const renderStatus = () => {
    if (!networkState.isConnected) {
      return <Text style={styles.statusText}>Offline</Text>;
    }

    if (syncError) {
       return <Text style={styles.statusTextError}>Sync Error: {syncError}</Text>;
    }

    if (isSyncing) {
      return <Text style={styles.statusText}>Syncing...</Text>;
    }

    if (lastSyncTime) {
      return (
        <Text style={styles.statusText}>
          Last sync: {new Date(lastSyncTime).toLocaleTimeString()}
        </Text>
      );
    }

    return null;
  };

  const renderNote = ({ item }: { item: Note }) => (
    <NoteCard
      note={item}
      onPress={() => navigation.navigate('Note', { noteId: item.id })}
      onDelete={() => handleDeleteNote(item.id)}
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <IconButton
          icon="menu"
          onPress={() => navigation.openDrawer()}
          color={theme.text}
        />
        <View style={styles.searchContainer}>
          <SearchBar
            value={search}
            onChangeText={setSearch}
            onClear={() => setSearch('')}
            placeholder="Search your note"
          />
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Calendar')}>
          <Icon name="calendar-outline" size={24} color={theme.text} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('UserProfile')}>
          <Image source={avatar} style={styles.avatar} />
        </TouchableOpacity>
        <IconButton
          icon="plus"
          onPress={() => navigation.navigate('NoteEditor', {})}
          color={COLORS.primary}
        />
      </View>
      {renderStatus()}

      <CategorySelector
        categories={[allCategory, ...categories]}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />
      <FlatList
        data={filteredNotes}
        keyExtractor={item => item.id}
        renderItem={renderNote}
        contentContainerStyle={styles.list}
        refreshing={isLoading}
        onRefresh={loadNotes}
        ListEmptyComponent={(
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No notes found</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchContainer: {
    flex: 1,
    marginHorizontal: SPACING.md,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
  },
  list: {
    padding: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  emptyText: {
    ...FONTS.regular,
    color: COLORS.textSecondary,
    fontSize: 16,
  },
  statusText: {
    ...FONTS.regular,
    fontSize: 12,
    color: COLORS.textSecondary,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  statusTextError: {
    ...FONTS.regular,
    fontSize: 12,
    color: COLORS.error,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
  },
}); 