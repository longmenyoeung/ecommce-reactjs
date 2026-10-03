import React, { useState, useEffect, useCallback } from 'react';
import { supportService } from '../services/support.service';
import {
  LifebuoyIcon,
  XMarkIcon,
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  PaperClipIcon,
  StarIcon,
  CheckCircleIcon,
  ClockIcon,
  QuestionMarkCircleIcon,
  PlusCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  PhotoIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ShieldCheckIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

const FAQS = [
  {
    q: 'How do I track my active order?',
    a: 'You can track your package in real-time by clicking "Track Order" in the top bar or profile menu, then entering your Order Tracking Number (e.g. ORD-XXXXXX). Our system provides live milestone updates from order placement to final delivery.'
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We support instant Bakong KHQR (Local Banking QR scan with live verification), Credit and Debit Cards (Visa, MasterCard, AMEX), and Cash on Delivery (COD) for eligible shipping destinations.'
  },
  {
    q: 'How do I apply a promotional discount coupon?',
    a: 'Open your Shopping Bag drawer, enter your promotional code (such as SAVE20 or VIP2026) in the Promo Code field, and click "Apply". The discount is automatically calculated and subtracted from your subtotal.'
  },
  {
    q: 'What should I do if an item arrives damaged or incorrect?',
    a: 'Submit a support request right here in our Help Center under the "New Request" tab, select "Order & Delivery" category, and attach a photo or screenshot of the item. Our support specialists will respond within minutes to arrange a replacement or refund.'
  },
  {
    q: 'Can I cancel or modify my delivery address after placing an order?',
    a: 'Orders can be modified while in "Pending" status. If your order has already progressed to "Processing" or "Shipped", please send us an urgent support message with your updated address immediately.'
  }
];

function SupportModal({ isOpen, onClose, user, onOpenAuth, onShowToast }) {
  const [activeTab, setActiveTab] = useState('tickets'); // 'tickets' | 'new' | 'faq'
  const [tickets, setTickets] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Active conversation thread state
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [threadLoading, setThreadLoading] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replyAttachment, setReplyAttachment] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);

  // Rating state
  const [ratingVal, setRatingVal] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  // New ticket form state
  const [newSubject, setNewSubject] = useState('');
  const [newCategory, setNewCategory] = useState('Order & Delivery');
  const [newPriority, setNewPriority] = useState('medium');
  const [newMessage, setNewMessage] = useState('');
  const [newAttachment, setNewAttachment] = useState('');
  const [isSubmittingNew, setIsSubmittingNew] = useState(false);

  // FAQ search & accordion
  const [faqSearch, setFaqSearch] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(0);

  // Load customer tickets
  const loadTickets = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await supportService.getTickets();
      if (res && res.success) {
        setTickets(res.tickets || []);
        setUnreadCount(res.unread_count || 0);
      }
    } catch (err) {
      console.error('Failed to load support tickets:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isOpen && user) {
      loadTickets();
    }
  }, [isOpen, user, loadTickets]);

  // View ticket thread
  const handleOpenTicket = async (ticketId) => {
    setThreadLoading(true);
    try {
      const res = await supportService.getTicket(ticketId);
      if (res && res.success) {
        setSelectedTicket(res.ticket);
        loadTickets(); // Refresh unread count
      }
    } catch (err) {
      if (onShowToast) onShowToast({ type: 'remove', title: 'Error', text: err.message || 'Could not load conversation' });
    } finally {
      setThreadLoading(false);
    }
  };

  // Submit customer reply
  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;

    setIsSendingReply(true);
    try {
      const res = await supportService.replyTicket(selectedTicket.id, {
        message: replyText.trim(),
        attachment_url: replyAttachment.trim() || null
      });

      if (res && res.success) {
        setReplyText('');
        setReplyAttachment('');
        const refreshed = await supportService.getTicket(selectedTicket.id);
        if (refreshed && refreshed.success) {
          setSelectedTicket(refreshed.ticket);
        }
        if (onShowToast) onShowToast({ type: 'success', title: 'Message Sent', text: 'Our support team will reply shortly.' });
        loadTickets();
      }
    } catch (err) {
      if (onShowToast) onShowToast({ type: 'remove', title: 'Failed to Send', text: err.message });
    } finally {
      setIsSendingReply(false);
    }
  };

  // Submit feedback rating
  const handleRate = async () => {
    if (!selectedTicket) return;
    setIsSubmittingRating(true);
    try {
      const res = await supportService.rateTicket(selectedTicket.id, {
        rating: ratingVal,
        feedback: feedbackText.trim() || null
      });
      if (res && res.success) {
        setSelectedTicket(res.ticket);
        if (onShowToast) onShowToast({ type: 'success', title: 'Thank You!', text: 'Your feedback rating has been recorded.' });
        loadTickets();
      }
    } catch (err) {
      if (onShowToast) onShowToast({ type: 'remove', title: 'Rating Failed', text: err.message });
    } finally {
      setIsSubmittingRating(false);
    }
  };

  // Submit new ticket
  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!user) {
      onClose();
      if (onOpenAuth) onOpenAuth();
      return;
    }
    if (!newSubject.trim() || !newMessage.trim()) return;

    setIsSubmittingNew(true);
    try {
      const res = await supportService.createTicket({
        subject: newSubject.trim(),
        category: newCategory,
        priority: newPriority,
        message: newMessage.trim(),
        attachment_url: newAttachment.trim() || null
      });

      if (res && res.success) {
        if (onShowToast) {
          onShowToast({
            type: 'success',
            title: 'Support Request Submitted',
            text: `Ticket #${res.ticket?.ticket_number} created. An administrator has been notified.`
          });
        }
        setNewSubject('');
        setNewMessage('');
        setNewAttachment('');
        setActiveTab('tickets');
        loadTickets();
        if (res.ticket) {
          setSelectedTicket(res.ticket);
        }
      }
    } catch (err) {
      if (onShowToast) onShowToast({ type: 'remove', title: 'Submission Error', text: err.message });
    } finally {
      setIsSubmittingNew(false);
    }
  };

  // File upload reader for screenshots
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        if (onShowToast) onShowToast({ type: 'remove', title: 'File Too Large', text: 'Screenshot must be under 5MB.' });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewAttachment(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  const filteredFaqs = FAQS.filter(
    f => f.q.toLowerCase().includes(faqSearch.toLowerCase()) || f.a.toLowerCase().includes(faqSearch.toLowerCase())
  );

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 3200,
        backgroundColor: 'rgba(10, 15, 26, 0.75)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.25s ease-out'
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel animate-scale-up"
        style={{
          width: '100%',
          maxWidth: '760px',
          maxHeight: 'min(92vh, 92dvh)',
          overflowY: 'auto',
          backgroundColor: 'var(--bg-primary)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.08) 0%, rgba(128, 0, 255, 0.08) 100%)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(0, 240, 255, 0.15)',
              color: 'var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <LifebuoyIcon style={{ width: '24px', height: '24px' }} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
                Help & Support Center
              </h2>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Direct assistance, real-time issue resolution, and customer service.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <XMarkIcon style={{ width: '20px', height: '20px' }} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-secondary)',
          padding: '0 16px'
        }}>
          <button
            onClick={() => { setActiveTab('tickets'); setSelectedTicket(null); }}
            style={{
              padding: '12px 18px',
              border: 'none',
              background: 'none',
              borderBottom: activeTab === 'tickets' ? '2.5px solid var(--accent-primary)' : '2.5px solid transparent',
              color: activeTab === 'tickets' ? 'var(--accent-primary)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'tickets' ? '700' : '500',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <ChatBubbleLeftRightIcon style={{ width: '18px', height: '18px' }} />
            <span>My Tickets</span>
            {unreadCount > 0 && (
              <span style={{
                backgroundColor: '#ef4444',
                color: '#fff',
                borderRadius: '10px',
                padding: '1px 6px',
                fontSize: '0.68rem',
                fontWeight: '800'
              }}>
                {unreadCount}
              </span>
            )}
          </button>

          <button
            onClick={() => { setActiveTab('new'); setSelectedTicket(null); }}
            style={{
              padding: '12px 18px',
              border: 'none',
              background: 'none',
              borderBottom: activeTab === 'new' ? '2.5px solid var(--accent-primary)' : '2.5px solid transparent',
              color: activeTab === 'new' ? 'var(--accent-primary)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'new' ? '700' : '500',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <PlusCircleIcon style={{ width: '18px', height: '18px' }} />
            <span>Submit Request</span>
          </button>

          <button
            onClick={() => { setActiveTab('faq'); setSelectedTicket(null); }}
            style={{
              padding: '12px 18px',
              border: 'none',
              background: 'none',
              borderBottom: activeTab === 'faq' ? '2.5px solid var(--accent-primary)' : '2.5px solid transparent',
              color: activeTab === 'faq' ? 'var(--accent-primary)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'faq' ? '700' : '500',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <QuestionMarkCircleIcon style={{ width: '18px', height: '18px' }} />
            <span>FAQs & Guide</span>
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '20px 24px', flex: 1, minHeight: '340px' }}>
          {/* TAB 1: MY TICKETS / CONVERSATION VIEW */}
          {activeTab === 'tickets' && (
            <div>
              {!user ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                  <ShieldCheckIcon style={{ width: '48px', height: '48px', margin: '0 auto 12px', color: 'var(--accent-primary)' }} />
                  <h3 style={{ color: 'var(--text-primary)', margin: '0 0 6px' }}>Sign in to view your tickets</h3>
                  <p style={{ fontSize: '0.88rem', margin: '0 0 16px' }}>
                    Access your previous support history and receive real-time answers from administrators.
                  </p>
                  <button
                    onClick={() => { onClose(); if (onOpenAuth) onOpenAuth(); }}
                    className="btn-primary"
                    style={{ padding: '10px 20px', fontSize: '0.9rem' }}
                  >
                    Sign In or Register
                  </button>
                </div>
              ) : selectedTicket ? (
                /* Interactive Conversation Stream */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Thread Header */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)'
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--accent-primary)', fontWeight: '700' }}>
                          {selectedTicket.ticket_number}
                        </span>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '0.7rem',
                          fontWeight: '700',
                          backgroundColor: selectedTicket.status === 'resolved' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(0, 240, 255, 0.15)',
                          color: selectedTicket.status === 'resolved' ? '#10b981' : 'var(--accent-primary)'
                        }}>
                          {selectedTicket.status?.toUpperCase()}
                        </span>
                      </div>
                      <h4 style={{ margin: '4px 0 0', fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                        {selectedTicket.subject}
                      </h4>
                    </div>

                    <button
                      onClick={() => setSelectedTicket(null)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-secondary)',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      ← Back to Tickets
                    </button>
                  </div>

                  {/* Messages Bubble Thread */}
                  <div style={{
                    maxHeight: '320px',
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    paddingRight: '6px'
                  }}>
                    {(selectedTicket.messages || []).map((msg) => {
                      const isAdmin = Boolean(msg.is_admin_reply);
                      return (
                        <div
                          key={msg.id}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: isAdmin ? 'flex-start' : 'flex-end'
                          }}
                        >
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '3px', padding: '0 4px' }}>
                            {isAdmin ? '🛡️ Store Support Specialist' : '👤 You'} • {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <div
                            style={{
                              maxWidth: '85%',
                              padding: '12px 16px',
                              borderRadius: isAdmin ? '16px 16px 16px 2px' : '16px 16px 2px 16px',
                              backgroundColor: isAdmin ? 'var(--bg-secondary)' : 'var(--accent-primary)',
                              color: isAdmin ? 'var(--text-primary)' : '#000',
                              border: isAdmin ? '1px solid var(--border-color)' : 'none',
                              fontSize: '0.88rem',
                              lineHeight: 1.5,
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }}
                          >
                            <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{msg.message}</p>
                            {msg.attachment_url && (
                              <div style={{ marginTop: '8px', paddingTop: '6px', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                                <img
                                  src={msg.attachment_url}
                                  alt="Attachment"
                                  style={{ maxHeight: '160px', borderRadius: '8px', objectFit: 'cover', display: 'block' }}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Satisfaction Rating Prompt if Ticket is Resolved */}
                  {selectedTicket.status === 'resolved' && !selectedTicket.rating && (
                    <div style={{
                      padding: '14px 16px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'rgba(245, 158, 11, 0.1)',
                      border: '1px solid rgba(245, 158, 11, 0.35)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#f59e0b' }}>
                          How would you rate our support on this ticket?
                        </span>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setRatingVal(star)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}
                            >
                              {star <= ratingVal ? (
                                <StarIconSolid style={{ width: '22px', height: '22px', color: '#f59e0b' }} />
                              ) : (
                                <StarIcon style={{ width: '22px', height: '22px', color: 'var(--text-muted)' }} />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                          type="text"
                          value={feedbackText}
                          onChange={(e) => setFeedbackText(e.target.value)}
                          placeholder="Optional feedback comment..."
                          style={{
                            flex: 1,
                            padding: '8px 12px',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: 'var(--bg-tertiary)',
                            border: '1px solid var(--border-color)',
                            color: 'var(--text-primary)',
                            fontSize: '0.82rem'
                          }}
                        />
                        <button
                          onClick={handleRate}
                          disabled={isSubmittingRating}
                          className="btn-primary"
                          style={{ padding: '8px 14px', fontSize: '0.82rem' }}
                        >
                          Submit Rating
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Customer Reply Input */}
                  <form onSubmit={handleSendReply} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ position: 'relative' }}>
                      <textarea
                        rows={2}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write your reply or question to the admin..."
                        style={{
                          width: '100%',
                          padding: '12px',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: 'var(--bg-secondary)',
                          border: '1px solid var(--border-color)',
                          color: 'var(--text-primary)',
                          fontSize: '0.88rem',
                          resize: 'none',
                          boxSizing: 'border-box'
                        }}
                        required
                      />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
                        <PaperClipIcon style={{ width: '18px', height: '18px', color: 'var(--text-muted)' }} />
                        <input
                          type="text"
                          value={replyAttachment}
                          onChange={(e) => setReplyAttachment(e.target.value)}
                          placeholder="Optional screenshot image URL..."
                          style={{
                            flex: 1,
                            padding: '6px 10px',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: 'var(--bg-secondary)',
                            border: '1px solid var(--border-color)',
                            color: 'var(--text-primary)',
                            fontSize: '0.78rem'
                          }}
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSendingReply || !replyText.trim()}
                        className="btn-primary"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '8px 16px',
                          fontSize: '0.85rem'
                        }}
                      >
                        <PaperAirplaneIcon style={{ width: '16px', height: '16px' }} />
                        <span>{isSendingReply ? 'Sending...' : 'Send Reply'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                /* Ticket List */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
                      Your Support History ({tickets.length})
                    </span>
                    <button
                      onClick={loadTickets}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--accent-primary)',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <ArrowPathIcon style={{ width: '14px', height: '14px' }} /> Refresh
                    </button>
                  </div>

                  {loading ? (
                    <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                      Loading your requests...
                    </div>
                  ) : tickets.length === 0 ? (
                    <div style={{
                      textAlign: 'center',
                      padding: '40px 20px',
                      backgroundColor: 'var(--bg-secondary)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px dashed var(--border-color)'
                    }}>
                      <p style={{ margin: '0 0 10px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        You have not submitted any support requests yet.
                      </p>
                      <button
                        onClick={() => setActiveTab('new')}
                        className="btn-primary"
                        style={{ padding: '8px 16px', fontSize: '0.82rem' }}
                      >
                        Submit Your First Request
                      </button>
                    </div>
                  ) : (
                    tickets.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => handleOpenTicket(t.id)}
                        style={{
                          padding: '14px 16px',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: 'var(--bg-secondary)',
                          border: t.user_unread ? '1.5px solid var(--accent-primary)' : '1px solid var(--border-color)',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '12px'
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <span style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: 'var(--accent-primary)', fontWeight: '700' }}>
                              {t.ticket_number}
                            </span>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>• {t.category}</span>
                            {t.user_unread && (
                              <span style={{
                                backgroundColor: 'var(--accent-primary)',
                                color: '#000',
                                padding: '1px 6px',
                                borderRadius: '8px',
                                fontSize: '0.65rem',
                                fontWeight: '800'
                              }}>
                                NEW REPLY
                              </span>
                            )}
                          </div>
                          <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: '700', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {t.subject}
                          </h4>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                          <span style={{
                            padding: '3px 9px',
                            borderRadius: '12px',
                            fontSize: '0.72rem',
                            fontWeight: '700',
                            backgroundColor: t.status === 'resolved' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(0, 240, 255, 0.12)',
                            color: t.status === 'resolved' ? '#10b981' : 'var(--accent-primary)'
                          }}>
                            {t.status?.toUpperCase()}
                          </span>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>→</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: NEW SUPPORT REQUEST */}
          {activeTab === 'new' && (
            <form onSubmit={handleCreateTicket} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', marginBottom: '6px', color: 'var(--text-primary)' }}>
                  Issue Subject *
                </label>
                <input
                  type="text"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="Brief summary of your question or problem..."
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    fontSize: '0.88rem',
                    boxSizing: 'border-box'
                  }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', marginBottom: '6px', color: 'var(--text-primary)' }}>
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      fontSize: '0.88rem'
                    }}
                  >
                    <option value="Order & Delivery">Order & Delivery</option>
                    <option value="Payment & Billing">Payment & Billing</option>
                    <option value="Product Question">Product Question</option>
                    <option value="Technical Bug">Technical / Website Bug</option>
                    <option value="Account & Security">Account & Security</option>
                    <option value="Other">Other Assistance</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', marginBottom: '6px', color: 'var(--text-primary)' }}>
                    Urgency / Priority
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      fontSize: '0.88rem'
                    }}
                  >
                    <option value="low">Low - General Question</option>
                    <option value="medium">Medium - Standard Request</option>
                    <option value="high">High - Order Problem</option>
                    <option value="urgent">Urgent - Payment / Locked Out</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', marginBottom: '6px', color: 'var(--text-primary)' }}>
                  Detailed Description *
                </label>
                <textarea
                  rows={4}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Please describe the issue in detail, including order numbers or error messages..."
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    fontSize: '0.88rem',
                    boxSizing: 'border-box'
                  }}
                  required
                />
              </div>

              {/* Attachment screenshot option */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', marginBottom: '6px', color: 'var(--text-primary)' }}>
                  Attach Screenshot or Photo (Optional)
                </label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    id="support-screenshot-file"
                    style={{ display: 'none' }}
                  />
                  <label
                    htmlFor="support-screenshot-file"
                    style={{
                      padding: '8px 14px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px dashed var(--border-color)',
                      color: 'var(--text-secondary)',
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <PhotoIcon style={{ width: '18px', height: '18px' }} />
                    <span>Upload Image File</span>
                  </label>

                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>or paste URL:</span>

                  <input
                    type="text"
                    value={newAttachment.startsWith('data:') ? 'Image attached' : newAttachment}
                    onChange={(e) => setNewAttachment(e.target.value)}
                    placeholder="https://..."
                    disabled={newAttachment.startsWith('data:')}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      fontSize: '0.82rem'
                    }}
                  />

                  {newAttachment && (
                    <button
                      type="button"
                      onClick={() => setNewAttachment('')}
                      style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.78rem', cursor: 'pointer' }}
                    >
                      Clear
                    </button>
                  )}
                </div>

                {newAttachment && (
                  <div style={{ marginTop: '8px' }}>
                    <img
                      src={newAttachment}
                      alt="Preview"
                      style={{ maxHeight: '100px', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                    />
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmittingNew || !newSubject.trim() || !newMessage.trim()}
                className="btn-primary"
                style={{
                  marginTop: '8px',
                  padding: '12px',
                  fontSize: '0.95rem',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <span>{isSubmittingNew ? 'Submitting Ticket...' : 'Submit Support Request'}</span>
              </button>
            </form>
          )}

          {/* TAB 3: FAQs & KNOWLEDGE BASE */}
          {activeTab === 'faq' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <input
                type="text"
                value={faqSearch}
                onChange={(e) => setFaqSearch(e.target.value)}
                placeholder="Search frequently asked questions..."
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontSize: '0.88rem',
                  boxSizing: 'border-box'
                }}
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {filteredFaqs.map((faq, idx) => {
                  const isOpenItem = expandedFaq === idx;
                  return (
                    <div
                      key={idx}
                      style={{
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        overflow: 'hidden'
                      }}
                    >
                      <button
                        onClick={() => setExpandedFaq(isOpenItem ? null : idx)}
                        style={{
                          width: '100%',
                          padding: '14px 16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-primary)',
                          fontWeight: '700',
                          fontSize: '0.9rem',
                          textAlign: 'left',
                          cursor: 'pointer'
                        }}
                      >
                        <span>{faq.q}</span>
                        {isOpenItem ? (
                          <ChevronUpIcon style={{ width: '18px', height: '18px', color: 'var(--accent-primary)', flexShrink: 0 }} />
                        ) : (
                          <ChevronDownIcon style={{ width: '18px', height: '18px', color: 'var(--text-muted)', flexShrink: 0 }} />
                        )}
                      </button>

                      {isOpenItem && (
                        <div style={{
                          padding: '0 16px 14px 16px',
                          fontSize: '0.85rem',
                          color: 'var(--text-secondary)',
                          lineHeight: 1.6,
                          borderTop: '1px solid rgba(255,255,255,0.05)'
                        }}>
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div style={{
                textAlign: 'center',
                padding: '16px',
                marginTop: '8px',
                backgroundColor: 'rgba(0, 240, 255, 0.05)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(0, 240, 255, 0.15)'
              }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Didn't find an answer to your problem?
                </span>
                <button
                  onClick={() => setActiveTab('new')}
                  style={{
                    marginLeft: '8px',
                    background: 'none',
                    border: 'none',
                    color: 'var(--accent-primary)',
                    fontWeight: '700',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Contact Our Support Team Directly →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SupportModal;
