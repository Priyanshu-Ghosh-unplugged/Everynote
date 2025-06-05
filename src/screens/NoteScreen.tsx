import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../hooks/useAuth';
import { usePowerSync } from '../hooks/usePowerSync';
import { RichTextEditor } from '../components/RichTextEditor';
import { IconButton } from '../components/IconButton';
import { COLORS } from '../constants/theme';
import Toast from 'react-native-toast-message';
import { RootStackParamList } from '../navigation/types';

type NoteScreenRouteProp = RouteProp<RootStackParamList, 'Note'>;

interface Note {
  id: string;
  title: string;
  content: string;
  category_id: string;
  created_at: number;
  updated_at: number;
  deleted_at: number | null;
  user_id: string;
  is_pinned: number;
  is_archived: number;
}

export const NoteScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<NoteScreenRouteProp>();
  const { theme } = useTheme();
  const { user } = useAuth();
  const { addNote, editNote, fetchNotes } = usePowerSync();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [isArchived, setIsArchived] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const noteId = route.params?.noteId;

  useEffect(() => {
    if (noteId) {
      loadNote();
    }
  }, [noteId, fetchNotes]);

  const loadNote = async () => {
    try {
      const notes: Note[] = await fetchNotes();
      const note = notes.find(n => n.id === noteId);
      if (note) {
        setTitle(note.title);
        setContent(note.content);
        setCategoryId(note.category_id);
        setIsPinned(note.is_pinned === 1);
        setIsArchived(note.is_archived === 1);
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error loading note',
        text2: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Title is required',
      });
      return;
    }

    setIsLoading(true);
    try {
      if (noteId) {
        await editNote({
          id: noteId,
          title,
          content,
          category_id: categoryId,
          is_pinned: isPinned,
          is_archived: isArchived,
        });
        Toast.show({
          type: 'success',
          text1: 'Note updated',
        });
      } else {
        await addNote({
          id: Date.now().toString(),
          title,
          content,
          category_id: categoryId,
        });
        Toast.show({
          type: 'success',
          text1: 'Note created',
        });
      }
      navigation.goBack();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error saving note',
        text2: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          onPress={() => navigation.goBack()}
          color={theme.text}
        />
        <View style={styles.actions}>
          <IconButton
            icon={isPinned ? 'pin' : 'pin-outline'}
            onPress={() => setIsPinned(!isPinned)}
            color={isPinned ? COLORS.primary : theme.text}
          />
          <IconButton
            icon={isArchived ? 'archive' : 'archive-outline'}
            onPress={() => setIsArchived(!isArchived)}
            color={isArchived ? COLORS.primary : theme.text}
          />
          <IconButton
            icon="check"
            onPress={handleSave}
            color={COLORS.primary}
            disabled={isLoading}
          />
        </View>
      </View>
      <ScrollView style={styles.content}>
        <RichTextEditor
          title={title}
          content={content}
          onTitleChange={setTitle}
          onContentChange={setContent}
          theme={theme}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
}); 