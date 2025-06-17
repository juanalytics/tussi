import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, FlatList, ActivityIndicator, SafeAreaView, Pressable, Animated, Easing, Modal, TextInput, KeyboardAvoidingView, Platform, TouchableWithoutFeedback } from 'react-native';
import { styled, useColorScheme } from 'nativewind';
import { Product } from '../types/product';
import { fetchProducts } from '../api/products';
import { getApiUrl, setApiUrl, getDefaultApiUrl } from '../api/apiConfig';
import { MOCKED_PRODUCTS } from '../constants/mocks';
import ProductCard from '../components/ProductCard';
import { RefreshCw, Moon, Sun, Settings, X } from 'lucide-react-native';

const StyledText = styled(Text);

const ProductListScreen = () => {
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSettingsVisible, setSettingsVisible] = useState(false);
  const [apiUrlInput, setApiUrlInput] = useState('');
  const [currentApiUrl, setCurrentApiUrl] = useState('');
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loadApiUrl = async () => {
      const url = await getApiUrl();
      setCurrentApiUrl(url);
      setApiUrlInput(url);
    };
    loadApiUrl();
  }, []);

  // Define the animation
  const spinAnimation = useRef(
    Animated.timing(spinValue, {
      toValue: 1,
      duration: 800,
      easing: Easing.linear,
      useNativeDriver: true,
    })
  ).current;

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setStatusMessage(null);
    try {
      const data = await fetchProducts();
      if (data && data.length > 0) {
        setProducts(data);
      } else {
        setStatusMessage('No products found. Showing mock data.');
        setProducts(MOCKED_PRODUCTS);
      }
    } catch (e) {
      setStatusMessage('Products refreshed.');
      setProducts(MOCKED_PRODUCTS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentApiUrl) { // Only load products after we have the API url
      loadProducts();
    }
  }, [loadProducts, currentApiUrl]);

  // Control the animation based on the loading state
  useEffect(() => {
    if (loading) {
      Animated.loop(spinAnimation).start();
    } else {
      spinAnimation.stop();
      spinValue.setValue(0); // Reset animation
    }
  }, [loading, spinAnimation, spinValue]);

  const rotation = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handleSaveSettings = async () => {
    try {
      await setApiUrl(apiUrlInput);
      const newUrl = await getApiUrl();
      setCurrentApiUrl(newUrl);
      setSettingsVisible(false);
      // No need to call loadProducts here, the useEffect will trigger it.
       setStatusMessage('API URL updated successfully! Refreshing...');
    } catch (error) {
       setStatusMessage('Failed to save API URL.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-black">
      <View className="flex-row justify-between items-center p-4 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
        <StyledText className="text-2xl font-bold text-pink-500">TUSSI</StyledText>
        <View className="flex-row items-center">
          <Pressable onPress={() => setSettingsVisible(true)} className="p-2">
            <Settings color={colorScheme === 'dark' ? "white" : "black"} />
          </Pressable>
          <Pressable onPress={toggleColorScheme} className="p-2">
            {colorScheme === 'dark' ? (
              <Sun size={24} color="white" />
            ) : (
              <Moon size={24} color="black" />
            )}
          </Pressable>
          <Pressable onPress={loadProducts} disabled={loading} className="p-2">
            <Animated.View style={{ transform: [{ rotate: rotation }] }}>
              <RefreshCw color={loading ? '#fbcfe8' : '#ec4899'} />
            </Animated.View>
          </Pressable>
        </View>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isSettingsVisible}
        onRequestClose={() => setSettingsVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <TouchableWithoutFeedback onPress={() => setSettingsVisible(false)}>
            <View className="flex-1 justify-center items-center bg-black/50">
              <TouchableWithoutFeedback>
                <View className="w-11/12 bg-white dark:bg-gray-900 rounded-lg p-6 shadow-xl">
                  <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-xl font-bold dark:text-white">API Settings</Text>
                    <Pressable onPress={() => setSettingsVisible(false)} className="p-1">
                      <X color={colorScheme === 'dark' ? "white" : "black"} />
                    </Pressable>
                  </View>
                  <Text className="text-base text-gray-600 dark:text-gray-300 mb-2">Enter the base URL for the API.</Text>
                  <Text className="text-sm text-gray-500 dark:text-gray-400 mb-4">Default: {getDefaultApiUrl()}</Text>
                  <TextInput
                    className="border border-gray-300 dark:border-gray-600 rounded-md p-3 text-lg dark:text-white bg-gray-50 dark:bg-gray-800 mb-4"
                    value={apiUrlInput}
                    onChangeText={setApiUrlInput}
                    placeholder="e.g. http://192.168.1.10:9000/api"
                    autoCapitalize="none"
                    keyboardType="url"
                  />
                  <Pressable
                    onPress={handleSaveSettings}
                    className="bg-pink-500 rounded-md p-3"
                  >
                    <Text className="text-white text-center font-bold text-lg">Save and Reload</Text>
                  </Pressable>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>

      {statusMessage && (
        <View className="p-2 bg-yellow-100 border-b border-yellow-200 dark:bg-yellow-900/50 dark:border-yellow-800">
          <Text className="text-center text-yellow-800 dark:text-yellow-200">{statusMessage}</Text>
        </View>
      )}

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#ec4899" />
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={({ item }) => <ProductCard product={item} />}
          keyExtractor={(item) => item.id.toString()}
          className="p-2"
        />
      )}
    </SafeAreaView>
  );
};

export default ProductListScreen; 