// ---------- Config ----------
const API_BASE = window.FLAME_API_BASE || "http://localhost:8000/api";

// ---------- State ----------
let state = {
  categories: [],
  foods: [],
  activeCategory: null,
  cart: [],
  token: localStorage.getItem("flame_token") || null,
  user: null,
};

// ---------- Helpers ----------
function money(n) {
  return "₹" + Number(n).toFixed(0);
}

function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.remove("hidden");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.add("hidden"), 2200);
}

async function api(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (state.token) headers["Authorization"] = `Bearer ${state.token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (res.status === 204) return null;
  if (!res.ok) {
    let detail = "Something went wrong";
    try { detail = (await res.json()).detail || detail; } catch (e) {}
    throw new Error(detail);
  }
  return res.json();
}

// ---------- Auth ----------
function isLoggedIn() { return !!state.token; }

async function loadCurrentUser() {
  if (!state.token) return;
  try {
    state.user = await api("/profile/me");
  } catch (e) {
    state.token = null;
    localStorage.removeItem("flame_token");
  }
}

function requireAuth(action) {
  if (!isLoggedIn()) {
    openAuthModal();
    return false;
  }
  return true;
}

// ---------- Data loading ----------
async function loadCategories() {
  state.categories = await api("/categories/");
  renderCategoryStrip();
}

async function loadFoods() {
  const params = new URLSearchParams();
  if (state.activeCategory) params.set("category_id", state.activeCategory);
  const search = document.getElementById("searchInput").value.trim();
  if (search) params.set("search", search);

  state.foods = await api(`/foods/?${params.toString()}`);
  renderFoodGrid();
}

async function loadCart() {
  if (!isLoggedIn()) { state.cart = []; renderCart(); return; }
  state.cart = await api("/cart/");
  renderCart();
}

async function loadOrders() {
  if (!isLoggedIn()) {
    document.getElementById("ordersList").innerHTML = `<p class="empty-cart">Log in to see your orders.</p>`;
    return;
  }
  const orders = await api("/profile/orders");
  renderOrders(orders);
}

// ---------- Rendering ----------
function renderCategoryStrip() {
  const el = document.getElementById("categoryStrip");
  const allChip = `<button class="chip ${!state.activeCategory ? "active" : ""}" data-cat="">All</button>`;
  const chips = state.categories
    .map(c => `<button class="chip ${state.activeCategory === c.id ? "active" : ""}" data-cat="${c.id}">${c.icon} ${c.name}</button>`)
    .join("");
  el.innerHTML = allChip + chips;

  el.querySelectorAll(".chip").forEach(chip => {
    chip.addEventListener("click", () => {
      state.activeCategory = chip.dataset.cat ? Number(chip.dataset.cat) : null;
      renderCategoryStrip();
      loadFoods();
    });
  });
}

function renderFoodGrid() {
  const el = document.getElementById("foodGrid");
  if (!state.foods.length) {
    el.innerHTML = `<div class="empty-state">No dishes found. Try a different search or category.</div>`;
    return;
  }

  el.innerHTML = state.foods.map(food => {
    const cartItem = state.cart.find(c => c.food.id === food.id);
    const controls = cartItem
      ? `<div class="qty-control">
           <button data-action="dec" data-cart-id="${cartItem.id}">−</button>
           <span>${cartItem.quantity}</span>
           <button data-action="inc" data-cart-id="${cartItem.id}">+</button>
         </div>`
      : `<button class="add-btn" data-action="add" data-food-id="${food.id}">Add</button>`;

    return `
      <div class="food-card">
        <div class="food-img-wrap">
          <img class="food-img" src="${food.image_url || "https://placehold.co/400x300?text=Flame"}" alt="${food.name}" loading="lazy">
        </div>
        <div class="food-body">
          <p class="food-name">${food.name}</p>
          <p class="food-desc">${food.description || ""}</p>
          <div class="food-footer">
            <span class="food-price">${money(food.price)}</span>
            ${controls}
          </div>
        </div>
      </div>`;
  }).join("");

  el.querySelectorAll("[data-action]").forEach(btn => {
    btn.addEventListener("click", async () => {
      if (!requireAuth()) return;
      const action = btn.dataset.action;
      try {
        if (action === "add") {
          await api("/cart/", { method: "POST", body: JSON.stringify({ food_id: Number(btn.dataset.foodId), quantity: 1 }) });
        } else if (action === "inc" || action === "dec") {
          const cartId = Number(btn.dataset.cartId);
          const item = state.cart.find(c => c.id === cartId);
          const newQty = action === "inc" ? item.quantity + 1 : item.quantity - 1;
          if (newQty <= 0) {
            await api(`/cart/${cartId}`, { method: "DELETE" });
          } else {
            await api(`/cart/${cartId}`, { method: "PUT", body: JSON.stringify({ quantity: newQty }) });
          }
        }
        await loadCart();
        renderFoodGrid();
      } catch (e) {
        showToast(e.message);
      }
    });
  });
}

function renderCart() {
  const countEl = document.getElementById("cartCount");
  const totalQty = state.cart.reduce((s, i) => s + i.quantity, 0);
  countEl.textContent = totalQty;
  countEl.classList.toggle("hidden", totalQty === 0);

  const itemsEl = document.getElementById("cartItems");
  if (!state.cart.length) {
    itemsEl.innerHTML = `<p class="empty-cart">Your cart is empty. Add something delicious!</p>`;
  } else {
    itemsEl.innerHTML = state.cart.map(item => `
      <div class="cart-item">
        <img src="${item.food.image_url || "https://placehold.co/100?text=Flame"}" alt="${item.food.name}">
        <div class="cart-item-info">
          <div class="name">${item.food.name}</div>
          <div class="price">${money(item.food.price)} × ${item.quantity}</div>
        </div>
        <div class="qty-control">
          <button data-action="dec" data-cart-id="${item.id}">−</button>
          <span>${item.quantity}</span>
          <button data-action="inc" data-cart-id="${item.id}">+</button>
        </div>
      </div>
    `).join("");

    itemsEl.querySelectorAll("[data-action]").forEach(btn => {
      btn.addEventListener("click", async () => {
        const cartId = Number(btn.dataset.cartId);
        const item = state.cart.find(c => c.id === cartId);
        const action = btn.dataset.action;
        const newQty = action === "inc" ? item.quantity + 1 : item.quantity - 1;
        try {
          if (newQty <= 0) {
            await api(`/cart/${cartId}`, { method: "DELETE" });
          } else {
            await api(`/cart/${cartId}`, { method: "PUT", body: JSON.stringify({ quantity: newQty }) });
          }
          await loadCart();
          renderFoodGrid();
        } catch (e) { showToast(e.message); }
      });
    });
  }

  const total = state.cart.reduce((s, i) => s + i.food.price * i.quantity, 0);
  document.getElementById("cartTotal").textContent = money(total);
}

function renderOrders(orders) {
  const el = document.getElementById("ordersList");
  if (!orders.length) {
    el.innerHTML = `<p class="empty-cart">No orders yet. Go get some flame-grilled goodness 🔥</p>`;
    return;
  }
  el.innerHTML = orders.map(order => `
    <div class="order-card">
      <div class="order-card-top">
        <strong>Order #${order.id}</strong>
        <span class="order-status ${order.status}">${order.status}</span>
      </div>
      <div class="order-items">${order.items.map(i => `${i.quantity}× ${i.food_name}`).join(", ")}</div>
      <div style="margin-top:8px; font-weight:700;">${money(order.total_amount)}</div>
    </div>
  `).join("");
}

// ---------- View switching ----------
function switchView(view) {
  document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
  document.getElementById(`view-${view}`).classList.add("active");
  document.querySelectorAll(".nav-link").forEach(n => n.classList.toggle("active", n.dataset.view === view));
  if (view === "orders") loadOrders();
}

// ---------- Cart drawer ----------
function openCart() {
  document.getElementById("cartDrawer").classList.add("open");
  document.getElementById("cartOverlay").classList.remove("hidden");
}
function closeCart() {
  document.getElementById("cartDrawer").classList.remove("open");
  document.getElementById("cartOverlay").classList.add("hidden");
}

// ---------- Auth modal ----------
function openAuthModal() {
  document.getElementById("authOverlay").classList.remove("hidden");
  document.getElementById("authModal").classList.remove("hidden");
  updateAuthModalView();
}
function closeAuthModal() {
  document.getElementById("authOverlay").classList.add("hidden");
  document.getElementById("authModal").classList.add("hidden");
}
function updateAuthModalView() {
  const loggedOut = document.getElementById("authLoggedOut");
  const loggedIn = document.getElementById("authLoggedIn");
  if (isLoggedIn() && state.user) {
    loggedOut.classList.add("hidden");
    loggedIn.classList.remove("hidden");
    document.getElementById("profileName").value = state.user.name || "";
    document.getElementById("profileEmail").value = state.user.email || "";
    document.getElementById("profilePhone").value = state.user.phone || "";
    document.getElementById("profileAddress").value = state.user.address || "";
  } else {
    loggedOut.classList.remove("hidden");
    loggedIn.classList.add("hidden");
  }
}

// ---------- Event wiring ----------
function wireEvents() {
  document.querySelectorAll(".nav-link").forEach(btn => {
    btn.addEventListener("click", () => switchView(btn.dataset.view));
  });

  document.getElementById("cartBtn").addEventListener("click", () => {
    if (!requireAuth()) return;
    openCart();
  });
  document.getElementById("closeCart").addEventListener("click", closeCart);
  document.getElementById("cartOverlay").addEventListener("click", closeCart);

  document.getElementById("profileBtn").addEventListener("click", openAuthModal);
  document.getElementById("closeAuth").addEventListener("click", closeAuthModal);
  document.getElementById("authOverlay").addEventListener("click", closeAuthModal);

  document.querySelectorAll(".tab-btn").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      document.getElementById("loginForm").classList.toggle("hidden", tab.dataset.tab !== "login");
      document.getElementById("registerForm").classList.toggle("hidden", tab.dataset.tab !== "register");
    });
  });

  let searchTimeout;
  document.getElementById("searchInput").addEventListener("input", () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(loadFoods, 300);
  });

  document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;
    const errEl = document.getElementById("loginError");
    errEl.textContent = "";
    try {
      const body = new URLSearchParams({ username: email, password });
      const res = await fetch(`${API_BASE}/auth/login`, { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Login failed");
      state.token = data.access_token;
      state.user = data.user;
      localStorage.setItem("flame_token", state.token);
      closeAuthModal();
      showToast(`Welcome back, ${state.user.name}!`);
      await Promise.all([loadCart(), loadFoods()]);
    } catch (err) {
      errEl.textContent = err.message;
    }
  });

  document.getElementById("registerForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("regName").value;
    const email = document.getElementById("regEmail").value;
    const phone = document.getElementById("regPhone").value;
    const password = document.getElementById("regPassword").value;
    const errEl = document.getElementById("registerError");
    errEl.textContent = "";
    try {
      const data = await api("/auth/register", { method: "POST", body: JSON.stringify({ name, email, phone, password }) });
      state.token = data.access_token;
      state.user = data.user;
      localStorage.setItem("flame_token", state.token);
      closeAuthModal();
      showToast(`Welcome to Flame, ${state.user.name}!`);
      await Promise.all([loadCart(), loadFoods()]);
    } catch (err) {
      errEl.textContent = err.message;
    }
  });

  document.getElementById("profileForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const successEl = document.getElementById("profileSuccess");
    try {
      state.user = await api("/profile/me", {
        method: "PUT",
        body: JSON.stringify({
          name: document.getElementById("profileName").value,
          phone: document.getElementById("profilePhone").value,
          address: document.getElementById("profileAddress").value,
        }),
      });
      successEl.textContent = "Profile updated!";
      setTimeout(() => (successEl.textContent = ""), 2000);
    } catch (err) {
      showToast(err.message);
    }
  });

  document.getElementById("logoutBtn").addEventListener("click", () => {
    state.token = null;
    state.user = null;
    localStorage.removeItem("flame_token");
    state.cart = [];
    renderCart();
    closeAuthModal();
    showToast("Logged out");
  });

  document.getElementById("checkoutBtn").addEventListener("click", async () => {
    if (!requireAuth()) return;
    if (!state.cart.length) { showToast("Your cart is empty"); return; }
    const method = document.querySelector('input[name="paymethod"]:checked').value;
    try {
      const order = await api("/orders/checkout", { method: "POST", body: JSON.stringify({ payment_method: method }) });
      closeCart();
      showToast(`Order #${order.id} placed 🔥 (${order.status})`);
      await loadCart();
      renderFoodGrid();
      switchView("orders");
    } catch (err) {
      showToast(err.message);
    }
  });
}

// ---------- Init ----------
async function init() {
  wireEvents();
  await loadCurrentUser();
  await Promise.all([loadCategories(), loadFoods()]);
  await loadCart();
  renderFoodGrid();
}

init();
