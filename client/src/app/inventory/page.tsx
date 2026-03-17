"use client";

import React, { useState, useEffect, useCallback } from 'react';
import styles from './inventory.module.css';
import { Search, Filter, Package, ChevronRight, Home, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '../context/CartContext';

interface Part {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  imageUrls: string[];
  isOffer: boolean;
  offerPrice?: number;
}

export default function InventoryPage() {
  const { addToCart } = useCart();
  const [parts, setParts] = useState<Part[]>([]);
  const [filteredParts, setFilteredParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Processors', 'Graphics Cards', 'Storage', 'Monitors', 'Memory', 'Motherboards'];

  const fetchParts = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:8000/parts');
      if (response.ok) {
        const data = await response.json();
        setParts(data);
        setFilteredParts(data);
      }
    } catch (err) {
      console.error('Failed to fetch parts', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchParts();
  }, [fetchParts]);

  useEffect(() => {
    let result = parts;
    if (activeCategory !== 'All') {
      result = result.filter(part => part.category === activeCategory);
    }
    if (searchTerm) {
      result = result.filter(part => 
        part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        part.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredParts(result);
  }, [searchTerm, activeCategory, parts]);

  return (
    <div className={styles.container}>
      <nav className={`${styles.nav} glass`}>
        <div className={styles.navContent}>
          <Link href="/" className={styles.logo}>
            SG Tech <span className="text-gradient">Solution</span>
          </Link>
          <Link href="/" className={styles.backLink}>
            <Home size={18} />
            <span>Back to Home</span>
          </Link>
        </div>
      </nav>

      <main className={styles.main}>
        <header className={styles.header}>
          <h1 className="text-gradient">Hardware Inventory</h1>
          <p>Explore our full catalog of high-performance computer parts and peripherals.</p>
        </header>

        <section className={`${styles.searchSection} glass`}>
          <div className={styles.searchBar}>
            <Search className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Search components..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="glass"
            />
          </div>
          <div className={styles.filterBar}>
            {categories.map(cat => (
              <button
                key={cat}
                className={`${styles.filterBtn} ${activeCategory === cat ? styles.active : ''} glass`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        <div className={styles.resultsHeader}>
          <span>Showing {filteredParts.length} items</span>
        </div>

        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Loading catalog...</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {filteredParts.map(part => (
              <Link href={`/inventory/${part.id}`} key={part.id} className={`${styles.card} glass`}>
                <div className={styles.imageWrapper}>
                  {part.imageUrls && part.imageUrls.length > 0 ? (
                    <img src={part.imageUrls[0]} alt={part.name} className={styles.partImage} />
                  ) : (
                    <div className={styles.placeholderImage}>
                      <Package size={48} />
                    </div>
                  )}
                  {part.isOffer && <span className={styles.offerBadge}>Special Offer</span>}
                </div>
                <div className={styles.cardContent}>
                  <div className={styles.category}>{part.category}</div>
                  <h3>{part.name}</h3>
                  <p>{part.description}</p>
                  <div className={styles.cardFooter}>
                    <div className={styles.priceContainer}>
                      {part.isOffer ? (
                        <>
                          <span className={styles.oldPrice}>₹{part.price.toFixed(2)}</span>
                          <span className={styles.price}>₹{part.offerPrice?.toFixed(2)}</span>
                        </>
                      ) : (
                        <span className={styles.price}>₹{part.price.toFixed(2)}</span>
                      )}
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div className={part.stock > 0 ? styles.statusInStock : styles.statusOutOfStock}>
                        {part.stock > 0 ? 'In Stock' : 'Out of Stock'}
                      </div>
                      <button 
                        className="btn-primary" 
                        style={{ padding: '6px 10px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}
                        disabled={part.stock === 0}
                        onClick={(e) => {
                          e.preventDefault(); // Prevent navigating to detail page
                          addToCart({
                            id: part.id,
                            name: part.name,
                            price: part.isOffer && part.offerPrice ? part.offerPrice : part.price,
                            imageUrls: part.imageUrls,
                            quantity: 1
                          });
                        }}
                      >
                        <ShoppingCart size={14} /> Add
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <footer className={styles.footer}>
        <p>&copy; 2026 SG Tech Solution. All rights reserved.</p>
      </footer>
    </div>
  );
}
