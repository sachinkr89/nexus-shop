import React, { useState, useEffect } from 'react';

// Mock Product Data
const PRODUCTS = [
  { id: 1, name: 'Minimalist Leather Watch', price: 129, category: 'Accessories', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500' },
  { id: 2, name: 'Wireless Noise-Canceling Headphones', price: 299, category: 'Electronics', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500' },
  { id: 3, name: 'Ergonomic Ceramic Mug', price: 24, category: 'Home & Living', image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500' },
  { id: 4, name: 'Premium Leather Backpack', price: 189, category: 'Accessories', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500' },
  { id: 5, name: 'Mechanical RGB Keyboard', price: 95, category: 'Electronics', image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500' },
  { id: 6, name: 'Scented Soy Candle Set', price: 35, category: 'Home & Living', image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=500' },
];

export default function App() {
  // --- State Management ---
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('shop_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1); // 1: Shipping, 2: Success

  // Sync Cart with LocalStorage
  useEffect(() => {
    localStorage.setItem('shop_cart', JSON.stringify(cart));
  }, [cart]);

  // --- Cart Actions ---
  const addToCart = (product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id, amount) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + amount;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (id) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  // --- Filter Logic ---
  const filteredProducts = PRODUCTS.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* --- Navbar --- */}
      <nav className="sticky top-0 bg-white border-b border-gray-200 z-40 project-navbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight text-indigo-600">NEXUS.SHOP</h1>
          
          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors duration-200"
          >
            🛒
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-indigo-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* --- Main Content Layout --- */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters Segment */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 items-center justify-between">
          <input
            type="text"
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-80 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          />
          <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            {['All', 'Accessories', 'Electronics', 'Home & Living'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors duration-150 ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* --- Product Grid --- */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No items found matching criteria.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
                <img src={product.image} alt={product.name} className="w-full h-56 object-cover bg-gray-100" />
                <div className="p-5">
                  <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">{product.category}</span>
                  <h3 className="text-lg font-medium text-gray-900 mt-1">{product.name}</h3>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xl font-bold text-gray-900">${product.price}</span>
                    <button
                      onClick={() => addToCart(product)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors duration-150"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* --- Cart Sidebar Drawer --- */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
          <div className="absolute inset-y-0 right-0 max-w-md w-full bg-white shadow-xl flex flex-col">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-bold">Shopping Cart ({cartCount})</h2>
              <button onClick={() => setIsCartOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-12 text-gray-400">Your cart is empty.</div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 border-b border-gray-100 pb-4">
                    <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-md bg-gray-50" />
                    <div className="flex-1">
                      <h4 className="font-medium text-sm text-gray-900">{item.name}</h4>
                      <p className="text-gray-500 text-sm mt-0.5">${item.price}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <button onClick={() => updateQuantity(item.id, -1)} className="px-2 py-0.5 border border-gray-300 rounded bg-gray-50 hover:bg-gray-100 text-xs">-</button>
                        <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="px-2 py-0.5 border border-gray-300 rounded bg-gray-50 hover:bg-gray-100 text-xs">+</button>
                      </div>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="text-red-500 text-sm hover:underline">Remove</button>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="flex justify-between font-semibold text-lg text-gray-900 mb-4">
                  <span>Total Amount:</span>
                  <span>${cartTotal}</span>
                </div>
                <button
                  onClick={() => { setIsCartOpen(false); setIsCheckingOut(true); setCheckoutStep(1); }}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-colors duration-150 text-center"
                >
                  Proceed to Checkout
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- Checkout Modal Flow --- */}
      {isCheckingOut && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsCheckingOut(false)} />
          <div className="bg-white rounded-2xl p-6 max-w-md w-full relative z-10 shadow-2xl">
            {checkoutStep === 1 ? (
              <div>
                <h3 className="text-xl font-bold mb-4">Shipping Information</h3>
                <form onSubmit={(e) => { e.preventDefault(); setCheckoutStep(2); setCart([]); }} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name</label>
                    <input required type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Delivery Address</label>
                    <input required type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                  <div className="bg-indigo-50 p-3 rounded-lg flex justify-between items-center text-sm mb-2">
                    <span className="text-gray-600">Total Due Now:</span>
                    <span className="font-bold text-indigo-700 text-base">${cartTotal}</span>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setIsCheckingOut(false)} className="w-1/2 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 font-medium">Cancel</button>
                    <button type="submit" className="w-1/2 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 font-semibold shadow-sm">Place Order</button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="text-4xl mb-3">🎉</div>
                <h3 className="text-2xl font-bold text-gray-900">Order Placed!</h3>
                <p className="text-gray-500 text-sm mt-2">Thank you for your purchase. Your local mock dashboard state has cleared successfully.</p>
                <button
                  onClick={() => setIsCheckingOut(false)}
                  className="mt-6 bg-gray-900 hover:bg-black text-white px-6 py-2 rounded-lg font-medium text-sm transition-colors duration-150"
                >
                  Return to Store
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

