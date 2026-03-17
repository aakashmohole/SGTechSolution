"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import styles from './Checkout.module.css';
import { useCart, CartItem } from '../context/CartContext';
import { useRouter } from 'next/navigation';
import { CheckCircle, Truck, CreditCard, ShoppingBag, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
  const { cart, cartTotal, cartCount, setIsCartOpen } = useCart();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Close sidebar if open when arriving here
  useEffect(() => {
    setIsCartOpen(false);
  }, [setIsCartOpen]);

  // Redirect if cart is empty
  useEffect(() => {
    if (cart.length === 0 && !isSubmitting) {
      router.push('/inventory');
    }
  }, [cart, router, isSubmitting]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const orderPayload = {
      customer_name: formData.name,
      customer_email: formData.email,
      customer_phone: formData.phone,
      delivery_address: formData.address,
      items: cart.map((item: CartItem) => ({
        part_id: item.id,
        quantity: item.quantity,
        price_at_time: item.price
      }))
    };

    try {
      const response = await fetch('http://localhost:8000/orders/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to place order');
      }

      // Success - clear cart manually or redirect to a success page that does it
      // For now we'll route to a success segment or home
      router.push('/checkout/success');
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred during checkout.');
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0) return null; // Prevent flash before redirect

  return (
    <div className={styles.container}>
      <Navbar />
      
      <main className={styles.main}>
        <div className={styles.header}>
          <Link href="/inventory" className={styles.backLink}>
            <ArrowLeft size={18} />
            <span>Back to Shopping</span>
          </Link>
          <h1 className="text-gradient">Secure Checkout</h1>
        </div>

        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}

        <div className={styles.checkoutLayout}>
          {/* Form Column */}
          <div className={styles.formSection}>
            <div className={styles.processSteps}>
              <div className={`${styles.step} ${styles.activeStep}`}>
                <div className={styles.stepIcon}><Truck size={20} /></div>
                <span>Delivery</span>
              </div>
              <div className={styles.stepLine}></div>
              <div className={`${styles.step} ${styles.pendingStep}`}>
                <div className={styles.stepIcon}><CreditCard size={20} /></div>
                <span>Payment (Mock)</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className={`${styles.checkoutForm} glass`}>
              <h3>Delivery Details</h3>
              <p className={styles.formSubtitle}>Where should we send your premium hardware?</p>
              
              <div className={styles.formGroup}>
                <label htmlFor="name">Full Name</label>
                <input 
                  type="text" 
                  id="name" 
                  name="name" 
                  required 
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="glass"
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="email">Email Address</label>
                  <input 
                    type="email" 
                    id="email" 
                    name="email" 
                    required 
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    className="glass"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="phone">Phone Number</label>
                  <input 
                    type="tel" 
                    id="phone" 
                    name="phone" 
                    required 
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 000-0000"
                    className="glass"
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="address">Full Delivery Address</label>
                <textarea 
                  id="address" 
                  name="address" 
                  rows={4} 
                  required 
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="123 Tech Avenue, Silicon Valley, CA 94000"
                  className="glass"
                />
              </div>

              <button 
                type="submit" 
                className={`btn-primary ${styles.submitBtn}`}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Processing...' : 'Complete Order'}
              </button>
            </form>
          </div>

          {/* Summary Column */}
          <div className={styles.summarySection}>
            <div className={`${styles.summaryCard} glass`}>
              <h3>Order Summary</h3>
              <div className={styles.summaryItems}>
                {cart.map((item: CartItem) => (
                  <div key={item.id} className={styles.summaryItem}>
                    <div className={styles.itemImgWrapper}>
                      {item.imageUrls && item.imageUrls.length > 0 ? (
                        <img src={item.imageUrls[0]} alt={item.name} />
                      ) : (
                        <ShoppingBag size={24} color="var(--text-dim)"/>
                      )}
                      <span className={styles.itemBadge}>{item.quantity}</span>
                    </div>
                    <div className={styles.itemInfo}>
                      <h4>{item.name}</h4>
                      <p>₹{item.price.toFixed(2)}</p>
                    </div>
                    <div className={styles.itemTotal}>
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.totals}>
                <div className={styles.totalsRow}>
                  <span>Subtotal ({cartCount} items)</span>
                  <span>₹{cartTotal.toFixed(2)}</span>
                </div>
                <div className={styles.totalsRow}>
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className={styles.divider}></div>
                <div className={`${styles.totalsRow} ${styles.grandTotal}`}>
                  <span>Total</span>
                  <span>₹{cartTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className={styles.secureNotice}>
                <CheckCircle size={16} color="#10b981" />
                <span>Secure SSL encrypted connection</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
