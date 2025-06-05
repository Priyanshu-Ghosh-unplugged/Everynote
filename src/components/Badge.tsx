import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, SPACING, FONTS } from '../constants/theme';

interface BadgeProps {
  value: number | string;
  color?: string;
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  value,
  color = COLORS.primary,
  style,
}) => {
  return (
    <View style={[styles.container, { backgroundColor: color }, style]}>
      <Text style={styles.text}>
        {value}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: SPACING.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    ...FONTS.medium,
    fontSize: 12,
    color: COLORS.background,
    textAlign: 'center',
  },
}); 