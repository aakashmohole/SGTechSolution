"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import styles from './dashboard.module.css';
import { Plus, Trash2, Edit2, LogOut, Package, Tag, Layers, RefreshCw, ShoppingCart, Clock, CheckCircle } from 'lucide-react';

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

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'inventory' | 'orders'>('inventory');
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [newPart, setNewPart] = useState({
    name: '',
    description: '',
    price: 0,
    category: 'Processors',
    stock: 0,
    isOffer: false,
    offerPrice: 0,
    imageUrls: [] as string[],
    specifications: {} as Record<string, string>,
  });
  const [specKey, setSpecKey] = useState('');
  const [specValue, setSpecValue] = useState('');
  const router = useRouter();

  const fetchParts = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:8000/parts');
      if (response.ok) {
        const data = await response.json();
        setParts(data);
      }
    } catch (err) {
      console.error('Failed to fetch parts', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      setLoadingOrders(true);
      const response = await fetch('http://localhost:8000/orders/');
      if (response.ok) {
        const data = await response.json();
        const sorted = data.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setOrders(sorted);

        const pendingCount = sorted.filter((o: any) => o.status === 'Pending').length;
        if (pendingCount > 0 && !sessionStorage.getItem('orders_alerted')) {
          alert(`Alert: You have ${pendingCount} new pending order(s) requiring your attention.`);
          sessionStorage.setItem('orders_alerted', 'true');
        }
      }
    } catch (err) {
      console.error('Failed to fetch orders', err);
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  const updateOrderStatus = async (orderId: number, status: string) => {
    try {
      const response = await fetch(`http://localhost:8000/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        fetchOrders();
      }
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const handleLogout = useCallback(() => {
    localStorage.removeItem('admin_token');
    router.push('/admin/login');
  }, [router]);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    fetchParts();
    fetchOrders();
  }, [fetchParts, fetchOrders, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setImageFiles(prev => [...prev, ...files]);
      
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async () => {
    if (imageFiles.length === 0) return [];
    const token = localStorage.getItem('admin_token');
    const formData = new FormData();
    imageFiles.forEach(file => formData.append('files', file));

    try {
      const response = await fetch('http://localhost:8000/uploads/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        return data.urls;
      }
    } catch (err) {
      console.error('Failed to upload images', err);
    }
    return [];
  };

  const addSpecification = () => {
    if (specKey && specValue) {
      setNewPart({
        ...newPart,
        specifications: { ...newPart.specifications, [specKey]: specValue }
      });
      setSpecKey('');
      setSpecValue('');
    }
  };

  const removeSpecification = (key: string) => {
    const nextSpecs = { ...newPart.specifications };
    delete nextSpecs[key];
    setNewPart({ ...newPart, specifications: nextSpecs });
  };

  const handleAddPart = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('admin_token');
    
    let uploadedUrls = [];
    if (imageFiles.length > 0) {
      uploadedUrls = await uploadImages();
    }

    try {
      const response = await fetch('http://localhost:8000/parts/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...newPart, imageUrls: uploadedUrls }),
      });

      if (response.ok) {
        setShowAddForm(false);
        setImageFiles([]);
        setImagePreviews([]);
        setNewPart({
          name: '',
          description: '',
          price: 0,
          category: 'Processors',
          stock: 0,
          isOffer: false,
          offerPrice: 0,
          imageUrls: [],
          specifications: {},
        });
        fetchParts();
      } else if (response.status === 401) {
        handleLogout();
      }
    } catch (err) {
      console.error('Failed to add part', err);
    }
  };

  const handleDeletePart = async (id: number) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    const token = localStorage.getItem('admin_token');
    try {
      const response = await fetch(`http://localhost:8000/parts/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });

      if (response.ok) {
        fetchParts();
      } else if (response.status === 401) {
        handleLogout();
      }
    } catch (err) {
      console.error('Failed to delete part', err);
    }
  };

  return (
    <div className={styles.container}>
      <header className={`${styles.header} glass`}>
        <div className={styles.headerContent}>
          <h1 className="text-gradient">Admin Dashboard</h1>
          <div className={styles.headerActions}>
            <button className={`${styles.btnIcon} glass ${activeTab === 'inventory' ? 'active' : ''}`} onClick={() => setActiveTab('inventory')} style={{ padding: '0 1rem', display: 'flex', alignItems: 'center', gap: '8px', color: activeTab === 'inventory' ? 'var(--primary-color)' : 'white' }}>
              <Package size={18} /> Inventory
            </button>
            <button className={`${styles.btnIcon} glass ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')} style={{ padding: '0 1rem', display: 'flex', alignItems: 'center', gap: '8px', color: activeTab === 'orders' ? 'var(--primary-color)' : 'white' }}>
              <ShoppingCart size={18} /> Orders
            </button>
            <button className={`${styles.btnIcon} glass`} onClick={activeTab === 'inventory' ? fetchParts : fetchOrders} title="Refresh">
              <RefreshCw size={20} />
            </button>
            <button className={styles.btnLogout} onClick={handleLogout}>
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        {activeTab === 'inventory' ? (
          <>
            <div className={styles.statsGrid}>
              <StatCard icon={<Package />} label="Total Items" value={parts.length.toString()} />
              <StatCard icon={<Tag />} label="Active Offers" value={parts.filter(p => p.isOffer).length.toString()} />
              <StatCard icon={<Layers />} label="Categories" value={new Set(parts.map(p => p.category)).size.toString()} />
            </div>

            <div className={styles.inventoryHeader}>
              <h2>Hardware Catalog</h2>
              <button className="btn-primary" onClick={() => setShowAddForm(true)}>
                <Plus size={20} />
                <span>Add New Part</span>
              </button>
            </div>

            {showAddForm && (
              <div className={`${styles.formOverlay} glass`}>
                <div className={`${styles.formCard} glass`}>
                  <h3>Add New Component</h3>
                  <form onSubmit={handleAddPart} className={styles.form}>
                    <div className={styles.inputGroup}>
                      <label>Name</label>
                      <input type="text" value={newPart.name} onChange={e => setNewPart({...newPart, name: e.target.value})} required className="glass" />
                    </div>
                    <div className={styles.inputGroup}>
                      <label>Description</label>
                      <textarea value={newPart.description} onChange={e => setNewPart({...newPart, description: e.target.value})} required className="glass" />
                    </div>
                    <div className={styles.row}>
                      <div className={styles.inputGroup}>
                        <label>Price (₹)</label>
                        <input type="number" step="0.01" value={newPart.price} onChange={e => setNewPart({...newPart, price: parseFloat(e.target.value)})} required className="glass" />
                      </div>
                      <div className={styles.inputGroup}>
                        <label>Stock</label>
                        <input type="number" value={newPart.stock} onChange={e => setNewPart({...newPart, stock: parseInt(e.target.value)})} required className="glass" />
                      </div>
                    </div>
                    <div className={styles.inputGroup}>
                      <label>Category</label>
                      <select value={newPart.category} onChange={e => setNewPart({...newPart, category: e.target.value})} className="glass">
                        <option>Processors</option>
                        <option>Graphics Cards</option>
                        <option>Storage</option>
                        <option>Monitors</option>
                        <option>Memory</option>
                        <option>Motherboards</option>
                      </select>
                    </div>
                    <div className={styles.inputGroup}>
                      <label>Component Images</label>
                      <input type="file" accept="image/*" multiple onChange={handleImageChange} className="glass" />
                      <div className={styles.previewsGrid}>
                        {imagePreviews.map((preview, idx) => (
                          <div key={idx} className={styles.previewItem}>
                            <img src={preview} alt="Preview" />
                            <button type="button" onClick={() => removeImage(idx)} className={styles.removeImg}>×</button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className={styles.inputGroup}>
                      <label>Specifications</label>
                      <div className={styles.specInputRow}>
                        <input type="text" placeholder="Key (e.g. Clock Speed)" value={specKey} onChange={e => setSpecKey(e.target.value)} className="glass" />
                        <input type="text" placeholder="Value (e.g. 5.1 GHz)" value={specValue} onChange={e => setSpecValue(e.target.value)} className="glass" />
                        <button type="button" onClick={addSpecification} className="btn-secondary">Add</button>
                      </div>
                      <div className={styles.specsList}>
                        {Object.entries(newPart.specifications).map(([key, val]) => (
                          <div key={key} className={styles.specItem}>
                            <span>{key}: {val}</span>
                            <button type="button" onClick={() => removeSpecification(key)}>×</button>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className={styles.formActions}>
                      <button type="button" className={styles.btnCancel} onClick={() => setShowAddForm(false)}>Cancel</button>
                      <button type="submit" className="btn-primary">Create Part</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <div className={`${styles.tableWrapper} glass`}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>Loading inventory...</td></tr>
                  ) : parts.length === 0 ? (
                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>No items found in inventory.</td></tr>
                  ) : (
                    parts.map(part => (
                      <tr key={part.id}>
                        <td>
                          <div className={styles.partCell}>
                            {part.imageUrls && part.imageUrls.length > 0 ? (
                              <img src={part.imageUrls[0]} alt={part.name} className={styles.tableThumb} />
                            ) : (
                              <div className={styles.placeholderThumb}><Package size={16} /></div>
                            )}
                            <div>
                              <div className={styles.partName}>{part.name}</div>
                              <div className={styles.partDesc}>{part.description.substring(0, 50)}...</div>
                            </div>
                          </div>
                        </td>
                        <td><span className={styles.categoryBadge}>{part.category}</span></td>
                        <td>₹{part.price.toFixed(2)}</td>
                        <td>{part.stock}</td>
                        <td>
                          <span className={part.stock > 0 ? styles.statusInStock : styles.statusOutOfStock}>
                            {part.stock > 0 ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </td>
                        <td>
                          <div className={styles.actions}>
                            <button className={styles.btnEdit} title="Edit"><Edit2 size={16} /></button>
                            <button className={styles.btnDelete} title="Delete" onClick={() => handleDeletePart(part.id)}><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <>
            <div className={styles.statsGrid}>
              <StatCard icon={<ShoppingCart />} label="Total Orders" value={orders.length.toString()} />
              <StatCard icon={<Clock />} label="Pending" value={orders.filter(o => o.status === 'Pending').length.toString()} />
              <StatCard icon={<CheckCircle />} label="Delivered" value={orders.filter(o => o.status === 'Delivered').length.toString()} />
            </div>

            <div className={styles.inventoryHeader}>
              <h2>Customer Orders</h2>
            </div>
            
            <div className={`${styles.tableWrapper} glass`}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer Details</th>
                    <th>Address</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingOrders ? (
                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>Loading orders...</td></tr>
                  ) : orders.length === 0 ? (
                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>No orders found.</td></tr>
                  ) : (
                    orders.map((order: any) => (
                      <tr key={order.id}>
                        <td>#{order.id.toString().padStart(5, '0')}</td>
                        <td>
                          <div className={styles.partCell}>
                            <div>
                              <div className={styles.partName}>{order.customer_name}</div>
                              <div className={styles.partDesc}>{order.customer_email}</div>
                              <div className={styles.partDesc}>{order.customer_phone}</div>
                            </div>
                          </div>
                        </td>
                        <td>{order.delivery_address}</td>
                        <td>₹{order.total_amount.toFixed(2)}</td>
                        <td>
                          <span className={order.status === 'Pending' ? styles.statusOutOfStock : styles.statusInStock}>
                            {order.status}
                          </span>
                        </td>
                        <td>
                          <div className={styles.actions} style={{ display: 'flex', gap: '8px' }}>
                            {order.status === 'Pending' && (
                              <button 
                                className="btn-secondary" 
                                style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem' }}
                                onClick={() => updateOrderStatus(order.id, 'Delivered')}
                              >
                                Mark Delivered
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className={`${styles.statCard} glass`}>
      <div className={styles.statIcon}>{icon}</div>
      <div className={styles.statInfo}>
        <div className={styles.statLabel}>{label}</div>
        <div className={styles.statValue}>{value}</div>
      </div>
    </div>
  );
}
