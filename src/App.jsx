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

    // Notifications state
    const [notifications, setNotifications] = useState(() => {
        try {
            const saved = localStorage.getItem('nexus_notifications');
            return saved ? JSON.parse(saved) : [
                {
                    id: 'notif-1',
                    title: '📦 Order #10245 Shipped & In Transit',
                    text: 'Your Executive Ultralight Watch has departed the Logistics Hub and is on its way via FedEx Priority Express.',
                    time: '1 hour ago',
                    unread: true,
                    type: 'tracking',
                    orderId: '10245'
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
        } catch {
            return [];
        }
    });

    const handleAddNotification = (title, text, type = 'tracking', orderId = null) => {
        const newNotif = {
            id: 'notif-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
            title,
            text,
            time: 'Just now',
            unread: true,
            type,
            orderId
        };
        setNotifications(prev => {
            const updated = [newNotif, ...prev];
            localStorage.setItem('nexus_notifications', JSON.stringify(updated));
            return updated;
        });
        showToast({
            type: type === 'tracking' ? 'info' : 'success',
            title,
            text
        });
    };

    const handleMarkAllRead = () => {
        setNotifications(prev => {
            const updated = prev.map(n => ({ ...n, unread: false }));
            localStorage.setItem('nexus_notifications', JSON.stringify(updated));
            return updated;
        });
    };

    const handleMarkRead = (id) => {
        setNotifications(prev => {
            const updated = prev.map(n => n.id === id ? { ...n, unread: false } : n);
            localStorage.setItem('nexus_notifications', JSON.stringify(updated));
            return updated;
        });
    };

    const handleClearAllNotifications = () => {
        setNotifications([]);
        localStorage.removeItem('nexus_notifications');
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
        if (!user) return;
        async function checkOrdersStatus() {
            try {
                const orders = await orderService.getOrderHistory();
                if (Array.isArray(orders)) {
                    orders.forEach(ord => {
                        const s = (ord.status || '').toLowerCase();
                        if (s === 'shipped') {
                            const notifKey = `notif_shipped_${ord.id}`;
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
    }, [user]);

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

            if (String(orderId) === '10245') {
                setTrackedOrder({
                    id: '10245',
                    tracking_number: 'FX-10245',
                    status: 'In Transit',
                    carrier: 'FedEx Priority Express',
                    estimated_delivery: 'Estimated 2 days',
                    payment_method: 'Credit Card',
                    total: 149.99,
                    shipping_address: '450 VIP Commerce Way, New York, NY 10001',
                    date: '2026-07-02',
                    items: [{ name: 'Executive Ultralight Watch', quantity: 1, price: 149.99 }]
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
                notifications={notifications}
                onMarkAllRead={handleMarkAllRead}
                onMarkRead={handleMarkRead}
                onOpenTracking={handleTrackOrder}
                onClearAllNotifications={handleClearAllNotifications}
                products={allProducts}
                onQuickView={(prod) => setQuickViewProduct(prod)}
                onAddToCart={(prod) => {
                    addToCart(prod, 1);
                    showToast({
                        type: 'success',
                        title: 'Added to Bag',
                        text: `${prod.name} added to your cart.`
                    });
                }}
            />

            {/* Main Routing Area (Supports / catalog, /products/:id detail, and /track) */}
            <div style={{ flex: 1 }}>
                <AppRoutes
                    onAddToCart={(product, qty = 1) => {
                        addToCart(product, qty);
                        showToast({
                            type: 'success',
                            title: 'Added to Bag',
                            text: `${product.name} added to your cart.`
                        });
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
                    handleAddNotification(
                        `🎉 Order Confirmed (#${newOrder.id || '10245'})`,
                        `Payment verified via ${newOrder.payment_method || 'Card'}. Live tracking is now active!`,
                        'tracking',
                        newOrder.id || '10245'
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
                    addToCart(prod, qty);
                    showToast({
                        type: 'success',
                        title: 'Added to Bag',
                        text: `${prod.name} added to cart.`
                    });
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
