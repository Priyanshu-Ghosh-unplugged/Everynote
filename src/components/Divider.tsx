import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, SPACING } from '../constants/theme';

interface DividerProps {
  color?: string;
  thickness?: number;
  spacing?: number;
  style?: ViewStyle;
}

export const Divider: React.FC<DividerProps> = ({
  color = COLORS.border,
  thickness = 1,
  spacing = SPACING.md,
  style,
}) => {
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: color,
          height: thickness,
          marginVertical: spacing,
        },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
}); 