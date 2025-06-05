import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, FONTS } from '../constants/theme';
import Icon from 'react-native-vector-icons/Ionicons';

export const AboutScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
       {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <Icon name={Platform.OS === 'ios' ? 'chevron-back' : 'arrow-back'} size={28} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>About</Text>
        <View style={styles.iconButton} />{/* Placeholder for symmetry */}
      </View>

      <View style={styles.content}>
        <Text style={styles.appName}>Everynote Kapybara</Text>
        <Text style={styles.versionText}>Version: 1.0.0 (Placeholder)</Text>
        <Text style={styles.descriptionText}>
          Everynote Kapybara is a modern, feature-rich note-taking application designed to help you capture your thoughts and ideas effortlessly.
          Organize your notes with categories, find what you need quickly with search, and customize your experience with various settings.
        </Text>
        <Text style={styles.sectionTitle}>Features:</Text>
        <Text style={styles.featureText}>- Note creation, editing, and deletion</Text>
        <Text style={styles.featureText}>- Category management</Text>
        <Text style={styles.featureText}>- Full-text search</Text>
        <Text style={styles.featureText}>- Customizable settings (Dark Mode, Sync, Auto-save, Biometrics)</Text>
        <Text style={styles.featureText}>- Rich text editing</Text>
        {/* Add more features as they are implemented */}

        <Text style={styles.sectionTitle}>Credits:</Text>
        <Text style={styles.creditsText}>Developed with React Native and various open-source libraries.</Text>
        {/* Add specific credits if necessary */}

      </View>
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
  appName: {
    ...FONTS.bold,
    fontSize: 28,
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  versionText: {
    ...FONTS.regular,
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  descriptionText: {
    ...FONTS.regular,
    fontSize: 16,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.md,
    lineHeight: 22,
  },
  sectionTitle: {
    ...FONTS.bold,
    fontSize: 18,
    color: COLORS.text,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  featureText: {
    ...FONTS.regular,
    fontSize: 16,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  creditsText: {
    ...FONTS.regular,
    fontSize: 16,
    color: COLORS.text,
  },
}); 