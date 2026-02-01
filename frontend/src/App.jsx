import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Layout from "./module/customer/components/Layout";
import Home from "./module/customer/pages/Home";
import BrandSelection from "./module/customer/pages/BrandSelection";
import ModelSelection from "./module/customer/pages/ModelSelection";
import ProductTypeSelection from "./module/customer/pages/ProductTypeSelection";
import ProductListing from "./module/customer/pages/ProductListing";
import ProductDetail from "./module/customer/pages/ProductDetail";
import OrderDetails from "./module/customer/pages/OrderDetails";
import Cart from "./module/customer/pages/Cart";
import Login from "./module/customer/pages/Login";
import Signup from "./module/customer/pages/Signup";
import Checkout from "./module/customer/pages/Checkout";
import Profile from "./module/customer/pages/Profile";
import Orders from "./module/customer/pages/Orders";
import Addresses from "./module/customer/pages/Addresses";
import SettingsPage from "./module/customer/pages/Settings";
import { CartProvider } from "./module/customer/context/CartContext";
import ScrollToTop from "./components/ScrollToTop";

// Admin Imports
import AdminLayout from "./module/admin/layout/AdminLayout";
import AdminLogin from "./module/admin/pages/AdminLogin";
import Dashboard from "./module/admin/pages/Dashboard";
import CategoryManagement from "./module/admin/pages/CategoryManagement";
import BrandManagement from "./module/admin/pages/BrandManagement";
import ModelManagement from "./module/admin/pages/ModelManagement";
import ProductManagement from "./module/admin/pages/ProductManagement";
import StockManagement from "./module/admin/pages/StockManagement";
import OrderManagement from "./module/admin/pages/OrderManagement";
import OrderDetail from "./module/admin/pages/OrderDetail";
import CustomerManagement from "./module/admin/pages/CustomerManagement";
import CustomerDetail from "./module/admin/pages/CustomerDetail";
import ReviewManagement from "./module/admin/pages/ReviewManagement";
import Settings from "./module/admin/pages/Settings";
import Reports from "./module/admin/pages/Reports";

import SupportManagement from "./module/admin/pages/SupportManagement";
import BannerManagement from "./module/admin/pages/BannerManagement";
import HomeSectionManagement from "./module/admin/pages/HomeSectionManagement";

const AdminProtectedRoute = ({ children }) => {
  const isAdminAuthenticated = !!localStorage.getItem("adminToken");
  return isAdminAuthenticated ? (
    children
  ) : (
    <Navigate to="/admin/login" replace />
  );
};

const App = () => {
  return (
    <CartProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Customer Routes */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="brand-selection" element={<BrandSelection />} />
            <Route path="category/:slug" element={<BrandSelection />} />
            <Route path="brand/:brandId/models" element={<ModelSelection />} />
            <Route path="model/:modelId/products" element={<ProductTypeSelection />} />
            <Route path="products" element={<ProductListing />} />
            <Route path="product/:id" element={<ProductDetail />} />
            <Route path=":slug.html" element={<ProductDetail />} />
            <Route path="cart" element={<Cart />} />
            <Route path="login" element={<Login />} />
            <Route path="signup" element={<Signup />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="profile" element={<Profile />} />
            <Route path="order/:id" element={<OrderDetails />} />
            <Route path="profile/orders" element={<Orders />} />
            <Route path="profile/addresses" element={<Addresses />} />
            <Route path="profile/settings" element={<SettingsPage />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <AdminProtectedRoute>
                <AdminLayout />
              </AdminProtectedRoute>
            }>
            <Route index element={<Dashboard />} />
            <Route path="categories" element={<CategoryManagement />} />
            <Route path="brands" element={<BrandManagement />} />
            <Route path="models" element={<ModelManagement />} />
            <Route path="products" element={<ProductManagement />} />
            <Route path="stock" element={<StockManagement />} />
            <Route path="orders" element={<OrderManagement />} />
            <Route path="orders/:id" element={<OrderDetail />} />
            <Route path="customers" element={<CustomerManagement />} />
            <Route path="customers/:id" element={<CustomerDetail />} />
            <Route path="reviews" element={<ReviewManagement />} />
            <Route path="support" element={<SupportManagement />} />
            <Route path="reports" element={<Reports />} />

            <Route path="settings" element={<Settings />} />
            <Route path="banners" element={<BannerManagement />} />
            <Route path="home-sections" element={<HomeSectionManagement />} />
          </Route>
        </Routes>
      </Router>
    </CartProvider>
  );
};

export default App;
