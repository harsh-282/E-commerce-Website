import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Link, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import axios from "axios";
import { Gift, LayoutDashboard, PackagePlus, ShoppingCart, Users, Pencil, Trash2 } from "lucide-react";
import "./styles.css";

const API = axios.create({ baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api" });
const categories = ["Birthday Gifts", "Personalized Gifts", "Gift Hampers", "Home Decor", "Soft Toys"];

function App() {
  const [admin, setAdmin] = useState(JSON.parse(localStorage.getItem("giftify_admin") || "null"));
  API.interceptors.request.use((config) => {
    if (admin?.token) config.headers.Authorization = `Bearer ${admin.token}`;
    return config;
  });
  const saveAdmin = (user) => {
    setAdmin(user);
    user ? localStorage.setItem("giftify_admin", JSON.stringify(user)) : localStorage.removeItem("giftify_admin");
  };
  return <BrowserRouter>{admin ? <Shell saveAdmin={saveAdmin} /> : <Routes><Route path="*" element={<Login saveAdmin={saveAdmin} />} /></Routes>}</BrowserRouter>;
}

function Shell({ saveAdmin }) {
  return <div className="app"><aside><Link className="brand" to="/"><Gift /> Giftify Admin</Link><Link to="/"><LayoutDashboard /> Dashboard</Link><Link to="/products"><PackagePlus /> Products</Link><Link to="/orders"><ShoppingCart /> Orders</Link><Link to="/users"><Users /> Users</Link><button onClick={() => saveAdmin(null)}>Logout</button></aside><main><Routes><Route path="/" element={<Dashboard />} /><Route path="/products" element={<Products />} /><Route path="/orders" element={<Orders />} /><Route path="/users" element={<UsersPage />} /><Route path="*" element={<Navigate to="/" />} /></Routes></main></div>;
}

function Login({ saveAdmin }) {
  const [form, setForm] = useState({});
  const [error, setError] = useState("");
  const submit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post("/auth/login", form);
      if (data.role !== "admin") throw new Error("Admin access only");
      saveAdmin(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };
  return <section className="login"><form onSubmit={submit}><Gift size={44} /><h1>Admin Login</h1>{error && <p className="error">{error}</p>}<input required type="email" placeholder="Admin email" onChange={(e) => setForm({ ...form, email: e.target.value })} /><input required type="password" placeholder="Password" onChange={(e) => setForm({ ...form, password: e.target.value })} /><button>Login</button></form></section>;
}

function Dashboard() {
  const [stats, setStats] = useState({ products: 0, orders: 0, users: 0 });
  useEffect(() => { Promise.all([API.get("/products"), API.get("/orders"), API.get("/users")]).then(([p, o, u]) => setStats({ products: p.data.length, orders: o.data.length, users: u.data.length })); }, []);
  return <><h1>Dashboard</h1><div className="stats"><Stat label="Products" value={stats.products} /><Stat label="Orders" value={stats.orders} /><Stat label="Users" value={stats.users} /></div></>;
}

function Stat({ label, value }) {
  return <div className="stat"><span>{label}</span><strong>{value}</strong></div>;
}

function Products() {
  const blank = { name: "", description: "", price: "", image: "", category: categories[0], stock: 10, featured: false };
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);
  const load = () => API.get("/products").then(({ data }) => setProducts(data));
  useEffect(load, []);
  const submit = async (e) => {
    e.preventDefault();
    editing ? await API.put(`/products/${editing}`, form) : await API.post("/products", form);
    setForm(blank); setEditing(null); load();
  };
  const edit = (p) => { setEditing(p._id); setForm({ name: p.name, description: p.description, price: p.price, image: p.image, category: p.category, stock: p.stock, featured: p.featured }); };
  const del = async (id) => { if (confirm("Delete this product?")) { await API.delete(`/products/${id}`); load(); } };
  return <><div className="title"><h1>Products</h1></div><section className="panel"><h2>{editing ? "Edit Product" : "Add Product"}</h2><form className="product-form" onSubmit={submit}><input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /><input required type="number" placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /><input required placeholder="Image URL" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} /><select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{categories.map((c) => <option key={c}>{c}</option>)}</select><input type="number" placeholder="Stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} /><label className="check"><input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} /> Featured</label><textarea required placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /><button>{editing ? "Update Product" : "Add Product"}</button></form></section><Table headers={["Product", "Category", "Price", "Stock", "Actions"]}>{products.map((p) => <tr key={p._id}><td><img src={p.image} />{p.name}</td><td>{p.category}</td><td>₹{p.price}</td><td>{p.stock}</td><td><button onClick={() => edit(p)}><Pencil size={16} /></button><button onClick={() => del(p._id)}><Trash2 size={16} /></button></td></tr>)}</Table></>;
}

function Orders() {
  const [orders, setOrders] = useState([]);
  const load = () => API.get("/orders").then(({ data }) => setOrders(data));
  useEffect(load, []);
  const status = async (id, value) => { await API.put(`/orders/${id}/status`, { status: value }); load(); };
  return <><h1>Orders</h1><Table headers={["Customer", "Items", "Total", "Status", "Date"]}>{orders.map((o) => <tr key={o._id}><td>{o.user?.name}<small>{o.user?.email}</small></td><td>{o.items.map((i) => `${i.name} x ${i.quantity}`).join(", ")}</td><td>₹{o.totalAmount}</td><td><select value={o.status} onChange={(e) => status(o._id, e.target.value)}><option>Processing</option><option>Shipped</option><option>Delivered</option><option>Cancelled</option></select></td><td>{new Date(o.createdAt).toLocaleDateString()}</td></tr>)}</Table></>;
}

function UsersPage() {
  const [users, setUsers] = useState([]);
  useEffect(() => { API.get("/users").then(({ data }) => setUsers(data)); }, []);
  return <><h1>Users</h1><Table headers={["Name", "Email", "Role", "Joined"]}>{users.map((u) => <tr key={u._id}><td>{u.name}</td><td>{u.email}</td><td>{u.role}</td><td>{new Date(u.createdAt).toLocaleDateString()}</td></tr>)}</Table></>;
}

function Table({ headers, children }) {
  return <section className="panel table-wrap"><table><thead><tr>{headers.map((h) => <th key={h}>{h}</th>)}</tr></thead><tbody>{children}</tbody></table></section>;
}

createRoot(document.getElementById("root")).render(<App />);
