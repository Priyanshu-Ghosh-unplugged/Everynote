import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, FONTS } from '../constants/theme';
import { useSettings } from '../hooks/useSettings';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../hooks/useAuth';
import { useHaptics } from '../hooks/useHaptics';
import { useError } from '../hooks/useError';
import { useLoading } from '../hooks/useLoading';
import Icon from 'react-native-vector-icons/Ionicons';
import { Switch } from '../components/Switch';
import { useBiometrics } from '../hooks/useBiometrics';

export const SettingsScreen = () => {
  const navigation = useNavigation();
  const { settings, updateSettings, resetSettings } = useSettings();
  const { theme, toggleTheme } = useTheme();
  const { signOut } = useAuth();
  const { success, error: hapticError } = useHaptics();
  const { handleError } = useError();
  const { withLoading } = useLoading();
  const { biometricState, checkBiometrics } = useBiometrics();

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await withLoading(async () => {
                await signOut();
                success();
              }, 'Signing out...');
            } catch (err) {
              handleError(err);
              hapticError();
            }
          },
        },
      ],
    );
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to default?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await withLoading(async () => {
                await resetSettings();
                success();
              }, 'Resetting settings...');
            } catch (err) {
              handleError(err);
              hapticError();
            }
          },
        },
      ],
    );
  };

  const handleBiometricToggle = async (value: boolean) => {
    if (value) {
      const available = await checkBiometrics();
      if (available && biometricState.enrolled) {
        updateSettings({ biometricEnabled: true });
      } else if (!available) {
        Alert.alert('Biometrics Not Available', 'Your device does not support biometric authentication.');
        // Optionally update local state to reflect the change wasn't made
      } else if (!biometricState.enrolled) {
         Alert.alert('Biometrics Not Set Up', 'Please set up fingerprint or face recognition in your device settings.');
        // Optionally update local state
      }
    } else {
      updateSettings({ biometricEnabled: false });
    }
  };

  const renderSettingItem = (
    title: string,
    value: boolean,
    onValueChange: (value: boolean) => void,
    disabled?: boolean
  ) => (
    <View style={styles.settingItem}>
      <Text style={[styles.settingTitle, disabled && styles.settingTitleDisabled]}>{title}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <Icon name={Platform.OS === 'ios' ? 'chevron-back' : 'arrow-back'} size={28} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Settings</Text>
        <View style={styles.iconButton} />
      </View>
      <ScrollView>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          {renderSettingItem(
            'Dark Mode',
            theme.mode === 'dark',
            () => toggleTheme()
          )}
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sync</Text>
          {renderSettingItem(
            'Enable Sync',
            settings.syncEnabled,
            (value) => updateSettings({ syncEnabled: value })
          )}
          {renderSettingItem(
            'Auto Save',
            settings.autoSave,
            (value) => updateSettings({ autoSave: value })
          )}
        </View>

        {/* Security Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          {renderSettingItem(
            'Biometric Authentication',
            settings.biometricEnabled,
            handleBiometricToggle,
            !biometricState.available
          )}
           {!biometricState.available && (
            <Text style={styles.biometricStatusText}>
              Biometric authentication is not available on this device.
            </Text>
          )}
           {biometricState.available && !biometricState.enrolled && (
            <Text style={styles.biometricStatusText}>
              Please set up biometrics in your device settings to enable this feature.
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={handleSignOut}
          >
            <Text style={styles.buttonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data</Text>
          <TouchableOpacity
            style={[styles.button, styles.dangerButton]}
            onPress={handleResetSettings}
          >
            <Text style={styles.buttonText}>Reset Settings</Text>
          </TouchableOpacity>
        </View>
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
  section: {
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  sectionTitle: {
    ...FONTS.bold,
    fontSize: 18,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  settingTitle: {
    ...FONTS.regular,
    fontSize: 16,
    color: COLORS.text,
  },
   settingTitleDisabled: {
    color: COLORS.textSecondary,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  dangerButton: {
    backgroundColor: COLORS.error,
  },
  buttonText: {
    ...FONTS.medium,
    fontSize: 16,
    color: COLORS.background,
  },
   biometricStatusText: {
    ...FONTS.regular,
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
}); 