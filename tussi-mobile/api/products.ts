import { Product } from '../types/product';

// For Android emulator, use 'http://10.0.2.2:8001'
// For running on a real device, use your host machine's IP address.
const API_URL = 'http://localhost:8001';

export const fetchProducts = async (): Promise<Product[]> => {
  try {
    const response = await fetch(`${API_URL}/products`);
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    const data: Product[] = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    // In a real app, you'd want to handle this error more gracefully
    throw error;
  }
}; 