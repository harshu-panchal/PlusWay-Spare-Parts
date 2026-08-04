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
import { useEffect } from "react";
import {
  initializePushNotifications,
  setupForegroundNotificationHandler,
  registerFCMToken,
} from "./services/pushNotificationService";

// Eager imports for layouts and Home page (needed immediately)
import Layout from "./module/customer/components/Layout";
import AdminLayout from "./module/admin/layout/AdminLayout";
import Home from "./module/customer/pages/Home";

// Lazy-loaded Customer Pages
const BrandSelection = lazy(() => import("./module/customer/pages/BrandSelection"));
const ModelSelection = lazy(() => import("./module/customer/pages/ModelSelection"));
const ProductTypeSelection = lazy(() => import("./module/customer/pages/ProductTypeSelection"));
const CategoryRedirect = lazy(() => import("./module/customer/pages/CategoryRedirect"));
const ProductListing = lazy(() => import("./module/customer/pages/ProductListing"));
const HomeSectionCategories = lazy(() => import("./module/customer/pages/HomeSectionCategories"));
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

// Lazy-loaded Informational Pages
const About = lazy(() => import("./module/customer/pages/About"));
const Contact = lazy(() => import("./module/customer/pages/Contact"));
const LeadForm = lazy(() => import("./module/customer/pages/LeadForm"));
const PrivacyPolicy = lazy(() => import("./module/customer/pages/PrivacyPolicy"));
const RefundPolicy = lazy(() => import("./module/customer/pages/RefundPolicy"));
const TermsConditions = lazy(() => import("./module/customer/pages/TermsConditions"));
const Warranty = lazy(() => import("./module/customer/pages/Warranty"));
const Support = lazy(() => import("./module/customer/pages/Support"));
const Career = lazy(() => import("./module/customer/pages/Career"));
const TrackOrder = lazy(() => import("./module/customer/pages/TrackOrder"));
const ReplacementRequests = lazy(() => import("./module/customer/pages/ReplacementRequests"));
const Sitemap = lazy(() => import("./module/customer/pages/Sitemap"));
const HowToManuals = lazy(() => import("./module/customer/pages/HowToManuals"));
const MobileDirectory = lazy(() => import("./module/customer/pages/MobileDirectory"));

// Lazy-loaded Admin Pages
const AdminLogin = lazy(() => import("./module/admin/pages/AdminLogin"));
const Dashboard = lazy(() => import("./module/admin/pages/Dashboard"));
const CategoryManagement = lazy(() => import("./module/admin/pages/CategoryManagement"));
const BrandManagement = lazy(() => import("./module/admin/pages/BrandManagement"));
const ModelManagement = lazy(() => import("./module/admin/pages/ModelManagement"));
const ProductManagement = lazy(() => import("./module/admin/pages/ProductManagement"));
const AdminProductDetail = lazy(() => import("./module/admin/pages/ProductDetail"));
const StockManagement = lazy(() => import("./module/admin/pages/StockManagement"));
const OrderManagement = lazy(() => import("./module/admin/pages/OrderManagement"));
const OrderDetail = lazy(() => import("./module/admin/pages/OrderDetail"));
const CustomerManagement = lazy(() => import("./module/admin/pages/CustomerManagement"));
const CustomerDetail = lazy(() => import("./module/admin/pages/CustomerDetail"));
const ReviewManagement = lazy(() => import("./module/admin/pages/ReviewManagement"));
const Settings = lazy(() => import("./module/admin/pages/Settings"));
const ProductSidebarSettings = lazy(() => import("./module/admin/pages/ProductSidebarSettings"));
const Reports = lazy(() => import("./module/admin/pages/Reports"));
const Wallet = lazy(() => import("./module/admin/pages/Wallet"));
const SupportManagement = lazy(() => import("./module/admin/pages/SupportManagement"));
const BannerManagement = lazy(() => import("./module/admin/pages/BannerManagement"));
const HomeSectionManagement = lazy(() => import("./module/admin/pages/HomeSectionManagement"));
const BulkUploadHistory = lazy(() => import("./module/admin/pages/BulkUploadHistory"));
const LeadManagement = lazy(() => import("./module/admin/pages/LeadManagement"));

const AdminProtectedRoute = ({ children }) => {
  const isAdminAuthenticated = !!localStorage.getItem("adminToken");
  return isAdminAuthenticated ? (
    children
  ) : (
    <Navigate to="/admin/login" replace />
  );
};

const App = () => {
  useEffect(() => {
    // Initialize push notifications on app load
    initializePushNotifications();

    // Setup foreground message handler
    setupForegroundNotificationHandler((payload) => {
      console.log("Foreground notification received:", payload);
      // Optional: show a toast or custom alert here
    });

    // Try to register token if user is already logged in
    const userInfo = localStorage.getItem("userInfo");
    const adminToken = localStorage.getItem("adminToken");
    if (userInfo || adminToken) {
      registerFCMToken();
    }
  }, []);

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
              {/* Legacy /category/:slug — used by banners & external links.
                  Resolves the slug → category._id and redirects to the
                  canonical /products?category=<id> route. */}
              <Route path="category/:slug" element={<CategoryRedirect />} />
              <Route path="brand/:brandId/models" element={<ModelSelection />} />
              <Route path="model/:modelId/products" element={<ProductTypeSelection />} />
              <Route path="model/:modelId/mobile-phones" element={<ProductTypeSelection defaultDeviceType="Mobile" />} />
              <Route path="model/:modelId/mobiles" element={<ProductTypeSelection defaultDeviceType="Mobile" />} />
              <Route path="model/:modelId/spare-parts" element={<ProductTypeSelection defaultDeviceType="Spare Parts" />} />
              <Route path="model/:modelId/parts" element={<ProductTypeSelection defaultDeviceType="Spare Parts" />} />
              <Route path="products" element={<ProductListing />} />
              <Route path="section/:sectionId" element={<HomeSectionCategories />} />
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

              {/* Informational Pages */}
              <Route path="about" element={<About />} />
              <Route path="contact" element={<Contact />} />
              <Route path="enquiry" element={<LeadForm />} />
              <Route path="privacy-policy" element={<PrivacyPolicy />} />
              <Route path="refund-policy" element={<RefundPolicy />} />
              <Route path="terms-conditions" element={<TermsConditions />} />
              <Route path="warranty" element={<Warranty />} />
              <Route path="support" element={<Support />} />
              <Route path="career" element={<Career />} />
              <Route path="track-order" element={<TrackOrder />} />
              <Route path="replacement-requests" element={<ReplacementRequests />} />
              <Route path="sitemap" element={<Sitemap />} />
              <Route path="how-to-manuals" element={<HowToManuals />} />
              <Route path="mobile-directory" element={<MobileDirectory />} />
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
              <Route path="products/:id" element={<AdminProductDetail />} />
              <Route path="stock" element={<StockManagement />} />
              <Route path="bulk-upload-history" element={<BulkUploadHistory />} />
              <Route path="orders" element={<OrderManagement />} />
              <Route path="orders/:id" element={<OrderDetail />} />
              <Route path="customers" element={<CustomerManagement />} />
              <Route path="customers/:id" element={<CustomerDetail />} />
              <Route path="leads" element={<LeadManagement />} />
              <Route path="reviews" element={<ReviewManagement />} />
              <Route path="support" element={<SupportManagement />} />
              <Route path="reports" element={<Reports />} />
              <Route path="wallet" element={<Wallet />} />
              <Route path="settings" element={<Settings />} />
              <Route path="product-sidebar" element={<ProductSidebarSettings />} />
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
