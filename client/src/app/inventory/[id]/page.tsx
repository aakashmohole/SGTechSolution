"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import styles from './ProductDetail.module.css';
import { ShoppingCart, Zap, CheckCircle, XCircle, ChevronLeft, ChevronRight, Package, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '../../context/CartContext';

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
  specifications: Record<string, string>;
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const [part, setPart] = useState<Part | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  const fetchPart = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:8000/parts/${id}`);
      if (response.ok) {
        const data = await response.json();
        setPart(data);
      } else {
        router.push('/inventory');
      }
    } catch (err) {
      console.error('Failed to fetch part details', err);
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchPart();
  }, [fetchPart]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  if (!part) return null;

  return (
    <div className={styles.container}>
      <Navbar />
      
      <main className={styles.main}>
        <Link href="/inventory" className={styles.backButton}>
          <ArrowLeft size={20} />
          <span>Back to Catalog</span>
        </Link>

        <div className={styles.productGrid}>
          {/* Left Column: Gallery */}
          <section className={styles.gallerySection}>
            <div className={`${styles.mainImageWrapper} glass`}>
              {part.imageUrls.length > 0 ? (
                <img src={part.imageUrls[activeImage]} alt={part.name} className={styles.mainImage} />
              ) : (
                <div className={styles.placeholderMain}>
                  <Package size={80} />
                </div>
              )}
            </div>
            
            <div className={styles.thumbnails}>
              {part.imageUrls.map((url, index) => (
                <button 
                  key={index} 
                  className={`${styles.thumbBtn} ${activeImage === index ? styles.activeThumb : ''} glass`}
                  onClick={() => setActiveImage(index)}
                >
                  <img src={url} alt={`${part.name} ${index + 1}`} />
                </button>
              ))}
            </div>
          </section>

          {/* Right Column: Info & Actions */}
          <section className={styles.infoSection}>
            <div className={styles.categoryBadge}>{part.category}</div>
            <h1 className="text-gradient">{part.name}</h1>
            
            <div className={styles.priceRow}>
              {part.isOffer ? (
                <>
                  <span className={styles.offerPrice}>₹{part.offerPrice?.toFixed(2)}</span>
                  <span className={styles.originalPrice}>₹{part.price.toFixed(2)}</span>
                  <span className={styles.discountBadge}>
                    -{Math.round(((part.price - (part.offerPrice || 0)) / part.price) * 100)}%
                  </span>
                </>
              ) : (
                <span className={styles.price}>₹{part.price.toFixed(2)}</span>
              )}
            </div>

            <div className={styles.stockStatus}>
              {part.stock > 0 ? (
                <div className={styles.inStock}>
                  <CheckCircle size={18} />
                  <span>{part.stock} units available in stock</span>
                </div>
              ) : (
                <div className={styles.outOfStock}>
                  <XCircle size={18} />
                  <span>Currently out of stock</span>
                </div>
              )}
            </div>

            <p className={styles.description}>{part.description}</p>

            <div className={styles.actionButtons}>
              <button 
                className="btn-primary" 
                disabled={part.stock === 0}
                onClick={() => addToCart({
                  id: part.id,
                  name: part.name,
                  price: part.isOffer && part.offerPrice ? part.offerPrice : part.price,
                  imageUrls: part.imageUrls,
                  quantity: 1
                })}
              >
                <ShoppingCart size={20} />
                <span>Add to Cart</span>
              </button>
              <button 
                className={`${styles.buyNow} glass`} 
                disabled={part.stock === 0}
                onClick={() => {
                  addToCart({
                    id: part.id,
                    name: part.name,
                    price: part.isOffer && part.offerPrice ? part.offerPrice : part.price,
                    imageUrls: part.imageUrls,
                    quantity: 1
                  });
                  router.push('/checkout');
                }}
              >
                <Zap size={20} />
                <span>Buy Now</span>
              </button>
            </div>

            {/* Specifications Section */}
            {Object.keys(part.specifications).length > 0 && (
              <div className={styles.specsSection}>
                <h3>Technical Specifications</h3>
                <div className={styles.specsGrid}>
                  {Object.entries(part.specifications).map(([key, value]) => (
                    <div key={key} className={styles.specRow}>
                      <span className={styles.specKey}>{key}</span>
                      <span className={styles.specValue}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>&copy; 2026 SG Tech Solution. All rights reserved.</p>
      </footer>
    </div>
  );
}
