import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, FONTS } from '../constants/theme';
import Icon from 'react-native-vector-icons/Ionicons';

export const HelpScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
       {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <Icon name={Platform.OS === 'ios' ? 'chevron-back' : 'arrow-back'} size={28} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Help</Text>
        <View style={styles.iconButton} />{/* Placeholder for symmetry */}
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Getting Started</Text>
        <Text style={styles.sectionText}>
          Welcome to Everynote Kapybara! This app helps you organize your thoughts and ideas.
          Tap the '+' button on the Home screen to create your first note.
        </Text>

        <Text style={styles.sectionTitle}>Managing Notes</Text>
        <Text style={styles.sectionText}>
          - <Text style={{fontWeight: 'bold'}}>Create Note:</Text> Tap the '+' button on the Home screen.
          - <Text style={{fontWeight: 'bold'}}>Edit Note:</Text> Tap on a note from the list to open its detail view, then tap the pencil icon.
          - <Text style={{fontWeight: 'bold'}}>Delete Note:</Text> From the note detail view, tap the trash can icon.
          - <Text style={{fontWeight: 'bold'}}>Rich Text:</Text> Use the toolbar in the Note Editor to format your text (bold, italic, lists, etc.).
        </Text>

        <Text style={styles.sectionTitle}>Categories</Text>
        <Text style={styles.sectionText}>
          - <Text style={{fontWeight: 'bold'}}>Assign Category:</Text> Select a category for your note in the Note Editor.
          - <Text style={{fontWeight: 'bold'}}>Filter Notes:</Text> Use the category selector on the Home screen to view notes by category.
          - <Text style={{fontWeight: 'bold'}}>Manage Categories:</Text> Go to Settings {'>'} Category Management to add, edit, or delete categories.
        </Text>

        <Text style={styles.sectionTitle}>Search</Text>
        <Text style={styles.sectionText}>
          Use the search bar at the top of the Home screen to find notes by title or content.
        </Text>

        <Text style={styles.sectionTitle}>Settings</Text>
        <Text style={styles.sectionText}>
          Customize your app experience in the Settings screen. Here you can toggle Dark Mode, manage sync options, enable auto-save, and set up biometric authentication.
        </Text>

        <Text style={styles.sectionTitle}>Sync</Text>
        <Text style={styles.sectionText}>
          With sync enabled, your notes and categories are automatically backed up and synced across your devices using PowerSync.
        </Text>

        {/* Add more help topics as features are completed */}

      </ScrollView>
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
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  sectionTitle: {
    ...FONTS.bold,
    fontSize: 18,
    color: COLORS.text,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  sectionText: {
    ...FONTS.regular,
    fontSize: 16,
    color: COLORS.text,
    marginBottom: SPACING.md,
    lineHeight: 22,
  },
}); 