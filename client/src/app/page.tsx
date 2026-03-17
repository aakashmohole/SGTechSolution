"use client";

import React, { useEffect, useRef, useState } from 'react';
import Navbar from './components/Navbar';
import styles from './page.module.css';
import { ChevronDown, ChevronRight, Package, Cpu, Monitor, HardDrive, Keyboard } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';

gsap.registerPlugin(ScrollTrigger);

interface Part {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  isOffer: boolean;
  offerPrice?: number;
  imageUrls: string[];
}

export default function Home() {
  const heroRef = useRef(null);
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    gsap.from(heroRef.current, {
      opacity: 0,
      y: 50,
      duration: 1.5,
      ease: 'power4.out',
    });

    const fetchParts = async () => {
      try {
        const response = await fetch('http://localhost:8000/parts');
        if (response.ok) {
          const data = await response.json();
          // Show only top 4 featured items
          setParts(data.slice(0, 4));
        }
      } catch (err) {
        console.error('Failed to fetch parts', err);
      } finally {
        setLoading(false);
      }
    };

    fetchParts();
  }, []);

  return (
    <main className={styles.main}>
      <Navbar />
      
      {/* Hero Section */}
      <section className={styles.hero} ref={heroRef}>
        <div className={styles.heroCenter}>
          <div className={styles.heroBadge}>New Arrival</div>
          <h1 className="text-gradient">Next-Gen Performance</h1>
          <p>Discover the latest high-end processors, graphics cards, and peripherals to elevate your ultimate setup.</p>
          <div className={styles.heroActions}>
            <Link href="/inventory" className="btn-primary">
              Shop Now
            </Link>
          </div>
        </div>
        <div className={styles.scrollIndicator}>
          <ChevronDown size={32} />
        </div>
      </section>

      {/* Categories Section */}
      <section className={styles.categorySection}>
        <div className={styles.sectionHeader}>
          <h2 className="text-gradient">Shop by Category</h2>
        </div>
        <div className={styles.categoryGrid}>
          <Link href="/inventory?category=Processors" className={`${styles.categoryCard} glass`}>
            <Cpu size={40} className={styles.catIcon} />
            <h3>Processors</h3>
            <p>Power your build</p>
          </Link>
          <Link href="/inventory?category=Graphics Cards" className={`${styles.categoryCard} glass`}>
            <Monitor size={40} className={styles.catIcon} />
            <h3>Graphics</h3>
            <p>Maximum framerates</p>
          </Link>
          <Link href="/inventory?category=Storage" className={`${styles.categoryCard} glass`}>
            <HardDrive size={40} className={styles.catIcon} />
            <h3>Storage</h3>
            <p>Lightning fast loading</p>
          </Link>
          <Link href="/inventory?category=Peripherals" className={`${styles.categoryCard} glass`}>
            <Keyboard size={40} className={styles.catIcon} />
            <h3>Peripherals</h3>
            <p>Complete control</p>
          </Link>
        </div>
      </section>

      {/* Featured Highlights */}
      <section id="parts" className={styles.hardwareSection}>
        <div className={styles.sectionHeader}>
          <h2 className="text-gradient">Featured Highlights</h2>
          <p>Discover our top-trending and most recent additions.</p>
        </div>

        {loading ? (
          <div className={styles.loading}>Loading highlights...</div>
        ) : (
          <div className={styles.grid}>
            {parts.map((part) => (
              <Link href={`/inventory/${part.id}`} key={part.id} className={`${styles.card} glass`}>
                <div className={styles.cardImageWrapper}>
                  {part.imageUrls && part.imageUrls.length > 0 ? (
                    <img src={part.imageUrls[0]} alt={part.name} className={styles.highlightImage} />
                  ) : (
                    <div className={styles.placeholderHighlight}><Package size={40} /></div>
                  )}
                </div>
                <div className={styles.cardInfo}>
                  <span className={styles.category}>{part.category}</span>
                  <h3>{part.name}</h3>
                  <div className={styles.cardFooter}>
                    <span className={styles.price}>₹{part.price.toFixed(2)}</span>
                    <span className={part.stock > 0 ? styles.statusInStock : styles.statusOutOfStock}>
                      {part.stock > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className={styles.viewMoreContainer}>
          <Link href="/inventory" className={`${styles.viewMoreBtn} glass`}>
            <span>Search for more Parts & Items</span>
            <ChevronRight size={20} />
          </Link>
        </div>
      </section>

      {/* Custom PC Build Section */}
      <section id="custom-build" className={styles.customBuildSection}>
        <div className={`${styles.customBuildBanner} glass`}>
          <div className={styles.customBuildContent}>
            <div className={styles.badge} style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981' }}>New Feature</div>
            <h3 className="text-gradient">Custom PC Builder</h3>
            <p>Don't know where to start? Use our intelligent configurator to design the perfect machine for gaming, rendering, or office work. We ensure 100% component compatibility.</p>
            <Link href="/custom-build" className="btn-primary">Start Your Build</Link>
          </div>
          <div className={styles.customBuildImage}>
            {/* Can replace with a cool PC rig image later */}
            <div className={styles.placeholderRig}>
              <Cpu size={60} color="var(--primary)" />
            </div>
          </div>
        </div>
      </section>

      {/* Special Offers */}
      <section id="offers" className={styles.offersSection}>
        <div className={`${styles.offerBanner} glass`}>
          <div className={styles.offerContent}>
            <div className={styles.badge}>Monthly Special</div>
            <h3>Upgrade & Save</h3>
            <p>Get up to 20% off selected motherboards when you bundle with a 13th Gen Processor. Limited time only.</p>
            <Link href="/inventory" className="btn-primary">Shop Deals</Link>
          </div>
        </div>
      </section>

    </main>
  );
}
