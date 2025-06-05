import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  Image,
  TouchableOpacity,
  Alert
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, SPACING, FONTS } from '../constants/theme';
import { useNotes } from '../hooks/useNotes';
import { useCategories } from '../hooks/useCategories';
import { useKeyboard } from '../hooks/useKeyboard';
import { useHaptics } from '../hooks/useHaptics';
import { useError } from '../hooks/useError';
import { useLoading } from '../hooks/useLoading';
import { CategorySelector } from '../components/CategorySelector';
import { SearchBar } from '../components/SearchBar';
import { Note } from '../types';
// import { RichEditor, RichToolbar, actions } from 'react-native-pell-rich-editor';
// TODO: Import 10tap-editor components
// Assuming these exports and types from 10tap-editor.d.ts
import { Editor, Toolbar, EditorMethods } from '10tap-editor';
import { useSettings } from '../hooks/useSettings';
import { useBiometrics } from '../hooks/useBiometrics';

export const NoteEditorScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { noteId } = route.params as { noteId?: string };

  const [title, setTitle] = useState('');
  const [content, setContent] = useState(''); // Keep content state for initial load
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');

  const { notes, addNote, updateNote } = useNotes();
  const { categories } = useCategories();
  const { isKeyboardVisible, dismissKeyboard } = useKeyboard();
  const { success, error: hapticError } = useHaptics();
  const { handleError } = useError();
  const { withLoading } = useLoading();
  const { settings } = useSettings();
  const { authenticate } = useBiometrics();

  // TODO: Update ref for 10tap-editor
  // Use any to unblock, will refine type later
  const editorRef = useRef<any>(null); // Type the ref as any for now

  useEffect(() => {
    if (noteId) {
      const note = notes.find(n => n.id === noteId);
      if (note) {
        setTitle(note.title);
        setContent(note.content); // Set content state for initial load
        setCategory(note.category);
      }
    }
  }, [noteId, notes]);

  // Effect to load initial content into the editor
  useEffect(() => {
    if (editorRef.current && content) {
      // TODO: Confirm the correct method to load HTML content
      // Assuming loadHTML method exists on the ref object
      if (editorRef.current.loadHTML) {
         editorRef.current.loadHTML(content); 
      } else {
         console.warn('10tap-editor ref does not have loadHTML method.');
      }
    }
  }, [content]); // Re-run when content state changes (after fetching note)

  const handleSave = async () => {
    try {
      // Check for biometric authentication if enabled and creating a new note
      if (settings.biometricEnabled && !noteId) {
        const authenticated = await authenticate('Authenticate to save new note');
        if (!authenticated) {
          Alert.alert('Authentication Required', 'Biometric authentication is required to save a new note.');
          return;
        }
      }

      await withLoading(async () => {
        // Use getHTML from the ref object, assuming it exists
        const editorContent = editorRef.current?.getHTML ? await editorRef.current.getHTML() : '';
        
        const noteData: Partial<Note> = {
          title: title.trim(),
          content: editorContent, // Get content from 10tap-editor
          category,
        };

        if (noteId) {
          await updateNote(noteId, noteData);
        } else {
           // When adding a new note, ensure all required fields are present
           if (noteData.content === undefined) noteData.content = ''; // Default empty content if not available
           await addNote(noteData as Omit<Note, 'id' | 'created_at' | 'updated_at'>); // Cast to required type for addNote
        }
        success();
        navigation.goBack();
      }, 'Saving note...');
    } catch (err) {
      handleError(err);
      hapticError();
    }
  };

  // Placeholder avatar
  const avatar = require('../assets/avatar-placeholder.png');

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <View style={styles.topBar}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          onClear={() => setSearch('')}
          placeholder="Search your note"
        />
        <TouchableOpacity style={styles.avatarButton}>
          <Image source={avatar} style={styles.avatar} />
        </TouchableOpacity>
      </View>
      <CategorySelector
        categories={categories}
        selectedCategory={category}
        onSelectCategory={setCategory}
      />
      <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
        <Text style={styles.date}>{new Date().toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}</Text>
        <Text
          style={styles.titleInput}
          numberOfLines={1}
        >
          {title.length === 0 ? (
            <Text style={styles.placeholder}>Title</Text>
          ) : title}
        </Text>
        {/* TODO: Integrate 10tap-editor here */}
        <Editor
          ref={editorRef} // Pass the ref to the Editor
          // initialContentHTML is likely for initial render, loading later via ref is often needed
          // initialContentHTML={content} 
          placeholder="What's on your mind today?"
          style={styles.editor} // Apply styles to the editor
          // TODO: Add other necessary props for 10tap-editor, e.g., onChange
        />
      </ScrollView>
      {/* TODO: Integrate 10tap-editor toolbar here, possibly replacing RichToolbar */}
       <Toolbar 
         editor={editorRef} // Pass the ref to the Toolbar
         // Add other toolbar props based on 10tap-editor documentation
         style={styles.toolbar} // Apply styles to the toolbar
       />
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
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
  },
  avatarButton: {
    marginLeft: SPACING.sm,
    borderRadius: 20,
    overflow: 'hidden',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  date: {
    ...FONTS.regular,
    color: COLORS.textSecondary,
    fontSize: 14,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  titleInput: {
    ...FONTS.bold,
    fontSize: 24,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  placeholder: {
    ...FONTS.italic,
    color: COLORS.textSecondary,
    fontSize: 20,
  },
  editor: {
    minHeight: 200,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  toolbar: {
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    margin: SPACING.md,
    alignItems: 'center',
  },
  saveButtonText: {
    ...FONTS.medium,
    color: COLORS.background,
    fontSize: 16,
  },
}); 