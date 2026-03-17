"use client";

import React, { useEffect } from 'react';
import styles from './CartSidebar.module.css';
import { X, Trash2, Plus, Minus, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { gsap } from 'gsap';
import Link from 'next/link';

export default function CartSidebar() {
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, cartTotal } = useCart();
  const sidebarRef = React.useRef<HTMLDivElement>(null);
  const overlayRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isCartOpen) {
      gsap.to(overlayRef.current, { opacity: 1, display: 'block', duration: 0.3 });
      gsap.to(sidebarRef.current, { x: 0, duration: 0.4, ease: 'power3.out' });
      document.body.style.overflow = 'hidden';
    } else {
      gsap.to(overlayRef.current, { opacity: 0, display: 'none', duration: 0.3 });
      gsap.to(sidebarRef.current, { x: '100%', duration: 0.4, ease: 'power3.in' });
      document.body.style.overflow = '';
    }
  }, [isCartOpen]);

  return (
    <>
      <div 
        ref={overlayRef} 
        className={styles.overlay} 
        onClick={() => setIsCartOpen(false)} 
        style={{ display: 'none', opacity: 0 }}
      />
      
      <div 
        ref={sidebarRef} 
        className={`${styles.sidebar} glass`}
        style={{ transform: 'translateX(100%)' }}
      >
        <div className={styles.header}>
          <h2>Your Cart</h2>
          <button className={styles.closeBtn} onClick={() => setIsCartOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <div className={styles.content}>
          {cart.length === 0 ? (
            <div className={styles.emptyCart}>
              <ShoppingCart size={48} className={styles.emptyIcon} />
              <p>Your cart is empty.</p>
              <button 
                className="btn-primary" 
                onClick={() => setIsCartOpen(false)}
                style={{ marginTop: '1rem' }}
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className={styles.cartItems}>
              {cart.map(item => (
                <div key={item.id} className={styles.cartItem}>
                  <div className={styles.itemImage}>
                    {item.imageUrls && item.imageUrls.length > 0 ? (
                      <img src={item.imageUrls[0]} alt={item.name} />
                    ) : (
                      <div className={styles.placeholderImg}>Img</div>
                    )}
                  </div>
                  <div className={styles.itemDetails}>
                    <h4>{item.name}</h4>
                    <span className={styles.price}>₹{item.price.toFixed(2)}</span>
                    <div className={styles.quantityControls}>
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                        <Minus size={14} />
                      </button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                        <Plus size={14} />
                      </button>
                      <button 
                        className={styles.removeBtn} 
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className={styles.footer}>
            <div className={styles.totalRow}>
              <span>Total</span>
              <span>₹{cartTotal.toFixed(2)}</span>
            </div>
            <Link href="/checkout" className={`${styles.checkoutBtn} btn-primary`}>
              Proceed to Checkout
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
