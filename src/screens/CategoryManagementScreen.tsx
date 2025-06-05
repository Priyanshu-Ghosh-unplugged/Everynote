import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  FlatList,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, FONTS } from '../constants/theme';
import { useCategories } from '../hooks/useCategories';
import { useHaptics } from '../hooks/useHaptics';
import { useError } from '../hooks/useError';
import { useLoading } from '../hooks/useLoading';
import { Category } from '../hooks/useCategories';
import Icon from 'react-native-vector-icons/Ionicons';

export const CategoryManagementScreen = () => {
  const navigation = useNavigation();
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  const { categories, addCategory, updateCategory, deleteCategory } = useCategories();
  const { success, error: hapticError } = useHaptics();
  const { handleError } = useError();
  const { withLoading } = useLoading();

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      handleError(new Error('Category name cannot be empty'));
      return;
    }

    try {
      await withLoading(async () => {
        await addCategory({
          name: newCategoryName.trim(),
          color: COLORS.primary,
        });
        setNewCategoryName('');
        success();
      }, 'Adding category...');
    } catch (err) {
      handleError(err);
      hapticError();
    }
  };

  const handleUpdateCategory = async (category: Category) => {
    try {
      await withLoading(async () => {
        await updateCategory(category.id, {
          name: category.name,
          color: category.color,
        });
        setEditingCategory(null);
        success();
      }, 'Updating category...');
    } catch (err) {
      handleError(err);
      hapticError();
    }
  };

  const handleDeleteCategory = async (category: Category) => {
    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete "${category.name}"?`,
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
                await deleteCategory(category.id);
                success();
              }, 'Deleting category...');
            } catch (err) {
              handleError(err);
              hapticError();
            }
          },
        },
      ],
    );
  };

  const renderCategory = ({ item: category }: { item: Category }) => (
    <View style={styles.categoryItem}>
      {editingCategory?.id === category.id ? (
        <TextInput
          style={styles.editInput}
          value={editingCategory.name}
          onChangeText={(text) => setEditingCategory({ ...editingCategory, name: text })}
          onBlur={() => handleUpdateCategory(editingCategory)}
          autoFocus
          placeholder="Category name"
          placeholderTextColor={COLORS.textSecondary}
        />
      ) : (
        <TouchableOpacity
          style={styles.categoryChip}
          onPress={() => setEditingCategory(category)}
        >
          <View style={[styles.colorDot, { backgroundColor: category.color }]} />
          <Text style={styles.categoryName}>{category.name}</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity
        style={styles.iconButton}
        onPress={() => handleDeleteCategory(category)}
      >
        <Icon name="trash-outline" size={22} color={COLORS.error} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <Icon name={Platform.OS === 'ios' ? 'chevron-back' : 'arrow-back'} size={28} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Categories</Text>
        <View style={styles.iconButton} />
      </View>
      {/* Add Category */}
      <View style={styles.addSection}>
        <TextInput
          style={styles.input}
          placeholder="New category name"
          value={newCategoryName}
          onChangeText={setNewCategoryName}
          placeholderTextColor={COLORS.textSecondary}
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddCategory}
        >
          <Icon name="add" size={22} color={COLORS.background} />
        </TouchableOpacity>
      </View>
      {/* Category List */}
      <FlatList
        data={categories}
        renderItem={renderCategory}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
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
  addSection: {
    flexDirection: 'row',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  input: {
    flex: 1,
    ...FONTS.regular,
    fontSize: 16,
    color: COLORS.text,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    marginRight: SPACING.sm,
    backgroundColor: COLORS.background,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: SPACING.md,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  categoryChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: SPACING.sm,
  },
  categoryName: {
    ...FONTS.regular,
    fontSize: 16,
    color: COLORS.text,
  },
  editInput: {
    flex: 1,
    ...FONTS.regular,
    fontSize: 16,
    color: COLORS.text,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 8,
    marginRight: SPACING.sm,
    backgroundColor: COLORS.background,
  },
}); 