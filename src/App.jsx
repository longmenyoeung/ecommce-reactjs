import React, { useState, useEffect } from 'react';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import Topbar from './components/Topbar';
import Navbar from './components/Navbar';
import CartDrawer from './components/CartDrawer';
import ProductModal from './components/ProductModal';
import AboutModal from './components/AboutModal';
import ContactModal from './components/ContactModal';
import AuthModal from './components/AuthModal';
import CheckoutModal from './components/CheckoutModal';
import TrackingStatusModal from './components/TrackingStatusModal';
import TrackOrderModal from './components/TrackOrderModal';
import MobileBottomNav from './components/MobileBottomNav';
import SupportModal from './components/SupportModal';
import { AppRoutes } from './routes';
import { DEFAULT_CATEGORY_LIST } from './utils/categoryHelper';
import { ToastProvider, useToast } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { shipmentService } from './services/shipment.service';
import { orderService } from './services/order.service';
import { supportService } from './services/support.service';
import { fetchProducts } from './services/api';

/* ---------------------------------------------------------------------------
 * Notification feed storage (per-account / owner-only)
 * ---------------------------------------------------------------------------
 * Alerts are private: the feed is namespaced by user id so a second account
 * signing in on the same browser can never read the previous account's order,
 * tracking or promo alerts. Signed-out visitors keep no feed at all.
 * ------------------------------------------------------------------------- */
const LEGACY_NOTIFICATION_KEY = 'nexus_notifications';

const DEMO_NOTIFICATIONS = [
    {
        id: 'notif-1',
        title: '📦 Order #10245 Shipped & In Transit',
        text: 'Your Executive Ultralight Watch has departed the Logistics Hub and is on its way via FedEx Priority Express.',
        time: '1 hour ago',
        unread: true,
        type: 'tracking',
        // Demo copy only: order #10245 does not exist, so this alert
        // deliberately has no deep-link target any more.
        orderId: null
    },
    {
        id: 'notif-2',
        title: '🎉 VIP Promo Unlocked: NEXUSVIP20',
        text: 'Enjoy 20% off plus free express delivery on all new premium arrivals this week!',
        time: '1 day ago',
        unread: false,
        type: 'promo'
    }
];

/** Storage key holding one account's alert feed (null while signed out). */
const notificationStorageKey = (userId) => (userId ? `${LEGACY_NOTIFICATION_KEY}_${userId}` : null);

/** Per-account dedupe marker for the "order shipped" alert. */
const shippedMarkerKey = (userId, orderId) => `notif_shipped_${userId || 'guest'}_${orderId}`;

/** Read one account's own feed (demo seeds only on that account's first sign-in). */
const readNotificationFeed = (userId) => {
    const key = notificationStorageKey(userId);
    if (!key) return [];
    try {
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : DEMO_NOTIFICATIONS;
    } catch {
        return [];
    }
};

function StorefrontContent() {
    const { cartItems, isCartOpen, setIsCartOpen, addToCart, updateQuantity, removeFromCart, clearCart, totalCartCount } = useCart();
    const { user, login, logout } = useAuth();
    const { showToast } = useToast();

    // Modals & Navigation state
    const [quickViewProduct, setQuickViewProduct] = useState(null);
    const [activeModal, setActiveModal] = useState(null); // 'about' | 'contact' | 'auth' | 'support' | null
    const [checkoutData, setCheckoutData] = useState(null);
    const [trackedOrder, setTrackedOrder] = useState(null);
    const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
    const [supportUnreadCount, setSupportUnreadCount] = useState(0);

    // Filter & Category state
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [categories, setCategories] = useState(DEFAULT_CATEGORY_LIST);
    const [allProducts, setAllProducts] = useState([]);

    // Preload products for instant search dropdown availability
    useEffect(() => {
        fetchProducts().then(data => {
            if (data && Array.isArray(data) && data.length > 0) {
                setAllProducts(data);
            }
        }).catch(() => {});
    }, []);

    // Per-account alert feed. `notifFeedOwnerId` records which account the
    // in-memory feed belongs to, so a freshly signed-in account is never shown
    // the previous account's alerts.
    const userId = user?.id ?? null;
    const [notifications, setNotifications] = useState(() => readNotificationFeed(userId));
    const [notifFeedOwnerId, setNotifFeedOwnerId] = useState(() => userId);

    // Adopt the signed-in account's own feed the instant the account changes.
    // Declared before the persist effect below so its guard can never write one
    // account's alerts into another account's storage bucket.
    useEffect(() => {
        setNotifFeedOwnerId(userId);
        setNotifications(readNotificationFeed(userId));
        // Legacy builds kept one shared 'nexus_notifications' key for every
        // visitor; purge it so it can never bleed across accounts.
        try {
            localStorage.removeItem(LEGACY_NOTIFICATION_KEY);
        } catch {
            // Storage unavailable (private mode) - nothing to purge.
        }
    }, [userId]);

    // Persist the alert feed. This lives in an effect instead of inside the
    // setState updaters: React StrictMode double-invokes updaters in dev, so
    // every localStorage write used to run twice.
    useEffect(() => {
        const key = notificationStorageKey(userId);
        // Never persist for a signed-out visitor, and never while the rendered
        // feed still belongs to a previous account.
        if (!key || notifFeedOwnerId !== userId) return;
        try {
            localStorage.setItem(key, JSON.stringify(notifications));
        } catch {
            // Storage unavailable (private mode / quota) - in-memory feed still works.
        }
    }, [notifications, userId, notifFeedOwnerId]);

    // Owner guard: alerts are only ever rendered for a signed-in account that
    // actually owns the in-memory feed - enforced here, not just by convention.
    const visibleNotifications = userId && notifFeedOwnerId === userId ? notifications : [];

    const handleAddNotification = (title, text, type = 'tracking', orderId = null, toastType = null) => {
        const newNotif = {
            id: 'notif-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
            title,
            text,
            time: 'Just now',
            unread: true,
            type,
            orderId
        };
        setNotifications(prev => [newNotif, ...prev]);
        showToast({
            type: toastType || (type === 'tracking' ? 'info' : 'success'),
            title,
            text
        });
    };

    const handleMarkAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    };

    const handleMarkRead = (id) => {
        setNotifications(prev => prev.map(n => (n.id === id ? { ...n, unread: false } : n)));
    };

    const handleClearAllNotifications = () => {
        setNotifications([]);
    };

    // Check unread support responses from admin (fast 8s polling + focus revalidation)
    useEffect(() => {
        if (!user) {
            setSupportUnreadCount(0);
            return;
        }
        async function fetchSupportUnread() {
            try {
                const res = await supportService.getTickets();
                if (res && res.success) {
                    setSupportUnreadCount(res.unread_count || 0);
                }
            } catch {
                // silent
            }
        }
        fetchSupportUnread();
        const interval = setInterval(() => {
            if (document.visibilityState === 'visible') {
                fetchSupportUnread();
            }
        }, 8000);

        const handleFocus = () => fetchSupportUnread();
        window.addEventListener('focus', handleFocus);

        return () => {
            clearInterval(interval);
            window.removeEventListener('focus', handleFocus);
        };
    }, [user, activeModal]);

    // Fast order status notification listener: notifies customer when admin marks order shipped
    useEffect(() => {
        if (!userId) return;
        async function checkOrdersStatus() {
            try {
                const orders = await orderService.getOrderHistory();
                if (Array.isArray(orders)) {
                    orders.forEach(ord => {
                        const s = (ord.status || '').toLowerCase();
                        if (s === 'shipped') {
                            const notifKey = shippedMarkerKey(userId, ord.id);
                            if (!localStorage.getItem(notifKey)) {
                                localStorage.setItem(notifKey, 'true');
                                handleAddNotification(
                                    `📦 Order #${ord.id} Shipped & In Transit!`,
                                    `Your package has been dispatched via ${ord.carrier || 'FedEx Priority Express'} (Tracking: ${ord.tracking_number || `FX-${ord.id}`}).`,
                                    'tracking',
                                    ord.id
                                );
                            }
                        }
                    });
                }
            } catch {
                // silent
            }
        }
        checkOrdersStatus();
        const interval = setInterval(() => {
            if (document.visibilityState === 'visible') {
                checkOrdersStatus();
            }
        }, 8000);
        return () => clearInterval(interval);
    }, [userId]);

    // Tracking Handler with clean interactive modal
    const handleTrackOrder = async (orderId) => {
        if (!orderId) {
            setIsTrackModalOpen(true);
            return;
        }

        try {
            // Fetch live tracking from backend public track endpoint and order service
            const trackingInfo = await shipmentService.trackShipment(orderId).catch(() => null);
            const foundOrder = await orderService.getOrderById(orderId).catch(() => null);

            const active = trackingInfo || foundOrder;

            if (active && (active.id || active.order_id)) {
                setTrackedOrder({
                    id: active.id || active.order_id,
                    order_id: active.order_id || active.id,
                    tracking_number: active.tracking_number || `FX-${active.id || active.order_id}`,
                    status: active.status || 'Processing',
                    status_raw: active.status_raw || (active.status || 'processing').toLowerCase(),
                    carrier: active.carrier || 'FedEx Priority Express',
                    estimated_delivery: active.estimated_delivery || 'Estimated in 2 business days',
                    payment_method: active.payment_method || 'Credit Card',
                    total: Number(active.total || 0),
                    shipping_address: active.shipping_address || 'Customer Delivery Address',
                    date: active.date || (active.created_at ? String(active.created_at).substring(0, 10) : 'Recent'),
                    checkpoints: active.checkpoints || [],
                    items: active.items || []
                });

                showToast({
                    type: 'info',
                    title: `Order #${orderId}: ${active.status}`,
                    text: `Carrier: ${active.carrier || 'FedEx Express'} • Tracking: ${active.tracking_number || `FX-${orderId}`}`
                });
                return;
            }

            showToast({
                type: 'error',
                title: 'Tracking Not Found',
                text: `Could not locate order #${orderId}. Please check the number.`
            });
        } catch {
            showToast({
                type: 'error',
                title: 'Tracking Error',
                text: `Could not load tracking for order #${orderId}`
            });
        }
    };

    const handleOpenCatalog = () => {
        setActiveCategory('All');
        setSearchTerm('');
        window.scrollTo({ top: 400, behavior: 'smooth' });
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Top Announcement Bar */}
            <Topbar
                onOpenCatalog={handleOpenCatalog}
                onOpenAbout={() => setActiveModal('about')}
                onOpenContact={() => setActiveModal('contact')}
                onTrackOrder={() => setIsTrackModalOpen(true)}
            />

            {/* Navigation Bar */}
            <Navbar
                cartCount={totalCartCount}
                onOpenCart={() => setIsCartOpen(true)}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                activeCategory={activeCategory}
                setActiveCategory={setActiveCategory}
                categories={categories}
                onOpenAbout={() => setActiveModal('about')}
                onOpenContact={() => setActiveModal('contact')}
                onOpenSupport={() => setActiveModal('support')}
                supportUnreadCount={supportUnreadCount}
                onOpenCatalog={handleOpenCatalog}
                user={user}
                onOpenAuth={() => setActiveModal('auth')}
                onLogout={async () => {
                    await logout();
                    showToast({
                        type: 'info',
                        title: 'Signed Out',
                        text: 'You have been successfully signed out.'
                    });
                }}
                notifications={visibleNotifications}
                onMarkAllRead={handleMarkAllRead}
                onMarkRead={handleMarkRead}
                onOpenTracking={handleTrackOrder}
                onClearAllNotifications={handleClearAllNotifications}
                products={allProducts}
                onQuickView={(prod) => setQuickViewProduct(prod)}
                onAddToCart={(prod) => {
                    const res = addToCart(prod, 1);
                    if (res && !res.success) {
                        showToast({
                            type: 'remove',
                            title: 'Stock Limit Reached',
                            text: res.message || 'Cannot add more items to cart.'
                        });
                        return false;
                    }
                    showToast({
                        type: 'success',
                        title: 'Added to Bag',
                        text: `${prod.name} added to your cart.`
                    });
                    return true;
                }}
            />

            {/* Main Routing Area (Supports / catalog, /products/:id detail, and /track) */}
            <div style={{ flex: 1 }}>
                <AppRoutes
                    onAddToCart={(product, qty = 1) => {
                        const res = addToCart(product, qty);
                        if (res && !res.success) {
                            showToast({
                                type: 'remove',
                                title: 'Stock Limit Reached',
                                text: res.message || 'Cannot add more items to cart.'
                            });
                            return false;
                        }
                        showToast({
                            type: 'success',
                            title: 'Added to Bag',
                            text: `${product.name} added to your cart.`
                        });
                        return true;
                    }}
                    onQuickView={(prod) => setQuickViewProduct(prod)}
                    searchTerm={searchTerm}
                    activeCategory={activeCategory}
                    setActiveCategory={setActiveCategory}
                    categories={categories}
                    setCategories={setCategories}
                    onProductsLoaded={setAllProducts}
                    allProducts={allProducts}
                    onOpenAbout={() => setActiveModal('about')}
                    onOpenContact={() => setActiveModal('contact')}
                    onOpenCheckout={(data) => {
                        setIsCartOpen(false);
                        setCheckoutData(data);
                    }}
                    onOpenTracking={handleTrackOrder}
                />
            </div>

            {/* Cart Drawer Panel */}
            <CartDrawer
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                cartItems={cartItems}
                onUpdateQuantity={updateQuantity}
                onRemoveItem={removeFromCart}
                onClearCart={clearCart}
                user={user}
                onOpenAuth={() => setActiveModal('auth')}
                onShowToast={showToast}
                onOpenCheckout={(data) => {
                    setIsCartOpen(false);
                    setCheckoutData(data);
                }}
            />

            {/* Interactive Checkout Modal */}
            <CheckoutModal
                isOpen={Boolean(checkoutData)}
                onClose={() => setCheckoutData(null)}
                cartData={checkoutData}
                user={user}
                onOrderSuccess={(newOrder) => {
                    setCheckoutData(null);
                    clearCart();
                    setTrackedOrder(newOrder);
                    // Use the real order id only. A hardcoded '10245' fallback used
                    // to create an alert for a non-existent demo order, and its
                    // "View Live Timeline" deep-link then opened a fabricated
                    // tracking screen for that order.
                    const confirmedId = newOrder.id || newOrder.order_id || null;
                    const methodLabel = String(newOrder.payment_method || 'Card').toUpperCase();
                    handleAddNotification(
                        confirmedId ? `🎉 Order Confirmed (#${confirmedId})` : '🎉 Order Confirmed',
                        methodLabel === 'COD'
                            ? 'Order placed - pay cash on delivery. Live tracking is now active!'
                            : `Payment verified via ${methodLabel}. Live tracking is now active!`,
                        'tracking',
                        confirmedId,
                        'success'
                    );
                }}
                onShowToast={showToast}
            />

            {/* Live Order Tracking Status Modal */}
            <TrackingStatusModal
                isOpen={Boolean(trackedOrder)}
                onClose={() => setTrackedOrder(null)}
                order={trackedOrder}
                onShowToast={showToast}
            />

            {/* Track Order Input Modal (Replaces browser window.prompt) */}
            <TrackOrderModal
                isOpen={isTrackModalOpen}
                onClose={() => setIsTrackModalOpen(false)}
                onTrack={handleTrackOrder}
            />

            {/* Quick View Product Modal */}
            <ProductModal
                product={quickViewProduct}
                allProducts={allProducts}
                onClose={() => setQuickViewProduct(null)}
                onAddToCart={(prod, qty = 1) => {
                    const res = addToCart(prod, qty);
                    if (res && !res.success) {
                        showToast({
                            type: 'remove',
                            title: 'Stock Limit Reached',
                            text: res.message || 'Cannot add more items to cart.'
                        });
                        return false;
                    }
                    showToast({
                        type: 'success',
                        title: 'Added to Bag',
                        text: `${prod.name} added to cart.`
                    });
                    return true;
                }}
                onQuickView={(prod) => setQuickViewProduct(prod)}
            />

            {/* About & Contact Modals */}
            <AboutModal
                isOpen={activeModal === 'about'}
                onClose={() => setActiveModal(null)}
            />

            <ContactModal
                isOpen={activeModal === 'contact'}
                onClose={() => setActiveModal(null)}
            />

            {/* Customer Help & Support Center Modal */}
            <SupportModal
                isOpen={activeModal === 'support'}
                onClose={() => setActiveModal(null)}
                user={user}
                onOpenAuth={() => setActiveModal('auth')}
                onShowToast={showToast}
            />

            {/* Auth Modal */}
            <AuthModal
                isOpen={activeModal === 'auth'}
                onClose={() => setActiveModal(null)}
                user={user}
                onLogout={async () => {
                    await logout();
                    showToast({
                        type: 'info',
                        title: 'Signed Out',
                        text: 'You have been successfully signed out.'
                    });
                }}
                onAuthSuccess={(userData, token) => {
                    login(userData, token);
                    setActiveModal(null);
                    showToast({
                        type: 'success',
                        title: 'Welcome Back!',
                        text: `Logged in as ${userData.name}`
                    });
                }}
            />

            {/* Fixed Mobile Bottom Menu (Phone devices only - always shown) */}
            <MobileBottomNav
                cartCount={totalCartCount}
                onOpenCart={() => setIsCartOpen(prev => !prev)}
                onOpenAbout={() => { setIsCartOpen(false); setActiveModal('about'); }}
                onOpenContact={() => { setIsCartOpen(false); setActiveModal('contact'); }}
                onOpenSupport={() => { setIsCartOpen(false); setActiveModal('support'); }}
                supportUnreadCount={supportUnreadCount}
                onOpenCatalog={() => { setIsCartOpen(false); handleOpenCatalog(); }}
                onTrackOrder={() => { setIsCartOpen(false); setIsTrackModalOpen(true); }}
                activeCategory={activeCategory}
                setActiveCategory={setActiveCategory}
                user={user}
                onOpenAuth={() => { setIsCartOpen(false); setActiveModal('auth'); }}
            />
        </div>
    );
}

export function App() {
    return (
        <BrowserRouter>
            <ToastProvider>
                <AuthProvider>
                    <CartProvider>
                        <StorefrontContent />
                    </CartProvider>
                </AuthProvider>
            </ToastProvider>
        </BrowserRouter>
    );
}

export default App;
