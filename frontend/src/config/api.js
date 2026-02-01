/**
 * API Configuration
 * Centralized configuration for API endpoints
 */

// Get API base URL from environment variable, fallback to localhost for development
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

/**
 * Helper function to construct full API URLs
 * @param {string} path - API endpoint path (e.g., '/api/customer/login')
 * @returns {string} Full API URL
 */
export const getApiUrl = (path) => {
    // Remove leading slash if present to avoid double slashes
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `${API_BASE_URL}/${cleanPath}`;
};

/**
 * Common API endpoints
 */
export const API_ENDPOINTS = {
    // Customer Auth
    CUSTOMER_LOGIN: `${API_BASE_URL}/api/customer/login`,
    CUSTOMER_REGISTER: `${API_BASE_URL}/api/customer/register`,

    // Products
    PRODUCTS: `${API_BASE_URL}/api/customer/products`,
    PRODUCT_DETAIL: (id) => `${API_BASE_URL}/api/customer/products/${id}`,

    // Brands & Models
    BRANDS: `${API_BASE_URL}/api/customer/brands`,
    MODELS: `${API_BASE_URL}/api/customer/models`,

    // Home
    BANNERS: `${API_BASE_URL}/api/customer/banners`,
    HOME_SECTIONS: `${API_BASE_URL}/api/customer/home-sections`,

    // Orders
    ORDERS: `${API_BASE_URL}/api/customer/orders`,
    MY_ORDERS: `${API_BASE_URL}/api/customer/orders/myorders`,
    ORDER_DETAIL: (id) => `${API_BASE_URL}/api/customer/orders/${id}`,
    ORDER_PAY: (id) => `${API_BASE_URL}/api/customer/orders/${id}/pay`,

    // Config
    PAYPAL_CONFIG: `${API_BASE_URL}/api/config/paypal`,
};

export default API_BASE_URL;
