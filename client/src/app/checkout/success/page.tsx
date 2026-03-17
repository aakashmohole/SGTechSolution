"use client";

import React, { useEffect } from 'react';
import Navbar from '../../components/Navbar';
import styles from './Success.module.css';
import { CheckCircle, PackageSearch } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutSuccessPage() {
  
  // Clear cart on mount
  useEffect(() => {
    localStorage.removeItem('sgtech_cart');
    // We intentionally don't clear the context immediately to allow the user
    // to see the success page without the layout shifting or throwing errors
    // if it relies on cart data that is suddenly gone.
    // The context will naturally be empty on the next full refresh.
  }, []);

  return (
    <div className={styles.container}>
      <Navbar />
      
      <main className={styles.main}>
        <div className={`${styles.successCard} glass`}>
          <div className={styles.iconWrapper}>
            <CheckCircle size={64} className={styles.checkIcon} />
          </div>
          
          <h1 className="text-gradient">Order Confirmed!</h1>
          <p className={styles.message}>
            Thank you for your purchase. Your high-performance hardware is being prepared for shipment.
          </p>
          
          <div className={styles.details}>
            <p>We've sent a detailed receipt to your email address.</p>
            <p>You can expect delivery within 3-5 business days.</p>
          </div>

          <div className={styles.actions}>
            <Link href="/inventory" className="btn-primary">
              <PackageSearch size={20} />
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
