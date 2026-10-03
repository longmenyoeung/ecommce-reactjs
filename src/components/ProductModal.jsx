import React, { useState, useEffect, useMemo } from 'react';
import { getImageUrl, getFallbackImageUrl } from '../utils/imageHelper';
import { getCategoryName } from '../utils/categoryHelper';
import { XMarkIcon, ShoppingCartIcon, CheckCircleIcon, ExclamationTriangleIcon, PhotoIcon, SparklesIcon, TagIcon, ShieldCheckIcon, TruckIcon, EyeIcon } from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';

function ProductModal({ product, allProducts, onClose, onAddToCart, onQuickView }) {
  if (!product) return null;

  const [quantity, setQuantity] = useState(1);
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [imgError, setImgError] = useState(false);
  const [fallbackAttempted, setFallbackAttempted] = useState(false);

  useEffect(() => {
    if (product) {
      setQuantity(1);
      setActiveImgIndex(0);
      setImgError(false);
      setFallbackAttempted(false);
    }
  }, [product]);

  const primaryImgUrl = getImageUrl(product.image);
  const fallbackImgUrl = getFallbackImageUrl(product.image);
  const categoryName = getCategoryName(product);

  // Build a rich multi-image gallery with thumbnails combining main image and gallery images
  const galleryImages = useMemo(() => {
    const list = [];
    if (primaryImgUrl) {
      list.push(primaryImgUrl);
    }

    let parsedImages = product.images;
    if (typeof parsedImages === 'string') {
      try {
        parsedImages = JSON.parse(parsedImages);
      } catch (e) {
        parsedImages = [];
      }
    }

    if (Array.isArray(parsedImages) && parsedImages.length > 0) {
      parsedImages.forEach(img => {
        const fullUrl = getImageUrl(img);
        if (fullUrl && !list.includes(fullUrl)) {
          list.push(fullUrl);
        }
      });
    }

    // If only 1 image exists, add high-res or sample angle variants for interactive thumbnail switching
    if (list.length === 1) {
      if (fallbackImgUrl && fallbackImgUrl !== primaryImgUrl) {
        list.push(fallbackImgUrl);
      } else {
        list.push('https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80');
        list.push('https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80');
      }
    }
    return list;
  }, [product, primaryImgUrl, fallbackImgUrl]);

  // Compute more related products from the same category
  const relatedProducts = useMemo(() => {
    if (!allProducts || !Array.isArray(allProducts)) return [];
    const sameCat = allProducts.filter(p => p.id !== product.id && getCategoryName(p) === categoryName);
    if (sameCat.length >= 3) return sameCat.slice(0, 4);
    const others = allProducts.filter(p => p.id !== product.id && !sameCat.some(s => s.id === p.id));
    return [...sameCat, ...others].slice(0, 4);
  }, [allProducts, product, categoryName]);

  const handleImageError = (e) => {
    if (!fallbackAttempted && fallbackImgUrl && e.target.src !== fallbackImgUrl) {
      setFallbackAttempted(true);
      e.target.src = fallbackImgUrl;
    } else {
      setImgError(true);
    }
  };

  const formattedPrice = parseFloat(product.price || 0).toFixed(2);
  const totalPrice = (parseFloat(product.price || 0) * quantity).toFixed(2);
  const inStock = product.stock > 0;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      backgroundColor: 'rgba(20, 25, 35, 0.65)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      animation: 'fadeIn 0.25s ease-out'
    }} onClick={onClose}>
      <div
        className="glass-panel animate-spring-modal"
        style={{
          width: '100%',
          maxWidth: '960px',
          maxHeight: '90vh',
          borderRadius: 'var(--radius-lg)',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          backgroundColor: 'var(--bg-primary)',
          boxShadow: 'var(--shadow-lg), 0 0 40px var(--accent-glow)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            zIndex: 20,
            width: '38px',
            height: '38px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--bg-tertiary)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--danger)';
            e.currentTarget.style.color = '#fff';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
            e.currentTarget.style.color = 'var(--text-primary)';
          }}
        >
          <XMarkIcon style={{ width: '20px', height: '20px' }} />
        </button>

        {/* Top Split Area: Main Product Gallery + Details */}
        <div className="modal-split-grid">
          {/* Left: Main Product Image + Thumbnail Gallery */}
          <div style={{
            backgroundColor: 'var(--bg-secondary)',
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
            borderRight: '1px solid var(--border-color)'
          }}>
            {/* Category Badge & Rating */}
            <div style={{ position: 'absolute', top: '16px', left: '16px', zIndex: 10, display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <span className="badge badge-accent" style={{ background: 'var(--bg-tertiary)' }}>{categoryName}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: '700', color: 'var(--warning)', background: 'var(--bg-tertiary)', padding: '4px 8px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-color)', whiteSpace: 'nowrap' }}>
                <StarIcon style={{ width: '14px', height: '14px' }} /> 4.8 (124 reviews)
              </span>
            </div>

            {/* Main Active Image */}
            <div style={{
              width: '100%',
              height: '320px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              margin: '24px 0 16px'
            }}>
              {!imgError ? (
                <img
                  src={galleryImages[activeImgIndex] || primaryImgUrl}
                  alt={`${product.name} - View ${activeImgIndex + 1}`}
                  onError={handleImageError}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                    transition: 'opacity 0.3s ease'
                  }}
                />
              ) : (
                <div style={{
                  padding: '40px',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px',
                  color: 'var(--text-muted)'
                }}>
                  <PhotoIcon style={{ width: '64px', height: '64px', opacity: 0.4 }} />
                  <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>Image Not Available</span>
                </div>
              )}
            </div>

            {/* Thumbnail Product Switcher */}
            <div style={{
              display: 'flex',
              gap: '12px',
              width: '100%',
              justifyContent: 'center',
              overflowX: 'auto',
              paddingTop: '12px'
            }}>
              {galleryImages.map((thumbUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImgIndex(idx)}
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: activeImgIndex === idx ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                    boxShadow: activeImgIndex === idx ? '0 0 10px var(--accent-glow)' : 'none',
                    backgroundColor: 'var(--bg-tertiary)',
                    padding: '3px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    flexShrink: 0
                  }}
                >
                  <img
                    src={thumbUrl}
                    alt={`Thumbnail ${idx + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }}
                  />
                </button>
              ))}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
              Click thumbnails to view multi-angle gallery
            </span>
          </div>

          {/* Right: Product Info Section */}
          <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Product ID: #{product.id}
              </span>
              <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginTop: '4px', lineHeight: 1.2, color: 'var(--text-primary)' }}>
                {product.name}
              </h2>
            </div>

            {/* Price & Stock */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Unit Price</span>
                <span style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--accent-primary)', fontFamily: 'Outfit' }}>
                  ${formattedPrice}
                </span>
              </div>
              <span className={`badge ${inStock ? 'badge-success' : 'badge-warning'}`} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {inStock ? (
                  <>
                    <CheckCircleIcon style={{ width: '16px', height: '16px' }} />
                    <span>{product.stock} Available in Stock</span>
                  </>
                ) : (
                  <>
                    <ExclamationTriangleIcon style={{ width: '16px', height: '16px' }} />
                    <span>Out of Stock</span>
                  </>
                )}
              </span>
            </div>

            {/* Highlights Bar */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <TruckIcon style={{ width: '16px', height: '16px', color: 'var(--accent-primary)' }} /> Free Express Delivery
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheckIcon style={{ width: '16px', height: '16px', color: 'var(--success)' }} /> 2-Year Official Warranty
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', fontWeight: '700' }}>
                Product Description
              </h4>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {product.description || 'No detailed description available for this product.'}
              </p>
            </div>

            {/* Quantity Selector & Add to Cart */}
            {inStock && (
              <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-primary)' }}>Quantity:</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: 'var(--bg-tertiary)', padding: '4px 8px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-color)' }}>
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}
                    >
                      -
                    </button>
                    <span style={{ width: '30px', textAlign: 'center', fontWeight: '700', color: 'var(--text-primary)' }}>{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onAddToCart(product, quantity);
                    onClose();
                  }}
                  className="btn-primary"
                  style={{ width: '100%', padding: '14px', fontSize: '1.05rem', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <ShoppingCartIcon style={{ width: '20px', height: '20px', color: '#ffffff' }} />
                  <span>Add {quantity} to Cart • ${totalPrice}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Section: More Related Products */}
        {relatedProducts.length > 0 && (
          <div style={{ padding: '28px 32px', backgroundColor: 'var(--bg-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
              <SparklesIcon style={{ width: '20px', height: '20px', color: 'var(--warning)' }} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: '700', margin: 0, color: 'var(--text-primary)' }}>
                More Related Products in {categoryName}
              </h3>
            </div>

            <div className="modal-related-grid">
              {relatedProducts.map(relProd => (
                <div
                  key={relProd.id}
                  onClick={() => {
                    if (onQuickView) onQuickView(relProd);
                  }}
                  style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.25s'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent-primary)';
                    e.currentTarget.style.transform = 'translateY(-3px)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ width: '100%', paddingTop: '70%', position: 'relative', borderRadius: '6px', overflow: 'hidden', backgroundColor: 'var(--bg-secondary)' }}>
                    <img
                      src={getImageUrl(relProd.image)}
                      alt={relProd.name}
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <div>
                    <h5 style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {relProd.name}
                    </h5>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--accent-primary)', fontFamily: 'Outfit' }}>
                        ${parseFloat(relProd.price || 0).toFixed(2)}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <EyeIcon style={{ width: '14px', height: '14px' }} /> View
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductModal;
