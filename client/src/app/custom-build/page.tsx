"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Navbar from '../components/Navbar';
import styles from './page.module.css';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage } from '@react-three/drei';
import Link from 'next/link';
import { Cpu } from 'lucide-react';

// Mock Pre-built PCs
const PRE_BUILTS = [
  {
    id: 'pb-1',
    name: 'Starter Rig',
    price: 1200,
    discountPrice: 999,
    image: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?auto=format&fit=crop&q=80&w=400',
    parts: ['Intel Core i5', 'RTX 3060', '16GB RAM', '1TB NVMe']
  },
  {
    id: 'pb-2',
    name: 'Pro Streamer',
    price: 2500,
    discountPrice: 2199,
    image: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&q=80&w=400',
    parts: ['AMD Ryzen 9', 'RTX 4080', '32GB RAM', '2TB NVMe']
  }
];

// Placeholder 3D Case Component
function PCModel({ selectedParts }: { selectedParts: any }) {
  // Simple representation of a PC case and internals
  return (
    <group>
      {/* Case Header/Frame */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2, 4, 3]} />
        <meshStandardMaterial color="#1a1a1a" transparent opacity={0.6} metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Motherboard backing */}
      <mesh position={[-0.9, 0, 0]}>
        <boxGeometry args={[0.1, 3.5, 2.5]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      {/* CPU cooler (glows blue if CPU selected) */}
      <mesh position={[-0.6, 0.8, -0.5]}>
        <cylinderGeometry args={[0.4, 0.4, 0.3, 32]} />
        <meshStandardMaterial color={selectedParts.CPU ? "#00ffff" : "#333333"} emissive={selectedParts.CPU ? "#00ffff" : "#000000"} emissiveIntensity={0.5} />
      </mesh>
      {/* GPU (glows green if GPU selected) */}
      <mesh position={[-0.5, -0.5, 0]}>
        <boxGeometry args={[0.6, 0.2, 2]} />
        <meshStandardMaterial color={selectedParts.GPU ? "#00ff00" : "#333333"} emissive={selectedParts.GPU ? "#00ff00" : "#000000"} emissiveIntensity={selectedParts.GPU ? 0.5 : 0} />
      </mesh>
      {/* RAM (glows red if RAM selected) */}
      <mesh position={[-0.7, 0.8, 0.3]}>
        <boxGeometry args={[0.05, 0.6, 0.8]} />
        <meshStandardMaterial color={selectedParts.RAM ? "#ff0000" : "#333333"} emissive={selectedParts.RAM ? "#ff0000" : "#000000"} emissiveIntensity={selectedParts.RAM ? 0.5 : 0} />
      </mesh>
    </group>
  );
}

export default function CustomBuildPage() {
  const [parts, setParts] = useState<any[]>([]);
  const [selectedParts, setSelectedParts] = useState<any>({});
  const [activeCategory, setActiveCategory] = useState('CPU');

  useEffect(() => {
    fetch('http://localhost:8000/parts')
      .then(res => res.json())
      .then(data => setParts(data))
      .catch(err => console.error(err));
  }, []);

  const categories = ['CPU', 'GPU', 'RAM', 'Storage', 'Motherboard', 'Case'];
  
  // Categorize parts
  const categorizedParts = parts.reduce((acc, part) => {
    let cat = 'Other';
    const lowerName = part.name.toLowerCase();
    const lowerCat = part.category.toLowerCase();
    
    if (lowerCat.includes('processor') || lowerName.includes('intel') || lowerName.includes('ryzen') || lowerName.includes('cpu')) cat = 'CPU';
    else if (lowerCat.includes('graphic') || lowerName.includes('rtx') || lowerName.includes('rx') || lowerName.includes('gpu')) cat = 'GPU';
    else if (lowerName.includes('ram') || lowerName.includes('memory') || lowerName.includes('ddr4') || lowerName.includes('ddr5')) cat = 'RAM';
    else if (lowerCat.includes('storage') || lowerName.includes('ssd') || lowerName.includes('nvme') || lowerName.includes('hdd')) cat = 'Storage';
    else if (lowerName.includes('motherboard') || lowerName.includes('z790') || lowerName.includes('b650')) cat = 'Motherboard';
    else if (lowerName.includes('case') || lowerName.includes('tower')) cat = 'Case';
    
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(part);
    return acc;
  }, {} as any);

  const handleSelectPart = (cat: string, part: any) => {
    setSelectedParts((prev: any) => ({ ...prev, [cat]: part }));
  };

  const totalPrice = Object.values(selectedParts).reduce((sum: number, p: any) => sum + p.price, 0);

  return (
    <main className={styles.main}>
      <Navbar />
      
      {/* Upper Section: Pre-built PCs */}
      <section className={styles.preBuiltSection}>
        <div className={styles.sectionHeader}>
          <h2 className="text-gradient">Ready to Ship: Pre-Built Rigs</h2>
          <p>Prefer to skip the build? Choose from our discounted pre-configured setups.</p>
        </div>
        <div className={styles.preBuiltGrid}>
          {PRE_BUILTS.map(pb => (
            <div key={pb.id} className={`${styles.preBuiltCard} glass`}>
              <div className={styles.pbImage} style={{ backgroundImage: `url(${pb.image})` }}></div>
              <div className={styles.pbInfo}>
                <h3>{pb.name}</h3>
                <div className={styles.pbSpecs}>
                  {pb.parts.map((p, i) => <span key={i} className={styles.specBadge}>{p}</span>)}
                </div>
                <div className={styles.pbPricing}>
                  <span className={styles.originalPrice}>₹{pb.price}</span>
                  <span className={styles.discountPrice}>₹{pb.discountPrice}</span>
                </div>
                <button className="btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Buy This Build</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className={styles.divider}>
        <span>OR BUILD YOUR OWN</span>
      </div>

      {/* Lower Section: Custom PC Builder with 3D Preview */}
      <section className={styles.builderSection}>
         <div className={styles.sectionHeader}>
          <h2 className="text-gradient">Custom PC Builder</h2>
          <p>Select components and see your machine come to life in 3D.</p>
        </div>

        <div className={styles.builderLayout}>
          
          {/* Left: 3D Preview */}
          <div className={`${styles.previewContainer} glass`}>
            <div className={styles.canvasWrapper}>
              <Canvas camera={{ position: [5, 2, 5], fov: 45 }}>
                <Suspense fallback={null}>
                  <Stage environment="city" intensity={0.5}>
                    <PCModel selectedParts={selectedParts} />
                  </Stage>
                  <OrbitControls autoRotate autoRotateSpeed={0.5} />
                </Suspense>
              </Canvas>
            </div>
            <div className={styles.previewStats}>
              <div className={styles.totalPrice}>
                Total: <span>₹{totalPrice.toFixed(2)}</span>
              </div>
              <button className="btn-primary" disabled={totalPrice === 0}>Proceed to Checkout</button>
            </div>
          </div>

          {/* Right: Part Selection */}
          <div className={`${styles.selectionContainer} glass`}>
            <div className={styles.categoryTabs}>
              {categories.map(cat => (
                <button 
                  key={cat} 
                  className={`${styles.tabBtn} ${activeCategory === cat ? styles.activeTab : ''}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat} {selectedParts[cat] && '✓'}
                </button>
              ))}
            </div>

            <div className={styles.partsList}>
              {categorizedParts[activeCategory] && categorizedParts[activeCategory].length > 0 ? (
                categorizedParts[activeCategory].map((part: any) => (
                  <div 
                    key={part.id} 
                    className={`${styles.partItem} ${selectedParts[activeCategory]?.id === part.id ? styles.selectedPart : ''}`}
                    onClick={() => handleSelectPart(activeCategory, part)}
                  >
                    <div className={styles.partInfo}>
                      <h4>{part.name}</h4>
                      <p className={styles.partDesc}>{part.description.substring(0, 50)}...</p>
                    </div>
                    <div className={styles.partPrice}>+₹{part.price.toFixed(2)}</div>
                  </div>
                ))
              ) : (
                <div className={styles.emptyState}>No parts available in this category.</div>
              )}
            </div>
          </div>

        </div>
      </section>

    </main>
  );
}
