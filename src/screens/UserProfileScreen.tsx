import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import { COLORS, FONTS, SPACING, SIZES } from '../constants/theme';
import { usePowerSync } from '../hooks/usePowerSync';

export const UserProfileScreen = () => {
  const { user, signOut } = useAuth();
  const { theme } = useTheme();
  const { fetchNotes, fetchCategories } = usePowerSync();
  const navigation = useNavigation();
  const [noteCount, setNoteCount] = useState(0);
  const [categoryCount, setCategoryCount] = useState(0);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      if (!user) return;
      setIsLoadingStats(true);
      setStatsError(null);
      try {
        const notes = await fetchNotes();
        setNoteCount(notes.length);
        const categories = await fetchCategories();
        setCategoryCount(categories.length);
      } catch (error) {
        setStatsError(error instanceof Error ? error.message : 'Failed to load stats');
      } finally {
        setIsLoadingStats(false);
      }
    };

    loadStats();
  }, [user, fetchNotes, fetchCategories]);

  const handleSignOut = async () => {
    await signOut();
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfile');
  };

  if (!user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.centeredMessage}>
          <Text style={[styles.messageText, { color: theme.text }]}>Please log in to view your profile.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.profileHeader}>
        {user?.photo ? (
          <Image source={{ uri: user.photo }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarPlaceholderText}>{user?.name ? user.name[0] : user?.email?.[0]?.toUpperCase()}</Text>
          </View>
        )}
        <Text style={[styles.userName, { color: theme.text }]}>
          {user?.name || 'User'}
        </Text>
        <Text style={[styles.userEmail, { color: theme.textSecondary }]}>
          {user?.email}
        </Text>
      </View>

      <View style={styles.profileDetails}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>App Usage Statistics</Text>
        {isLoadingStats ? (
          <ActivityIndicator size="small" color={COLORS.primary} />
        ) : statsError ? (
          <Text style={[styles.errorText, { color: COLORS.error }]}>{statsError}</Text>
        ) : (
          <>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Notes Created:</Text>
              <Text style={[styles.statValue, { color: theme.text }]}>{noteCount}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Categories Created:</Text>
              <Text style={[styles.statValue, { color: theme.text }]}>{categoryCount}</Text>
            </View>
            {/* Add more stats as needed */}
          </>
        )}
      </View>

      <TouchableOpacity style={styles.editProfileButton} onPress={handleEditProfile}>
        <Text style={styles.editProfileButtonText}>Edit Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutButtonText}>Sign Out</Text>
      </TouchableOpacity>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centeredMessage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
  messageText: {
    ...FONTS.regular,
    fontSize: 16,
    textAlign: 'center',
  },
  profileHeader: {
    alignItems: 'center',
    padding: SPACING.xl,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: SPACING.md,
  },
  avatarPlaceholder: {
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholderText: {
    ...FONTS.bold,
    fontSize: SIZES.extraLarge * 2,
    color: COLORS.background,
  },
  userName: {
    ...FONTS.bold,
    fontSize: SIZES.extraLarge,
    marginBottom: SPACING.xs,
  },
  userEmail: {
    ...FONTS.regular,
    fontSize: 16,
  },
  profileDetails: {
    padding: SPACING.xl,
  },
  sectionTitle: {
    ...FONTS.bold,
    fontSize: 18,
    marginBottom: SPACING.md,
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  statLabel: {
    ...FONTS.regular,
    fontSize: 16,
  },
  statValue: {
    ...FONTS.medium,
    fontSize: 16,
  },
  errorText: {
    ...FONTS.regular,
    fontSize: 14,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
  signOutButton: {
    marginTop: SPACING.xl,
    marginHorizontal: SPACING.xl,
    backgroundColor: COLORS.error,
    padding: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  signOutButtonText: {
    ...FONTS.bold,
    fontSize: 16,
    color: COLORS.background,
  },
  editProfileButton: {
    marginTop: SPACING.xl,
    marginHorizontal: SPACING.xl,
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  editProfileButtonText: {
    ...FONTS.bold,
    fontSize: 16,
    color: COLORS.background,
  },
}); 