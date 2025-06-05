import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { COLORS, SPACING, FONTS } from '../constants/theme';
import Icon from 'react-native-vector-icons/Ionicons';

interface ListItemProps {
  title: string;
  subtitle?: string;
  leftIcon?: string;
  rightIcon?: string;
  onPress?: () => void;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
  showDivider?: boolean;
}

export const ListItem: React.FC<ListItemProps> = ({
  title,
  subtitle,
  leftIcon,
  rightIcon,
  onPress,
  style,
  titleStyle,
  subtitleStyle,
  showDivider = true,
}) => {
  const Container = onPress ? TouchableOpacity : View;

  return (
    <>
      <Container
        onPress={onPress}
        style={[styles.container, style]}
        activeOpacity={0.7}
      >
        {leftIcon && (
          <Icon name={leftIcon} size={24} color={COLORS.text} style={styles.leftIcon} />
        )}
        <View style={styles.content}>
          <Text style={[styles.title, titleStyle]} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.subtitle, subtitleStyle]} numberOfLines={2}>
              {subtitle}
            </Text>
          )}
        </View>
        {rightIcon && (
          <Icon name={rightIcon} size={24} color={COLORS.textSecondary} style={styles.rightIcon} />
        )}
      </Container>
      {showDivider && <View style={styles.divider} />}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  content: {
    flex: 1,
    marginHorizontal: SPACING.sm,
  },
  title: {
    ...FONTS.medium,
    fontSize: 16,
    color: COLORS.text,
  },
  subtitle: {
    ...FONTS.regular,
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  leftIcon: {
    marginRight: SPACING.sm,
  },
  rightIcon: {
    marginLeft: SPACING.sm,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginLeft: SPACING.md,
  },
}); 