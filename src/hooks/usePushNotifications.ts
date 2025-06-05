import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';

const usePushNotifications = () => {
  useEffect(() => {
    const configureNotifications = async () => {
      try {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') {
          console.warn('Push notification permissions not granted.');
          return;
        }

        // Configure notification handler
        Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
            shouldShowBanner: true,
            shouldShowList: true,
          }),
        });

        // Optional: Get push token
        const token = await Notifications.getExpoPushTokenAsync();
        console.log('Push token:', token);
      } catch (error) {
        console.error('Error configuring push notifications:', error);
      }
    };

    configureNotifications();
  }, []);
};

export default usePushNotifications; 