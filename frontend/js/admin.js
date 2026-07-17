document.addEventListener('DOMContentLoaded', () => {
  const API_BASE = 'http://localhost:5000/api';

  const adminLoginForm = document.getElementById('adminLoginForm');
  const adminUsername = document.getElementById('adminUsername');
  const adminPassword = document.getElementById('adminPassword');
  const loginError = document.getElementById('loginError');

  const logoutButtons = Array.from(document.querySelectorAll('.admin-logout-btn'));
  const adminSidebar = document.getElementById('adminSidebar');
  const adminNavToggle = document.getElementById('adminNavToggle');
  const adminSidebarClose = document.getElementById('adminSidebarClose');

  const menuForm = document.getElementById('menuForm');
  const menuTableBody = document.getElementById('menuTableBody');
  const ordersTableBody = document.getElementById('ordersTableBody');
  const itemName = document.getElementById('itemName');
  const itemCategory = document.getElementById('itemCategory');
  const itemPrice = document.getElementById('itemPrice');
  const itemDescription = document.getElementById('itemDescription');
  const itemImage = document.getElementById('itemImage');
  const imagePreview = document.getElementById('imagePreview');

  const adminStorageKey = 'urbanSipsAdminLoggedIn';
  const adminTokenKey = 'urbanSipsAdminToken';

  function isAdminLoggedIn() {
    return window.sessionStorage.getItem(adminStorageKey) === 'true';
  }

  function setLoggedIn(value, token) {
    if (value) {
      window.sessionStorage.setItem(adminStorageKey, 'true');
      if (token) window.sessionStorage.setItem(adminTokenKey, token);
    } else {
      window.sessionStorage.removeItem(adminStorageKey);
      window.sessionStorage.removeItem(adminTokenKey);
    }
  }

  function requireAdminLogin() {
    if (!isAdminLoggedIn()) {
      window.location.href = '/admin/index.html';
    }
  }

  function handleLogout() {
    setLoggedIn(false);
    window.location.href = '/index.html';
  }

  // ---------- Login ----------
  if (adminLoginForm) {
    if (isAdminLoggedIn()) {
      window.location.href = '/admin/dashboard.html';
      return;
    }

    adminLoginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      loginError.textContent = '';

      const username = adminUsername.value.trim();
      const password = adminPassword.value.trim();

      try {
        const res = await fetch(`${API_BASE}/admin/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        const json = await res.json();

        if (!res.ok || !json.success) {
          loginError.textContent = json.error || 'Invalid admin credentials. Please try again.';
          return;
        }

        setLoggedIn(true, json.token);
        window.location.href = '/admin/dashboard.html';
      } catch (err) {
        loginError.textContent = 'Could not reach the server. Is the backend running?';
      }
    });

    return;
  }

  requireAdminLogin();

  logoutButtons.forEach(button => button.addEventListener('click', handleLogout));

  function closeSidebar() {
    if (!adminSidebar) return;
    adminSidebar.classList.remove('open');
    if (adminNavToggle) adminNavToggle.setAttribute('aria-expanded', 'false');
  }

  if (adminNavToggle && adminSidebar) {
    adminNavToggle.addEventListener('click', () => {
      const open = adminSidebar.classList.toggle('open');
      adminNavToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  if (adminSidebarClose && adminSidebar) {
    adminSidebarClose.addEventListener('click', closeSidebar);
  }

  if (adminSidebar) {
    adminSidebar.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') closeSidebar();
    });
  }

  // ---------- Menu Management ----------
  if (menuTableBody) {
    let editId = null;
    let selectedImageData = '';

    function formatPrice(value) {
      return `Rs. ${Number(value).toLocaleString()}`;
    }

    async function fetchProducts() {
      try {
        const res = await fetch(`${API_BASE}/products`);
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.error);
        return json.data;
      } catch (err) {
        menuTableBody.innerHTML = '<tr><td colspan="4">Could not load menu items. Is the backend running?</td></tr>';
        return [];
      }
    }

    function renderMenuTable(items) {
      if (!items.length) {
        menuTableBody.innerHTML = '<tr><td colspan="4">No menu items yet.</td></tr>';
        return;
      }

      menuTableBody.innerHTML = items.map((item) => `
        <tr data-id="${item.id}">
          <td>${item.title}</td>
          <td>${item.category}</td>
          <td>${formatPrice(item.price)}</td>
          <td>
            <button type="button" class="table-btn edit-btn" data-id="${item.id}">Edit</button>
            <button type="button" class="table-btn delete-btn" data-id="${item.id}">Delete</button>
          </td>
        </tr>
      `).join('');
    }

    async function refreshMenuTable() {
      const items = await fetchProducts();
      renderMenuTable(items);
      updateMenuCount(items.length);
      return items;
    }

    function updateMenuCount(count) {
      const menuCountEl = document.getElementById('menuCount');
      if (menuCountEl) menuCountEl.textContent = String(count).padStart(2, '0');
    }

    refreshMenuTable();

    if (itemImage) {
      itemImage.addEventListener('change', () => {
        const file = itemImage.files[0];
        if (!file) {
          selectedImageData = '';
          if (imagePreview) imagePreview.innerHTML = '<span>Image preview will appear here when an image is selected.</span>';
          return;
        }

        const reader = new FileReader();
        reader.onload = () => {
          selectedImageData = reader.result;
          if (imagePreview) imagePreview.innerHTML = `<img src="${selectedImageData}" alt="Preview">`;
        };
        reader.readAsDataURL(file);
      });
    }

    menuForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const title = itemName.value.trim();
      const category = itemCategory.value;
      const description = itemDescription ? itemDescription.value.trim() : '';
      const rawPrice = itemPrice.value.trim();

      if (!title || !rawPrice) return;

      // The field's placeholder ("Rs. 500") hints at free text, so strip
      // any currency symbol/letters before sending — the API needs a
      // plain number.
      const numericPrice = Number(String(rawPrice).replace(/[^0-9.]/g, ''));

      if (!numericPrice || numericPrice <= 0) {
        alert('Please enter a valid price (e.g. 500 or Rs. 500).');
        return;
      }

      const payload = {
        title,
        category,
        description,
        price: numericPrice,
        image: selectedImageData || undefined
      };
      // ...rest of the function is unchanged

      try {
        const url = editId ? `${API_BASE}/products/${editId}` : `${API_BASE}/products`;
        const method = editId ? 'PUT' : 'POST';

        const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const json = await res.json();

        if (!res.ok || !json.success) {
          alert((json.errors && json.errors.join('\n')) || 'Failed to save item.');
          return;
        }

        await refreshMenuTable();
        menuForm.reset();
        selectedImageData = '';
        if (imagePreview) imagePreview.innerHTML = '<span>Image preview will appear here when an image is selected.</span>';
        editId = null;
        menuForm.querySelector('button[type="submit"]').textContent = 'Add Item';
      } catch (err) {
        alert('Could not reach the server. Is the backend running?');
      }
    });

    menuTableBody.addEventListener('click', async (e) => {
      const editBtn = e.target.closest('.edit-btn');
      const delBtn = e.target.closest('.delete-btn');

      if (editBtn) {
        const id = editBtn.dataset.id;
        const items = await fetchProducts();
        const item = items.find(i => i.id === id);
        if (!item) return;

        itemName.value = item.title;
        itemCategory.value = item.category.toLowerCase();
        if (itemDescription) itemDescription.value = item.description || '';
        itemPrice.value = item.price;
        selectedImageData = item.image || '';
        if (imagePreview && selectedImageData) {
          imagePreview.innerHTML = `<img src="${selectedImageData}" alt="Preview">`;
        }
        editId = id;
        menuForm.querySelector('button[type="submit"]').textContent = 'Update Item';
      }

      if (delBtn) {
        const id = delBtn.dataset.id;
        if (!confirm('Delete this menu item?')) return;

        try {
          const res = await fetch(`${API_BASE}/products/${id}`, { method: 'DELETE' });
          const json = await res.json();
          if (!res.ok || !json.success) throw new Error(json.error);
          await refreshMenuTable();
        } catch (err) {
          alert('Could not delete item.');
        }
      }
    });
  }

  // ---------- Orders Management ----------
  if (ordersTableBody) {
    async function fetchOrders() {
      try {
        const res = await fetch(`${API_BASE}/orders`);
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.error);
        return json.data;
      } catch (err) {
        ordersTableBody.innerHTML = '<tr><td colspan="4">Could not load orders. Is the backend running?</td></tr>';
        return [];
      }
    }

    function renderOrdersTable(orders) {
      if (!orders.length) {
        ordersTableBody.innerHTML = '<tr><td colspan="4">No orders yet.</td></tr>';
        return;
      }

      ordersTableBody.innerHTML = orders.map((order) => {
        const itemsSummary = order.items.map(i => `${i.qty} ${i.title}`).join(', ');
        const nextStatus = order.status === 'completed' ? 'pending' : 'completed';
        const nextLabel = order.status === 'completed' ? 'Mark Pending' : 'Mark Done';

        return `
          <tr data-id="${order.id}">
            <td>${order.id}</td>
            <td>${itemsSummary}</td>
            <td><span class="status ${order.status}">${order.status === 'completed' ? 'Completed' : 'Pending'}</span></td>
            <td>
              <button class="table-btn status-btn" data-id="${order.id}" data-status="${nextStatus}">${nextLabel}</button>
              <button class="table-btn delete-btn" data-id="${order.id}" type="button">Delete</button>
            </td>
          </tr>
        `;
      }).join('');
    }

    async function refreshOrdersTable() {
      const orders = await fetchOrders();
      renderOrdersTable(orders);
      updatePendingCount(orders);
      return orders;
    }

    function updatePendingCount(orders) {
      const pendingCountEl = document.getElementById('pendingCount');
      if (pendingCountEl) {
        const pending = orders.filter(o => o.status === 'pending').length;
        pendingCountEl.textContent = String(pending).padStart(2, '0');
      }
    }

    refreshOrdersTable();

    ordersTableBody.addEventListener('click', async (e) => {
      const statusBtn = e.target.closest('.status-btn');
      const deleteBtn = e.target.closest('.delete-btn');

      if (statusBtn) {
        const id = statusBtn.dataset.id;
        const nextStatus = statusBtn.dataset.status;

        try {
          const res = await fetch(`${API_BASE}/orders/${id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: nextStatus })
          });
          const json = await res.json();
          if (!res.ok || !json.success) throw new Error(json.error);
          await refreshOrdersTable();
        } catch (err) {
          alert('Could not update order status.');
        }
      }

      if (deleteBtn) {
        const id = deleteBtn.dataset.id;
        if (!confirm('Delete this order?')) return;

        try {
          const res = await fetch(`${API_BASE}/orders/${id}`, { method: 'DELETE' });
          const json = await res.json();
          if (!res.ok || !json.success) throw new Error(json.error);
          await refreshOrdersTable();
        } catch (err) {
          alert('Could not delete order.');
        }
      }
    });
  }

  // ---------- Dashboard counts (when menu/orders tables aren't on the page) ----------
  const menuCountEl = document.getElementById('menuCount');
  const pendingCountEl = document.getElementById('pendingCount');

  if (menuCountEl && !menuTableBody) {
    fetch(`${API_BASE}/products`)
      .then(res => res.json())
      .then(json => {
        if (json.success) menuCountEl.textContent = String(json.data.length).padStart(2, '0');
      })
      .catch(() => {});
  }

  if (pendingCountEl && !ordersTableBody) {
    fetch(`${API_BASE}/orders?status=pending`)
      .then(res => res.json())
      .then(json => {
        if (json.success) pendingCountEl.textContent = String(json.count).padStart(2, '0');
      })
      .catch(() => {});
  }
});