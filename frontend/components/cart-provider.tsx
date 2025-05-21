"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { usePathname } from 'next/navigation';

interface CartItem {
    id: string; // ID del producto en el frontend (ej. un slug, o el mismo productId)
    productId: string; // ID del producto en el backend/base de datos
    name: string;
    price: number;
    quantity: number;
    image?: string;
    //description?: string;
}

interface CartContextType {
    cart: CartItem[];
    addToCart: (item: Omit<CartItem, "quantity" | "id" | "productId"> & { id: string; productId: string }) => Promise<void>;
    removeFromCart: (productId: string) => Promise<void>;
    updateItemQuantity: (productId: string, quantity: number) => Promise<void>;
    clearCart: () => Promise<void>;
    isLoading: boolean;
    error: string | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const pathname = usePathname();

    // Función para obtener el token de localStorage de forma segura en el cliente
    const getToken = useCallback(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('token'); // Asume que el token se guarda con la clave 'token'
        }
        return null;
    }, []);

    // Función para obtener el carrito del backend
    const fetchCart = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        const token = getToken();

        if (!token) {
            // Si no hay token, el usuario no está autenticado, el carrito está vacío en el frontend
            setCart([]);
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_CART_API_URL}/api/cart`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`, // Envía el token
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                // Si el carrito no existe (404), inicializa el carrito vacío
                if (response.status === 404) {
                    setCart([]);
                } else {
                    throw new Error(`Failed to fetch cart: ${response.status}`);
                }
            } else {
                const result = await response.json();
                // ACCESO CORRECTO A LOS DATOS: result.data.items
                setCart(result.data.items || []);
            }
        } catch (e: any) {
            console.error("Error al cargar el carrito:", e);
            setError(e.message || "Failed to load cart.");
            setCart([]);
        } finally {
            setIsLoading(false);
        }
    }, [getToken]); // Dependencia de getToken

    // Efecto para cargar el carrito al montar el componente y cuando la ruta cambia
    useEffect(() => {
        fetchCart();
    }, [fetchCart, pathname]); // Dependencia de pathname para re-fetch si la ruta cambia

    // Función para añadir un ítem al carrito
    const addToCart = useCallback(async (item: Omit<CartItem, "quantity" | "id" | "productId"> & { id: string; productId: string }) => {
        setIsLoading(true);
        setError(null);
        const token = getToken();

        if (!token) {
            setError("User not authenticated. Please log in to add items to cart.");
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_CART_API_URL}/api/cart/items`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`, // Envía el token
                },
                body: JSON.stringify({
                    productId: item.productId,
                    quantity: 1, // Siempre añadir una unidad por defecto
                    name: item.name,
                    price: item.price,
                    image: item.image,
                   // description: item.description,
                }),
            });
            if (!response.ok) throw new Error("Failed to add item to cart");
            await fetchCart(); // Recarga el carrito desde el backend para actualizar el estado
        } catch (e: any) {
            console.error("Error al añadir ítem:", e);
            setError(e.message || "Failed to add item.");
        } finally {
            setIsLoading(false);
        }
    }, [getToken, fetchCart]); // Dependencias de getToken y fetchCart

    // Función para eliminar un ítem del carrito
    const removeFromCart = useCallback(async (productId: string) => {
        setIsLoading(true);
        setError(null);
        const token = getToken();

        if (!token) {
            setError("User not authenticated. Please log in to remove items from cart.");
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_CART_API_URL}/api/cart/items/${productId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`, // Envía el token
                },
            });
            if (!response.ok) throw new Error("Failed to remove item from cart");
            await fetchCart(); // Recarga el carrito para reflejar los cambios
        } catch (e: any) {
            console.error("Error al eliminar ítem:", e);
            setError(e.message || "Failed to remove item.");
        } finally {
            setIsLoading(false);
        }
    }, [getToken, fetchCart]);

    // Función para actualizar la cantidad de un ítem
    const updateItemQuantity = useCallback(async (productId: string, quantity: number) => {
        if (quantity <= 0) {
            await removeFromCart(productId); // Si la cantidad es 0 o menos, elimínalo
            return;
        }
        setIsLoading(true);
        setError(null);
        const token = getToken();

        if (!token) {
            setError("User not authenticated. Please log in to update cart.");
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_CART_API_URL}/api/cart/items/${productId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`, // Envía el token
                },
                body: JSON.stringify({ quantity }),
            });
            if (!response.ok) throw new Error("Failed to update item quantity");
            await fetchCart(); // Recarga el carrito para reflejar los cambios
        } catch (e: any) {
            console.error("Error al actualizar cantidad:", e);
            setError(e.message || "Failed to update quantity.");
        } finally {
            setIsLoading(false);
        }
    }, [getToken, fetchCart, removeFromCart]); // Asegura que removeFromCart también sea una dependencia

    // Función para vaciar todo el carrito
    const clearCart = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        const token = getToken();

        if (!token) {
            setError("User not authenticated. Please log in to clear cart.");
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_CART_API_URL}/api/cart`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`, // Envía el token
                },
            });
            if (!response.ok) throw new Error("Failed to clear cart");
            setCart([]); // Optimisticamente vacía el carrito en el frontend. fetchCart podría ser redundante aquí
        } catch (e: any) {
            console.error("Error al vaciar carrito:", e);
            setError(e.message || "Failed to clear cart.");
        } finally {
            setIsLoading(false);
        }
    }, [getToken]);

    const contextValue = {
        cart,
        addToCart,
        removeFromCart,
        updateItemQuantity,
        clearCart,
        isLoading,
        error,
    };

    return (
        <CartContext.Provider value={contextValue}>
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
};