import { 
  HomeIcon, 
  UserIcon, 
  SparklesIcon, 
  ChatBubbleLeftRightIcon, 
  ShoppingCartIcon,
  LifebuoyIcon
} from '@heroicons/react/24/outline';

function MobileBottomNav({ cartCount, onOpenCart, onOpenAbout, onOpenContact, onOpenSupport, supportUnreadCount = 0, onTrackOrder, activeCategory, setActiveCategory, onOpenCatalog, user, onOpenAuth }) {
  return (
    <nav className="mobile-bottom-menu">
      {/* Home / Catalog */}
      <button
        onClick={() => {
          if (onOpenCatalog) onOpenCatalog();
          else {
            if (setActiveCategory) setActiveCategory('All');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
        className="mobile-bottom-item"
        style={{ color: activeCategory === 'All' ? 'var(--accent-primary)' : 'var(--text-secondary)' }}
      >
        <HomeIcon style={{ width: '22px', height: '22px' }} />
        <span>Home</span>
      </button>

      {/* Account / Profile Icon */}
      <button
        onClick={() => {
          if (onOpenAuth) onOpenAuth();
        }}
        className="mobile-bottom-item"
        style={{ color: user ? 'var(--accent-primary)' : 'var(--text-secondary)' }}
      >
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <UserIcon style={{ width: '22px', height: '22px' }} />
          {user && (
            <span style={{
              position: 'absolute',
              top: '-2px',
              right: '-4px',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: user.role === 'admin' ? 'var(--warning)' : 'var(--accent-primary)',
              border: '1.5px solid #fff'
            }} />
          )}
        </div>
        <span style={{ fontWeight: user ? '700' : '500', fontSize: '0.72rem' }}>
          {user ? 'Profile' : 'Account'}
        </span>
      </button>

      {/* Support Center */}
      <button
        onClick={onOpenSupport}
        className="mobile-bottom-item"
        style={{ position: 'relative' }}
      >
        <div style={{ position: 'relative' }}>
          <LifebuoyIcon style={{ width: '22px', height: '22px' }} />
          {supportUnreadCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-3px',
              right: '-6px',
              backgroundColor: '#ef4444',
              color: '#fff',
              borderRadius: '50%',
              width: '8px',
              height: '8px',
              border: '1.5px solid #fff'
            }} />
          )}
        </div>
        <span>Support</span>
      </button>

      {/* Contact */}
      <button
        onClick={onOpenContact}
        className="mobile-bottom-item"
      >
        <ChatBubbleLeftRightIcon style={{ width: '22px', height: '22px' }} />
        <span>Contact</span>
      </button>

      {/* Bag */}
      <button
        onClick={onOpenCart}
        className="mobile-bottom-item"
        style={{ position: 'relative', color: cartCount > 0 ? 'var(--color-cta)' : 'var(--text-secondary)' }}
      >
        <div style={{ position: 'relative' }}>
          <ShoppingCartIcon style={{ width: '22px', height: '22px' }} />
          {cartCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-6px',
              right: '-10px',
              backgroundColor: 'var(--color-accent)',
              color: '#fff',
              borderRadius: 'var(--radius-full)',
              padding: '1px 5px',
              fontSize: '0.65rem',
              fontWeight: '800',
              lineHeight: 1
            }}>
              {cartCount}
            </span>
          )}
        </div>
        <span>Bag</span>
      </button>
    </nav>
  );
}

export default MobileBottomNav;
