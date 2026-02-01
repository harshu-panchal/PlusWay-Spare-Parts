import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

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
            const { data } = await axios.get('http://localhost:5001/api/customer/cart', getConfig());
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
            await axios.post('http://localhost:5001/api/customer/cart', {
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
            await axios.delete(`http://localhost:5001/api/customer/cart/${productId}`, getConfig());
            fetchCart();
        } catch (error) {
            console.error("Error removing from cart:", error);
        }
    };

    const updateQuantity = async (productId, quantity) => {
        if (quantity < 1) return;
        try {
            await axios.put(`http://localhost:5001/api/customer/cart/${productId}`, {
                quantity
            }, getConfig());
            fetchCart();
        } catch (error) {
            console.error("Error updating quantity:", error);
        }
    };

    const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, cartTotal, cartCount, fetchCart }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);

