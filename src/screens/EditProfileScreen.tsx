import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../hooks/useAuth';
import { COLORS, FONTS, SPACING, SIZES } from '../constants/theme';
import { IconButton } from '../components/IconButton';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import {
  launchImageLibrary,
  ImagePickerResponse,
  MediaType,
} from 'react-native-image-picker';

export const EditProfileScreen = () => {
  const { theme } = useTheme();
  const { user, updateUserProfile } = useAuth();
  const navigation = useNavigation();
  const [name, setName] = useState(user?.name || '');
  const [photoUrl, setPhotoUrl] = useState(user?.photo || '');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Update state if user data changes externally
    setName(user?.name || '');
    setPhotoUrl(user?.photo || '');
  }, [user]);

  const handleSave = async () => {
    if (!user) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'User not authenticated.',
      });
      return;
    }

    setIsLoading(true);
    try {
      let newPhotoUrl = photoUrl; // Start with current photoUrl state

      // TODO: Implement photo upload logic here
      // If photoUrl has changed and is a local URI (from image picker),
      // upload the image to your cloud storage service.
      // Example check (might need refinement based on your URI scheme):
      // if (photoUrl && photoUrl.startsWith('file://')) {
      //   const uploadedUrl = await uploadImage(photoUrl); // Replace with your upload function
      //   newPhotoUrl = uploadedUrl;
      // }

      await updateUserProfile(user.id, { name, photo: newPhotoUrl }); // Save updated name and new photo URL

      Toast.show({
        type: 'success',
        text1: 'Profile Updated',
      });
      navigation.goBack();
    } catch (error) {
      console.error('Failed to save profile', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to save profile',
        text2: error instanceof Error ? error.message : 'An error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
  };

   const handleChoosePhoto = () => {
     const options = {
       mediaType: 'photo' as MediaType,
       maxWidth: 300,
       maxHeight: 300,
       includeBase64: false,
     };

     launchImageLibrary(options, (response: ImagePickerResponse) => {
       if (response.didCancel) {
         console.log('User cancelled image picker');
       } else if (response.errorCode) {
         console.log('ImagePicker Error: ', response.errorCode);
         Alert.alert('Error', 'Failed to pick image.');
       } else if (response.assets && response.assets.length > 0) {
         const asset = response.assets[0];
         if (asset.uri) {
           // Here you would typically upload the image asset.uri to cloud storage
           // and then get a public downloadable URL.
           // For this example, we'll just use the local URI.
           setPhotoUrl(asset.uri);
         }
       }
     });
   };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
         <IconButton
            icon="arrow-left"
            onPress={() => navigation.goBack()}
            color={theme.text}
          />
          <Text style={[styles.title, { color: theme.text }]}>Edit Profile</Text>
          <View style={{ width: 24 }} /> {/* Spacer */}
      </View>
      <View style={styles.content}>

        <TouchableOpacity onPress={handleChoosePhoto} style={styles.avatarContainer}>
           {photoUrl ? (
            <Image source={{ uri: photoUrl }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
               <Text style={styles.avatarPlaceholderText}>{user?.name ? user.name[0] : user?.email?.[0]?.toUpperCase()}</Text>
            </View>
          )}
           <View style={styles.cameraIconContainer}>
               {/* Replace with actual camera icon component if available */}
               <Text style={styles.cameraIcon}>📷</Text>
           </View>
        </TouchableOpacity>

        <Text style={[styles.label, { color: theme.textSecondary }]}>Name</Text>
        <TextInput
          style={[styles.input, { borderColor: theme.border, color: theme.text }]}
          value={name}
          onChangeText={setName}
          placeholder="Enter your name"
          placeholderTextColor={COLORS.textSecondary}
        />

        {/* Add more fields as needed, e.g., email (if editable) */}

        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: COLORS.primary }]}
          onPress={handleSave}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={COLORS.background} />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
   header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  content: {
    flex: 1,
    padding: SPACING.md,
    alignItems: 'center',
  },
  title: {
    ...FONTS.bold,
    fontSize: 20,
    // marginBottom: SPACING.md,
  },
   avatarContainer: {
     marginBottom: SPACING.xl,
     position: 'relative',
   },
   avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
   },
   avatarPlaceholder: {
     backgroundColor: COLORS.primary,
   },
    avatarPlaceholderText: {
      ...FONTS.bold,
      fontSize: SIZES.extraLarge * 2,
      color: COLORS.background,
    },
   cameraIconContainer: {
     position: 'absolute',
     bottom: 0,
     right: 0,
     backgroundColor: COLORS.textSecondary, // Or a more appropriate icon background
     borderRadius: 20,
     padding: SPACING.xs,
     borderWidth: 2,
     borderColor: COLORS.background,
   },
   cameraIcon: {
     fontSize: 20,
     color: COLORS.background,
   },
  label: {
    ...FONTS.medium,
    fontSize: 16,
    marginBottom: SPACING.xs,
    alignSelf: 'flex-start',
    marginTop: SPACING.md,
  },
  input: {
    width: '100%',
    padding: SPACING.sm,
    borderWidth: 1,
    borderRadius: 8,
    fontSize: 16,
    ...FONTS.regular,
  },
  saveButton: {
    width: '100%',
    padding: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  saveButtonText: {
    ...FONTS.bold,
    fontSize: 18,
    color: COLORS.background,
  },
}); 