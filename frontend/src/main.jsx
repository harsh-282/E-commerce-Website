import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Link, Navigate, Route, Routes, useNavigate, useParams, useSearchParams } from "react-router-dom";
import axios from "axios";
import { Gift, ShoppingBag, User, Search, Trash2, Plus, Minus } from "lucide-react";
import "./styles.css";

const apiRoot = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || "https://e-commerce-website-a444.vercel.app";
const API = axios.create({
  baseURL: apiRoot.endsWith("/api") ? apiRoot : `${apiRoot.replace(/\/$/, "")}/api`
});
const categories = ["Birthday Gifts", "Personalized Gifts", "Gift Hampers", "Home Decor", "Soft Toys"];
const AppContext = createContext();

function Provider({ children }) {
  const [auth, setAuth] = useState(JSON.parse(localStorage.getItem("giftify_user") || "null"));
  const [cart, setCart] = useState(null);
  API.interceptors.request.use((config) => {
    if (auth?.token) config.headers.Authorization = `Bearer ${auth.token}`;
    return config;
  });
  const saveAuth = (user) => {
    setAuth(user);
    user ? localStorage.setItem("giftify_user", JSON.stringify(user)) : localStorage.removeItem("giftify_user");
  };
  const loadCart = async () => {
    if (!auth) return setCart(null);
    const { data } = await API.get("/cart");
    setCart(data);
  };
  useEffect(() => { loadCart().catch(() => setCart(null)); }, [auth]);
  const value = useMemo(() => ({ auth, saveAuth, cart, loadCart }), [auth, cart]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

const useApp = () => useContext(AppContext);
const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

function Layout() {
  const { auth, saveAuth, cart } = useApp();
  const count = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  return (
    <>
      <header className="nav">
        <Link className="brand" to="/"><Gift /> <span>Giftify</span></Link>
        <nav>
          <Link to="/products">Shop</Link><Link to="/contact">Contact</Link>
          {auth && <Link to="/orders">My Orders</Link>}
        </nav>
        <div className="nav-actions">
          <Link className="icon-link" to="/cart"><ShoppingBag /> <b>{count}</b></Link>
          {auth ? <button onClick={() => saveAuth(null)}>Logout</button> : <Link className="button" to="/login"><User size={18} /> Login</Link>}
        </div>
      </header>
      <main><Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<RequireAuth><Cart /></RequireAuth>} />
        <Route path="/checkout" element={<RequireAuth><Checkout /></RequireAuth>} />
        <Route path="/orders" element={<RequireAuth><Orders /></RequireAuth>} />
        <Route path="/login" element={<Auth mode="login" />} />
        <Route path="/register" element={<Auth mode="register" />} />
        <Route path="/contact" element={<Contact />} />
      </Routes></main>
      <footer>Giftify - Your Perfect Gift Destination</footer>
    </>
  );
}

function RequireAuth({ children }) {
  const { auth } = useApp();
  return auth ? children : <Navigate to="/login" />;
}

function Home() {
  const [products, setProducts] = useState([]);
  useEffect(() => { API.get("/products").then(({ data }) => setProducts(data.filter((p) => p.featured).slice(0, 4))); }, []);
  return (
    <>
      <section className="hero">
        <div>
          <p>Curated gifts for every relationship</p>
          <h1>Giftify - Your Perfect Gift Destination</h1>
          <span>Find thoughtful birthday gifts, personalized keepsakes, hampers, decor, and plush surprises with a polished shopping experience.</span>
          <Link className="primary" to="/products">Shop Gifts</Link>
        </div>
      </section>
      <section className="section"><h2>Shop By Category</h2><div className="category-grid">{categories.map((c) => <Link to={`/products?category=${c}`} key={c}>{c}</Link>)}</div></section>
      <section className="section"><h2>Featured Picks</h2><ProductGrid products={products} /></section>
    </>
  );
}

function Products() {
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const category = params.get("category") || "";
  useEffect(() => {
    API.get("/products", { params: { category, search } }).then(({ data }) => setProducts(data));
  }, [category, search]);
  return <section className="section page"><div className="toolbar"><h1>Gift Collection</h1><label><Search size={18} /><input placeholder="Search gifts" onChange={(e) => setSearch(e.target.value)} /></label></div><div className="chips"><button className={!category ? "active" : ""} onClick={() => setParams({})}>All</button>{categories.map((c) => <button className={category === c ? "active" : ""} onClick={() => setParams({ category: c })} key={c}>{c}</button>)}</div><ProductGrid products={products} /></section>;
}

function ProductGrid({ products }) {
  return <div className="grid">{products.map((p) => <Link className="card" to={`/products/${p._id}`} key={p._id}><img src={p.image} /><div><small>{p.category}</small><h3>{p.name}</h3><p>{p.description}</p><strong>{money(p.price)}</strong></div></Link>)}</div>;
}

function ProductDetails() {
  const { id } = useParams();
  const { auth, loadCart } = useApp();
  const [product, setProduct] = useState(null);
  const navigate = useNavigate();
  useEffect(() => { API.get(`/products/${id}`).then(({ data }) => setProduct(data)); }, [id]);
  const add = async () => {
    if (!auth) return navigate("/login");
    await API.post("/cart", { productId: id, quantity: 1 });
    await loadCart();
    navigate("/cart");
  };
  if (!product) return <section className="section">Loading...</section>;
  return <section className="details"><img src={product.image} /><div><small>{product.category}</small><h1>{product.name}</h1><p>{product.description}</p><h2>{money(product.price)}</h2><button className="primary" onClick={add}><ShoppingBag size={18} /> Add to Cart</button></div></section>;
}

function Cart() {
  const { cart, loadCart } = useApp();
  const navigate = useNavigate();
  const items = cart?.items || [];
  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const qty = async (id, quantity) => { await API.put(`/cart/${id}`, { quantity }); loadCart(); };
  const remove = async (id) => { await API.delete(`/cart/${id}`); loadCart(); };
  return <section className="section page"><h1>Your Cart</h1>{items.length === 0 ? <p>Your cart is empty.</p> : <><div className="cart-list">{items.map((item) => <div className="cart-row" key={item._id}><img src={item.product.image} /><div><h3>{item.product.name}</h3><p>{money(item.product.price)}</p></div><div className="stepper"><button onClick={() => qty(item._id, item.quantity - 1)}><Minus size={16} /></button><span>{item.quantity}</span><button onClick={() => qty(item._id, item.quantity + 1)}><Plus size={16} /></button></div><button onClick={() => remove(item._id)}><Trash2 size={17} /></button></div>)}</div><aside className="total"><h2>Total {money(total)}</h2><button className="primary" onClick={() => navigate("/checkout")}>Checkout</button></aside></>}</section>;
}

function Checkout() {
  const { loadCart } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({ shippingAddress: "", phone: "", paymentMethod: "Cash on Delivery" });
  const submit = async (e) => { e.preventDefault(); await API.post("/orders", form); await loadCart(); navigate("/orders"); };
  return <FormShell title="Checkout"><form onSubmit={submit}><textarea required placeholder="Shipping address" onChange={(e) => setForm({ ...form, shippingAddress: e.target.value })} /><input required placeholder="Phone" onChange={(e) => setForm({ ...form, phone: e.target.value })} /><select onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}><option>Cash on Delivery</option><option>UPI on Delivery</option></select><button className="primary">Place Order</button></form></FormShell>;
}

function Orders() {
  const [orders, setOrders] = useState([]);
  useEffect(() => { API.get("/orders/my").then(({ data }) => setOrders(data)); }, []);
  return <section className="section page"><h1>My Orders</h1><div className="orders">{orders.map((o) => <div className="order" key={o._id}><b>{o.status}</b><span>{money(o.totalAmount)}</span><small>{new Date(o.createdAt).toLocaleString()}</small>{o.items.map((i) => <p key={i.product}>{i.name} x {i.quantity}</p>)}</div>)}</div></section>;
}

function Auth({ mode }) {
  const isRegister = mode === "register";
  const { saveAuth } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({});
  const submit = async (e) => { e.preventDefault(); const { data } = await API.post(`/auth/${mode}`, form); saveAuth(data); navigate("/"); };
  return <FormShell title={isRegister ? "Create Account" : "Welcome Back"}><form onSubmit={submit}>{isRegister && <input required placeholder="Name" onChange={(e) => setForm({ ...form, name: e.target.value })} />}<input required type="email" placeholder="Email" onChange={(e) => setForm({ ...form, email: e.target.value })} /><input required type="password" placeholder="Password" onChange={(e) => setForm({ ...form, password: e.target.value })} /><button className="primary">{isRegister ? "Register" : "Login"}</button><Link to={isRegister ? "/login" : "/register"}>{isRegister ? "Already have an account?" : "New to Giftify?"}</Link></form></FormShell>;
}

function FormShell({ title, children }) {
  return <section className="form-page"><div className="form-card"><h1>{title}</h1>{children}</div></section>;
}

function Contact() {
  return <section className="contact"><div><h1>Contact Giftify</h1><p>Email: support@giftify.local</p><p>Phone: +91 98765 43210</p><p>Address: Giftify Studio, Bengaluru, India</p></div><form><input placeholder="Name" /><input placeholder="Email" /><textarea placeholder="Message" /><button className="primary">Send Message</button></form></section>;
}

createRoot(document.getElementById("root")).render(<BrowserRouter><Provider><Layout /></Provider></BrowserRouter>);
