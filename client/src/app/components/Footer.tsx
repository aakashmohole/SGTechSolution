import React from 'react';
import Link from 'next/link';
import { MapPin, Phone, Mail, Instagram, Twitter, Facebook, Cpu } from 'lucide-react';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        
        {/* Brand Information */}
        <div className={styles.footerBrand}>
          <div className={styles.logo}>
            <Cpu size={32} color="var(--primary)" />
            <span>SG Tech</span>
          </div>
          <p className={styles.brandDesc}>
            Your premium destination for high-performance computer parts, custom gaming rigs, and top-tier peripherals. Empowering gamers and creators since 2026.
          </p>
          <div className={styles.socials}>
            <a href="#" className={styles.socialLink} aria-label="Instagram"><Instagram size={20} /></a>
            <a href="#" className={styles.socialLink} aria-label="Twitter"><Twitter size={20} /></a>
            <a href="#" className={styles.socialLink} aria-label="Facebook"><Facebook size={20} /></a>
          </div>
        </div>

        {/* Quick Links */}
        <div className={styles.footerLinks}>
          <h3>Quick Links</h3>
          <ul>
            <li><Link href="/">Home</Link></li>
            <li><Link href="/inventory">Shop All Parts</Link></li>
            <li><Link href="/custom-build">Custom PC Builder</Link></li>
            <li><Link href="/checkout">Cart & Checkout</Link></li>
          </ul>
        </div>

        {/* Categories */}
        <div className={styles.footerLinks}>
          <h3>Categories</h3>
          <ul>
            <li><Link href="/inventory?category=Processors">Processors (CPU)</Link></li>
            <li><Link href="/inventory?category=Graphics%20Cards">Graphics Cards (GPU)</Link></li>
            <li><Link href="/inventory?category=Motherboards">Motherboards</Link></li>
            <li><Link href="/inventory?category=Storage">Storage & Memory</Link></li>
            <li><Link href="/inventory?category=Peripherals">Peripherals</Link></li>
          </ul>
        </div>

        {/* Contact Information */}
        <div className={styles.footerContact}>
          <h3>Contact Us</h3>
          <ul>
            <li>
              <MapPin size={18} className={styles.contactIcon} />
              <span>123 Tech Park Avenue, Silicon Space, NY 10001</span>
            </li>
            <li>
              <Phone size={18} className={styles.contactIcon} />
              <span>+1 (800) 123-4567</span>
            </li>
            <li>
              <Mail size={18} className={styles.contactIcon} />
              <span>support@sgtech.com</span>
            </li>
          </ul>
        </div>

      </div>

      <div className={styles.footerBottom}>
        <p>&copy; {new Date().getFullYear()} SG Tech Solution. All rights reserved.</p>
        <div className={styles.legalLinks}>
          <Link href="#">Privacy Policy</Link>
          <span className={styles.separator}>|</span>
          <Link href="#">Terms of Service</Link>
          <span className={styles.separator}>|</span>
          <Link href="#">Refund Policy</Link>
        </div>
      </div>
    </footer>
  );
}
