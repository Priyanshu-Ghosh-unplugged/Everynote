import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DrawerItemList, createDrawerNavigator, DrawerContentComponentProps } from '@react-navigation/drawer';
import { SafeAreaView, View, Image, Text } from 'react-native';

import AuthScreen from '../screens/AuthScreen';
import HomeScreen from '../screens/HomeScreen';
import { UserProfileScreen } from '../screens/UserProfileScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { HelpScreen } from '../screens/HelpScreen';
import { AboutScreen } from '../screens/AboutScreen';
import { RootStackParamList } from '../types';
import { useAuth } from '../hooks/useAuth';
import { COLORS } from '../constants/theme';
import { EditProfileScreen } from '../screens/EditProfileScreen';
import { CalendarScreen } from '../screens/CalendarScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Drawer = createDrawerNavigator<RootStackParamList>();

const CustomDrawerContent = (props: DrawerContentComponentProps) => {
  const { user } = useAuth();
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ padding: 20, borderBottomWidth: 1, borderBottomColor: COLORS.border }}>
        <Image
          source={{ uri: user?.photo || 'https://via.placeholder.com/150' }}
          style={{ width: 80, height: 80, borderRadius: 40, marginBottom: 10 }}
        />
        <Text style={{ color: COLORS.text, fontSize: 18, fontWeight: 'bold' }}>{user?.name || 'Guest'}</Text>
        <Text style={{ color: COLORS.textSecondary, fontSize: 14 }}>{user?.email || 'N/A'}</Text>
      </View>
      <DrawerItemList {...props} />
    </SafeAreaView>
  );
};

const AppNavigator = () => {
  const { user } = useAuth();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {user ? (
        <Stack.Screen name="Home" component={DrawerNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
};

const AuthNavigator = () => {
  // Assuming you have an Auth screen for login/signup
  // Replace with your actual Auth screen component
  const AuthScreen = () => (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Auth Screen (Placeholder)</Text>
    </View>
  );

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Auth" component={AuthScreen} />
    </Stack.Navigator>
  );
};

const DrawerNavigator = () => {
  return (
    <Drawer.Navigator
      initialRouteName="Home"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Drawer.Screen name="Home" component={HomeScreen} />
      <Drawer.Screen name="UserProfile" component={UserProfileScreen} />
      <Drawer.Screen name="EditProfile" component={EditProfileScreen} />
      <Drawer.Screen name="Calendar" component={CalendarScreen} />
    </Drawer.Navigator>
  );
};

export default AppNavigator; 