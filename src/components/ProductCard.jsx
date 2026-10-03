import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { getImageUrl, getFallbackImageUrl } from '../utils/imageHelper';
import { getCategoryName } from '../utils/categoryHelper';
import { EyeIcon, ShoppingCartIcon, PhotoIcon } from '@heroicons/react/24/outline';

function ProductCard({ product, onAddToCart, onQuickView }) {
  const [imgError, setImgError] = useState(false);
  const [fallbackAttempted, setFallbackAttempted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Determine category display
  const categoryName = getCategoryName(product);
  
  // Resolve image URL
  const primaryImgUrl = getImageUrl(product.image);
  const fallbackImgUrl = getFallbackImageUrl(product.image);

  // Parse gallery images (handles arrays and JSON strings from Laravel)
  let parsedGallery = product.images;
  if (typeof parsedGallery === 'string') {
    try { parsedGallery = JSON.parse(parsedGallery); } catch (e) { parsedGallery = []; }
  }
  const galleryList = Array.isArray(parsedGallery) ? parsedGallery.map(img => getImageUrl(img)).filter(Boolean) : [];
  const hoverImgUrl = galleryList.length > 0 ? galleryList[0] : null;

  const handleImageError = (e) => {
    if (!fallbackAttempted && fallbackImgUrl && e.target.src !== fallbackImgUrl) {
      setFallbackAttempted(true);
      e.target.src = fallbackImgUrl;
    } else {
      setImgError(true);
    }
  };

  const formattedPrice = parseFloat(product.price || 0).toFixed(2);
  const inStock = product.stock > 0;

  return (
    <div
      className="glass-card animate-fade-in hover-lift-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        height: '100%'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image Container */}
      <div
        className="product-card-img"
        onClick={() => onQuickView(product)}
      >
        {!imgError && (primaryImgUrl || hoverImgUrl) ? (
          <img
            src={isHovered && hoverImgUrl ? hoverImgUrl : primaryImgUrl}
            alt={product.name}
            onError={handleImageError}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'all 0.55s cubic-bezier(0.16, 1, 0.3, 1)',
              transform: isHovered ? 'scale(1.08)' : 'scale(1)'
            }}
          />
        ) : (
          /* Styled Fallback when image fails to load or is null */
          <div style={{
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, var(--bg-secondary), var(--bg-tertiary))',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            textAlign: 'center',
            gap: '12px'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--accent-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(168, 85, 247, 0.4)'
            }}>
              <PhotoIcon style={{ width: '30px', height: '30px', color: '#fff' }} />
            </div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
              {product.name}
            </span>
          </div>
        )}

        {/* Quick View Button on Hover */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.25)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: isHovered ? 1 : 0,
          transition: 'opacity 0.3s ease'
        }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="btn-secondary"
            style={{
              backgroundColor: 'var(--bg-primary)',
              borderColor: 'var(--accent-primary)',
              color: 'var(--text-primary)',
              boxShadow: '0 0 15px var(--accent-glow)',
              transform: isHovered ? 'translateY(0)' : 'translateY(10px)',
              transition: 'all 0.3s ease',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <EyeIcon style={{ width: '18px', height: '18px' }} /> Quick View
          </button>
        </div>

        {/* Stock Status Badge */}
        <div className="product-card-badges" style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          zIndex: 5,
          pointerEvents: 'none'
        }}>
          <span className={`badge ${inStock ? 'badge-success' : 'badge-warning'}`} style={{
            background: 'var(--bg-primary)',
            backdropFilter: 'blur(8px)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            {inStock ? `${product.stock} In Stock` : 'Sold Out'}
          </span>
        </div>

        {/* Multi-angle indicator if product has gallery images */}
        {galleryList.length > 0 && (
          <div style={{
            position: 'absolute',
            bottom: '10px',
            right: '10px',
            background: 'var(--bg-primary)',
            padding: '3px 7px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.72rem',
            fontWeight: '700',
            color: 'var(--text-primary)',
            boxShadow: 'var(--shadow-sm)',
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <PhotoIcon style={{ width: '12px', height: '12px', color: 'var(--accent-primary)' }} />
            <span>+{galleryList.length} Angles</span>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="product-card-body">
        <span className="product-card-category" title={categoryName}>
          {categoryName}
        </span>

        <h3 className="product-card-title">
          <Link
            to={`/products/${product.id}`}
            style={{ color: 'inherit', textDecoration: 'none' }}
            onMouseOver={(e) => (e.target.style.color = 'var(--accent-primary)')}
            onMouseOut={(e) => (e.target.style.color = 'var(--text-primary)')}
          >
            {product.name}
          </Link>
        </h3>

        <p className="product-card-desc" style={{
          fontSize: '0.85rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.5,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          flex: 1,
          margin: 0
        }}>
          {product.description || 'No description provided for this product.'}
        </p>

        {/* Price & Action Button */}
        <div className="product-card-footer">
          <div>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.05em' }}>
              Price
            </span>
            <span style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--text-primary)', fontFamily: 'Outfit' }}>
              ${formattedPrice}
            </span>
          </div>

          <button
            onClick={() => inStock && onAddToCart(product)}
            disabled={!inStock}
            className={inStock ? 'btn-primary' : 'btn-secondary'}
            style={{
              opacity: inStock ? 1 : 0.5,
              cursor: inStock ? 'pointer' : 'not-allowed',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {inStock ? (
              <>
                <ShoppingCartIcon style={{ width: '16px', height: '16px', color: '#ffffff' }} />
                <span>Add to Cart</span>
              </>
            ) : (
              <span>Out of Stock</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
