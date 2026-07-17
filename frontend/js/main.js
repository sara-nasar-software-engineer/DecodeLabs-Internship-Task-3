document.addEventListener('DOMContentLoaded', function () {
  const year = document.getElementById('year');
  const navToggle = document.getElementById('navToggle');
  const mainNav = document.getElementById('mainNav');
  const filterButtons = document.querySelectorAll('.filter-btn');
  const menuGrid = document.getElementById('menuGrid');
  const contactForm = document.getElementById('contactForm');
  const formMsg = document.getElementById('formMsg');
  const cartCount = document.getElementById('cartCount');
  const cartBtn = document.getElementById('cartBtn');

  // Change this if your backend runs somewhere else
  const API_BASE = 'http://localhost:5000/api';

  const cartStorageKey = 'urbanSipsCartItems';

  // Cart stays in localStorage on purpose — it's temporary, per-browser
  // state, not something the backend needs to own.
  function loadCart() {
    try {
      const saved = localStorage.getItem(cartStorageKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  function saveCart(cart) {
    localStorage.setItem(cartStorageKey, JSON.stringify(cart));
    updateCartCount();
  }

  function updateCartCount() {
    const cart = loadCart();
    const totalQty = cart.reduce((sum, item) => sum + (item.qty || 1), 0);
    if (cartCount) cartCount.textContent = totalQty;
  }

  function formatPrice(value) {
    return `Rs. ${Number(value).toLocaleString()}`;
  }

  function renderMenu(items) {
    if (!menuGrid) return;
    menuGrid.innerHTML = items.map(item => `
      <article class="menu-card" data-category="${item.category}">
        <img src="${item.image}" alt="${item.title}" class="card-img">
        <div class="card-body">
          <h3>${item.title}</h3>
          <p>${item.description || ''}</p>
          <div class="card-footer">
            <span>${formatPrice(item.price)}</span>
            <button class="btn btn-small add-btn" type="button" data-id="${item.id}">Order</button>
          </div>
        </div>
      </article>
    `).join('');
  }

  // Fetched once on page load and reused for "Add to cart" lookups
  let cachedMenuItems = [];

  async function fetchMenu() {
    try {
      const res = await fetch(`${API_BASE}/products`);
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to load menu.');
      }

      cachedMenuItems = json.data;
      renderMenu(cachedMenuItems);
    } catch (err) {
      console.error('Could not load menu from API:', err);
      if (menuGrid) {
        menuGrid.innerHTML = '<p>Sorry, the menu could not be loaded right now. Please make sure the backend server is running.</p>';
      }
    }
  }

  function addToCart(itemId) {
    const item = cachedMenuItems.find(i => i.id === itemId);
    if (!item) return;

    const cart = loadCart();
    const existing = cart.find(i => i.id === item.id);

    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ ...item, qty: 1 });
    }

    saveCart(cart);
    alert(`${item.title} added to cart.`);
  }

  year.textContent = new Date().getFullYear();
  updateCartCount();
  fetchMenu();

  if (navToggle && mainNav) {

  // Toggle menu
  navToggle.addEventListener("click", function (e) {
    e.stopPropagation();

    mainNav.classList.toggle("active");

    navToggle.setAttribute(
      "aria-expanded",
      mainNav.classList.contains("active")
    );
  });

  // Close menu when a link is clicked
  document.querySelectorAll(".nav-list a").forEach(link => {
    link.addEventListener("click", function () {
      mainNav.classList.remove("active");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });

  // Close menu when clicking outside
  document.addEventListener("click", function (e) {
    if (
      !mainNav.contains(e.target) &&
      !navToggle.contains(e.target)
    ) {
      mainNav.classList.remove("active");
      navToggle.setAttribute("aria-expanded", "false");
    }
  });
}

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      const filter = button.dataset.filter;
      const cards = menuGrid.querySelectorAll('.menu-card');

      cards.forEach(card => {
        const category = card.dataset.category;
        card.style.display = (filter === 'all' || filter === category) ? 'flex' : 'none';
      });
if (mainNav && mainNav.classList.contains('active')) {
  mainNav.classList.remove('active');
  if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
}
    });
  });

  if (menuGrid) {
    menuGrid.addEventListener('click', (e) => {
      const btn = e.target.closest('.add-btn');
      if (!btn) return;
      addToCart(btn.dataset.id);
    });
  }

  if (cartBtn) {
    cartBtn.addEventListener('click', () => {
      window.location.href = 'cart.html';
    });
  }

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = contactForm.name.value.trim();
      const email = contactForm.email.value.trim();
      const message = contactForm.message.value.trim();
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!name || !email || !message) {
        formMsg.textContent = 'Please fill in all fields.';
        formMsg.style.color = '#b33a3a';
        return;
      }

      if (!emailPattern.test(email)) {
        formMsg.textContent = 'Please enter a valid email address.';
        formMsg.style.color = '#b33a3a';
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/contact`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, message })
        });
        const json = await res.json();

        if (!res.ok || !json.success) {
          throw new Error((json.errors && json.errors.join(' ')) || 'Failed to send message.');
        }

        formMsg.textContent = 'Message sent successfully.';
        formMsg.style.color = '#8b5e34';
        contactForm.reset();
      } catch (err) {
        formMsg.textContent = err.message || 'Something went wrong. Please try again.';
        formMsg.style.color = '#b33a3a';
      }
    });
  }
});