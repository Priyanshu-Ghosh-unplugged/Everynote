import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { COLORS, SPACING, FONTS } from '../constants/theme';
import { Note } from '../types';

interface NoteCardProps {
  note: Note;
  onPress: (note: Note) => void;
  onDelete?: () => void;
}

export const NoteCard: React.FC<NoteCardProps> = ({ note, onPress, onDelete }) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(note)}
    >
      <Text style={styles.title} numberOfLines={1}>
        {note.title}
      </Text>
      <Text style={styles.content} numberOfLines={2}>
        {note.content}
      </Text>
      <View style={styles.footer}>
        <View style={[styles.categoryDot, { backgroundColor: COLORS.primary }]} />
        <Text style={styles.category}>{note.category}</Text>
        <Text style={styles.date}>
          {new Date(note.updated_at).toLocaleDateString()}
        </Text>
      </View>
      {onDelete && (
        <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.md,
  },
  title: {
    ...FONTS.bold,
    fontSize: 18,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  content: {
    ...FONTS.regular,
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.xs,
  },
  category: {
    ...FONTS.medium,
    fontSize: 12,
    color: COLORS.primary,
    marginRight: SPACING.sm,
  },
  date: {
    ...FONTS.regular,
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  deleteButton: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    backgroundColor: COLORS.error,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: 4,
  },
  deleteButtonText: {
    color: COLORS.background,
    fontSize: 12,
    fontWeight: 'bold',
  },
}); 