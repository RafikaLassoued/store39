import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { StoreLayout } from './components/layout/StoreLayout';
import { HomePage } from './pages/store/HomePage';
import { ProductsPage } from './pages/store/ProductsPage';
import { ProductDetailPage } from './pages/store/ProductDetailPage';
import { CartPage } from './pages/store/CartPage';
import { CheckoutPage } from './pages/store/CheckoutPage';
import { OrdersPage } from './pages/store/OrdersPage';
import { CmsPage } from './pages/store/CmsPage';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminCategories } from './pages/admin/AdminCategories';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminDelivery } from './pages/admin/AdminDelivery';
import { AdminCoupons } from './pages/admin/AdminCoupons';
import { AdminAnalytics } from './pages/admin/AdminAnalytics';
import { AdminSettings } from './pages/admin/AdminSettings';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { initFacebookPixel, initGA4, trackEvent } from './lib/tracking';
import { updateMetaTags, generateStoreSchema } from './lib/seo';
import { AddProductPage } from './pages/admin/AddProductPage';

import { getPixelSettings } from './lib/supabaseStore';
import { useAdminAuth } from './hooks/useAdminAuth';
import { useStore } from './hooks/useStore';
import type { PixelSettings } from './types';

function TrackingInit({ settings }: { settings: PixelSettings | null }) {
  useEffect(() => {
    if (settings?.isFacebookEnabled && settings.facebookPixelId) {
      initFacebookPixel(settings.facebookPixelId);
    }
    if (settings?.isGoogleEnabled && settings.googleAnalyticsId) {
      initGA4(settings.googleAnalyticsId);
    }

    trackEvent('page_view');
    updateMetaTags({
      title: 'متجر ملابس - متجرك الإلكتروني للأزياء والموضة في الجزائر',
      description: 'تسوقي أحدث صيحات الموضة والأزياء بأسعار تنافسية مع توصيل لجميع الولايات الجزائرية. فساتين، عبايات، حجابات وأكثر.',
      type: 'website',
    });
  }, [settings]);

  return null;
}

function SEOInit() {
  useEffect(() => {
    // Add structured data
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.innerHTML = generateStoreSchema();
    document.head.appendChild(script);

    // Add canonical URL
    const canonical = document.createElement('link');
    canonical.rel = 'canonical';
    canonical.href = window.location.origin;
    document.head.appendChild(canonical);

    // Add OpenGraph locale
    const ogLocale = document.createElement('meta');
    ogLocale.setAttribute('property', 'og:locale');
    ogLocale.setAttribute('content', 'ar_DZ');
    document.head.appendChild(ogLocale);

    return () => {
      script.remove();
      canonical.remove();
      ogLocale.remove();
    };
  }, []);

  return null;
}

export default function App() {
  const adminPath = '/admin';
  const adminLoginPath = '/admin-secret-x9k2/login';
  const session = useAdminAuth((s) => s.session);
  const authLoading = useAdminAuth((s) => s.loading);
  const initAuth = useAdminAuth((s) => s.init);
  const [pixelSettings, setPixelSettings] = useState<PixelSettings | null>(null);

  useEffect(() => {
    void initAuth();
  }, [initAuth]);

  const loadProducts = useStore((s) => s.loadProducts);
  const loadCategories = useStore((s) => s.loadCategories);
  const loadCoupons = useStore((s) => s.loadCoupons);

  useEffect(() => {
    const run = async () => {
      const pixels = await getPixelSettings();
      setPixelSettings(pixels);
    };
    void run();
  }, []);

  useEffect(() => {
    void loadProducts();
    void loadCategories();
    void loadCoupons();
  }, [loadProducts, loadCategories, loadCoupons]);

  if (authLoading) return <div className="p-6">جاري التحقق من الجلسة...</div>;

  return (
    <BrowserRouter>
      <TrackingInit settings={pixelSettings} />
      <SEOInit />
      <Routes>
        {/* Store Routes */}
        <Route element={<StoreLayout adminPath={adminPath} />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/product/:slug" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/page/:slug" element={<CmsPage />} />
        </Route>

        {/* Admin Secret Login Route */}
        <Route path={adminLoginPath} element={<AdminLoginPage redirectPath={adminPath} />} />

        {/* Admin Protected Routes */}
        <Route
          path={adminPath}
          element={
            session ? (
              <AdminLayout basePath={adminPath} />
            ) : (
              <Navigate to={adminLoginPath} replace />
            )
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="delivery" element={<AdminDelivery />} />
          <Route path="coupons" element={<AdminCoupons />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="addproduct" element={<AddProductPage />} />
        </Route>

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
