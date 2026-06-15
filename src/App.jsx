import React, { useState, useEffect } from 'react';

// Enhanced Mock Product Catalog with Ratings & Inventory
const PRODUCTS = [
  { id: 1, name: 'Minimalist Leather Watch', price: 129, category: 'Accessories', rating: 4.8, stock: 5, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500' },
  { id: 2, name: 'Wireless Noise-Canceling Headphones', price: 299, category: 'Electronics', rating: 4.9, stock: 3, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500' },
  { id: 3, name: 'Ergonomic Ceramic Mug', price: 24, category: 'Home & Living', rating: 4.2, stock: 12, image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500' },
  { id: 4, name: 'Premium Leather Backpack', price: 189, category: 'Accessories', rating: 4.6, stock: 7, image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500' },
  { id: 5, name: 'Mechanical RGB Keyboard', price: 95, category: 'Electronics', rating: 4.7, stock: 4, image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500' },
  { id: 6, name: 'Scented Soy Candle Set', price: 35, category: 'Home & Living', rating: 4.5, stock: 15, image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=500' },
];

const VALID_COUPONS = {
  'SUPER10': 0.10, // 10% Off
  'NEXUS20': 0.20, // 20% Off
};

export default function App() {
  // --- Core Reactive States ---
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem('shop_cart')) || []);
  const [wishlist, setWishlist] = useState(() => JSON.parse(localStorage.getItem('shop_wishlist')) || []);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('featured'); 
  const [toast, setToast] = useState(null);
  
  // UI Panels Modals
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  
  // Coupon Checkout Processing
  const [couponInput, setCouponInput] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0); 
  const [activeCoupon, setActiveCoupon] = useState('');
  const [checkoutStep, setCheckoutStep] = useState(1);

  // Sync LocalStorage Pipelines
  useEffect(() => { localStorage.setItem('shop_cart', JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem('shop_wishlist', JSON.stringify(wishlist)); }, [wishlist]);

  // --- Notification Toast Dispatcher ---
  const triggerToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  };

  // --- Cart Workflow Orchestration ---
  const addToCart = (product) => {
    const cartItem = cart.find(item => item.id === product.id);
    if (cartItem && cartItem.quantity >= product.stock) {
      triggerToast(`Sorry, only ${product.stock} units available in inventory!`, 'error');
      return;
    }

    setCart(prev => {
      if (cartItem) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    triggerToast(`${product.name} appended into cart.`);
  };

  const updateQuantity = (id, change) => {
    const targetItem = cart.find(item => item.id === id);
    if (change > 0 && targetItem.quantity >= targetItem.stock) {
      triggerToast(`Max stock structural limit reached!`, 'error');
      return;
    }
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const nextQty = item.quantity + change;
        return nextQty > 0 ? { ...item, quantity: nextQty } : null;
      }
      return item;
    }).filter(Boolean));
  };

  // --- Wishlist Handler ---
  const toggleWishlist = (product) => {
    setWishlist(prev => {
      const exists = prev.some(item => item.id === product.id);
      if (exists) {
        triggerToast(`Removed ${product.name} from Wishlist`, 'info');
        return prev.filter(item => item.id !== product.id);
      }
      triggerToast(`Saved ${product.name} to Wishlist!`);
      return [...prev, product];
    });
  };

  // --- Coupon Processor ---
  const applyPromoCode = (e) => {
    e.preventDefault();
    const code = couponInput.trim().toUpperCase();
    if (VALID_COUPONS[code] !== undefined) {
      setAppliedDiscount(VALID_COUPONS[code]);
      setActiveCoupon(code);
      triggerToast(`Promo Code "${code}" injected successfully!`);
    } else {
      triggerToast('Invalid or expired coupon matrix routing', 'error');
    }
    setCouponInput('');
  };

  // --- Filter and Sorting Execution ---
  const processedProducts = PRODUCTS.filter(prod => {
    const matchStr = prod.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCategory === 'All' || prod.category === selectedCategory;
    return matchStr && matchCat;
  }).sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    return a.id - b.id; // Featured default fallback
  });

  const rawSubtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const discountAmount = rawSubtotal * appliedDiscount;
  const finalTotalAmount = rawSubtotal - discountAmount;
  const globalCartUnits = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
      
      {/* --- Micro Toast Engine --- */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-xl text-white font-medium text-sm flex items-center gap-2 animate-bounce ${
          toast.type === 'error' ? 'bg-rose-600' : toast.type === 'info' ? 'bg-amber-500' : 'bg-emerald-600'
        }`}>
          {toast.type === 'error' ? '⚠️' : '✨'} {toast.message}
        </div>
      )}

      {/* --- Global Utility Header --- */}
      <nav className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-200 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <span className="text-xl font-black tracking-tight text-indigo-600">NEXUS.PRO</span>
          <div className="flex items-center gap-4">
            <button onClick={() => setIsWishlistOpen(true)} className="relative p-2.5 bg-slate-100 hover:bg-slate-200 rounded-full transition-all">
              ❤️ {wishlist.length > 0 && <span className="absolute -top-1 -right-1 bg-rose-500 h-3 w-3 rounded-full" />}
            </button>
            <button onClick={() => setIsCartOpen(true)} className="relative p-2.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-full transition-all font-bold">
              🛒 ({globalCartUnits})
            </button>
          </div>
        </div>
      </nav>

      {/* --- Core View Grid Layout --- */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Advanced Matrix Filtering Pipeline Control Bar */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-8 flex flex-col lg:flex-row gap-4 items-center justify-between">
          <input
            type="text"
            placeholder="Search catalog architecture..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full lg:w-96 px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
          />
          <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto justify-end">
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-xl bg-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="featured">Featured Engine</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Top Rated Metrics</option>
            </select>
            <div className="flex gap-1.5 overflow-x-auto">
              {['All', 'Accessories', 'Electronics', 'Home & Living'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    selectedCategory === cat ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* --- Product Grid Core --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {processedProducts.map(prod => {
            const isInWish = wishlist.some(w => w.id === prod.id);
            return (
              <div key={prod.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col justify-between">
                <div className="relative overflow-hidden">
                  <img src={prod.image} alt={prod.name} className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500" />
                  <button 
                    onClick={() => toggleWishlist(prod)} 
                    className="absolute top-3 right-3 bg-white/90 backdrop-blur p-2 rounded-full shadow-md text-sm hover:scale-110 transition-transform"
                  >
                    {isInWish ? '❤️' : '🤍'}
                  </button>
                  {prod.stock <= 4 && (
                    <span className="absolute bottom-3 left-3 bg-rose-500 text-white text-[10px] uppercase tracking-widest font-extrabold px-2 py-1 rounded-md">
                      Only {prod.stock} Left!
                    </span>
                  )}
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center text-xs font-bold text-indigo-600 tracking-wider uppercase">
                      <span>{prod.category}</span>
                      <span className="text-amber-500">⭐ {prod.rating}</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mt-2 line-clamp-1">{prod.name}</h3>
                  </div>
                  <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-100">
                    <span className="text-2xl font-black text-slate-900">${prod.price}</span>
                    <button
                      onClick={() => addToCart(prod)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-lg shadow-indigo-100"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* --- Shared Module Drawer Framework (Cart Layout) --- */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
          <div className="absolute inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl flex flex-col animate-slide-in">
            <div className="p-5 border-b flex items-center justify-between bg-slate-50">
              <h2 className="text-lg font-black tracking-tight">Shopping Core Cart</h2>
              <button onClick={() => setIsCartOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-16 text-slate-400">Cart processing array is empty.</div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="flex gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-slate-900 truncate">{item.name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">${item.price} each</p>
                      <div className="flex items-center gap-3 mt-2">
                        <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 flex items-center justify-center border rounded bg-white text-xs font-bold hover:bg-slate-100">-</button>
                        <span className="text-sm font-bold">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 flex items-center justify-center border rounded bg-white text-xs font-bold hover:bg-slate-100">+</button>
                      </div>
                    </div>
                    <button onClick={() => setCart(prev => prev.filter(p => p.id !== item.id))} className="text-xs text-rose-500 font-bold self-start hover:underline">Delete</button>
                  </div>
                ))
              )}
            </div>
            {cart.length > 0 && (
              <div className="p-5 border-t bg-white shadow-inner">
                <div className="flex justify-between font-bold text-base mb-4">
                  <span>Subtotal Matrix:</span>
                  <span>${rawSubtotal.toFixed(2)}</span>
                </div>
                <button
                  onClick={() => { setIsCartOpen(false); setIsCheckingOut(true); setCheckoutStep(1); }}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-lg transition text-center text-sm tracking-wide"
                >
                  Initialize Secure Checkout
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- Wishlist Modal View Panel --- */}
      {isWishlistOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsWishlistOpen(false)} />
          <div className="absolute inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl flex flex-col">
            <div className="p-5 border-b flex items-center justify-between">
              <h2 className="text-lg font-black text-rose-600">Saved Wishlist ({wishlist.length})</h2>
              <button onClick={() => setIsWishlistOpen(false)} className="text-slate-400">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {wishlist.length === 0 ? (
                <div className="text-center py-12 text-slate-400">No items bookmarked yet.</div>
              ) : (
                wishlist.map(item => (
                  <div key={item.id} className="flex items-center justify-between gap-4 border-b pb-3">
                    <div className="flex items-center gap-3">
                      <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-lg" />
                      <div>
                        <h4 className="font-bold text-xs truncate w-36">{item.name}</h4>
                        <p className="text-xs font-black text-slate-700">${item.price}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { addToCart(item); toggleWishlist(item); }} className="px-2.5 py-1.5 bg-indigo-600 text-white text-[10px] font-bold rounded-lg">Move to Cart</button>
                      <button onClick={() => toggleWishlist(item)} className="text-xs text-slate-400">✕</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- Checkout Control Flow Engine --- */}
      {isCheckingOut && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl relative">
            {checkoutStep === 1 ? (
              <div>
                <h3 className="text-xl font-black tracking-tight mb-4">Enterprise Order Validation</h3>
                
                {/* Embedded Discount Voucher Application Row */}
                <form onSubmit={applyPromoCode} className="flex gap-2 mb-6 p-3 bg-slate-50 border rounded-2xl">
                  <input
                    type="text"
                    placeholder="Enter Coupon (e.g. SUPER10, NEXUS20)"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    className="flex-1 bg-white border px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider outline-none focus:border-indigo-500"
                  />
                  <button type="submit" className="bg-slate-900 text-white px-4 py-1.5 rounded-xl text-xs font-bold hover:bg-black transition">Apply</button>
                </form>

                <div className="space-y-2 border-b pb-4 mb-4 text-xs text-slate-600">
                  <div className="flex justify-between"><span>Subtotal:</span><span className="font-bold">${rawSubtotal.toFixed(2)}</span></div>
                  {activeCoupon && <div className="flex justify-between text-emerald-600"><span>Promo Discount ({activeCoupon}):</span><span className="font-bold">-${discountAmount.toFixed(2)}</span></div>}
                  <div className="flex justify-between text-sm text-slate-900 font-black pt-2 border-t"><span>Total Amount Due:</span><span>${finalTotalAmount.toFixed(2)}</span></div>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); setCheckoutStep(2); setCart([]); setAppliedDiscount(0); setActiveCoupon(''); }} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Full Delivery Name</label>
                    <input required type="text" className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Shipping Destination Address</label>
                    <input required type="text" className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setIsCheckingOut(false)} className="w-1/2 border py-2.5 rounded-xl text-xs font-bold hover:bg-slate-50">Abort</button>
                    <button type="submit" className="w-1/2 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-xs font-bold shadow-md shadow-indigo-100">Authorize Dispatch</button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">✓</div>
                <h3 className="text-2xl font-black text-slate-900">Transaction Complete</h3>
                <p className="text-xs text-slate-500 mt-2 max-w-sm mx-auto">Your order has been authorized. The reactive state engine cache registers clean slate clearance.</p>
                <button
                  onClick={() => setIsCheckingOut(false)}
                  className="mt-6 bg-slate-900 text-white px-6 py-2.5 rounded-xl text-xs font-bold tracking-wide hover:bg-black"
                >
                  Return to Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
