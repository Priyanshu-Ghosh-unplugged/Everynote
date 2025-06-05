import { useState, useEffect } from 'react';
import {
  Platform,
  Dimensions,
  PixelRatio,
  StatusBar,
} from 'react-native';

interface DeviceInfo {
  platform: string;
  platformVersion: string;
  screenWidth: number;
  screenHeight: number;
  scale: number;
  fontScale: number;
  statusBarHeight: number;
  isLandscape: boolean;
}

export const useDevice = () => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    platform: Platform.OS,
    platformVersion: Platform.Version.toString(),
    screenWidth: Dimensions.get('window').width,
    screenHeight: Dimensions.get('window').height,
    scale: PixelRatio.get(),
    fontScale: PixelRatio.getFontScale(),
    statusBarHeight: StatusBar.currentHeight || 0,
    isLandscape: false,
  });

  useEffect(() => {
    const updateDeviceInfo = () => {
      const { width, height } = Dimensions.get('window');
      const isLandscape = width > height;

      setDeviceInfo(prev => ({
        ...prev,
        screenWidth: width,
        screenHeight: height,
        isLandscape,
      }));
    };

    const dimensionsSubscription = Dimensions.addEventListener('change', updateDeviceInfo);

    return () => {
      dimensionsSubscription.remove();
    };
  }, []);

  return deviceInfo;
}; 