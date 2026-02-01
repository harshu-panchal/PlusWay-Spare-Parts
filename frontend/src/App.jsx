import React, { lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { CartProvider } from "./module/customer/context/CartContext";
import ScrollToTop from "./components/ScrollToTop";
import LoadingFallback from "./components/LoadingFallback";
import RouteTransitionLoader from "./components/RouteTransitionLoader";

// Eager imports for layouts (needed immediately)
import Layout from "./module/customer/components/Layout";
import AdminLayout from "./module/admin/layout/AdminLayout";

// Lazy-loaded Customer Pages
const Home = lazy(() => import("./module/customer/pages/Home"));
const BrandSelection = lazy(() => import("./module/customer/pages/BrandSelection"));
const ModelSelection = lazy(() => import("./module/customer/pages/ModelSelection"));
const ProductTypeSelection = lazy(() => import("./module/customer/pages/ProductTypeSelection"));
const ProductListing = lazy(() => import("./module/customer/pages/ProductListing"));
const ProductDetail = lazy(() => import("./module/customer/pages/ProductDetail"));
const OrderDetails = lazy(() => import("./module/customer/pages/OrderDetails"));
const Cart = lazy(() => import("./module/customer/pages/Cart"));
const Login = lazy(() => import("./module/customer/pages/Login"));
const Signup = lazy(() => import("./module/customer/pages/Signup"));
const Checkout = lazy(() => import("./module/customer/pages/Checkout"));
const Profile = lazy(() => import("./module/customer/pages/Profile"));
const Orders = lazy(() => import("./module/customer/pages/Orders"));
const Addresses = lazy(() => import("./module/customer/pages/Addresses"));
const SettingsPage = lazy(() => import("./module/customer/pages/Settings"));

// Lazy-loaded Admin Pages
const AdminLogin = lazy(() => import("./module/admin/pages/AdminLogin"));
const Dashboard = lazy(() => import("./module/admin/pages/Dashboard"));
const CategoryManagement = lazy(() => import("./module/admin/pages/CategoryManagement"));
const BrandManagement = lazy(() => import("./module/admin/pages/BrandManagement"));
const ModelManagement = lazy(() => import("./module/admin/pages/ModelManagement"));
const ProductManagement = lazy(() => import("./module/admin/pages/ProductManagement"));
const StockManagement = lazy(() => import("./module/admin/pages/StockManagement"));
const OrderManagement = lazy(() => import("./module/admin/pages/OrderManagement"));
const OrderDetail = lazy(() => import("./module/admin/pages/OrderDetail"));
const CustomerManagement = lazy(() => import("./module/admin/pages/CustomerManagement"));
const CustomerDetail = lazy(() => import("./module/admin/pages/CustomerDetail"));
const ReviewManagement = lazy(() => import("./module/admin/pages/ReviewManagement"));
const Settings = lazy(() => import("./module/admin/pages/Settings"));
const Reports = lazy(() => import("./module/admin/pages/Reports"));
const SupportManagement = lazy(() => import("./module/admin/pages/SupportManagement"));
const BannerManagement = lazy(() => import("./module/admin/pages/BannerManagement"));
const HomeSectionManagement = lazy(() => import("./module/admin/pages/HomeSectionManagement"));

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
        <RouteTransitionLoader />
        <Suspense fallback={<LoadingFallback />}>
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
        </Suspense>
      </Router>
    </CartProvider>
  );
};

export default App;
