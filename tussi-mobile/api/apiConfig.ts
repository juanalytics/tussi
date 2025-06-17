import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const API_URL_STORAGE_KEY = 'tussi_api_url';

// Default URL pointing to the API Gateway.
// For Android emulator, use 'http://10.0.2.2:9000/api'
// For iOS simulator and local development, use 'http://localhost:9000/api'
const ANDROID_DEFAULT_URL = 'http://10.0.2.2:8000/api';
const DEFAULT_URL = 'http://localhost:8000';

export const getDefaultApiUrl = () => {
  return Platform.OS === 'android' ? ANDROID_DEFAULT_URL : DEFAULT_URL;
};

export const getApiUrl = async (): Promise<string> => {
  try {
    const url = await AsyncStorage.getItem(API_URL_STORAGE_KEY);
    return url || getDefaultApiUrl();
  } catch (error) {
    console.error('Failed to get API URL from storage', error);
    return getDefaultApiUrl();
  }
};

export const setApiUrl = async (url: string): Promise<void> => {
  try {
    // A simple validation to ensure we're not storing an empty string
    if (url && url.trim().length > 0) {
      await AsyncStorage.setItem(API_URL_STORAGE_KEY, url.trim());
    } else {
      // If the user provides an empty string, we can remove the key
      // to revert to the default URL.
      await AsyncStorage.removeItem(API_URL_STORAGE_KEY);
    }
  } catch (error) {
    console.error('Failed to save API URL to storage', error);
    // Optionally, re-throw or handle the error as needed
    throw new Error('Could not save API URL');
  }
}; 