document.addEventListener('DOMContentLoaded', function () {
  const year = document.getElementById('year');
  const cartCount = document.getElementById('cartCount');
  const orderSummary = document.getElementById('orderSummary');
  const orderTotal = document.getElementById('orderTotal');
  const checkoutForm = document.getElementById('checkoutForm');
  const navToggle = document.getElementById('navToggle');
  const mainNav = document.getElementById('mainNav');

  const API_BASE = 'http://localhost:5000/api';
  const cartStorageKey = 'urbanSipsCartItems';

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
  }

  function formatPrice(value) {
    return `Rs. ${Number(value).toLocaleString()}`;
  }

  function updateCartCount(cart) {
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    if (cartCount) cartCount.textContent = totalQty;
  }

  function renderSummary() {
    const cart = loadCart();
    updateCartCount(cart);

    if (!orderSummary) return;

    if (!cart.length) {
      orderSummary.innerHTML = '<p>No items in cart.</p>';
      if (orderTotal) orderTotal.textContent = 'Rs. 0';
      return;
    }

    let total = 0;
    orderSummary.innerHTML = cart.map(item => {
      const itemTotal = item.price * item.qty;
      total += itemTotal;
      return `<p>${item.title} × ${item.qty} — ${formatPrice(itemTotal)}</p>`;
    }).join('');

    if (orderTotal) orderTotal.textContent = formatPrice(total);
  }

  year.textContent = new Date().getFullYear();
  renderSummary();

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', () => {
      const open = mainNav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  if (checkoutForm) {
    checkoutForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const cart = loadCart();
      if (!cart.length) {
        alert('Your cart is empty.');
        return;
      }

      const formData = new FormData(checkoutForm);
      const requiredFields = ['fullName', 'email', 'address', 'city', 'postal', 'card', 'expiry', 'cvv'];

      for (const field of requiredFields) {
        if (!String(formData.get(field) || '').trim()) {
          alert('Please fill in all checkout fields.');
          return;
        }
      }

      const submitBtn = checkoutForm.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      try {
        const res = await fetch(`${API_BASE}/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customer: {
              fullName: formData.get('fullName'),
              email: formData.get('email'),
              address: formData.get('address'),
              city: formData.get('city'),
              postal: formData.get('postal')
            },
            items: cart.map(item => ({
              id: item.id,
              title: item.title,
              price: item.price,
              qty: item.qty
            }))
          })
        });

        const json = await res.json();

        if (!res.ok || !json.success) {
          throw new Error((json.errors && json.errors.join(' ')) || 'Failed to place order.');
        }

        alert(`Order placed successfully. Order ID: ${json.data.id}`);
        saveCart([]);
        window.location.href = 'index.html';
      } catch (err) {
        alert(err.message || 'Something went wrong placing your order. Please try again.');
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }
});