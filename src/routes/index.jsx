import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Product from '../pages/products/Product';
import ProductDetailPage from '../pages/products/ProductDetailPage';
import OrderTrackingPage from '../pages/orders/OrderTrackingPage';
import CustomerAccountPage from '../pages/account/CustomerAccountPage';

/**
 * Main App Routes configuration
 */
export function AppRoutes({
  onAddToCart,
  onQuickView,
  searchTerm,
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
    <Routes>
      {/* Catalog Home */}
      <Route
        path="/"
        element={
          <Product
            onAddToCart={onAddToCart}
            onQuickView={onQuickView}
            searchTerm={searchTerm}
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
  );
}

export default AppRoutes;
