import React from 'react';
import Header from './Header';
import Navbar from './Navbar';
import Footer from './Footer';
import MobileMenu from './MobileMenu';

/**
 * Main User Layout wrapping Header, Navbar, Content, Footer, and Mobile bottom navigation
 */
export function UserLayout({
  children,
  onOpenCatalog,
  onOpenAbout,
  onOpenContact,
  onTrackOrder,
  cartCount,
  onOpenCart,
  searchTerm,
  setSearchTerm,
  activeCategory,
  setActiveCategory,
  categories,
  user,
  onOpenAuth,
  onLogout
}) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header
        onOpenCatalog={onOpenCatalog}
        onOpenAbout={onOpenAbout}
        onOpenContact={onOpenContact}
        onTrackOrder={onTrackOrder}
      />
      <Navbar
        cartCount={cartCount}
        onOpenCart={onOpenCart}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        categories={categories}
        onOpenAbout={onOpenAbout}
        onOpenContact={onOpenContact}
        onOpenCatalog={onOpenCatalog}
        user={user}
        onOpenAuth={onOpenAuth}
        onLogout={onLogout}
      />
      <main style={{ flex: 1 }}>
        {children}
      </main>
      <Footer />
      <MobileMenu
        activeTab="home"
        cartCount={cartCount}
        onOpenCart={onOpenCart}
        user={user}
        onOpenAuth={onOpenAuth}
        onOpenCatalog={onOpenCatalog}
        onTrackOrder={onTrackOrder}
      />
    </div>
  );
}

export default UserLayout;
