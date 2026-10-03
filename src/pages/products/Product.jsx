import React, { useState, useEffect, useMemo } from 'react';
import { fetchProducts, fetchCategories, fetchBestSellers } from '../../services/api';
import { getCategoryName, DEFAULT_CATEGORY_LIST } from '../../utils/categoryHelper';
import ProductCard from '../../components/ProductCard';
import SkeletonCard from '../../components/SkeletonCard';
import BestSellersLeaderboard from '../../components/BestSellersLeaderboard';
import { getImageUrl } from '../../utils/imageHelper';
import { 
  BoltIcon, ShieldCheckIcon, CubeIcon, ExclamationTriangleIcon, MagnifyingGlassIcon, 
  GlobeAltIcon, SparklesIcon, FireIcon, TruckIcon, CheckBadgeIcon, StarIcon, 
  TagIcon, SignalIcon, ShoppingCartIcon, EyeIcon, ArrowDownIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';

function Product({ onAddToCart, onQuickView, searchTerm, activeCategory, setActiveCategory, categories, setCategories, onProductsLoaded, onOpenAbout, onOpenContact }) {
  const [products, setProducts] = useState([]);
  const [bestSellersMap, setBestSellersMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('featured');

  useEffect(() => {
    fetchBestSellers().then((data) => {
      if (Array.isArray(data)) {
        const map = {};
        data.forEach(item => {
          map[item.id] = Number(item.sold || 0);
        });
        setBestSellersMap(map);
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const [data, apiCats] = await Promise.all([
          fetchProducts(),
          fetchCategories()
        ]);
        setProducts(data || []);
        if (onProductsLoaded) onProductsLoaded(data || []);

        // Build category list dynamically directly from backend API categories fetch
        const uniqueCats = new Set();
        
        if (Array.isArray(apiCats) && apiCats.length > 0) {
          apiCats.forEach(c => {
            if (c && c.name && c.name.trim() !== '') {
              uniqueCats.add(c.name.trim());
            }
          });
        }

        // Add categories extracted from loaded products
        (data || []).forEach(p => {
          const catName = getCategoryName(p);
          if (catName && catName !== 'General' && catName !== 'Uncategorized') {
            uniqueCats.add(catName);
          }
        });

        setCategories(['All', ...Array.from(uniqueCats)]);
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setError("Could not load products from http://127.0.0.1:8000/api/products. Please ensure your Laravel API server is running.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [setCategories]);

  // Fast background auto-revalidation & window focus refresh
  useEffect(() => {
    const handleRevalidate = () => {
      fetchProducts().then(data => {
        if (data && Array.isArray(data)) {
          setProducts(data);
          if (onProductsLoaded) onProductsLoaded(data);
        }
      }).catch(() => {});
    };

    window.addEventListener('focus', handleRevalidate);
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        handleRevalidate();
      }
    }, 15000);

    return () => {
      window.removeEventListener('focus', handleRevalidate);
      clearInterval(interval);
    };
  }, [onProductsLoaded]);

  const [inStockOnly, setInStockOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState(2500);
  const [ratingFilter, setRatingFilter] = useState('all');

  // Filter and Sort Products
  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];

    // Filter by Category dynamically (case-insensitive for reliability)
    if (activeCategory && activeCategory !== 'All') {
      result = result.filter(p => {
        const catName = getCategoryName(p);
        return catName && catName.toLowerCase() === activeCategory.toLowerCase();
      });
    }

    // Filter by Search Term
    if (searchTerm && searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter(p => 
        (p.name && p.name.toLowerCase().includes(term)) ||
        (p.description && p.description.toLowerCase().includes(term))
      );
    }

    // Filter by In-Stock availability
    if (inStockOnly) {
      result = result.filter(p => (p.stock ?? 99) > 0);
    }

    // Filter by Max Price
    if (maxPrice < 2500) {
      result = result.filter(p => parseFloat(p.price || 0) <= maxPrice);
    }

    // Sort Products
    if (sortBy === 'best-sellers') {
      result.sort((a, b) => (bestSellersMap[b.id] || 0) - (bestSellersMap[a.id] || 0));
    } else if (sortBy === 'price-asc') {
      result.sort((a, b) => parseFloat(a.price || 0) - parseFloat(b.price || 0));
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => parseFloat(b.price || 0) - parseFloat(a.price || 0));
    } else if (sortBy === 'name-asc') {
      result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else if (sortBy === 'newest') {
      result.sort((a, b) => (b.id || 0) - (a.id || 0));
    }

    return result;
  }, [products, activeCategory, searchTerm, sortBy, inStockOnly, maxPrice, bestSellersMap]);

  // Top flagship spotlight product for hero showcase
  const spotlightProduct = useMemo(() => {
    if (!products || products.length === 0) return null;
    const sorted = [...products].sort((a, b) => (bestSellersMap[b.id] || 0) - (bestSellersMap[a.id] || 0));
    return sorted[0] || products[0];
  }, [products, bestSellersMap]);

  return (
    <div style={{ paddingBottom: '60px' }}>
      {/* Clean & Modern Storefront Hero Section */}
      <section id="hero-section" className="hero-wrapper">
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          {/* Main 2-Column Hero Grid: Left Content, Right Curated Product Spotlight */}
          <div className="hero-main-grid">
            {/* Left Column: Headline, Subtext, Buttons & Trust Badges */}
            <div>
              <div className="hero-live-pill">
                <span className="hero-pulse-dot" />
                <span>Curated Tech & Premium Essentials</span>
              </div>

              <h1 className="hero-heading">
                Elevate Your Lifestyle with{' '}
                <span className="hero-headline-accent">
                  Premium Essentials
                </span>
              </h1>

              <p className="hero-subtitle">
                Explore our curated inventory featuring ultra-responsive filtering, real-time stock verification, and an elevated VIP shopping experience designed for modern tech enthusiasts.
              </p>

              {/* Action CTA Buttons */}
              <div className="hero-cta-cluster">
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('best-sellers-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="hero-btn-bestsellers"
                >
                  <FireIcon style={{ width: '17px', height: '17px', color: '#F59E0B' }} />
                  <span>Best Sellers (Top 10)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('catalog-products-header') || document.getElementById('products-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="hero-btn-catalog"
                >
                  <span>Browse Catalog &darr;</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (onOpenContact) onOpenContact();
                  }}
                  className="hero-btn-support"
                >
                  <ChatBubbleLeftRightIcon style={{ width: '16px', height: '16px' }} />
                  <span>VIP Support</span>
                </button>
              </div>

              {/* Live Trust & Quality Bar */}
              <div className="hero-trust-bar">
                <div className="hero-trust-item">
                  <div style={{ display: 'flex', color: '#F59E0B' }}>
                    {[...Array(5)].map((_, i) => (
                      <StarSolid key={i} style={{ width: '14px', height: '14px' }} />
                    ))}
                  </div>
                  <span><strong>4.9/5</strong> (10k+ reviews)</span>
                </div>
                <div className="hero-trust-item">
                  <TruckIcon style={{ width: '16px', height: '16px', color: '#64748B' }} />
                  <span>Free Express VIP Delivery</span>
                </div>
                <div className="hero-trust-item">
                  <ShieldCheckIcon style={{ width: '16px', height: '16px', color: '#64748B' }} />
                  <span>Verified Authentic</span>
                </div>
              </div>
            </div>

            {/* Right Column: Clean & Elegant Product Spotlight Card */}
            <div>
              <div className="hero-spotlight-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontSize: '0.74rem',
                    fontWeight: '700',
                    color: '#334155',
                    background: '#F1F5F9',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)'
                  }}>
                    <FireIcon style={{ width: '14px', height: '14px', color: '#F59E0B' }} /> Best Seller #1
                  </span>

                  <span style={{
                    fontSize: '0.74rem',
                    fontWeight: '600',
                    color: '#10B981',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
                    In Stock
                  </span>
                </div>

                {/* Product Media Display */}
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: '210px',
                    borderRadius: '12px',
                    background: '#F8FAFC',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    marginBottom: '16px',
                    cursor: spotlightProduct ? 'pointer' : 'default',
                    border: '1px solid #E2E8F0'
                  }}
                  onClick={() => {
                    if (spotlightProduct && onQuickView) onQuickView(spotlightProduct);
                  }}
                >
                  {spotlightProduct && spotlightProduct.image ? (
                    <img
                      src={getImageUrl(spotlightProduct.image)}
                      alt={spotlightProduct.name}
                      style={{
                        maxWidth: '82%',
                        maxHeight: '82%',
                        objectFit: 'contain',
                        transition: 'transform 0.3s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                      <BoltIcon style={{ width: '40px', height: '40px', color: '#64748B', margin: '0 auto 8px' }} />
                      <p style={{ fontSize: '0.85rem', fontWeight: '600', color: '#64748B' }}>Featured Product</p>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                    <div style={{ overflow: 'hidden' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: '600', textTransform: 'uppercase', color: '#94A3B8', letterSpacing: '0.04em' }}>
                        {spotlightProduct ? getCategoryName(spotlightProduct) : 'Flagship Collection'}
                      </span>
                      <h3 style={{
                        fontSize: '1.1rem',
                        fontWeight: '700',
                        color: '#0F172A',
                        margin: '2px 0 6px',
                        lineHeight: 1.3,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {spotlightProduct?.name || 'iPhone 18 Pro Max Titanium'}
                      </h3>
                    </div>
                    
                    {/* Price Badge */}
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0F172A' }}>
                        ${parseFloat(spotlightProduct?.price || 999).toFixed(2)}
                      </div>
                      <div style={{ fontSize: '0.76rem', color: '#94A3B8', textDecoration: 'line-through' }}>
                        ${(parseFloat(spotlightProduct?.price || 999) * 1.25).toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Rating & Discount */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <div style={{ display: 'flex', color: '#F59E0B' }}>
                        {[...Array(5)].map((_, i) => (
                          <StarSolid key={i} style={{ width: '13px', height: '13px' }} />
                        ))}
                      </div>
                      <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#0F172A', marginLeft: '4px' }}>4.9</span>
                      <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                        ({(bestSellersMap[spotlightProduct?.id] || 480) + 120}+ sold)
                      </span>
                    </div>
                    <span style={{
                      background: '#FEF2F2',
                      color: '#DC2626',
                      fontSize: '0.72rem',
                      fontWeight: '700',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      border: '1px solid #FEE2E2'
                    }}>
                      SAVE 20%
                    </span>
                  </div>

                  {/* Showcase CTAs */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        if (spotlightProduct && onAddToCart) onAddToCart(spotlightProduct);
                      }}
                      className="btn btn-primary"
                      style={{
                        flex: 1,
                        padding: '9px 16px',
                        fontSize: '0.86rem',
                        fontWeight: '600',
                        borderRadius: 'var(--radius-full)',
                        background: '#0F172A',
                        color: '#FFFFFF',
                        border: '1px solid #0F172A',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <ShoppingCartIcon style={{ width: '16px', height: '16px' }} />
                      Add to Cart
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (spotlightProduct && onQuickView) onQuickView(spotlightProduct);
                      }}
                      className="btn btn-secondary"
                      style={{
                        padding: '9px 14px',
                        fontSize: '0.86rem',
                        fontWeight: '600',
                        borderRadius: 'var(--radius-full)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        border: '1px solid #E2E8F0',
                        background: '#FFFFFF',
                        color: '#0F172A'
                      }}
                    >
                      <EyeIcon style={{ width: '16px', height: '16px' }} />
                      Preview
                    </button>
                  </div>
                </div>

                {/* Subtle reassurance bar */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '14px',
                  paddingTop: '12px',
                  borderTop: '1px solid #F1F5F9',
                  fontSize: '0.74rem',
                  color: '#64748B'
                }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <TruckIcon style={{ width: '14px', height: '14px' }} /> Free VIP Delivery
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <CheckBadgeIcon style={{ width: '14px', height: '14px', color: '#10B981' }} /> Guaranteed 30-Day Returns
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Promotional & Feature Benefit Cards (3 Highlights) */}
          <div className="hero-feature-grid">
            {/* Card 1: Flash Sale */}
            <div
              className="hero-benefit-card"
              onClick={() => {
                const el = document.getElementById('catalog-products-header') || document.getElementById('products-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <div className="hero-benefit-icon-box">
                <FireIcon style={{ width: '22px', height: '22px' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <h4 style={{ fontSize: '0.96rem', fontWeight: '700', color: '#0F172A', margin: 0 }}>
                    Flash Sale Up to 40% OFF
                  </h4>
                  <span style={{ fontSize: '0.68rem', fontWeight: '600', color: '#64748B', background: '#F1F5F9', padding: '2px 7px', borderRadius: '4px' }}>
                    Limited Time
                  </span>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#64748B', margin: 0, lineHeight: 1.45 }}>
                  On high-end laptops, mechanical keyboards & audio gear.
                </p>
              </div>
            </div>

            {/* Card 2: Free Express VIP Delivery */}
            <div
              className="hero-benefit-card"
              onClick={() => {
                const el = document.getElementById('catalog-products-header') || document.getElementById('products-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <div className="hero-benefit-icon-box">
                <TruckIcon style={{ width: '22px', height: '22px' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <h4 style={{ fontSize: '0.96rem', fontWeight: '700', color: '#0F172A', margin: 0 }}>
                    Free Express VIP Delivery
                  </h4>
                  <span style={{ fontSize: '0.68rem', fontWeight: '600', color: '#64748B', background: '#F1F5F9', padding: '2px 7px', borderRadius: '4px' }}>
                    Orders $50+
                  </span>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#64748B', margin: 0, lineHeight: 1.45 }}>
                  On all orders over $50 with guaranteed 30-day returns.
                </p>
              </div>
            </div>

            {/* Card 3: Verified Authentic Quality */}
            <div
              className="hero-benefit-card"
              onClick={() => {
                if (onOpenContact) onOpenContact();
              }}
            >
              <div className="hero-benefit-icon-box">
                <CheckBadgeIcon style={{ width: '22px', height: '22px' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <h4 style={{ fontSize: '0.96rem', fontWeight: '700', color: '#0F172A', margin: 0 }}>
                    Verified Authentic Quality
                  </h4>
                  <span style={{ fontSize: '0.68rem', fontWeight: '600', color: '#64748B', background: '#F1F5F9', padding: '2px 7px', borderRadius: '4px' }}>
                    100% Genuine
                  </span>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#64748B', margin: 0, lineHeight: 1.45 }}>
                  100% genuine products with 24/7 dedicated priority support.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Best Sellers Leaderboard Section */}
      <BestSellersLeaderboard
        onAddToCart={onAddToCart}
        onQuickView={onQuickView}
      />

      {/* Products Catalog Section */}
      <section id="products-section" className="products-section">
        {/* Anchor for Products Catalog Scroll */}
        <div id="products-catalog" style={{ scrollMarginTop: '85px' }} />

      {/* Category Pills Bar - Placed directly above products */}
      {categories && categories.length > 0 && (
        <div className="container" style={{ marginBottom: '16px' }}>
          <div className="category-scroll-bar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '7px 18px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.84rem',
                  fontWeight: '600',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.25s',
                  backgroundColor: activeCategory === cat ? 'var(--color-cta)' : 'var(--bg-primary)',
                  color: activeCategory === cat ? '#ffffff' : 'var(--text-primary)',
                  border: activeCategory === cat ? '1px solid var(--color-cta)' : '1px solid var(--border-color)',
                  boxShadow: activeCategory === cat ? '0 3px 10px rgba(30, 30, 30, 0.15)' : 'none',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
                onMouseOver={(e) => {
                  if (activeCategory !== cat) {
                    e.currentTarget.style.borderColor = 'var(--accent-primary)';
                  }
                }}
                onMouseOut={(e) => {
                  if (activeCategory !== cat) {
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                  }
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Catalog Controls & Sorting Bar */}
      <div className="container" style={{ marginBottom: '28px' }}>
        <div className="glass-panel" style={{ padding: '16px 20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', margin: 0, color: 'var(--text-primary)' }}>
              {activeCategory === 'All' ? 'All Products' : activeCategory}
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '400', marginLeft: '10px' }}>
                ({filteredAndSortedProducts.length} items found)
              </span>
            </h3>

            {(activeCategory !== 'All' || maxPrice < 2500 || inStockOnly || searchTerm) && (
              <button
                onClick={() => {
                  setActiveCategory('All');
                  setMaxPrice(2500);
                  setInStockOnly(false);
                  setSortBy('featured');
                }}
                className="badge"
                style={{ cursor: 'pointer', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--color-accent)' }}
              >
                Reset All Filters
              </button>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
            {/* Price Slider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '220px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                Max Price: <strong style={{ color: 'var(--text-primary)' }}>${maxPrice}</strong>
              </span>
              <input
                type="range"
                min="20"
                max="2500"
                step="20"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                style={{ flex: 1, accentColor: 'var(--color-accent)', cursor: 'pointer' }}
              />
            </div>

            {/* In-Stock Only Toggle */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)' }}>
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: 'var(--color-accent)', cursor: 'pointer' }}
              />
              In Stock Only
            </label>

            {/* Sort Select */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Sort:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                <option value="featured">Featured / Default</option>
                <option value="best-sellers">🔥 Best Sellers (Top Sold)</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="newest">Newest Arrivals</option>
                <option value="name-asc">Name (A-Z)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Product Grid Section */}
      <main className="container">
        {loading ? (
          <div className="product-grid">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <SkeletonCard key={n} />
            ))}
          </div>
        ) : error ? (
          /* Error State */
          <div className="glass-panel animate-fade-in" style={{
            padding: '60px 20px',
            textAlign: 'center',
            borderRadius: 'var(--radius-lg)',
            maxWidth: '650px',
            margin: '40px auto',
            border: '1px solid var(--danger)',
            backgroundColor: 'var(--danger-bg)'
          }}>
            <ExclamationTriangleIcon style={{ width: '64px', height: '64px', color: 'var(--danger)', margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '1.5rem', color: 'var(--danger)', marginBottom: '12px' }}>
              Connection Error
            </h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '24px' }}>
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
              style={{ backgroundColor: 'var(--danger)' }}
            >
              Retry Fetching API
            </button>
          </div>
        ) : filteredAndSortedProducts.length === 0 ? (
          /* Empty Search/Filter State */
          <div className="glass-panel animate-fade-in" style={{
            padding: '60px 20px',
            textAlign: 'center',
            borderRadius: 'var(--radius-lg)',
            maxWidth: '550px',
            margin: '40px auto'
          }}>
            <MagnifyingGlassIcon style={{ width: '64px', height: '64px', color: 'var(--text-muted)', margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>No matching products found</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
              We couldn't find any products matching "{searchTerm || activeCategory}". Try searching for another keyword or selecting a different category.
            </p>
            <button
              onClick={() => {
                // reset filters
              }}
              className="btn-secondary"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          /* Products Grid */
          <div className="product-grid">
            {filteredAndSortedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={onAddToCart}
                onQuickView={onQuickView}
              />
            ))}
          </div>
        )}
      </main>
      </section>

      {/* Footer Section */}
      <footer id="footer-section" className="app-footer" style={{
        marginTop: '80px',
        paddingTop: '60px',
        borderTop: '1px solid var(--border-color)',
        backgroundColor: 'var(--bg-secondary)'
      }}>
        <div className="container" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '40px',
          paddingBottom: '40px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '800' }}>
                <BoltIcon style={{ width: '18px', height: '18px', color: '#fff' }} />
              </div>
              <h3 style={{ fontSize: '1.3rem', margin: 0 }}>Men ICT <span className="gradient-text">Store</span></h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              A premium e-commerce web application designed with clean aesthetics, powered directly by a high-performance Laravel backend API.
            </p>
            <a href="tel:+1800636428" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--success)', fontWeight: '600', fontSize: '0.82rem', marginTop: '12px', textDecoration: 'none' }}>
              <ShieldCheckIcon style={{ width: '16px', height: '16px' }} /> 24/7 Priority Hotline: +1 (800) MEN-ICT
            </a>
          </div>

          <div>
            <h4 style={{ fontSize: '1rem', marginBottom: '16px', color: 'var(--text-primary)' }}>Store Navigation & Links</h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              <li>
                <button onClick={() => {
                  const el = document.getElementById('hero-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                  else window.scrollTo({ top: 0, behavior: 'smooth' });
                }} style={{ color: 'var(--text-secondary)', cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--accent-primary)'} onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}>
                  Hero / Storefront Top
                </button>
              </li>
              <li>
                <button onClick={() => {
                  const el = document.getElementById('products-catalog');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }} style={{ color: 'var(--text-secondary)', cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--accent-primary)'} onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}>
                  Products / All Catalog Items
                </button>
              </li>
              <li>
                <button onClick={onOpenAbout} style={{ color: 'var(--text-secondary)', cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--accent-primary)'} onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}>
                  About Men ICT Store
                </button>
              </li>
              <li>
                <button onClick={onOpenContact} style={{ color: 'var(--text-secondary)', cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--accent-primary)'} onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}>
                  Contact & Order Support
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: '1rem', marginBottom: '16px', color: 'var(--text-primary)' }}>Newsletter & Updates</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              Subscribe to get notified about new product drops in our catalog.
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="email"
                placeholder="Enter your email..."
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem'
                }}
              />
              <button className="btn-primary" style={{ padding: '10px 16px' }}>Join</button>
            </div>
          </div>
        </div>

        <div style={{
          borderTop: '1px solid var(--border-color)',
          padding: '20px 0',
          textAlign: 'center',
          fontSize: '0.8rem',
          color: 'var(--text-muted)'
        }}>
          © {new Date().getFullYear()} Men ICT Store • Built with React, Vite & Laravel API • All Rights Reserved.
        </div>
      </footer>
    </div>
  );
}

export default Product;
