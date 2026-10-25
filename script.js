'use strict';

// Demo product catalog; no backend or payment gateway required.
const products = [
  { id: 1, name: 'Choco Wafer Bites', category: 'Snacks', price: 28, emoji: '🍫', bg: '#f5e6d7', description: 'A crunchy, chocolatey snack.', badge: 'BESTSELLER' },
  { id: 2, name: 'Potato Chips', category: 'Snacks', price: 35, emoji: '🍟', bg: '#fff0d3', description: 'Crispy goodness for movie nights.', badge: 'POPULAR' },
  { id: 3, name: 'Orange Soda', category: 'Drinks', price: 30, emoji: '🥤', bg: '#ffe1d0', description: 'A refreshing fizzy favorite.', badge: '' },
  { id: 4, name: 'Instant Noodles', category: 'Essentials', price: 18, emoji: '🍜', bg: '#f3e9db', description: 'A quick meal for busy days.', badge: 'SULIT' },
  { id: 5, name: 'Bottled Water', category: 'Drinks', price: 20, emoji: '💧', bg: '#dff1fb', description: 'Stay fresh and hydrated.', badge: '' },
  { id: 6, name: 'Butter Cookies', category: 'Snacks', price: 55, emoji: '🍪', bg: '#f8e8c6', description: 'Sweet bites to share.', badge: 'NEW' },
  { id: 7, name: 'Bath Soap', category: 'Essentials', price: 29, emoji: '🧼', bg: '#e3f2e7', description: 'Everyday freshness and care.', badge: '' },
  { id: 8, name: 'Fresh Milk', category: 'Drinks', price: 75, emoji: '🥛', bg: '#e5e9f8', description: 'Creamy and delicious.', badge: '' }
];
const storageKey = 'sarisariko-demo-cart';
let cart = {};
try { cart = JSON.parse(localStorage.getItem(storageKey)) || {}; } catch { cart = {}; }
let category = 'All';
let searchTerm = '';
const money = n => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(n);
const grid = document.querySelector('#productsGrid');
const drawer = document.querySelector('#cartDrawer');
const overlay = document.querySelector('#cartOverlay');
const toast = document.querySelector('#toast');
let toastTimer;

function renderProducts() {
  const filtered = products.filter(p => (category === 'All' || category === p.category) && p.name.toLowerCase().includes(searchTerm));
  grid.innerHTML = filtered.map(p => `
    <article class="product-card">
      <div class="product-image" style="--product-bg:${p.bg}"><span class="product-emoji" aria-hidden="true">${p.emoji}</span>${p.badge ? `<span class="product-badge">${p.badge}</span>` : ''}</div>
      <div class="product-info"><span class="product-category">${p.category}</span><h3>${p.name}</h3><p class="product-description">${p.description}</p><div class="product-bottom"><span class="price">${money(p.price)}</span><button class="add-btn" type="button" data-add="${p.id}" aria-label="Add ${p.name} to cart">+ Add to cart</button></div></div>
    </article>`).join('');
  document.querySelector('#resultsCount').textContent = `${filtered.length} products`;
  document.querySelector('#emptyState').hidden = filtered.length !== 0;
}
function persistCart() { try { localStorage.setItem(storageKey, JSON.stringify(cart)); } catch {} }
function cartDetails() { return products.filter(p => cart[p.id] > 0).map(p => ({ ...p, qty: cart[p.id] })); }
function renderCart() {
  const items = cartDetails();
  const count = items.reduce((sum, p) => sum + p.qty, 0);
  const subtotal = items.reduce((sum, p) => sum + p.price * p.qty, 0);
  document.querySelector('#cartCount').textContent = count;
  document.querySelector('#cartSubtotal').textContent = money(subtotal);
  document.querySelector('#checkoutBtn').disabled = count === 0;
  document.querySelector('#cartItems').innerHTML = items.length ? items.map(p => `
    <div class="cart-row"><div class="cart-row-emoji" style="--product-bg:${p.bg}" aria-hidden="true">${p.emoji}</div><div><h3>${p.name}</h3><p>${money(p.price)} each</p><div class="quantity"><button type="button" data-decrease="${p.id}" aria-label="Decrease ${p.name}">−</button><strong>${p.qty}</strong><button type="button" data-increase="${p.id}" aria-label="Increase ${p.name}">+</button></div><button type="button" class="remove-btn" data-remove="${p.id}">Remove</button></div><strong>${money(p.price * p.qty)}</strong></div>`).join('') : '<div class="cart-empty"><span>🛒</span>Your cart is empty.<br />Go grab something you love!</div>';
  persistCart();
}
function showToast(message) { toast.textContent = message; toast.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('show'), 2200); }
function openCart() { drawer.hidden = false; overlay.hidden = false; document.body.style.overflow = 'hidden'; document.querySelector('#closeCart').focus(); }
function closeCart() { drawer.hidden = true; overlay.hidden = true; document.body.style.overflow = ''; document.querySelector('#openCart').focus(); }
function addToCart(id) { cart[id] = (cart[id] || 0) + 1; renderCart(); showToast('Added to your cart! 🛍️'); }

document.querySelector('#categoryFilters').addEventListener('click', e => {
  const btn = e.target.closest('[data-category]'); if (!btn) return;
  category = btn.dataset.category;
  document.querySelectorAll('[data-category]').forEach(b => { const active = b === btn; b.classList.toggle('active', active); b.setAttribute('aria-pressed', String(active)); });
  renderProducts();
});
document.querySelector('#searchInput').addEventListener('input', e => { searchTerm = e.target.value.trim().toLowerCase(); renderProducts(); });
grid.addEventListener('click', e => { const btn = e.target.closest('[data-add]'); if (btn) addToCart(Number(btn.dataset.add)); });
document.querySelector('#cartItems').addEventListener('click', e => {
  const btn = e.target.closest('button'); if (!btn) return;
  if (btn.dataset.increase) cart[Number(btn.dataset.increase)] += 1;
  if (btn.dataset.decrease) { const id = Number(btn.dataset.decrease); cart[id] = Math.max(0, (cart[id] || 0) - 1); }
  if (btn.dataset.remove) delete cart[Number(btn.dataset.remove)];
  renderCart();
});
document.querySelector('#openCart').addEventListener('click', openCart);
document.querySelector('#closeCart').addEventListener('click', closeCart);
overlay.addEventListener('click', closeCart);
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !drawer.hidden) closeCart(); });
document.querySelector('#checkoutBtn').addEventListener('click', () => { if (!cartDetails().length) return; showToast('Demo checkout only — no real orders placed.'); });
document.querySelector('#year').textContent = new Date().getFullYear();
renderProducts();
renderCart();
