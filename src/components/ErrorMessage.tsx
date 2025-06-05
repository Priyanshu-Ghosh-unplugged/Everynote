import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, FONTS } from '../constants/theme';
import Icon from 'react-native-vector-icons/Ionicons';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  onRetry,
  onDismiss,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Icon name="alert-circle" size={24} color={COLORS.error} style={styles.icon} />
        <Text style={styles.message}>{message}</Text>
      </View>
      <View style={styles.actions}>
        {onRetry && (
          <TouchableOpacity onPress={onRetry} style={styles.button}>
            <Icon name="refresh" size={20} color={COLORS.primary} />
            <Text style={styles.buttonText}>Retry</Text>
          </TouchableOpacity>
        )}
        {onDismiss && (
          <TouchableOpacity onPress={onDismiss} style={styles.button}>
            <Icon name="close" size={20} color={COLORS.textSecondary} />
            <Text style={[styles.buttonText, styles.dismissText]}>Dismiss</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: SPACING.md,
    margin: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: SPACING.sm,
  },
  message: {
    ...FONTS.medium,
    fontSize: 14,
    color: COLORS.error,
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: SPACING.sm,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    marginLeft: SPACING.sm,
  },
  buttonText: {
    ...FONTS.medium,
    fontSize: 14,
    color: COLORS.primary,
    marginLeft: SPACING.xs,
  },
  dismissText: {
    color: COLORS.textSecondary,
  },
}); 