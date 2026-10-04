import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

const Product = lazy(() => import('../pages/products/Product'));
const ProductDetailPage = lazy(() => import('../pages/products/ProductDetailPage'));
const OrderTrackingPage = lazy(() => import('../pages/orders/OrderTrackingPage'));
const CustomerAccountPage = lazy(() => import('../pages/account/CustomerAccountPage'));
const OrderSuccessPage = lazy(() => import('../pages/orders/OrderSuccessPage'));

function RouteLoadingFallback() {
  return (
    <div style={{
      minHeight: '60vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '16px'
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '3px solid rgba(0, 240, 255, 0.15)',
        borderTopColor: 'var(--accent-primary, #00f0ff)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />
      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary, #94a3b8)', fontWeight: '600', letterSpacing: '0.5px' }}>
        Loading page...
      </span>
    </div>
  );
}

/**
 * Main App Routes configuration
 */
export function AppRoutes({
  onAddToCart,
  onQuickView,
  searchTerm,
  setSearchTerm,
  activeCategory,
  setActiveCategory,
  categories,
  setCategories,
  onProductsLoaded,
  allProducts,
  onOpenAbout,
  onOpenContact,
  onOpenCheckout,
  onOpenTracking
}) {
  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <Routes>
        {/* Catalog Home */}
        <Route
          path="/"
          element={
            <Product
              onAddToCart={onAddToCart}
              onQuickView={onQuickView}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
              categories={categories}
              setCategories={setCategories}
              onProductsLoaded={onProductsLoaded}
              onOpenAbout={onOpenAbout}
              onOpenContact={onOpenContact}
            />
          }
        />

        {/* Dedicated Product Details Page */}
        <Route
          path="/products/:id"
          element={
            <ProductDetailPage
              allProducts={allProducts}
              onOpenCheckout={onOpenCheckout}
            />
          }
        />

        {/* Dedicated Order Tracking */}
        <Route path="/track" element={<OrderTrackingPage />} />
        <Route path="/track/:orderId" element={<OrderTrackingPage />} />

        {/* Order Payment Success / AnajakPay Callback */}
        <Route path="/orders/success" element={<OrderSuccessPage />} />

        {/* Customer Account Portal */}
        <Route path="/account" element={<CustomerAccountPage onOpenTracking={onOpenTracking} />} />

        {/* Fallback to Catalog */}
        <Route
          path="*"
          element={
            <Product
              onAddToCart={onAddToCart}
              onQuickView={onQuickView}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
              categories={categories}
              setCategories={setCategories}
              onProductsLoaded={onProductsLoaded}
              onOpenAbout={onOpenAbout}
              onOpenContact={onOpenContact}
            />
          }
        />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;
