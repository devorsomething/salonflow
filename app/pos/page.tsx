'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Service {
  id: string;
  name: string;
  price_cents: number;
  duration_minutes?: number;
  category?: string;
}

interface Product {
  id: string;
  name: string;
  price_cents: number;
  stock_quantity?: number;
  category?: string;
}

interface CartItem {
  id: string;
  type: 'service' | 'product';
  name: string;
  price_cents: number;
  quantity: number;
  stock_quantity?: number;
}

interface Stylist {
  id: string;
  name: string;
}

export default function POSPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Tab state
  const [activeTab, setActiveTab] = useState<'services' | 'products'>('services');

  // Data state
  const [services, setServices] = useState<Service[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [selectedStylist, setSelectedStylist] = useState<string>('');

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);

  // Customer & Payment state
  const [customerPhone, setCustomerPhone] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash' | 'bank_transfer'>('card');

  // UI state
  const [processing, setProcessing] = useState(false);
  const [saleComplete, setSaleComplete] = useState(false);
  const [error, setError] = useState('');

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('salonflow_token');
    if (!token) {
      router.push('/login?redirect=/pos');
      return;
    }
    setIsAuthenticated(true);
    loadData();
  }, [router]);

  const loadData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('salonflow_token') || '';
      const headers = { 'Authorization': `Bearer ${token}` };

      // Fetch services
      const servicesRes = await fetch('/api/services', { headers });
      const servicesData = await servicesRes.json();
      // Normalize: API returns {services: [...]} or {data: [...]} or [...]
      let svcs = [];
      if (Array.isArray(servicesData)) svcs = servicesData;
      else if (Array.isArray(servicesData?.data)) svcs = servicesData.data;
      else if (Array.isArray(servicesData?.services)) svcs = servicesData.services;
      setServices(svcs);

      // Fetch products
      const productsRes = await fetch('/api/products', { headers });
      const productsData = await productsRes.json();
      // Normalize: API returns {products: [...]} or {data: [...]} or [...]
      let prods = [];
      if (Array.isArray(productsData)) prods = productsData;
      else if (Array.isArray(productsData?.data)) prods = productsData.data;
      else if (Array.isArray(productsData?.products)) prods = productsData.products;
      setProducts(prods);

      // Fetch stylists
      const stylistsRes = await fetch('/api/salons/demo-salon', { headers });
      const salonData = await stylistsRes.json();
      if (salonData.stylists) {
        setStylists(salonData.stylists);
        if (salonData.stylists.length > 0) {
          setSelectedStylist(salonData.stylists[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Daten konnten nicht geladen werden');
    }
    setLoading(false);
  };

  // Add item to cart
  const addToCart = (item: Service | Product, type: 'service' | 'product') => {
    const itemAny = item as { price_cents?: number; price?: number; name: string; id: string; stock_quantity?: number };
    const priceCents = itemAny.price_cents ?? (itemAny.price ?? 0);
    const existing = cart.find(i => i.id === itemAny.id && i.type === type);
    
    if (existing) {
      setCart(cart.map(i => 
        i.id === itemAny.id && i.type === type 
          ? { ...i, quantity: i.quantity + 1 }
          : i
      ));
    } else {
      setCart([...cart, {
        id: itemAny.id,
        type,
        name: itemAny.name,
        price_cents: priceCents,
        quantity: 1,
        ...(type === 'product' ? { stock_quantity: itemAny.stock_quantity ?? 0 } : {})
      }]);
    }
  };

  // Remove item from cart
  const removeFromCart = (id: string, type: 'service' | 'product') => {
    setCart(cart.filter(i => !(i.id === id && i.type === type)));
  };

  // Update quantity
  const updateQuantity = (id: string, type: 'service' | 'product', delta: number) => {
    setCart(cart.map(i => {
      if (i.id === id && i.type === type) {
        const newQty = i.quantity + delta;
        return newQty > 0 ? { ...i, quantity: newQty } : i;
      }
      return i;
    }).filter(i => i.quantity > 0));
  };

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + item.price_cents * item.quantity, 0);
  const discount = couponDiscount;
  const total = Math.max(0, subtotal - discount);

  // Apply coupon
  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    
    try {
      const token = localStorage.getItem('salonflow_token') || '';
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ code: couponCode, order_cents: subtotal })
      });
      
      const data = await res.json();
      if (data.valid) {
        setCouponDiscount(data.discount_cents || 0);
        setCouponError('');
      } else {
        setCouponError(data.error || 'Ungültiger Code');
        setCouponDiscount(0);
      }
    } catch {
      setCouponError('Validierung fehlgeschlagen');
      setCouponDiscount(0);
    }
  };

  // Clear coupon
  const clearCoupon = () => {
    setCouponCode('');
    setCouponDiscount(0);
    setCouponError('');
  };

  // Process payment
  const processPayment = async () => {
    if (cart.length === 0) return;
    
    setProcessing(true);
    setError('');

    try {
      const token = localStorage.getItem('salonflow_token') || '';
      
      // Create payment record
      const paymentRes = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount_cents: total,
          method: paymentMethod,
          status: 'completed',
          notes: couponCode ? `Coupon: ${couponCode}` : undefined
        })
      });

      if (!paymentRes.ok) throw new Error('Payment failed');

      // Decrement stock for products in cart
      const productItems = cart.filter(i => i.type === 'product');
      for (const item of productItems) {
        try {
          const stockRes = await fetch(`/api/products/${item.id}/stock`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ stock_quantity: Math.max(0, (item.stock_quantity || 0) - item.quantity) })
          });
          if (stockRes.ok) {
            const updated = await stockRes.json();
            // Update local products state
            setProducts(prev => prev.map(p => p.id === item.id ? { ...p, stock_quantity: updated.stock_quantity } : p));
          }
        } catch (e) {
          console.error('Stock update failed for', item.name, e);
        }
      }
      
      setSaleComplete(true);
      setCart([]);
      
      // Reset after 3 seconds
      setTimeout(() => {
        setSaleComplete(false);
        clearCoupon();
        setCustomerPhone('');
      }, 3000);
    } catch (err) {
      setError('Zahlung fehlgeschlagen. Bitte erneut versuchen.');
    }
    
    setProcessing(false);
  };

  // Cancel current sale
  const cancelSale = () => {
    setCart([]);
    clearCoupon();
    setCustomerPhone('');
    setPaymentMethod('card');
  };

  // New booking
  const newBooking = () => {
    router.push('/book/demo-salon');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-sage-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-sage-200 border-t-sage-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sage-600">Weiterleitung...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-sage-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-sage-200 border-t-sage-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sage-600">Laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sage-50">
      {/* Header */}
      <header className="bg-white border-b border-sage-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-sage-900">SalonFlow POS</h1>
            <span className="text-sage-400">|</span>
            <select
              value={selectedStylist}
              onChange={(e) => setSelectedStylist(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-sage-200 text-sage-700 bg-white focus:outline-none focus:border-sage-500"
            >
              {stylists.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-sage-500">
              {new Date().toLocaleDateString('de-AT', { weekday: 'long', day: 'numeric', month: 'long' })}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {saleComplete ? (
          // Success State
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="bg-white rounded-2xl p-8 shadow-lg text-center max-w-md w-full">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-sage-900 mb-2">Zahlung erfolgreich!</h2>
              <p className="text-sage-600 mb-4">Die Zahlung wurde verarbeitet.</p>
              <p className="text-lg font-semibold text-sage-900">€{(total / 100).toFixed(2)}</p>
            </div>
          </div>
        ) : (
          // Two Column Layout
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LEFT: Service/Product Grid */}
            <div className="lg:col-span-2 space-y-4">
              {/* Tabs */}
              <div className="bg-white rounded-xl shadow-sm border border-sage-100 overflow-hidden">
                <div className="flex">
                  <button
                    onClick={() => setActiveTab('services')}
                    className={`flex-1 py-3 px-4 font-medium transition-colors ${
                      activeTab === 'services'
                        ? 'bg-sage-600 text-white'
                        : 'bg-white text-sage-600 hover:bg-sage-50'
                    }`}
                  >
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                      Services
                    </span>
                  </button>
                  <button
                    onClick={() => setActiveTab('products')}
                    className={`flex-1 py-3 px-4 font-medium transition-colors ${
                      activeTab === 'products'
                        ? 'bg-sage-600 text-white'
                        : 'bg-white text-sage-600 hover:bg-sage-50'
                    }`}
                  >
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      Produkte
                      {products.some(p => (p.stock_quantity || 0) <= 5) && (
                        <span className="w-2 h-2 bg-amber-400 rounded-full" />
                      )}
                    </span>
                  </button>
                </div>

                {/* Services Grid */}
                {activeTab === 'services' && (
                  <div className="p-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {services.map((service) => (
                        <button
                          key={service.id}
                          onClick={() => addToCart(service, 'service')}
                          className="p-4 rounded-xl border-2 border-sage-100 hover:border-sage-300 hover:shadow-md transition-all text-left bg-white"
                        >
                          <p className="font-medium text-sage-900">{service.name}</p>
                          <p className="text-sm text-sage-500 mt-1">
                            {service.duration_minutes ? `${service.duration_minutes} Min.` : '—'}
                          </p>
                          <p className="text-lg font-semibold text-sage-600 mt-2">
                            €{(service.price_cents / 100).toFixed(2)}
                          </p>
                        </button>
                      ))}
                    </div>
                    {services.length === 0 && (
                      <div className="text-center py-8 text-sage-500">
                        Keine Services verfügbar
                      </div>
                    )}
                  </div>
                )}

                {/* Products Grid */}
                {activeTab === 'products' && (
                  <div className="p-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {products.map((product) => {
                        const lowStock = (product.stock_quantity || 0) <= 5;
                        const outOfStock = (product.stock_quantity || 0) === 0;
                        return (
                          <button
                            key={product.id}
                            onClick={() => !outOfStock && addToCart(product, 'product')}
                            disabled={outOfStock}
                            className={`p-4 rounded-xl border-2 transition-all text-left ${
                              outOfStock
                                ? 'border-sage-100 bg-sage-50 opacity-60 cursor-not-allowed'
                                : lowStock
                                ? 'border-amber-200 hover:border-amber-300 hover:shadow-md bg-white'
                                : 'border-sage-100 hover:border-sage-300 hover:shadow-md bg-white'
                            }`}
                          >
                            <p className="font-medium text-sage-900">{product.name}</p>
                            <p className={`text-sm mt-1 ${lowStock ? 'text-amber-600' : 'text-sage-500'}`}>
                              {outOfStock ? 'Nicht vorrätig' : `${product.stock_quantity} verfügbar`}
                            </p>
                            <p className="text-lg font-semibold text-sage-600 mt-2">
                              €{(product.price_cents / 100).toFixed(2)}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                    {products.length === 0 && (
                      <div className="text-center py-8 text-sage-500">
                        Keine Produkte verfügbar
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT: Current Sale */}
            <div className="space-y-4">
              {/* Cart */}
              <div className="bg-white rounded-xl shadow-sm border border-sage-100 overflow-hidden">
                <div className="p-4 border-b border-sage-100">
                  <h2 className="font-semibold text-sage-900">Aktueller Verkauf</h2>
                </div>
                
                <div className="p-4 max-h-64 overflow-y-auto">
                  {cart.length === 0 ? (
                    <div className="text-center py-8 text-sage-400">
                      <svg className="w-12 h-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      <p>Noch keine Artikel</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {cart.map((item) => (
                        <div key={`${item.type}-${item.id}`} className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-sage-900 text-sm">{item.name}</p>
                            <p className="text-xs text-sage-500">
                              €{(item.price_cents / 100).toFixed(2)} × {item.quantity}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.id, item.type, -1)}
                              className="w-7 h-7 rounded-lg bg-sage-100 text-sage-600 hover:bg-sage-200 flex items-center justify-center text-sm"
                            >
                              −
                            </button>
                            <span className="w-6 text-center font-medium">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.type, 1)}
                              className="w-7 h-7 rounded-lg bg-sage-100 text-sage-600 hover:bg-sage-200 flex items-center justify-center text-sm"
                            >
                              +
                            </button>
                            <button
                              onClick={() => removeFromCart(item.id, item.type)}
                              className="w-7 h-7 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center text-sm ml-2"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Totals */}
                <div className="p-4 border-t border-sage-100 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-sage-500">Zwischensumme</span>
                    <span className="text-sage-700">€{(subtotal / 100).toFixed(2)}</span>
                  </div>
                  
                  {/* Coupon Input */}
                  <div className="pt-2 border-t border-sage-100">
                    {couponDiscount > 0 ? (
                      <div className="flex justify-between items-center text-green-600">
                        <span className="text-sm flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                          {couponCode}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">-€{(couponDiscount / 100).toFixed(2)}</span>
                          <button onClick={clearCoupon} className="text-xs text-sage-400 hover:text-sage-600">✕</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          placeholder="Gutschein"
                          className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-sage-200 focus:outline-none focus:border-sage-500"
                        />
                        <button
                          onClick={applyCoupon}
                          className="px-3 py-1.5 text-sm bg-sage-100 text-sage-600 rounded-lg hover:bg-sage-200"
                        >
                          +
                        </button>
                      </div>
                    )}
                    {couponError && (
                      <p className="text-xs text-red-500 mt-1">{couponError}</p>
                    )}
                  </div>

                  <div className="flex justify-between font-semibold text-lg pt-2 border-t border-sage-200">
                    <span className="text-sage-700">Gesamt</span>
                    <span className="text-sage-900">€{(total / 100).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Customer */}
              <div className="bg-white rounded-xl shadow-sm border border-sage-100 p-4">
                <label className="block text-sm font-medium text-sage-700 mb-2">
                  Kundentelefon (optional)
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+43 123 456789"
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-sage-200 focus:outline-none focus:border-sage-500"
                />
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-xl shadow-sm border border-sage-100 overflow-hidden">
                <div className="p-4 border-b border-sage-100">
                  <h3 className="font-semibold text-sage-900">Zahlungsart</h3>
                </div>
                <div className="flex">
                  {[
                    { id: 'card', label: 'Kartenzahlung', icon: '💳' },
                    { id: 'cash', label: 'Bar', icon: '💵' },
                    { id: 'bank_transfer', label: 'Überweisung', icon: '🏦' },
                  ].map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id as typeof paymentMethod)}
                      className={`flex-1 py-3 px-2 text-sm font-medium transition-colors ${
                        paymentMethod === method.id
                          ? 'bg-sage-600 text-white'
                          : 'bg-white text-sage-600 hover:bg-sage-50'
                      }`}
                    >
                      <span className="block">{method.icon}</span>
                      <span className="block mt-1">{method.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                  {error}
                </div>
              )}

              {/* Pay Button */}
              <button
                onClick={processPayment}
                disabled={cart.length === 0 || processing}
                className={`w-full py-4 rounded-xl font-semibold text-lg transition-all ${
                  cart.length === 0 || processing
                    ? 'bg-sage-200 text-sage-400 cursor-not-allowed'
                    : 'bg-sage-600 text-white hover:bg-sage-700 shadow-lg shadow-sage-200'
                }`}
              >
                {processing ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Wird verarbeitet...
                  </span>
                ) : (
                  `€{(total / 100).toFixed(2)} bezahlen`
                )}
              </button>
            </div>
          </div>
        )}

        {/* Quick Actions Bar */}
        <div className="mt-6 flex flex-wrap gap-3 justify-center">
          <button
            onClick={newBooking}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-sage-200 rounded-xl text-sage-700 hover:bg-sage-50 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Neue Buchung
          </button>
          <button
            onClick={() => router.push('/admin')}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-sage-200 rounded-xl text-sage-700 hover:bg-sage-50 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Kunde suchen
          </button>
          <button
            onClick={cancelSale}
            disabled={cart.length === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
              cart.length === 0
                ? 'bg-sage-100 text-sage-300 cursor-not-allowed'
                : 'bg-red-50 border border-red-200 text-red-600 hover:bg-red-100'
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Storno
          </button>
        </div>
      </main>
    </div>
  );
}
