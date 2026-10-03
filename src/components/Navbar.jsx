import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  BoltIcon, MagnifyingGlassIcon, XMarkIcon, ShoppingCartIcon, SparklesIcon, 
  CubeIcon, UserIcon, ArrowRightOnRectangleIcon, LifebuoyIcon, ArrowRightIcon,
  TagIcon, EyeIcon, PhotoIcon, CheckBadgeIcon
} from '@heroicons/react/24/outline';
import NotificationBell from './NotificationsCenter';
import { getImageUrl } from '../utils/imageHelper';
import { getCategoryName } from '../utils/categoryHelper';
import { fetchProducts } from '../services/api';

function Navbar({ 
  cartCount, onOpenCart, searchTerm, setSearchTerm, activeCategory, setActiveCategory, 
  categories, onOpenAbout, onOpenContact, onOpenSupport, supportUnreadCount = 0, 
  onOpenCatalog, user, onOpenAuth, onLogout, notifications, onMarkAllRead, onMarkRead, 
  onOpenTracking, onClearAllNotifications, products = [], onQuickView, onAddToCart 
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [localProducts, setLocalProducts] = useState(products || []);
  const searchWrapperRef = useRef(null);

  // Sync products when passed from parent
  useEffect(() => {
    if (products && products.length > 0) {
      setLocalProducts(products);
    }
  }, [products]);

  // Fallback fetch if products empty
  useEffect(() => {
    if (!products || products.length === 0) {
      fetchProducts().then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setLocalProducts(data);
        }
      }).catch(() => {});
    }
  }, [products]);

  // Click outside listener to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter matching products
  const productList = localProducts && localProducts.length > 0 ? localProducts : (products || []);
  
  const searchResults = useMemo(() => {
    if (!searchTerm || !searchTerm.trim()) return [];
    const term = searchTerm.toLowerCase().trim();
    return productList.filter(item => {
      const name = (item.name || '').toLowerCase();
      const desc = (item.description || '').toLowerCase();
      const cat = (getCategoryName(item) || '').toLowerCase();
      return name.includes(term) || desc.includes(term) || cat.includes(term);
    });
  }, [searchTerm, productList]);

  // Filter matching categories
  const matchingCategories = useMemo(() => {
    if (!searchTerm || !searchTerm.trim() || !categories) return [];
    const term = searchTerm.toLowerCase().trim();
    return categories.filter(c => c !== 'All' && c.toLowerCase().includes(term));
  }, [searchTerm, categories]);

  const handleSelectProduct = (product) => {
    setIsDropdownOpen(false);
    if (onQuickView) {
      onQuickView(product);
    } else {
      const el = document.getElementById('catalog-products-header') || document.getElementById('products-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleViewAllInCatalog = () => {
    setIsDropdownOpen(false);
    const el = document.getElementById('catalog-products-header') || document.getElementById('products-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };
  return (
    <header id="navbar-section" className="app-navbar" style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      backgroundColor: 'var(--bg-primary)',
      borderBottom: '1px solid var(--border-color)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
      transition: 'all 0.3s ease'
    }}>
      {/* Main Navigation Row */}
      <div className="container navbar-top-row">
        {/* Header Main Row (Brand + Action Buttons) */}
        <div className="navbar-header-main">
          {/* Brand Logo */}
          <div
            className="navbar-brand-wrapper"
            style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', flexShrink: 1, minWidth: 0, overflow: 'hidden' }}
            onClick={() => {
              setActiveCategory('All');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <div className="navbar-brand-icon" style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-cta)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 4px 14px rgba(30, 30, 30, 0.2)',
              flexShrink: 0
            }}>
              <BoltIcon style={{ width: '24px', height: '24px', color: '#fff' }} />
            </div>
            <div style={{ minWidth: 0, overflow: 'hidden' }}>
              <h1 className="navbar-brand-title" style={{ fontSize: '1.45rem', fontWeight: '800', margin: 0, lineHeight: 1.1, color: 'var(--text-primary)', letterSpacing: '-0.03em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Men ICT <span style={{ color: 'var(--accent-primary)' }}>Store</span>
              </h1>
              <span className="navbar-brand-subtitle" style={{ fontSize: '0.68rem', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: '700', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Premium Essentials
              </span>
            </div>
          </div>

        {/* Action Buttons & Quick Nav */}
        <div className="navbar-actions-group" style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
          <button
            onClick={() => {
              if (onOpenCatalog) onOpenCatalog();
              else {
                setActiveCategory('All');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className="desktop-only-btn"
            style={{
              padding: '9px 16px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'transparent',
              border: '1px solid transparent',
              color: 'var(--text-primary)',
              fontWeight: '600',
              fontSize: '0.88rem',
              transition: 'all 0.2s ease',
              cursor: 'pointer'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            Products
          </button>

          <button
            onClick={() => {
              const el = document.getElementById('best-sellers-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
              else window.location.href = '/#best-sellers-section';
            }}
            className="desktop-only-btn"
            style={{
              padding: '9px 16px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              color: '#F59E0B',
              fontWeight: '700',
              fontSize: '0.88rem',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(245, 158, 11, 0.2)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(245, 158, 11, 0.1)';
            }}
          >
            🔥 Best Sellers
          </button>

          <button
            onClick={onOpenAbout}
            className="desktop-only-btn"
            style={{
              padding: '9px 16px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'transparent',
              border: '1px solid transparent',
              color: 'var(--text-primary)',
              fontWeight: '600',
              fontSize: '0.88rem',
              transition: 'all 0.2s ease',
              cursor: 'pointer'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            About Us
          </button>

          <button
            onClick={onOpenContact}
            className="desktop-only-btn"
            style={{
              padding: '9px 16px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'transparent',
              border: '1px solid transparent',
              color: 'var(--text-primary)',
              fontWeight: '600',
              fontSize: '0.88rem',
              transition: 'all 0.2s ease',
              cursor: 'pointer'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            Contact
          </button>

          <button
            onClick={onOpenSupport}
            title="Help & Support Center"
            className="navbar-support-btn"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              fontWeight: '600',
              fontSize: '0.88rem',
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
              e.currentTarget.style.color = 'var(--accent-primary)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            <LifebuoyIcon style={{ width: '18px', height: '18px', color: 'var(--accent-primary)' }} />
            <span>Support</span>
            {supportUnreadCount > 0 && (
              <span style={{
                backgroundColor: '#ef4444',
                color: '#fff',
                borderRadius: '8px',
                padding: '1px 5px',
                fontSize: '0.65rem',
                fontWeight: '800',
                lineHeight: 1
              }}>
                {supportUnreadCount}
              </span>
            )}
          </button>

          {user ? (
            <button
              onClick={onOpenAuth}
              title="View Profile & Account Data"
              className="navbar-profile-btn"
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                color: 'var(--accent-primary)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                flexShrink: 0
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent-primary)';
                e.currentTarget.style.boxShadow = '0 0 10px rgba(0, 240, 255, 0.25)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <UserIcon style={{ width: '20px', height: '20px' }} />
              <span style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: user.role === 'admin' ? 'var(--warning)' : 'var(--accent-primary)',
                border: '2px solid var(--bg-primary)'
              }} />
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="navbar-auth-btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                fontWeight: '600',
                fontSize: '0.88rem',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent-primary)';
                e.currentTarget.style.color = 'var(--accent-primary)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
            >
              <UserIcon style={{ width: '18px', height: '18px' }} />
              <span className="navbar-auth-text">Sign In</span>
            </button>
          )}

          {/* Live Alerts & Tracking Notification Bell */}
          <NotificationBell
            user={user}
            notifications={user ? (notifications || []) : []}
            onMarkAllRead={onMarkAllRead}
            onMarkRead={onMarkRead}
            onOpenTracking={onOpenTracking}
            onClearAll={onClearAllNotifications}
          />

          <button
            onClick={onOpenCart}
            className="navbar-bag-btn"
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 22px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-cta)',
              border: '1px solid var(--color-cta)',
              color: '#ffffff',
              fontWeight: '600',
              fontSize: '0.95rem',
              boxShadow: '0 4px 14px rgba(30, 30, 30, 0.2)',
              transition: 'all 0.2s ease',
              cursor: 'pointer'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-cta-hover)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-cta)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <ShoppingCartIcon style={{ width: '20px', height: '20px', color: '#ffffff' }} />
            <span>Bag</span>
            {cartCount > 0 && (
              <span style={{
                backgroundColor: 'var(--color-accent)',
                color: '#fff',
                borderRadius: 'var(--radius-full)',
                padding: '2px 8px',
                fontSize: '0.75rem',
                fontWeight: '700'
              }}>
                {cartCount}
              </span>
            )}
          </button>
        </div>
        </div> {/* End navbar-header-main */}

        {/* Search Bar with Live List Down Product Dropdown */}
        <div 
          ref={searchWrapperRef}
          className="navbar-search-wrapper" 
          style={{
            flex: 1,
            maxWidth: '540px',
            position: 'relative',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <span style={{ position: 'absolute', left: '16px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
            <MagnifyingGlassIcon style={{ width: '18px', height: '18px' }} />
          </span>

          <input
            type="text"
            placeholder="Search catalog products..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              if (e.target.value.trim().length > 0) {
                setIsDropdownOpen(true);
              }
            }}
            onFocus={() => {
              if (searchTerm && searchTerm.trim().length > 0) {
                setIsDropdownOpen(true);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleViewAllInCatalog();
              } else if (e.key === 'Escape') {
                setIsDropdownOpen(false);
              }
            }}
            style={{
              width: '100%',
              padding: '11px 40px 11px 44px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--bg-secondary)',
              border: isDropdownOpen && searchTerm && searchTerm.trim().length > 0 ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
              transition: 'all 0.25s',
              boxShadow: isDropdownOpen && searchTerm && searchTerm.trim().length > 0 ? '0 0 0 3px rgba(122, 147, 168, 0.15)' : 'none'
            }}
          />

          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm('');
                setIsDropdownOpen(false);
              }}
              style={{ position: 'absolute', right: '14px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', padding: '4px', cursor: 'pointer' }}
              title="Clear search"
            >
              <XMarkIcon style={{ width: '18px', height: '18px' }} />
            </button>
          )}

          {/* Live Search List Down Product Dropdown */}
          {isDropdownOpen && searchTerm && searchTerm.trim().length > 0 && (
            <div 
              className="navbar-search-dropdown"
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                left: 0,
                right: 0,
                backgroundColor: 'var(--bg-primary)',
                borderRadius: '16px',
                border: '1px solid var(--border-color)',
                boxShadow: '0 18px 45px rgba(0, 0, 0, 0.12)',
                zIndex: 1000,
                overflow: 'hidden',
                animation: 'fadeInDropdown 0.18s ease-out'
              }}
            >
              {/* Header Bar */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 16px',
                borderBottom: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-secondary)',
                fontSize: '0.78rem'
              }}>
                <span style={{ fontWeight: '700', color: 'var(--text-secondary)' }}>
                  Products matching <span style={{ color: 'var(--text-primary)' }}>"{searchTerm}"</span>
                </span>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: '700',
                  color: searchResults.length > 0 ? 'var(--color-success)' : 'var(--text-muted)',
                  backgroundColor: searchResults.length > 0 ? 'var(--color-success-bg)' : 'transparent',
                  padding: '2px 8px',
                  borderRadius: '9999px'
                }}>
                  {searchResults.length} {searchResults.length === 1 ? 'item' : 'items'}
                </span>
              </div>

              {/* Category Match Chip if applicable */}
              {matchingCategories.length > 0 && (
                <div style={{
                  padding: '8px 16px',
                  backgroundColor: 'var(--bg-primary)',
                  borderBottom: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  flexWrap: 'wrap'
                }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '600' }}>Filter Category:</span>
                  {matchingCategories.map(cat => (
                    <button
                      key={cat}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setActiveCategory(cat);
                        handleViewAllInCatalog();
                      }}
                      style={{
                        padding: '3px 10px',
                        borderRadius: '9999px',
                        fontSize: '0.72rem',
                        fontWeight: '700',
                        backgroundColor: activeCategory === cat ? 'var(--color-cta)' : 'var(--bg-secondary)',
                        color: activeCategory === cat ? '#ffffff' : 'var(--text-primary)',
                        border: '1px solid var(--border-color)',
                        cursor: 'pointer'
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}

              {/* Product Results List */}
              <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
                {searchResults.length === 0 ? (
                  <div style={{ padding: '32px 20px', textAlign: 'center' }}>
                    <MagnifyingGlassIcon style={{ width: '32px', height: '32px', color: 'var(--text-muted)', margin: '0 auto 8px' }} />
                    <p style={{ margin: '0 0 4px', fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                      No products found
                    </p>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      We couldn't find any products matching "{searchTerm}". Try another keyword or browse below.
                    </p>
                  </div>
                ) : (
                  searchResults.slice(0, 7).map((item) => {
                    const imgUrl = item.image ? getImageUrl(item.image) : null;
                    const catName = getCategoryName(item);
                    const inStock = (item.stock ?? 99) > 0;
                    return (
                      <div
                        key={item.id}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleSelectProduct(item);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '10px 16px',
                          borderBottom: '1px solid var(--border-color)',
                          cursor: 'pointer',
                          transition: 'background-color 0.15s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        {/* Thumbnail */}
                        <div style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '10px',
                          backgroundColor: 'var(--bg-secondary)',
                          border: '1px solid var(--border-color)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden',
                          flexShrink: 0
                        }}>
                          {imgUrl ? (
                            <img
                              src={imgUrl}
                              alt={item.name}
                              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            <CubeIcon style={{ width: '22px', height: '22px', color: 'var(--text-muted)' }} />
                          )}
                        </div>

                        {/* Title & Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '0.68rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
                              {catName || 'Product'}
                            </span>
                            {inStock ? (
                              <span style={{ fontSize: '0.65rem', fontWeight: '700', color: '#10B981', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }} /> In Stock
                              </span>
                            ) : (
                              <span style={{ fontSize: '0.65rem', fontWeight: '700', color: '#EF4444' }}>
                                Out of Stock
                              </span>
                            )}
                          </div>
                          <div style={{
                            fontSize: '0.88rem',
                            fontWeight: '700',
                            color: 'var(--text-primary)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {item.name}
                          </div>
                        </div>

                        {/* Price & Quick Action */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                          <span style={{ fontSize: '0.92rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                            ${parseFloat(item.price || 0).toFixed(2)}
                          </span>

                          {onAddToCart && inStock && (
                            <button
                              type="button"
                              title="Add directly to Bag"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onAddToCart(item);
                              }}
                              style={{
                                padding: '6px 10px',
                                borderRadius: 'var(--radius-full)',
                                backgroundColor: 'var(--color-cta)',
                                color: '#ffffff',
                                border: 'none',
                                fontSize: '0.75rem',
                                fontWeight: '700',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-cta-hover)'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-cta)'}
                            >
                              <ShoppingCartIcon style={{ width: '13px', height: '13px' }} />
                              <span>+ Bag</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Bottom Footer View All */}
              {searchResults.length > 0 && (
                <div
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleViewAllInCatalog();
                  }}
                  style={{
                    padding: '11px 16px',
                    backgroundColor: 'var(--bg-secondary)',
                    borderTop: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    fontSize: '0.82rem',
                    fontWeight: '700',
                    color: 'var(--text-primary)',
                    transition: 'background-color 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-glass-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MagnifyingGlassIcon style={{ width: '15px', height: '15px' }} />
                    View all {searchResults.length} matching products in catalog
                  </span>
                  <span style={{ fontSize: '0.9rem' }}>&darr;</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
