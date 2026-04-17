import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { StoreLayout } from './components/layout/StoreLayout';
import { HomePage } from './pages/store/HomePage';
import { ProductsPage } from './pages/store/ProductsPage';
import { ProductDetailPage } from './pages/store/ProductDetailPage';
import { CartPage } from './pages/store/CartPage';
import { CheckoutPage } from './pages/store/CheckoutPage';
import { OrdersPage } from './pages/store/OrdersPage';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminCategories } from './pages/admin/AdminCategories';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminDelivery } from './pages/admin/AdminDelivery';
import { AdminCoupons } from './pages/admin/AdminCoupons';
import { AdminAnalytics } from './pages/admin/AdminAnalytics';
import { initFacebookPixel, initTikTokPixel, initGA4, initGTM, trackEvent } from './lib/tracking';
import { updateMetaTags, generateStoreSchema } from './lib/seo';

function TrackingInit() {
  useEffect(() => {
    // Initialize tracking pixels (replace with actual IDs in production)
    initFacebookPixel('YOUR_FB_PIXEL_ID');
    initTikTokPixel('YOUR_TTQ_PIXEL_ID');
    initGA4('G-XXXXXXXXXX');
    initGTM('GTM-XXXXXXX');

    // Track initial page view
    trackEvent('page_view');

    // Set initial meta tags
    updateMetaTags({
      title: 'أناقتي - متجرك الإلكتروني للأزياء والموضة في الجزائر',
      description: 'تسوقي أحدث صيحات الموضة والأزياء بأسعار تنافسية مع توصيل لجميع الولايات الجزائرية. فساتين، عبايات، حجابات وأكثر.',
      type: 'website',
    });
  }, []);

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
      document.head.removeChild(script);
      document.head.removeChild(canonical);
      document.head.removeChild(ogLocale);
    };
  }, []);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <TrackingInit />
      <SEOInit />
      <Routes>
        {/* Store Routes */}
        <Route element={<StoreLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/product/:slug" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders" element={<OrdersPage />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="delivery" element={<AdminDelivery />} />
          <Route path="coupons" element={<AdminCoupons />} />
          <Route path="analytics" element={<AdminAnalytics />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
