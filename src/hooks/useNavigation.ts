import { useState, useEffect } from 'react';
import { useNavigation as useReactNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';

export const useNavigation = () => {
  const navigation = useReactNavigation<StackNavigationProp<RootStackParamList>>();
  const [currentRoute, setCurrentRoute] = useState<string>('');

  useEffect(() => {
    const unsubscribe = navigation.addListener('state', (state) => {
      const currentRouteName = state.data.state.routes[state.data.state.index].name;
      setCurrentRoute(currentRouteName);
    });

    return unsubscribe;
  }, [navigation]);

  const navigateToHome = () => {
    navigation.navigate('Home');
  };

  const navigateToNote = (noteId: string) => {
    navigation.navigate('Note', { noteId });
  };

  const navigateToCategory = (categoryId: string) => {
    navigation.navigate('Category', { categoryId });
  };

  const navigateToSettings = () => {
    navigation.navigate('Settings');
  };

  const goBack = () => {
    navigation.goBack();
  };

  return {
    currentRoute,
    navigateToHome,
    navigateToNote,
    navigateToCategory,
    navigateToSettings,
    goBack,
  };
}; 