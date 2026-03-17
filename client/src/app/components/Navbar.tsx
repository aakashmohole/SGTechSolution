"use client";

import React from 'react';
import Link from 'next/link';
import styles from './Navbar.module.css';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { cartCount, setIsCartOpen } = useCart();

  return (
    <nav className={`${styles.nav} glass`}>
      <div className={styles.navContent}>
        <Link href="/" className={styles.logo}>
          SG Tech <span className="text-gradient">Solution</span>
        </Link>
        <div className={styles.links}>
          <Link href="/inventory" className={styles.link}>Parts</Link>
          <a href="/#offers" className={styles.link}>Offers</a>
          <button 
            className={styles.cartBtn} 
            onClick={() => setIsCartOpen(true)}
            aria-label="Open Cart"
          >
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className={styles.cartBadge}>{cartCount}</span>
            )}
          </button>
          <Link href="/admin/login" className={styles.adminLink}>Admin Login</Link>
        </div>
      </div>
    </nav>
  );
}
