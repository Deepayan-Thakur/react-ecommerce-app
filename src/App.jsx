import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShoppingBag, 
  Menu, 
  X, 
  Star, 
  ShoppingCart, 
  Trash2, 
  ArrowLeft, 
  CreditCard, 
  CheckCircle, 
  Instagram, 
  Facebook, 
  Twitter, 
  Truck, 
  ShieldCheck, 
  RefreshCcw, 
  Mail,
  User,
  Package,
  LogOut,
  Clock,
  MapPin
} from 'lucide-react';

// --- FIREBASE IMPORTS ---
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  addDoc,
  onSnapshot
} from 'firebase/firestore';

// --- FIREBASE CONFIGURATION & SETUP ---
// TODO: PASTE YOUR FIREBASE CONFIGURATION HERE
const firebaseConfig = {
  apiKey: "AIzaSyCH4cBvnAPeoQDS9eeaZXCp7forADfykOY",
  authDomain: "e-website-ecomerce.firebaseapp.com",
  projectId: "e-website-ecomerce",
  storageBucket: "e-website-ecomerce.firebasestorage.app",
  messagingSenderId: "680022332036",
  appId: "1:680022332036:web:f435b0545d1f47811f28d1"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- SAMPLE DATA FOR SEEDING ---
const INITIAL_PRODUCTS = [
  {
    id: 'h1',
    category: 'Hoodies',
    name: 'Urban Street Oversized Hoodie',
    price: 49.99,
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=800',
    description: 'Premium heavyweight cotton blend with a relaxed boxy fit. Perfect for the modern streetwear aesthetic.',
    sizes: ['S', 'M', 'L', 'XL'],
    rating: 4.8
  },
  {
    id: 'h2',
    category: 'Hoodies',
    name: 'Midnight Black Fleece',
    price: 54.99,
    image: 'https://images.unsplash.com/photo-1578768079052-aa76e52ff62e?auto=format&fit=crop&q=80&w=800',
    description: 'Ultra-soft fleece lining keeps you warm. Features minimal branding and reinforced stitching.',
    sizes: ['M', 'L', 'XL', 'XXL'],
    rating: 4.9
  },
  {
    id: 'h3',
    category: 'Hoodies',
    name: 'Pastel Essentials Hoodie',
    price: 45.00,
    image: 'https://images.unsplash.com/photo-1588117260148-447884962645?auto=format&fit=crop&q=80&w=800',
    description: 'Soft pastel tones for a lighter look. Breathable fabric suitable for all seasons.',
    sizes: ['XS', 'S', 'M', 'L'],
    rating: 4.6
  },
  {
    id: 'j1',
    category: 'Jackets',
    name: 'Classic Moto Leather Jacket',
    price: 189.99,
    image: 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?auto=format&fit=crop&q=80&w=800',
    description: 'Genuine full-grain leather with asymmetric zip closure and quilted shoulder details.',
    sizes: ['S', 'M', 'L', 'XL'],
    rating: 5.0
  },
  {
    id: 'j2',
    category: 'Jackets',
    name: 'Vintage Aviator Bomber',
    price: 149.99,
    image: 'https://images.unsplash.com/photo-1551028919-ac7bcb7d7162?auto=format&fit=crop&q=80&w=800',
    description: 'Inspired by classic aviation gear. Faux fur collar (detachable) and ribbed cuffs.',
    sizes: ['M', 'L', 'XL'],
    rating: 4.7
  },
  {
    id: 'j3',
    category: 'Jackets',
    name: 'Denim Sherpa Trucker',
    price: 89.99,
    image: 'https://images.unsplash.com/photo-1616423664074-907f885304e2?auto=format&fit=crop&q=80&w=800',
    description: 'Rugged denim exterior with warm sherpa lining. A timeless classic for layering.',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    rating: 4.5
  },
  {
    id: 't1',
    category: 'T-Shirts',
    name: 'Signature Box Logo Tee',
    price: 29.99,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800',
    description: '100% organic cotton. Features our signature embroidered box logo on the chest.',
    sizes: ['S', 'M', 'L', 'XL'],
    rating: 4.4
  },
  {
    id: 't2',
    category: 'T-Shirts',
    name: 'Abstract Graphic Print',
    price: 34.99,
    image: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&q=80&w=800',
    description: 'Limited edition graphic print designed by local artists. High-quality screen print.',
    sizes: ['S', 'M', 'L'],
    rating: 4.8
  }
];

// --- MAIN COMPONENT ---
export default function App() {
  // Views: home, category, product, cart, checkout, success, login, signup, account, orders
  const [view, setView] = useState('home'); 
  
  // Data State
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  
  // UI State
  const [activeCategory, setActiveCategory] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);
  const [authError, setAuthError] = useState('');

  // --- AUTH & DATA LOADING ---
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Simple auth check for local use
        await signInAnonymously(auth);
      } catch (error) {
        console.error("Auth error:", error);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // --- SEED & FETCH PRODUCTS ---
  useEffect(() => {
    if (!user || !user.uid) return;

    // Fetch Products - UPDATED PATH FOR LOCAL USE
    // Using simple root collection 'products' for easier local management
    const productsRef = collection(db, 'products'); 
    const unsubscribeProducts = onSnapshot(productsRef, (snapshot) => {
      if (snapshot.empty) {
        console.log("Seeding Database...");
        INITIAL_PRODUCTS.forEach(async (p) => {
          await setDoc(doc(productsRef, p.id), p);
        });
      } else {
        const fetchedProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(fetchedProducts);
        setLoading(false);
      }
    }, (error) => {
      console.error("Products listener error:", error);
      setLoading(false);
    });

    // Fetch Orders (Only if not anonymous) - UPDATED PATH FOR LOCAL USE
    let unsubscribeOrders = () => {};
    if (user && !user.isAnonymous) {
        // Using nested collection under users for easier local management
        const ordersRef = collection(db, 'users', user.uid, 'orders');
        unsubscribeOrders = onSnapshot(ordersRef, (snapshot) => {
            const fetchedOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            // Sort in memory since we can't use orderBy in simple queries
            fetchedOrders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            setOrders(fetchedOrders);
        }, (error) => {
          console.error("Orders listener error:", error);
        });
    } else {
        setOrders([]);
    }

    return () => {
        unsubscribeProducts();
        unsubscribeOrders();
    };
  }, [user]);

  // --- CART LOGIC ---
  const addToCart = (product, size) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id && item.selectedSize === size);
      if (existing) {
        return prev.map(item => 
          (item.id === product.id && item.selectedSize === size)
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { ...product, selectedSize: size, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId, size) => {
    setCart(prev => prev.filter(item => !(item.id === itemId && item.selectedSize === size)));
  };

  const updateQuantity = (itemId, size, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === itemId && item.selectedSize === size) {
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }
      return item;
    }));
  };

  const cartTotal = useMemo(() => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [cart]);

  // --- NAVIGATION HELPERS ---
  const goHome = () => {
    setView('home');
    setActiveCategory(null);
    setSelectedProduct(null);
    window.scrollTo(0, 0);
  };

  const goToCategory = (cat) => {
    setActiveCategory(cat);
    setView('category');
    window.scrollTo(0, 0);
  };

  const goToProduct = (product) => {
    setSelectedProduct(product);
    setView('product');
    window.scrollTo(0, 0);
  };

  const handleLogout = async () => {
      await signOut(auth);
      setView('home');
      setCart([]); // Clear cart on logout
  };

  // --- AUTH COMPONENT ---
  const AuthView = ({ mode }) => { // mode is 'login' or 'signup'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [localLoading, setLocalLoading] = useState(false);

    const handleAuth = async (e) => {
        e.preventDefault();
        setLocalLoading(true);
        setAuthError('');
        try {
            if (mode === 'signup') {
                await createUserWithEmailAndPassword(auth, email, password);
                // We could update profile here, but for now we rely on user.email
            } else {
                await signInWithEmailAndPassword(auth, email, password);
            }
            setLocalLoading(false);
            setView('account'); // Go to account on success
        } catch (err) {
            setLocalLoading(false);
            console.error(err);
            setAuthError(err.message.replace('Firebase: ', ''));
        }
    };

    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
            <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
                    <p className="text-gray-500 mt-2">
                        {mode === 'login' ? 'Sign in to access your orders' : 'Join LuxeWear for exclusive access'}
                    </p>
                </div>

                {authError && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm">
                        {authError}
                    </div>
                )}

                <form onSubmit={handleAuth} className="space-y-6">
                    {mode === 'signup' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Full Name</label>
                            <input 
                                type="text" 
                                required
                                className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="John Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email Address</label>
                        <input 
                            type="email" 
                            required
                            className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input 
                            type="password" 
                            required
                            className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button 
                        type="submit"
                        disabled={localLoading}
                        className="w-full bg-indigo-600 text-white p-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors flex justify-center"
                    >
                        {localLoading ? <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span> : (mode === 'login' ? 'Sign In' : 'Create Account')}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-600">
                    {mode === 'login' ? (
                        <>Don't have an account? <button onClick={() => {setAuthError(''); setView('signup');}} className="text-indigo-600 font-bold hover:underline">Sign up</button></>
                    ) : (
                        <>Already have an account? <button onClick={() => {setAuthError(''); setView('login');}} className="text-indigo-600 font-bold hover:underline">Log in</button></>
                    )}
                </div>
            </div>
        </div>
    );
  };

  // --- ACCOUNT COMPONENT ---
  const AccountView = () => {
      if (!user || user.isAnonymous) {
          // If accessing account view while anonymous, redirect to login
          // (Though standard flow prevents this via UI)
          return <AuthView mode="login" />;
      }

      return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
              <div className="flex items-center justify-between mb-8">
                  <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
                  <button onClick={handleLogout} className="flex items-center text-red-600 hover:text-red-800 font-medium">
                      <LogOut size={18} className="mr-2" /> Sign Out
                  </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* User Profile Card */}
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
                      <div className="flex items-center space-x-4 mb-6">
                          <div className="bg-indigo-100 p-4 rounded-full">
                              <User size={32} className="text-indigo-600" />
                          </div>
                          <div>
                              <p className="font-bold text-gray-900">{user.email}</p>
                              <p className="text-sm text-gray-500">Member since {new Date(user.metadata.creationTime).toLocaleDateString()}</p>
                          </div>
                      </div>
                      <div className="border-t border-gray-100 pt-4">
                        <p className="text-sm text-gray-500 mb-2">Account Status</p>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                        </span>
                      </div>
                  </div>

                  {/* Quick Actions / Stats */}
                  <div className="md:col-span-2 space-y-8">
                      {/* Recent Orders Preview */}
                      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                          <div className="flex items-center justify-between mb-6">
                              <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
                              <button onClick={() => setView('orders')} className="text-indigo-600 font-medium hover:underline text-sm">
                                  View All History
                              </button>
                          </div>

                          {orders.length === 0 ? (
                              <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                                  <Package size={32} className="mx-auto mb-2 opacity-50" />
                                  <p>You haven't placed any orders yet.</p>
                                  <button onClick={goHome} className="mt-4 text-indigo-600 font-medium hover:underline">Start Shopping</button>
                              </div>
                          ) : (
                              <div className="space-y-4">
                                  {orders.slice(0, 2).map((order) => (
                                      <div key={order.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                                          <div>
                                              <p className="font-bold text-gray-900">Order #{order.id.slice(-6).toUpperCase()}</p>
                                              <p className="text-sm text-gray-500">{order.items.length} items • ${order.total.toFixed(2)}</p>
                                          </div>
                                          <div className="text-right">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 
                                                order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {order.status}
                                            </span>
                                            <p className="text-xs text-gray-400 mt-1">{new Date(order.timestamp).toLocaleDateString()}</p>
                                          </div>
                                      </div>
                                  ))}
                              </div>
                          )}
                      </div>
                  </div>
              </div>
          </div>
      );
  };

  // --- ORDERS LIST COMPONENT ---
  const OrdersListView = () => {
    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <button onClick={() => setView('account')} className="text-gray-500 hover:text-indigo-600 flex items-center mb-6">
                <ArrowLeft size={20} className="mr-1" /> Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Order History</h1>

            {orders.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-xl">
                    <Package size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 text-lg mb-6">No orders found.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map((order) => (
                        <div key={order.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex flex-wrap gap-4 justify-between items-center">
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Order Placed</p>
                                    <p className="text-sm font-medium text-gray-900">{new Date(order.timestamp).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Total</p>
                                    <p className="text-sm font-medium text-gray-900">${order.total.toFixed(2)}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Ship To</p>
                                    <p className="text-sm font-medium text-gray-900">{order.name}</p>
                                </div>
                                <div className="flex-grow md:flex-grow-0 text-right">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Order #</p>
                                    <p className="text-sm font-medium text-gray-900">{order.id.slice(-8).toUpperCase()}</p>
                                </div>
                            </div>
                            
                            <div className="p-6">
                                <div className="flex items-center mb-6">
                                    <div className={`p-2 rounded-full mr-3 ${
                                        order.status === 'Delivered' ? 'bg-green-100 text-green-600' : 'bg-indigo-100 text-indigo-600'
                                    }`}>
                                        {order.status === 'Delivered' ? <CheckCircle size={20} /> : <Clock size={20} />}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">Status: {order.status}</h3>
                                        <p className="text-sm text-gray-500">
                                            {order.status === 'Processing' ? 'We are preparing your order.' : 
                                             order.status === 'Shipped' ? 'Your order is on the way.' : 'Package delivered.'}
                                        </p>
                                    </div>
                                </div>

                                <ul className="divide-y divide-gray-100">
                                    {order.items.map((item, idx) => (
                                        <li key={idx} className="py-4 flex items-center">
                                            <img src={item.image} alt={item.name} className="h-16 w-16 w- object-cover rounded-md border border-gray-200" />
                                            <div className="ml-4 flex-1">
                                                <p className="text-sm font-medium text-gray-900">{item.name}</p>
                                                <p className="text-sm text-gray-500">Size: {item.selectedSize} | Qty: {item.quantity}</p>
                                            </div>
                                            <p className="text-sm font-medium text-gray-900">${item.price}</p>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
  };

  // --- STANDARD VIEWS (Navbar, Hero, etc.) ---

  const Navbar = () => (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 -ml-2 mr-2 md:hidden">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div onClick={goHome} className="cursor-pointer flex flex-col items-start">
              <span className="text-2xl font-bold tracking-tighter text-gray-900 uppercase">LUXE<span className="text-indigo-600">WEAR</span></span>
              <span className="text-[0.6rem] tracking-widest text-gray-500 uppercase -mt-1">Premium Showroom</span>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <button onClick={goHome} className={`text-sm font-medium hover:text-indigo-600 ${view === 'home' ? 'text-indigo-600' : 'text-gray-700'}`}>Home</button>
            <button onClick={() => goToCategory('Hoodies')} className="text-sm font-medium text-gray-700 hover:text-indigo-600">Hoodies</button>
            <button onClick={() => goToCategory('Jackets')} className="text-sm font-medium text-gray-700 hover:text-indigo-600">Jackets</button>
            <button onClick={() => goToCategory('T-Shirts')} className="text-sm font-medium text-gray-700 hover:text-indigo-600">T-Shirts</button>
          </div>

          <div className="flex items-center space-x-4">
            {/* Account Icon */}
            <button 
                onClick={() => {
                    if (user && !user.isAnonymous) {
                        setView('account');
                    } else {
                        setView('login');
                    }
                }} 
                className={`p-2 transition-colors ${['account', 'orders', 'login', 'signup'].includes(view) ? 'text-indigo-600' : 'text-gray-700 hover:text-indigo-600'}`}
            >
                <User size={24} />
            </button>

            {/* Cart Icon */}
            <button onClick={() => setView('cart')} className="relative p-2 text-gray-700 hover:text-indigo-600 transition-colors">
              <ShoppingBag size={24} />
              {cart.length > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-indigo-600 rounded-full">
                  {cart.reduce((a, b) => a + b.quantity, 0)}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <button onClick={() => { goToCategory('Hoodies'); setIsMenuOpen(false); }} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 w-full text-left">Hoodies</button>
            <button onClick={() => { goToCategory('Jackets'); setIsMenuOpen(false); }} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 w-full text-left">Jackets</button>
            <button onClick={() => { goToCategory('T-Shirts'); setIsMenuOpen(false); }} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 w-full text-left">T-Shirts</button>
            <button onClick={() => { setView(user && !user.isAnonymous ? 'account' : 'login'); setIsMenuOpen(false); }} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 w-full text-left">My Account</button>
          </div>
        </div>
      )}
    </nav>
  );

  const Hero = () => (
    <div className="relative bg-gray-900 overflow-hidden">
      <div className="absolute inset-0">
        <img 
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1600" 
          alt="Showroom" 
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/40 to-transparent"></div>
      </div>
      <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
          Redefine Your Style
        </h1>
        <p className="mt-6 text-xl text-gray-300 max-w-xl">
          Explore our exclusive collection of premium streetwear and classic fits. 
          Designed for comfort, engineered for style.
        </p>
        <div className="mt-10">
          <button 
            onClick={() => goToCategory('Hoodies')}
            className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg transition-all shadow-lg hover:shadow-indigo-500/30"
          >
            Shop Collection
          </button>
        </div>
      </div>
    </div>
  );

  const CategoryGrid = () => {
    const categories = [
      { name: 'Hoodies', img: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=600' },
      { name: 'Jackets', img: 'https://images.unsplash.com/photo-1551028919-ac7bcb7d7162?auto=format&fit=crop&q=80&w=600' },
      { name: 'T-Shirts', img: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=600' }
    ];

    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Shop by Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((cat) => (
            <div 
              key={cat.name} 
              onClick={() => goToCategory(cat.name)}
              className="group relative h-80 rounded-lg overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all duration-300"
            >
              <img src={cat.img} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <h3 className="text-3xl font-bold text-white tracking-wider border-b-2 border-transparent group-hover:border-white pb-1 transition-all">
                  {cat.name}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  };

  const ProductCard = ({ product }) => (
    <div 
      onClick={() => goToProduct(product)}
      className="group bg-white rounded-xl shadow-sm hover:shadow-lg overflow-hidden cursor-pointer transition-all duration-300 border border-gray-100"
    >
      <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200 xl:aspect-w-7 xl:aspect-h-8 relative h-72">
        <img 
          src={product.image} 
          alt={product.name} 
          className="h-full w-full object-cover object-center group-hover:opacity-75"
        />
        <div className="absolute bottom-4 right-4 bg-white p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
          <ShoppingBag size={20} className="text-gray-900" />
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-sm text-gray-500">{product.category}</h3>
        <div className="flex justify-between items-center mt-1">
          <h3 className="text-lg font-semibold text-gray-900 truncate pr-2">{product.name}</h3>
          <p className="text-lg font-bold text-indigo-600">${product.price}</p>
        </div>
        <div className="flex items-center mt-2 text-yellow-500">
          <Star size={14} fill="currentColor" />
          <span className="text-xs text-gray-500 ml-1">{product.rating} (42 reviews)</span>
        </div>
      </div>
    </div>
  );

  const ProductListView = () => {
    const filteredProducts = products.filter(p => p.category === activeCategory);
    
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center mb-8">
          <button onClick={goHome} className="text-gray-500 hover:text-indigo-600 flex items-center mr-4">
            <ArrowLeft size={20} className="mr-1" /> Home
          </button>
          <h2 className="text-3xl font-bold text-gray-900">{activeCategory}</h2>
        </div>
        
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 text-gray-500">No products found in this category.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredProducts.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    );
  };

  const ProductDetailView = () => {
    const [selectedSize, setSelectedSize] = useState('');
    
    if (!selectedProduct) return null;

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <button onClick={() => setView('category')} className="text-gray-500 hover:text-indigo-600 flex items-center mb-6">
          <ArrowLeft size={20} className="mr-1" /> Back to {selectedProduct.category}
        </button>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="rounded-2xl overflow-hidden bg-gray-100 shadow-sm">
            <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-cover" />
          </div>
          
          <div className="flex flex-col">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{selectedProduct.name}</h1>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-3xl font-bold text-indigo-600">${selectedProduct.price}</span>
              <div className="flex items-center bg-yellow-50 px-3 py-1 rounded-full">
                <Star size={16} className="text-yellow-500 mr-1" fill="currentColor" />
                <span className="text-sm font-medium text-yellow-700">{selectedProduct.rating} Rating</span>
              </div>
            </div>
            
            <p className="mt-6 text-gray-600 leading-relaxed text-lg">{selectedProduct.description}</p>
            
            <div className="mt-8">
              <h3 className="text-sm font-medium text-gray-900">Select Size</h3>
              <div className="grid grid-cols-4 gap-4 mt-3">
                {selectedProduct.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`py-3 text-sm font-bold rounded-md border ${
                      selectedSize === size
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-500'
                        : 'border-gray-200 text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-10 flex space-x-4">
              <button 
                onClick={() => {
                  if(!selectedSize) return alert("Please select a size");
                  addToCart(selectedProduct, selectedSize);
                }}
                className="flex-1 bg-indigo-600 border border-transparent rounded-lg py-4 px-8 flex items-center justify-center text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors shadow-lg shadow-indigo-200"
              >
                <ShoppingCart className="mr-2" size={20} /> Add to Cart
              </button>
            </div>
            
            <div className="mt-8 border-t border-gray-200 pt-8 grid grid-cols-2 gap-4">
              <div className="flex items-center text-gray-500 text-sm">
                <Truck className="mr-2" size={18} /> Free Shipping
              </div>
              <div className="flex items-center text-gray-500 text-sm">
                <ShieldCheck className="mr-2" size={18} /> Secure Payment
              </div>
              <div className="flex items-center text-gray-500 text-sm">
                <RefreshCcw className="mr-2" size={18} /> 30-Day Returns
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const CartView = () => (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
      
      {cart.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-xl">
          <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg mb-6">Your cart is empty.</p>
          <button onClick={goHome} className="text-indigo-600 font-medium hover:underline">Continue Shopping</button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {cart.map((item) => (
              <li key={`${item.id}-${item.selectedSize}`} className="p-6 flex flex-col sm:flex-row items-center">
                <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-md mb-4 sm:mb-0" />
                <div className="flex-1 sm:ml-6 text-center sm:text-left">
                  <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                  <p className="mt-1 text-sm text-gray-500">Size: {item.selectedSize} | Category: {item.category}</p>
                  <p className="mt-1 text-lg font-semibold text-indigo-600">${item.price}</p>
                </div>
                <div className="flex items-center mt-4 sm:mt-0">
                  <div className="flex items-center border border-gray-300 rounded-md">
                    <button onClick={() => updateQuantity(item.id, item.selectedSize, -1)} className="px-3 py-1 hover:bg-gray-100">-</button>
                    <span className="px-3 py-1 border-l border-r border-gray-300">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.selectedSize, 1)} className="px-3 py-1 hover:bg-gray-100">+</button>
                  </div>
                  <button onClick={() => removeFromCart(item.id, item.selectedSize)} className="ml-6 text-red-500 hover:text-red-700">
                    <Trash2 size={20} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <div className="bg-gray-50 p-6">
            <div className="flex justify-between items-center text-lg font-bold text-gray-900 mb-6">
              <span>Total</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-end">
              <button 
                onClick={() => setView('checkout')}
                className="w-full sm:w-auto bg-indigo-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-indigo-700 shadow-md transition-colors"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const CheckoutView = () => {
    const [loadingPay, setLoadingPay] = useState(false);
    const [formData, setFormData] = useState({
      name: '', email: user && !user.isAnonymous ? user.email : '', address: '', card: ''
    });

    const handlePayment = async (e) => {
      e.preventDefault();
      setLoadingPay(true);
      
      const currentOrder = {
        name: formData.name,
        email: formData.email,
        address: formData.address,
        items: [...cart],
        total: cartTotal,
        timestamp: new Date().toISOString(),
        status: 'Processing' // Initial status
      };
      
      try {
        // Save to Database (if user is logged in, use their ID. If anonymous, use anonymous ID)
        if (user) {
            // Using nested collection under users for easier local management
            await addDoc(collection(db, 'users', user.uid, 'orders'), currentOrder);
        }
        
        // Simulate Delay
        setTimeout(() => {
            setLoadingPay(false);
            setLastOrder(currentOrder);
            setCart([]);
            setView('success');
        }, 1500);

      } catch (err) {
          console.error("Order failed:", err);
          setLoadingPay(false);
          alert("Payment failed. Please try again.");
      }
    };

    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <button onClick={() => setView('cart')} className="text-gray-500 hover:text-indigo-600 flex items-center mb-6">
          <ArrowLeft size={20} className="mr-1" /> Back to Cart
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
        
        {(!user || user.isAnonymous) && (
             <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-lg mb-8 flex justify-between items-center">
                 <p className="text-sm text-indigo-800">Already have an account? Sign in to save this order to your history.</p>
                 <button onClick={() => setView('login')} className="text-indigo-600 text-sm font-bold hover:underline">Sign In</button>
             </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <form onSubmit={handlePayment} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input 
                required
                type="text" 
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-3 border focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="John Doe"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input 
                required
                type="email" 
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-3 border focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="john@example.com"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Shipping Address</label>
              <textarea 
                required
                rows={3}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-3 border focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="123 Street Name, City, Country"
                value={formData.address}
                onChange={e => setFormData({...formData, address: e.target.value})}
              />
            </div>
            
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Details (Test Mode)</h3>
              <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-md mb-4 text-sm text-yellow-800">
                Test Mode: Enter any dummy card number.
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Card Number</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CreditCard className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    required
                    type="text"
                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-3 border"
                    placeholder="4242 4242 4242 4242"
                    value={formData.card}
                    onChange={e => setFormData({...formData, card: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loadingPay}
              className="w-full bg-indigo-600 text-white p-4 rounded-lg font-bold text-lg hover:bg-indigo-700 shadow-lg transition-all flex justify-center items-center"
            >
              {loadingPay ? (
                <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></span>
              ) : null}
              {loadingPay ? 'Processing...' : `Pay $${cartTotal.toFixed(2)}`}
            </button>
          </form>

          <div className="bg-gray-50 p-6 rounded-lg h-fit">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>
            <ul className="space-y-4 mb-4">
              {cart.map(item => (
                <li key={`${item.id}-${item.selectedSize}`} className="flex justify-between text-sm">
                  <span className="text-gray-600">{item.name} (x{item.quantity})</span>
                  <span className="font-medium text-gray-900">${(item.price * item.quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <div className="border-t border-gray-200 pt-4 flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const SuccessView = () => {
    // Helper to generate mailto link for client-side "email"
    const generateMailto = () => {
      if (!lastOrder) return '#';
      
      const subject = encodeURIComponent("Your LuxeWear Order Receipt");
      const bodyText = `Thank you for your order, ${lastOrder.name}!\n\n` +
        `Order Date: ${new Date(lastOrder.timestamp).toLocaleDateString()}\n\n` +
        `Here is your summary:\n` +
        lastOrder.items.map(i => `- ${i.name} (${i.selectedSize}) x${i.quantity}: $${(i.price * i.quantity).toFixed(2)}`).join('\n') +
        `\n\nTotal Paid: $${lastOrder.total.toFixed(2)}\n\n` +
        `Shipping Address:\n${lastOrder.address}\n\n` +
        `We hope to see you again soon!\nLuxeWear Team`;
        
      return `mailto:${lastOrder.email}?subject=${subject}&body=${encodeURIComponent(bodyText)}`;
    };

    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="bg-green-100 p-4 rounded-full mb-6">
          <CheckCircle size={64} className="text-green-600" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Order Successful!</h1>
        <p className="text-xl text-gray-600 max-w-md mb-2">
          Thank you for your purchase. Your order has been confirmed.
        </p>
        
        {lastOrder && (
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-8 max-w-md w-full">
            <p className="text-blue-800 text-sm mb-3">
              We have sent a confirmation receipt to <strong>{lastOrder.email}</strong>
            </p>
            <a 
              href={generateMailto()}
              className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-semibold hover:underline"
            >
              <Mail size={16} className="mr-1" /> Open Receipt in Email Client
            </a>
          </div>
        )}

        <div className="flex space-x-4">
            <button 
                onClick={goHome}
                className="bg-gray-100 text-gray-800 px-8 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
                Continue Shopping
            </button>
            {user && !user.isAnonymous && (
                <button 
                    onClick={() => setView('orders')}
                    className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-indigo-700 shadow-md transition-colors"
                >
                    View Order Status
                </button>
            )}
        </div>
      </div>
    );
  };

  const Footer = () => (
    <footer className="bg-gray-900 text-white py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-xl font-bold mb-4 uppercase">LuxeWear</h3>
          <p className="text-gray-400 text-sm">Premium clothing for the modern individual. Quality, comfort, and style in every stitch.</p>
        </div>
        <div>
          <h4 className="font-bold mb-4">Shop</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><button onClick={() => goToCategory('Hoodies')} className="hover:text-white">Hoodies</button></li>
            <li><button onClick={() => goToCategory('Jackets')} className="hover:text-white">Jackets</button></li>
            <li><button onClick={() => goToCategory('T-Shirts')} className="hover:text-white">T-Shirts</button></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-4">Support</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><a href="#" className="hover:text-white">Contact Us</a></li>
            <li><a href="#" className="hover:text-white">FAQs</a></li>
            <li><a href="#" className="hover:text-white">Shipping</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-4">Follow Us</h4>
          <div className="flex space-x-4 text-gray-400">
            <Instagram className="hover:text-white cursor-pointer" size={20} />
            <Facebook className="hover:text-white cursor-pointer" size={20} />
            <Twitter className="hover:text-white cursor-pointer" size={20} />
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
        © 2025 LuxeWear Inc. All rights reserved.
      </div>
    </footer>
  );

  // --- RENDERER ---
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
        <p className="mt-4 text-gray-500 font-medium animate-pulse">Loading Showroom...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {view === 'home' && (
          <>
            <Hero />
            <CategoryGrid />
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-gray-100">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Featured Collection</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {products.slice(0, 4).map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            </section>
          </>
        )}
        {view === 'category' && <ProductListView />}
        {view === 'product' && <ProductDetailView />}
        {view === 'cart' && <CartView />}
        {view === 'checkout' && <CheckoutView />}
        {view === 'success' && <SuccessView />}
        {(view === 'login' || view === 'signup') && <AuthView mode={view} />}
        {view === 'account' && <AccountView />}
        {view === 'orders' && <OrdersListView />}
      </main>
      <Footer />
    </div>
  );
}