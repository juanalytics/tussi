import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, FlatList, ActivityIndicator, SafeAreaView, Pressable, Animated, Easing } from 'react-native';
import { styled } from 'nativewind';
import { Product } from '../types/product';
import { fetchProducts } from '../api/products';
import { MOCKED_PRODUCTS } from '../constants/mocks';
import ProductCard from '../components/ProductCard';
import { RefreshCw } from 'lucide-react-native';

const StyledText = styled(Text);

const ProductListScreen = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const spinValue = useRef(new Animated.Value(0)).current;

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
      setStatusMessage('Could not connect to API. Showing mock data.');
      setProducts(MOCKED_PRODUCTS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

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

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-black">
      <View className="flex-row justify-between items-center p-4 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
        <StyledText className="text-2xl font-bold text-pink-500">TUSSI</StyledText>
        <Pressable onPress={loadProducts} disabled={loading} className="p-2">
          <Animated.View style={{ transform: [{ rotate: rotation }] }}>
            <RefreshCw color={loading ? '#fbcfe8' : '#ec4899'} />
          </Animated.View>
        </Pressable>
      </View>

      {statusMessage && (
        <View className="p-2 bg-yellow-100 border-b border-yellow-200">
          <Text className="text-center text-yellow-800">{statusMessage}</Text>
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