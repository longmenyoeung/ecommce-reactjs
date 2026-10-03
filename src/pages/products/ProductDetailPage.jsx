import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchProductById, fetchProducts } from '../../services/api';
import { getImageUrl, getFallbackImageUrl } from '../../utils/imageHelper';
import { getCategoryName } from '../../utils/categoryHelper';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import ProductCard from '../../components/ProductCard';
import {
  ArrowLeftIcon,
  ShoppingCartIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PhotoIcon,
  SparklesIcon,
  ShieldCheckIcon,
  TruckIcon,
  ShareIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';

import { ENV } from '../../config/env';

export function ProductDetailPage({ allProducts = [], onOpenCheckout }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, setIsCartOpen } = useCart();
  const { showToast } = useToast();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [imgError, setImgError] = useState(false);
  const [fallbackAttempted, setFallbackAttempted] = useState(false);

  // Reviews state
  const [reviewsData, setReviewsData] = useState({
    average_rating: 4.9,
    total_reviews: 0,
    breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    data: []
  });
  const [reviewForm, setReviewForm] = useState({ rating: 5, author_name: '', comment: '' });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    fetch(`${ENV.API_BASE_URL}/products/${id}/reviews`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success) {
          setReviewsData(data);
        }
      })
      .catch(() => {});
  }, [id]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewForm.comment.trim()) return;
    setIsSubmittingReview(true);
    try {
      const res = await fetch(`${ENV.API_BASE_URL}/products/${id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(reviewForm)
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        showToast({ type: 'success', title: 'Review Submitted', text: 'Thank you for your rating!' });
        setReviewForm({ rating: 5, author_name: '', comment: '' });
        setShowReviewForm(false);
        const refetch = await fetch(`${ENV.API_BASE_URL}/products/${id}/reviews`);
        const refetchData = await refetch.json();
        if (refetchData.success) setReviewsData(refetchData);
      } else {
        showToast({ type: 'error', title: 'Submission Error', text: resData.message || 'Could not submit review' });
      }
    } catch (err) {
      showToast({ type: 'error', title: 'Network Error', text: err.message });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    let isMounted = true;

    async function loadProduct() {
      try {
        setLoading(true);
        setError(null);

        // First check in-memory cache if passed from catalog
        const existing = allProducts.find((p) => String(p.id) === String(id));
        if (existing) {
          setProduct(existing);
          setLoading(false);
          return;
        }

        // Otherwise fetch fresh from API
        const data = await fetchProductById(id);
        if (isMounted) {
          if (data && data.id) {
            setProduct(data);
          } else {
            setError('Product not found in store catalog.');
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error(`Failed to load product #${id}:`, err);
          setError('Unable to load product information. Please check your connection.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadProduct();

    return () => {
      isMounted = false;
    };
  }, [id, allProducts]);

  const primaryImgUrl = product ? getImageUrl(product.image) : '';
  const fallbackImgUrl = product ? getFallbackImageUrl(product.image) : '';
  const categoryName = product ? getCategoryName(product) : 'General';

  const galleryImages = useMemo(() => {
    if (!product) return [];
    const list = [];
    if (primaryImgUrl) list.push(primaryImgUrl);

    let parsedImages = product.images;
    if (typeof parsedImages === 'string') {
      try {
        parsedImages = JSON.parse(parsedImages);
      } catch {
        parsedImages = [];
      }
    }

    if (Array.isArray(parsedImages) && parsedImages.length > 0) {
      parsedImages.forEach((img) => {
        const fullUrl = getImageUrl(img);
        if (fullUrl && !list.includes(fullUrl)) {
          list.push(fullUrl);
        }
      });
    }

    if (list.length === 1 && fallbackImgUrl && fallbackImgUrl !== primaryImgUrl) {
      list.push(fallbackImgUrl);
    }
    return list;
  }, [product, primaryImgUrl, fallbackImgUrl]);

  const relatedProducts = useMemo(() => {
    if (!allProducts || allProducts.length === 0 || !product) return [];
    return allProducts
      .filter((p) => String(p.id) !== String(product.id))
      .slice(0, 4);
  }, [allProducts, product]);

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    showToast({
      type: 'success',
      title: 'Link Copied!',
      text: 'Shareable product URL copied to clipboard.'
    });
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity);
    showToast({
      type: 'success',
      title: 'Added to Bag',
      text: `${quantity}× ${product.name} added to cart.`
    });
  };

  const handleBuyNow = () => {
    if (!product) return;
    addToCart(product, quantity);
    if (onOpenCheckout) {
      onOpenCheckout({
        items: [
          {
            id: product.id,
            name: product.name,
            price: parseFloat(product.price || 0),
            quantity,
            image: product.image
          }
        ],
        subtotal: parseFloat(product.price || 0) * quantity
      });
    } else {
      setIsCartOpen(true);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '80px 24px', maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
        <ArrowPathIcon
          style={{ width: '40px', height: '40px', color: 'var(--color-accent)', margin: '0 auto 16px' }}
          className="animate-spin"
        />
        <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>Loading Product Details...</h3>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div
        className="glass-panel"
        style={{
          padding: '60px 24px',
          maxWidth: '600px',
          margin: '60px auto',
          textAlign: 'center',
          borderRadius: 'var(--radius-lg)'
        }}
      >
        <ExclamationTriangleIcon style={{ width: '56px', height: '56px', color: 'var(--danger)', margin: '0 auto 16px' }} />
        <h2 style={{ fontSize: '1.5rem', marginBottom: '12px' }}>{error || 'Product Not Found'}</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
          The requested item may have been moved or removed from our inventory.
        </p>
        <button onClick={() => navigate('/')} className="btn-primary">
          <ArrowLeftIcon style={{ width: '18px', height: '18px' }} /> Back to Storefront
        </button>
      </div>
    );
  }

  const inStock = (product.stock ?? 99) > 0;
  const currentImg = galleryImages[activeImgIndex] || primaryImgUrl || fallbackImgUrl;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 20px 80px' }}>
      {/* Breadcrumbs & Navigation */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '28px',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ArrowLeftIcon style={{ width: '16px', height: '16px' }} /> Catalog
          </Link>
          <span>/</span>
          <span>{categoryName}</span>
          <span>/</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{product.name}</span>
        </div>

        <button
          onClick={handleCopyLink}
          className="btn-secondary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', padding: '8px 14px' }}
        >
          <ShareIcon style={{ width: '16px', height: '16px' }} /> Share Link
        </button>
      </div>

      {/* Main Product Showcase Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '40px',
          alignItems: 'start'
        }}
      >
        {/* Left: Interactive Media Gallery */}
        <div>
          <div
            className="glass-card"
            style={{
              position: 'relative',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              aspectRatio: '1 / 1',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {!imgError && currentImg ? (
              <img
                src={currentImg}
                alt={product.name}
                onError={() => {
                  if (!fallbackAttempted && fallbackImgUrl) {
                    setFallbackAttempted(true);
                  } else {
                    setImgError(true);
                  }
                }}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: 'transform 0.4s ease'
                }}
              />
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                <PhotoIcon style={{ width: '56px', height: '56px', margin: '0 auto 8px', opacity: 0.5 }} />
                <p style={{ margin: 0, fontSize: '0.85rem' }}>Image Preview</p>
              </div>
            )}

            <div
              style={{
                position: 'absolute',
                top: '16px',
                left: '16px',
                display: 'flex',
                gap: '8px'
              }}
            >
              <span className="badge badge-accent">
                <SparklesIcon style={{ width: '14px', height: '14px', display: 'inline', marginRight: '4px' }} />
                {categoryName}
              </span>
            </div>
          </div>

          {/* Gallery Thumbnails */}
          {galleryImages.length > 1 && (
            <div
              style={{
                display: 'flex',
                gap: '12px',
                marginTop: '16px',
                overflowX: 'auto',
                paddingBottom: '6px'
              }}
            >
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImgIndex(idx)}
                  style={{
                    width: '76px',
                    height: '76px',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    border: activeImgIndex === idx ? '2px solid var(--color-accent)' : '1px solid var(--border-color)',
                    padding: 0,
                    cursor: 'pointer',
                    flexShrink: 0,
                    opacity: activeImgIndex === idx ? 1 : 0.65,
                    transition: 'all 0.2s ease',
                    background: 'none'
                  }}
                >
                  <img src={img} alt={`Angle ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Specifications & Purchasing Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <div style={{ display: 'flex', color: '#f59e0b' }}>
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} style={{ width: '18px', height: '18px' }} />
                ))}
              </div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>(4.9 • 128 Reviews)</span>
            </div>

            <h1 style={{ fontSize: '2.2rem', fontWeight: '800', margin: '0 0 12px', color: 'var(--text-primary)', lineHeight: 1.2 }}>
              {product.name}
            </h1>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px', marginBottom: '16px' }}>
              <span style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--color-accent)' }}>
                ${parseFloat(product.price || 0).toFixed(2)}
              </span>
              <span style={{ fontSize: '1rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                ${(parseFloat(product.price || 0) * 1.25).toFixed(2)}
              </span>
              <span className="badge" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                Save 20%
              </span>
            </div>

            {/* In-Stock Indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', marginBottom: '20px' }}>
              {inStock ? (
                <>
                  <CheckCircleIcon style={{ width: '18px', height: '18px', color: '#10b981' }} />
                  <span style={{ color: '#10b981', fontWeight: '600' }}>In Stock ({product.stock ?? '99+'} units ready to dispatch)</span>
                </>
              ) : (
                <>
                  <ExclamationTriangleIcon style={{ width: '18px', height: '18px', color: 'var(--danger)' }} />
                  <span style={{ color: 'var(--danger)', fontWeight: '600' }}>Currently Backordered</span>
                </>
              )}
            </div>

            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '1rem', margin: 0 }}>
              {product.description || 'Engineered with precision materials designed for maximum durability, elegance, and peak modern lifestyle demands.'}
            </p>
          </div>

          {/* Quantity and Actions */}
          <div
            className="glass-panel"
            style={{
              padding: '20px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: '600', fontSize: '0.95rem', color: 'var(--text-primary)' }}>Select Quantity</span>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-secondary)',
                  overflow: 'hidden'
                }}
              >
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  style={{
                    padding: '8px 16px',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    fontSize: '1.1rem'
                  }}
                >
                  -
                </button>
                <span style={{ padding: '0 12px', fontWeight: '700', fontSize: '0.95rem' }}>{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min((product.stock || 99), q + 1))}
                  style={{
                    padding: '8px 16px',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    fontSize: '1.1rem'
                  }}
                >
                  +
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button
                onClick={handleAddToCart}
                disabled={!inStock}
                className="btn-secondary"
                style={{
                  padding: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontWeight: '700'
                }}
              >
                <ShoppingCartIcon style={{ width: '20px', height: '20px' }} /> Add to Bag
              </button>
              <button
                onClick={handleBuyNow}
                disabled={!inStock}
                className="btn-primary"
                style={{
                  padding: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontWeight: '700'
                }}
              >
                Instant Checkout
              </button>
            </div>
          </div>

          {/* Guarantees & Perks */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <TruckIcon style={{ width: '22px', height: '22px', color: 'var(--color-accent)' }} />
              <span>Complimentary Express Shipping</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <ShieldCheckIcon style={{ width: '22px', height: '22px', color: '#10b981' }} />
              <span>2-Year Official Warranty</span>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews & Feedback Section */}
      <section style={{ marginTop: '72px', borderTop: '1px solid var(--border-color)', paddingTop: '48px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
          <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '0 0 6px', color: 'var(--text-primary)' }}>
              Verified Buyer Reviews
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ display: 'flex', color: '#f59e0b' }}>
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} style={{ width: '20px', height: '20px' }} />
                ))}
              </div>
              <span style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                {reviewsData.average_rating || '5.0'} out of 5
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                ({reviewsData.total_reviews || reviewsData.data?.length || 0} reviews)
              </span>
            </div>
          </div>

          <button
            onClick={() => setShowReviewForm((prev) => !prev)}
            className="btn-primary"
            style={{ padding: '10px 20px', fontSize: '0.9rem' }}
          >
            {showReviewForm ? 'Close Form' : 'Write a Review'}
          </button>
        </div>

        {/* Review Form */}
        {showReviewForm && (
          <form
            onSubmit={handleReviewSubmit}
            className="glass-card animate-scale-in"
            style={{
              padding: '24px',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-color)',
              marginBottom: '36px',
              maxWidth: '650px'
            }}
          >
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', margin: '0 0 16px' }}>Leave Your Rating & Review</h3>

            {/* Star Selector */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>
                Rating Score
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                  >
                    <StarIcon
                      style={{
                        width: '28px',
                        height: '28px',
                        color: star <= reviewForm.rating ? '#f59e0b' : 'var(--text-muted)'
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>
                Your Name
              </label>
              <input
                type="text"
                placeholder="e.g. Alexander Vance"
                value={reviewForm.author_name}
                onChange={(e) => setReviewForm({ ...reviewForm, author_name: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>
                Your Review Experience
              </label>
              <textarea
                required
                rows="4"
                placeholder="Describe product build quality, daily performance, fit and finish..."
                value={reviewForm.comment}
                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  resize: 'vertical'
                }}
              />
            </div>

            <button type="submit" disabled={isSubmittingReview} className="btn-primary" style={{ padding: '10px 24px' }}>
              {isSubmittingReview ? 'Submitting...' : 'Post Public Review'}
            </button>
          </form>
        )}

        {/* Reviews List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {(reviewsData.data && reviewsData.data.length > 0) ? (
            reviewsData.data.map((rev) => (
              <div
                key={rev.id}
                className="glass-panel"
                style={{
                  padding: '20px 24px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.85rem' }}>
                      {(rev.author_name || 'U').charAt(0).toUpperCase()}
                    </div>
                    <strong style={{ fontSize: '0.95rem' }}>{rev.author_name}</strong>
                    {rev.is_verified_buyer && (
                      <span className="badge" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontSize: '0.75rem', padding: '2px 8px' }}>
                        ✓ Verified Buyer
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {rev.created_at ? rev.created_at.substring(0, 10) : 'Recent'}
                  </span>
                </div>

                <div style={{ display: 'flex', color: '#f59e0b', marginBottom: '8px' }}>
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      style={{
                        width: '16px',
                        height: '16px',
                        color: i < (rev.rating || 5) ? '#f59e0b' : 'var(--text-muted)'
                      }}
                    />
                  ))}
                </div>

                <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {rev.comment}
                </p>
              </div>
            ))
          ) : (
            <div
              className="glass-panel"
              style={{
                padding: '36px',
                textAlign: 'center',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-secondary)'
              }}
            >
              <p style={{ margin: 0 }}>Be the first verified customer to share your thoughts on this product!</p>
            </div>
          )}
        </div>
      </section>

      {/* Related Products Carousel */}
      {relatedProducts.length > 0 && (
        <section style={{ marginTop: '80px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: '800', margin: 0 }}>You Might Also Love</h2>
            <Link to="/" style={{ color: 'var(--color-accent)', textDecoration: 'none', fontWeight: '600', fontSize: '0.9rem' }}>
              View All Collection &rarr;
            </Link>
          </div>
          <div className="product-grid">
            {relatedProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onAddToCart={(prod) => addToCart(prod, 1)}
                onQuickView={() => navigate(`/products/${p.id}`)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default ProductDetailPage;
