import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Share,
  Platform,
  ActivityIndicator
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { COLORS, SPACING, FONTS } from '../constants/theme';
import { useNotes } from '../hooks/useNotes';
import { useHaptics } from '../hooks/useHaptics';
import { useError } from '../hooks/useError';
import { useLoading } from '../hooks/useLoading';
import { Note } from '../types';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSettings } from '../hooks/useSettings';
import { useBiometrics } from '../hooks/useBiometrics';

export const NoteDetailScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { noteId } = route.params as { noteId: string };
  
  const [note, setNote] = useState<Note | null>(null);
  const { notes, deleteNote } = useNotes();
  const { success, error: hapticError } = useHaptics();
  const { handleError } = useError();
  const { withLoading } = useLoading();
  const { settings } = useSettings();
  const { biometricState, checkBiometrics, authenticate } = useBiometrics();

  const [isBiometricallyChecked, setIsBiometricallyChecked] = useState(false);
  const [biometricAuthSuccessful, setBiometricAuthSuccessful] = useState(false);
  const [biometricCheckLoading, setBiometricCheckLoading] = useState(true);
  const [biometricCheckError, setBiometricCheckError] = useState<string | null>(null);

  useEffect(() => {
    const currentNote = notes.find(n => n.id === noteId);
    if (currentNote) {
      setNote(currentNote);
    }
  }, [noteId, notes]);

  const checkAndAuthenticate = async () => {
    if (!settings.biometricEnabled) {
      setIsBiometricallyChecked(true);
      setBiometricAuthSuccessful(true);
      setBiometricCheckLoading(false);
      return;
    }

    setBiometricCheckLoading(true);
    setBiometricCheckError(null);

    const available = await checkBiometrics();

    if (available && biometricState.enrolled) {
      const authenticated = await authenticate('Authenticate to view note');
      setBiometricAuthSuccessful(authenticated);
      if (!authenticated) {
        setBiometricCheckError('Biometric authentication failed.');
      }
    } else {
      // If biometrics enabled but not available or enrolled, prevent access
      setBiometricAuthSuccessful(false); 
      if (!available) {
        setBiometricCheckError('Biometric authentication is not available on this device.');
      } else if (!biometricState.enrolled) {
        setBiometricCheckError('Biometric authentication is not set up on your device.');
      }
      // Optionally disable the setting if it's enabled but cannot be used
       if (settings.biometricEnabled) {
           // This might be better handled by informing the user in settings and not auto-disabling
          // updateSettings({ biometricEnabled: false });
       }
    }

    setIsBiometricallyChecked(true);
    setBiometricCheckLoading(false);
  };

  useEffect(() => {
    checkAndAuthenticate();
  }, [noteId, settings.biometricEnabled, biometricState.available, biometricState.enrolled]);

  const handleEdit = async () => {
    if (settings.biometricEnabled) {
      const authenticated = await authenticate('Authenticate to edit note');
      if (!authenticated) {
        Alert.alert('Authentication Required', 'Biometric authentication is required to edit this note.');
        return;
      }
    }
    navigation.navigate('NoteEditor', { noteId });
  };

  const handleDelete = async () => {
    if (settings.biometricEnabled) {
      const authenticated = await authenticate('Authenticate to delete note');
      if (!authenticated) {
        Alert.alert('Authentication Required', 'Biometric authentication is required to delete this note.');
        return;
      }
    }
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await withLoading(async () => {
                await deleteNote(noteId);
                success();
                navigation.goBack();
              }, 'Deleting note...');
            } catch (err) {
              handleError(err);
              hapticError();
            }
          },
        },
      ],
    );
  };

  const handleShare = async () => {
    try {
      if (!note) return;

      if (settings.biometricEnabled) {
        const authenticated = await authenticate('Authenticate to share note');
        if (!authenticated) {
          Alert.alert('Authentication Required', 'Biometric authentication is required to share this note.');
          return;
        }
      }

      const result = await Share.share({
        title: note.title,
        message: `${note.title}\n\n${note.content}`,
      });

      if (result.action === Share.sharedAction) {
        success();
      }
    } catch (err) {
      handleError(err);
      hapticError();
    }
  };

  if (biometricCheckLoading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        {settings.biometricEnabled && <Text style={styles.loadingText}>Waiting for biometric authentication...</Text>}
      </View>
    );
  }

  if (!biometricAuthSuccessful) {
     return (
       <View style={styles.centeredContainer}>
         <Text style={styles.errorText}>{biometricCheckError || 'Biometric authentication failed or is not available. Cannot access note.'}</Text>
         {biometricState.available && biometricState.enrolled && settings.biometricEnabled && (
            <TouchableOpacity style={styles.retryButton} onPress={() => checkAndAuthenticate()}>
               <Text style={styles.retryButtonText}>Retry Authentication</Text>
            </TouchableOpacity>
         )}
         <TouchableOpacity style={styles.goBackButton} onPress={() => navigation.goBack()}>
            <Text style={styles.goBackButtonText}>Go Back</Text>
         </TouchableOpacity>
       </View>
     );
  }

  if (!note) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Note not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <Icon name={Platform.OS === 'ios' ? 'chevron-back' : 'arrow-back'} size={28} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle} numberOfLines={1}>{note.title}</Text>
        <TouchableOpacity onPress={handleEdit} style={styles.iconButton}>
          <Icon name="create-outline" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
      {/* Note Info */}
      <View style={styles.header}>
        <View style={styles.categoryChip}>
          <Text style={styles.categoryChipText}>{note.category}</Text>
        </View>
        <Text style={styles.date}>
          Last updated: {new Date(note.updated_at).toLocaleDateString()}
        </Text>
      </View>
      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.noteText}>{note.content}</Text>
      </View>
      {/* Toolbar */}
      <View style={styles.toolbar}>
        <TouchableOpacity style={styles.toolbarIcon} onPress={handleEdit}>
          <Icon name="create-outline" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolbarIcon} onPress={handleShare}>
          <Icon name="share-social-outline" size={24} color={COLORS.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolbarIcon} onPress={handleDelete}>
          <Icon name="trash-outline" size={24} color={COLORS.error} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
   centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 20,
  },
   loadingText: {
    marginTop: 10,
    color: COLORS.text,
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
  iconButton: {
    padding: SPACING.sm,
  },
  topBarTitle: {
    ...FONTS.bold,
    color: COLORS.text,
    fontSize: 20,
    flex: 1,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  categoryChip: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryChipText: {
    ...FONTS.medium,
    color: COLORS.primary,
    fontSize: 14,
  },
  date: {
    ...FONTS.regular,
    fontSize: 13,
    color: COLORS.textSecondary,
    marginLeft: SPACING.md,
  },
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  noteText: {
    ...FONTS.regular,
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 24,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    justifyContent: 'space-around',
  },
  toolbarIcon: {
    padding: SPACING.md,
    borderRadius: 8,
  },
  errorText: {
    ...FONTS.medium,
    fontSize: 16,
    color: COLORS.error,
    textAlign: 'center',
    marginTop: SPACING.xl,
  },
  retryButton: {
     marginTop: 20,
     backgroundColor: COLORS.primary,
     paddingVertical: 10,
     paddingHorizontal: 20,
     borderRadius: 8,
   },
    retryButtonText: {
      color: COLORS.background,
      fontSize: 16,
      fontWeight: 'bold',
    },
    goBackButton: {
      marginTop: 10,
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: COLORS.textSecondary,
    },
    goBackButtonText: {
       color: COLORS.textSecondary,
       fontSize: 16,
    }
}); 