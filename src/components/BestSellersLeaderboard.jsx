import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchBestSellers } from '../services/api';
import { getImageUrl, getFallbackImageUrl } from '../utils/imageHelper';
import { getCategoryName } from '../utils/categoryHelper';
import {
  FireIcon,
  TrophyIcon,
  SparklesIcon,
  ShoppingCartIcon,
  EyeIcon,
  ArrowTrendingUpIcon,
  TagIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';

export default function BestSellersLeaderboard({ onAddToCart, onQuickView }) {
  const [bestSellers, setBestSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('podium'); // 'podium' | 'grid'

  useEffect(() => {
    let isMounted = true;
    async function loadBestSellers() {
      try {
        setLoading(true);
        const data = await fetchBestSellers();
        if (isMounted) {
          setBestSellers(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.warn('Failed to load best sellers leaderboard:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadBestSellers();
    return () => { isMounted = false; };
  }, []);

  if (loading) {
    return (
      <section id="best-sellers-section" style={{ padding: '40px 0', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <div style={{ width: '180px', height: '24px', margin: '0 auto 12px', background: 'var(--bg-secondary)', borderRadius: '12px' }} className="skeleton" />
            <div style={{ width: '320px', height: '36px', margin: '0 auto', background: 'var(--bg-secondary)', borderRadius: '8px' }} className="skeleton" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {[1, 2, 3].map(n => (
              <div key={n} style={{ height: '260px', borderRadius: '16px', background: 'var(--bg-secondary)' }} className="skeleton" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!bestSellers || bestSellers.length === 0) {
    return null;
  }

  const topThree = bestSellers.slice(0, 3);
  const remaining = bestSellers.slice(3, 10);

  const getRankBadge = (rank) => {
    if (rank === 1) {
      return {
        label: '1st Champion',
        icon: '🥇',
        color: '#F59E0B',
        bg: 'linear-gradient(135deg, rgba(245, 158, 11, 0.25) 0%, rgba(217, 119, 6, 0.1) 100%)',
        border: 'rgba(245, 158, 11, 0.45)',
        glow: '0 8px 30px rgba(245, 158, 11, 0.25)'
      };
    }
    if (rank === 2) {
      return {
        label: '2nd Runner-Up',
        icon: '🥈',
        color: '#94A3B8',
        bg: 'linear-gradient(135deg, rgba(148, 163, 184, 0.25) 0%, rgba(100, 116, 139, 0.1) 100%)',
        border: 'rgba(148, 163, 184, 0.4)',
        glow: '0 8px 24px rgba(148, 163, 184, 0.2)'
      };
    }
    if (rank === 3) {
      return {
        label: '3rd Place',
        icon: '🥉',
        color: '#D97706',
        bg: 'linear-gradient(135deg, rgba(217, 119, 6, 0.2) 0%, rgba(180, 83, 9, 0.1) 100%)',
        border: 'rgba(217, 119, 6, 0.4)',
        glow: '0 8px 24px rgba(217, 119, 6, 0.18)'
      };
    }
    return {
      label: `#${rank}`,
      icon: '⭐',
      color: 'var(--color-accent)',
      bg: 'var(--bg-secondary)',
      border: 'var(--border-color)',
      glow: 'none'
    };
  };

  return (
    <section
      id="best-sellers-section"
      style={{
        padding: '50px 0 60px',
        position: 'relative',
        borderBottom: '1px solid var(--border-color)',
        background: 'linear-gradient(180deg, var(--bg-primary) 0%, var(--bg-secondary) 100%)'
      }}
    >
      <div className="container">
        {/* Section Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px', marginBottom: '32px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '5px 14px', borderRadius: '999px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#EF4444', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>
              <FireIcon style={{ width: '16px', height: '16px' }} />
              Best Sellers Leaderboard (Top 10)
            </div>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', fontWeight: '900', color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>Most Popular Store Items</span>
              <SparklesIcon style={{ width: '28px', height: '28px', color: '#F59E0B' }} />
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: '6px 0 0', maxWidth: '600px' }}>
              Real-time sales leaderboard calculated directly from customer orders and verified item deliveries.
            </p>
          </div>

          {/* View Mode Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '4px' }}>
            <button
              type="button"
              onClick={() => setViewMode('podium')}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: '700',
                border: 'none',
                cursor: 'pointer',
                background: viewMode === 'podium' ? 'var(--color-cta)' : 'transparent',
                color: viewMode === 'podium' ? '#fff' : 'var(--text-secondary)',
                transition: 'all 0.2s'
              }}
            >
              🏆 Podium & List
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: '700',
                border: 'none',
                cursor: 'pointer',
                background: viewMode === 'grid' ? 'var(--color-cta)' : 'transparent',
                color: viewMode === 'grid' ? '#fff' : 'var(--text-secondary)',
                transition: 'all 0.2s'
              }}
            >
              🛍️ Showcase Cards
            </button>
          </div>
        </div>

        {/* View Mode 1: Top 3 Champions Podium + Rows */}
        {viewMode === 'podium' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            {/* Top 3 Podium Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              {topThree.map((item) => {
                const badge = getRankBadge(item.rank);
                const primaryImg = getImageUrl(item.image);
                const fallbackImg = getFallbackImageUrl(item.image);

                return (
                  <div
                    key={item.id}
                    className="glass-card"
                    style={{
                      borderRadius: '20px',
                      border: `1.5px solid ${badge.border}`,
                      background: 'var(--bg-primary)',
                      padding: '24px',
                      position: 'relative',
                      overflow: 'hidden',
                      boxShadow: badge.glow,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    {/* Top Banner Ribbon */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '10px', background: badge.bg, border: `1px solid ${badge.border}`, color: badge.color, fontWeight: '800', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        <span>{badge.icon}</span>
                        <span>{badge.label}</span>
                      </span>

                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: '800', color: '#EF4444', background: 'rgba(239, 68, 68, 0.1)', padding: '4px 10px', borderRadius: '999px' }}>
                        <FireIcon style={{ width: '14px', height: '14px' }} />
                        {item.sold} Sold
                      </span>
                    </div>

                    {/* Product Media & Details */}
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '18px' }}>
                      <div style={{ width: '92px', height: '92px', borderRadius: '14px', overflow: 'hidden', background: 'var(--bg-secondary)', flexShrink: 0, border: '1px solid var(--border-color)', position: 'relative' }}>
                        <img
                          src={primaryImg}
                          alt={item.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => {
                            if (fallbackImg && e.target.src !== fallbackImg) {
                              e.target.src = fallbackImg;
                            }
                          }}
                        />
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          {item.category_name || item.category || 'General'}
                        </span>
                        <Link to={`/products/${item.id}`} style={{ textDecoration: 'none' }}>
                          <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-primary)', margin: '2px 0 6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {item.name}
                          </h4>
                        </Link>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                          <span style={{ fontSize: '1.25rem', fontWeight: '900', color: 'var(--text-primary)' }}>
                            ${Number(item.price || 0).toFixed(2)}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            • Total rev: ${Number(item.revenue || 0).toFixed(0)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Action Buttons */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', paddingTop: '14px', borderTop: '1px solid var(--border-color)' }}>
                      <button
                        type="button"
                        onClick={() => onQuickView && onQuickView(item)}
                        className="btn btn-secondary"
                        style={{ padding: '8px 12px', fontSize: '0.8rem', fontWeight: '700', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                      >
                        <EyeIcon style={{ width: '14px', height: '14px' }} /> Quick View
                      </button>
                      <button
                        type="button"
                        onClick={() => onAddToCart && onAddToCart(item)}
                        className="btn btn-primary"
                        style={{ padding: '8px 12px', fontSize: '0.8rem', fontWeight: '800', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                      >
                        <ShoppingCartIcon style={{ width: '14px', height: '14px' }} /> Add to Cart
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Ranks 4 to 10 Rows Table */}
            {remaining.length > 0 && (
              <div
                className="glass-card"
                style={{
                  borderRadius: '20px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-primary)',
                  overflow: 'hidden'
                }}
              >
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ArrowTrendingUpIcon style={{ width: '16px', height: '16px', color: 'var(--color-accent)' }} />
                    Ranks #4 &ndash; #{bestSellers.length} Leaderboard Standings
                  </span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {remaining.length} additional top performers
                  </span>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
                    <thead>
                      <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                        <th style={{ padding: '12px 18px', fontWeight: '700', color: 'var(--text-secondary)', width: '70px' }}>Rank</th>
                        <th style={{ padding: '12px 18px', fontWeight: '700', color: 'var(--text-secondary)' }}>Product</th>
                        <th style={{ padding: '12px 18px', fontWeight: '700', color: 'var(--text-secondary)' }}>Category</th>
                        <th style={{ padding: '12px 18px', fontWeight: '700', color: 'var(--text-secondary)' }}>Price</th>
                        <th style={{ padding: '12px 18px', fontWeight: '700', color: 'var(--text-secondary)' }}>Total Sold</th>
                        <th style={{ padding: '12px 18px', fontWeight: '700', color: 'var(--text-secondary)', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {remaining.map((item) => {
                        const primaryImg = getImageUrl(item.image);
                        const fallbackImg = getFallbackImageUrl(item.image);

                        return (
                          <tr
                            key={item.id}
                            style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }}
                            onMouseOver={(e) => { e.currentTarget.style.background = 'var(--bg-secondary)'; }}
                            onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; }}
                          >
                            <td style={{ padding: '14px 18px' }}>
                              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', fontWeight: '800', fontSize: '0.78rem', color: 'var(--text-primary)' }}>
                                #{item.rank}
                              </span>
                            </td>
                            <td style={{ padding: '14px 18px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '44px', height: '44px', borderRadius: '10px', overflow: 'hidden', background: 'var(--bg-secondary)', flexShrink: 0, border: '1px solid var(--border-color)' }}>
                                  <img
                                    src={primaryImg}
                                    alt={item.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    onError={(e) => {
                                      if (fallbackImg && e.target.src !== fallbackImg) {
                                        e.target.src = fallbackImg;
                                      }
                                    }}
                                  />
                                </div>
                                <div>
                                  <Link to={`/products/${item.id}`} style={{ textDecoration: 'none' }}>
                                    <p style={{ fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>{item.name}</p>
                                  </Link>
                                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                    Stock: {item.stock > 0 ? `${item.stock} in stock` : 'Out of stock'}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: '14px 18px' }}>
                              <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '999px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                                {item.category_name || item.category || 'General'}
                              </span>
                            </td>
                            <td style={{ padding: '14px 18px', fontWeight: '800', color: 'var(--text-primary)' }}>
                              ${Number(item.price || 0).toFixed(2)}
                            </td>
                            <td style={{ padding: '14px 18px' }}>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', fontWeight: '800', fontSize: '0.78rem' }}>
                                <FireIcon style={{ width: '12px', height: '12px' }} />
                                {item.sold} sold
                              </span>
                            </td>
                            <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                              <div style={{ display: 'inline-flex', gap: '6px' }}>
                                <button
                                  type="button"
                                  onClick={() => onQuickView && onQuickView(item)}
                                  style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '600' }}
                                  title="Quick View"
                                >
                                  <EyeIcon style={{ width: '14px', height: '14px' }} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onAddToCart && onAddToCart(item)}
                                  style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', background: 'var(--color-cta)', color: '#fff', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}
                                >
                                  <ShoppingCartIcon style={{ width: '13px', height: '13px' }} />
                                  Add
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* View Mode 2: Grid Showcase Cards */}
        {viewMode === 'grid' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
            {bestSellers.map((item) => {
              const badge = getRankBadge(item.rank);
              const primaryImg = getImageUrl(item.image);
              const fallbackImg = getFallbackImageUrl(item.image);

              return (
                <div
                  key={item.id}
                  className="glass-card"
                  style={{
                    borderRadius: '16px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-primary)',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative'
                  }}
                >
                  <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 2 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', padding: '3px 8px', borderRadius: '8px', background: badge.bg, border: `1px solid ${badge.border}`, color: badge.color, fontWeight: '800', fontSize: '0.72rem' }}>
                      {badge.icon} #{item.rank}
                    </span>
                  </div>

                  <div style={{ width: '100%', height: '150px', borderRadius: '12px', overflow: 'hidden', background: 'var(--bg-secondary)', marginBottom: '12px' }}>
                    <img
                      src={primaryImg}
                      alt={item.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        if (fallbackImg && e.target.src !== fallbackImg) {
                          e.target.src = fallbackImg;
                        }
                      }}
                    />
                  </div>

                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>
                      {item.category_name || item.category || 'General'}
                    </span>
                    <Link to={`/products/${item.id}`} style={{ textDecoration: 'none' }}>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--text-primary)', margin: '2px 0 6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.name}
                      </h4>
                    </Link>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span style={{ fontSize: '1.1rem', fontWeight: '900', color: 'var(--text-primary)' }}>
                        ${Number(item.price || 0).toFixed(2)}
                      </span>
                      <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#EF4444' }}>
                        {item.sold} sold
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={() => onQuickView && onQuickView(item)}
                      className="btn btn-secondary"
                      style={{ padding: '6px', fontSize: '0.75rem', borderRadius: '8px' }}
                    >
                      View
                    </button>
                    <button
                      type="button"
                      onClick={() => onAddToCart && onAddToCart(item)}
                      className="btn btn-primary"
                      style={{ padding: '6px', fontSize: '0.75rem', fontWeight: '800', borderRadius: '8px' }}
                    >
                      + Cart
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
