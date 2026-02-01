import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../../../config/api';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(false);

    // Helper to get token
    const getToken = () => {
        const userInfo = localStorage.getItem('userInfo');
        return userInfo ? JSON.parse(userInfo).token : null;
    };

    const getConfig = () => {
        const token = getToken();
        return {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };
    };

    const fetchCart = async () => {
        const token = getToken();
        if (!token) {
            setCartItems([]);
            return;
        }
        try {
            const { data } = await axios.get(API_ENDPOINTS.CART, getConfig());
            // Transform backend structure to frontend structure if needed
            // Backend returns { items: [{ product: {...}, quantity: 1 }] }
            // Frontend expects flat list mostly: [{ ...product, quantity: 1 }]
            const formattedItems = (data.items || []).map(item => ({
                ...item.product,
                quantity: item.quantity,
                // Ensure image is accessible (product might have image string or images array)
                image: item.product.image || (item.product.images && item.product.images[0]) || ''
            }));
            setCartItems(formattedItems);
        } catch (error) {
            console.error("Error fetching cart:", error);
        }
    };

    useEffect(() => {
        fetchCart();
    }, []);

    const addToCart = async (product, quantity = 1) => {
        const token = getToken();
        if (!token) {
            alert("Please login to add items to cart");
            return;
        }

        try {
            await axios.post(API_ENDPOINTS.CART, {
                productId: product._id,
                quantity
            }, getConfig());
            fetchCart(); // Refetch to sync
            alert("Item added to cart!");
        } catch (error) {
            console.error("Error adding to cart:", error);
            alert("Failed to add to cart");
        }
    };

    const removeFromCart = async (productId) => {
        try {
            await axios.delete(API_ENDPOINTS.CART_ITEM(productId), getConfig());
            fetchCart();
        } catch (error) {
            console.error("Error removing from cart:", error);
        }
    };

    const updateQuantity = async (productId, quantity) => {
        if (quantity < 1) return;
        try {
            await axios.put(API_ENDPOINTS.CART_ITEM(productId), {
                quantity
            }, getConfig());
            fetchCart();
        } catch (error) {
            console.error("Error updating quantity:", error);
        }
    };

    const clearCart = async () => {
        try {
            await axios.delete(API_ENDPOINTS.CART, getConfig());
            fetchCart();
        } catch (error) {
            console.error("Error clearing cart:", error);
        }
    };

    const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount, fetchCart }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);

