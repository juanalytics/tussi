import React from 'react';
import { Text, View } from 'react-native';
import { Product } from '../types/product';
import { Card } from './ui/card';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <Card className="m-2">
      <View>
        <Text className="text-lg font-bold">{product.name}</Text>
        <Text className="text-sm text-gray-600 mt-1">{product.description || 'No description'}</Text>
        <View className="flex-row justify-between items-center mt-4">
          <Text className="text-base font-semibold">${product.price.toFixed(2)}</Text>
          <Text className="text-base">Stock: {product.stock}</Text>
        </View>
      </View>
    </Card>
  );
};

export default ProductCard; 