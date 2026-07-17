document.addEventListener('DOMContentLoaded', function () {
  const year = document.getElementById('year');
  const cartCount = document.getElementById('cartCount');
  const cartBody = document.getElementById('cartBody');
  const summaryList = document.getElementById('summaryList');
  const summaryTotal = document.getElementById('summaryTotal');
  const clearCartBtn = document.getElementById('clearCart');
  const navToggle = document.getElementById('navToggle');
  const mainNav = document.getElementById('mainNav');

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

  function renderCart() {
    const cart = loadCart();
    updateCartCount(cart);

    if (!cartBody) return;

    if (!cart.length) {
      cartBody.innerHTML = '<tr><td colspan="4">Your cart is empty.</td></tr>';
      if (summaryList) summaryList.innerHTML = '<p>No items added yet.</p>';
      if (summaryTotal) summaryTotal.textContent = 'Rs. 0';
      return;
    }

    let total = 0;

    cartBody.innerHTML = cart.map((item, index) => {
      const itemTotal = item.price * item.qty;
      total += itemTotal;
      return `
        <tr>
          <td>${item.title}</td>
          <td>${formatPrice(item.price)}</td>
          <td>
            <input class="qty-input" type="number" min="1" value="${item.qty}" data-index="${index}" style="width:70px;padding:0.45rem;border:1px solid var(--line);border-radius:10px;">
          </td>
          <td><button class="table-btn remove-btn" data-index="${index}" type="button">Remove</button></td>
        </tr>
      `;
    }).join('');

    if (summaryList) {
      summaryList.innerHTML = cart.map(item => `<p>${item.title} × ${item.qty}</p>`).join('');
    }

    if (summaryTotal) summaryTotal.textContent = formatPrice(total);
  }

  year.textContent = new Date().getFullYear();
  renderCart();

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', () => {
      const open = mainNav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  if (cartBody) {
    cartBody.addEventListener('change', (e) => {
      const input = e.target.closest('.qty-input');
      if (!input) return;

      const cart = loadCart();
      const index = Number(input.dataset.index);
      const value = Math.max(1, Number(input.value || 1));

      if (cart[index]) {
        cart[index].qty = value;
        saveCart(cart);
        renderCart();
      }
    });

    cartBody.addEventListener('click', (e) => {
      const btn = e.target.closest('.remove-btn');
      if (!btn) return;

      const cart = loadCart();
      const index = Number(btn.dataset.index);
      cart.splice(index, 1);
      saveCart(cart);
      renderCart();
    });
  }

  if (clearCartBtn) {
    clearCartBtn.addEventListener('click', () => {
      localStorage.removeItem(cartStorageKey);
      renderCart();
    });
  }
});