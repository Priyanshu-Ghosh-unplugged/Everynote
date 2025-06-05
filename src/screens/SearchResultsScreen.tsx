import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { COLORS, SPACING, FONTS } from '../constants/theme';
import { useSearch } from '../hooks/useSearch';
import { Note } from '../types';
import Icon from 'react-native-vector-icons/Ionicons';
import { NoteCard } from '../components/NoteCard';

export const SearchResultsScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { results, loading, error } = useSearch();

  const renderNote = ({ item: note }: { item: Note }) => (
    <NoteCard note={note} onPress={() => navigation.navigate('Note', { noteId: note.id })} />
  );

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <Icon name={Platform.OS === 'ios' ? 'chevron-back' : 'arrow-back'} size={28} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Search Results</Text>
        <View style={styles.iconButton} />
      </View>
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : results.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No results found</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          renderItem={renderNote}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: SPACING.lg,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    height: 56,
  },
  topBarTitle: {
    ...FONTS.bold,
    color: COLORS.text,
    fontSize: 20,
    flex: 1,
    textAlign: 'center',
  },
  iconButton: {
    padding: SPACING.sm,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  list: {
    padding: SPACING.md,
  },
  errorText: {
    ...FONTS.medium,
    fontSize: 16,
    color: COLORS.error,
    textAlign: 'center',
  },
  emptyText: {
    ...FONTS.medium,
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
}); 