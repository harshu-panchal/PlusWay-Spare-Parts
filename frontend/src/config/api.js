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
    CUSTOMER_PROFILE: `${API_BASE_URL}/api/customer/profile`,
    CUSTOMER_SEND_OTP: `${API_BASE_URL}/api/customer/send-otp`,
    CUSTOMER_VERIFY_OTP: `${API_BASE_URL}/api/customer/verify-otp`,

    // Products
    PRODUCTS: `${API_BASE_URL}/api/customer/products`,
    PRODUCT_DETAIL: (id) => `${API_BASE_URL}/api/customer/products/${id}`,
    CREATE_REVIEW: (id) => `${API_BASE_URL}/api/customer/products/${id}/reviews`,

    // Brands & Models
    BRANDS: `${API_BASE_URL}/api/customer/brands`,
    MODELS: `${API_BASE_URL}/api/customer/models`,

    // Home
    BANNERS: `${API_BASE_URL}/api/customer/banners`,
    HOME_SECTIONS: `${API_BASE_URL}/api/customer/home-sections`,

    // Orders
    ORDERS: `${API_BASE_URL}/api/customer/orders`,
    MY_ORDERS: `${API_BASE_URL}/api/customer/orders/myorders`,
    MY_REVIEWS: `${API_BASE_URL}/api/customer/reviews`,
    ORDER_DETAIL: (id) => `${API_BASE_URL}/api/customer/orders/${id}`,
    ORDER_PAY: (id) => `${API_BASE_URL}/api/customer/orders/${id}/pay`,
    RAZORPAY_CREATE_ORDER: (id) => `${API_BASE_URL}/api/customer/orders/${id}/razorpay`,
    RAZORPAY_VERIFY: (id) => `${API_BASE_URL}/api/customer/orders/${id}/razorpay/verify`,

    // Config
    PAYPAL_CONFIG: `${API_BASE_URL}/api/config/paypal`,

    // Cart
    CART: `${API_BASE_URL}/api/customer/cart`,
    CART_ITEM: (id) => `${API_BASE_URL}/api/customer/cart/${id}`,

    // Addresses
    ADDRESSES: `${API_BASE_URL}/api/customer/addresses`,
    ADDRESS_DETAIL: (id) => `${API_BASE_URL}/api/customer/addresses/${id}`,
    ADDRESS_DEFAULT: (id) => `${API_BASE_URL}/api/customer/addresses/${id}/default`,

    // Admin Auth
    ADMIN_LOGIN: `${API_BASE_URL}/api/admin/login`,

    // Admin Dashboard & Reports
    ADMIN_DASHBOARD_STATS: `${API_BASE_URL}/api/admin/dashboard-stats`,
    ADMIN_REPORTS_STATS: `${API_BASE_URL}/api/admin/reports-stats`,
    ADMIN_WALLET_STATS: `${API_BASE_URL}/api/admin/wallet-stats`,

    // Admin Products
    ADMIN_PRODUCTS: `${API_BASE_URL}/api/admin/products`,
    ADMIN_PRODUCT_DETAIL: (id) => `${API_BASE_URL}/api/admin/products/${id}`,
    ADMIN_PRODUCT_STOCK: (id) => `${API_BASE_URL}/api/admin/products/${id}/stock`,

    // Admin Categories & Brands
    ADMIN_CATEGORIES: `${API_BASE_URL}/api/admin/categories`,
    ADMIN_CATEGORY_DETAIL: (id) => `${API_BASE_URL}/api/admin/categories/${id}`,
    ADMIN_BRANDS: `${API_BASE_URL}/api/admin/brands`,
    ADMIN_BRAND_DETAIL: (id) => `${API_BASE_URL}/api/admin/brands/${id}`,

    // Admin Models
    ADMIN_MODELS: `${API_BASE_URL}/api/admin/models`,
    ADMIN_MODEL_DETAIL: (id) => `${API_BASE_URL}/api/admin/models/${id}`,

    // Admin Orders
    ADMIN_ORDERS: `${API_BASE_URL}/api/admin/orders`,
    ADMIN_ORDER_DETAIL: (id) => `${API_BASE_URL}/api/admin/orders/${id}`,
    ADMIN_ORDER_STATUS: (id) => `${API_BASE_URL}/api/admin/orders/${id}/status`,
    ADMIN_ORDER_INVOICE: (id) => `${API_BASE_URL}/api/admin/orders/${id}/invoice`,

    // Admin Customers
    ADMIN_CUSTOMERS: `${API_BASE_URL}/api/admin/customers`,
    ADMIN_CUSTOMER_DETAIL: (id) => `${API_BASE_URL}/api/admin/customers/${id}`,

    // Admin Banners
    ADMIN_BANNERS: `${API_BASE_URL}/api/admin/banners`,
    ADMIN_BANNER_DETAIL: (id) => `${API_BASE_URL}/api/admin/banners/${id}`,

    // Admin Home Sections
    ADMIN_HOME_SECTIONS: `${API_BASE_URL}/api/admin/home-sections`,
    ADMIN_HOME_SECTION_DETAIL: (id) => `${API_BASE_URL}/api/admin/home-sections/${id}`,

    // Admin Reviews
    ADMIN_REVIEWS: `${API_BASE_URL}/api/admin/reviews`,
    ADMIN_REVIEW_DETAIL: (id) => `${API_BASE_URL}/api/admin/reviews/${id}`,

    // Admin Support Tickets
    ADMIN_TICKETS: `${API_BASE_URL}/api/admin/tickets`,
    ADMIN_TICKET_DETAIL: (id) => `${API_BASE_URL}/api/admin/tickets/${id}`,

    // Customer Categories (public endpoint used by admin)
    CUSTOMER_CATEGORIES: `${API_BASE_URL}/api/customer/categories`,

    // Translation API
    TRANSLATE: `${API_BASE_URL}/api/v1/translate`,
    TRANSLATE_BATCH: `${API_BASE_URL}/api/v1/translate/batch`,
    TRANSLATE_OBJECT: `${API_BASE_URL}/api/v1/translate/object`,
    TRANSLATE_STATS: `${API_BASE_URL}/api/v1/translate/stats`,
};

export default API_BASE_URL;
