Here is a professional, complete `README.md` file tailored specifically for your **Urban Sips** coffee shop web application. It highlights the MVC structure, your recent SQLite database integration milestone, and the tooling you used.

---

# Urban Sips — Premium Coffee House

Urban Sips is a full-stack e-commerce web application for a premium coffee shop. Built as part of the Full Stack Development track at DecodeLabs, this project implements a clean **Model-View-Controller (MVC)** architecture to decouple the user interface from business logic and persistent data storage.

Originally built with static data, the application has been upgraded to feature a fully integrated relational database backend, complete with an interactive administration dashboard for real-time order tracking and menu management.

---

## 🚀 Features

### 🛒 Frontend & Customer Experience

* **Artisan Menu:** Dynamic display of premium coffees, pastries, and seasonal items fetched directly from the database API.
* **Interactive Cart Flow:** Seamless add-to-cart experience with real-time total updates.
* **Persistent Checkout:** Validated checkout form that pushes confirmed customer orders directly to the backend database.
* **Contact & Feedback:** Dedicated contact portal allowing patrons to leave inquiries.

### 💼 Admin Dashboard & Backend

* **MVC Architecture:** Clean codebase separation across Routes, Controllers, and Models utilizing Express.js.
* **Relational Database Persistence:** Integrated utilizing Node's built-in `node:sqlite` (`DatabaseSync`) module.
* **Real-time Order Management:** Track pending, processing, or completed orders seamlessly.
* **Menu Item CRUD:** Create, read, update, and delete menu products dynamically via the API.
* **Transaction Safety:** Fail-safe transaction handling (`BEGIN` / `COMMIT` / `ROLLBACK`) ensuring atomic writes for multi-table queries (e.g., matching parent orders to nested item lists).

---

## 🛠️ Tech Stack

* **Frontend:** HTML5, CSS3 (Custom variables, responsive grid & flexbox systems), Vanilla JavaScript
* **Backend:** Node.js, Express.js
* **Database:** SQLite (`node:sqlite` DatabaseSync)
* **Dev Tooling:** `npx serve` (Lightweight static file server for local deployment simulations)

---

## 📂 Project Structure

```text
urban-sips-mvc-database-integration/
├── backend/
│   ├── src/
│   │   ├── config/          # Database connection & initialization
│   │   ├── controllers/     # Request handlers & application logic
│   │   ├── middleware/      # Request validation (e.g., validateOrder)
│   │   ├── models/          # Database schemas & manual SQL transactions
│   │   └── routes/          # Express API route endpoints
│   ├── server.js            # Express application entry point
│   └── package.json
└── frontend/                # Static frontend files served via 'npx serve'
    ├── admin.js             # Dashboard controller script
    ├── dashboard.html       # Admin core panel
    ├── index.html           # Home landing page
    ├── menu.html            # Shop browse layout
    ├── orders.html          # Order tracking screen
    ├── settings.html        # Configuration UI
    └── style.css            # Component-scoped variables and global theme

```

---

## ⚡ Getting Started

### 1. Prerequisites

Ensure you have **Node.js (v22 or newer recommended)** installed, as the project relies on the native `node:sqlite` module.

### 2. Setting Up the Backend

Navigate to the backend directory, install the required Express dependencies, and boot up your API server:

```bash
cd backend
npm install
npm start

```

The server will initialize your SQLite database tables and start listening on: `http://localhost:5000`

### 3. Running the Frontend

Because browser security flags restrict `fetch()` requests when opening web pages directly from local files (`file://`), you need to run a static file server.

Open a new terminal window, navigate to your frontend project directory, and use `npx serve` to simulate a live production hosting environment:

```bash
cd frontend
npx serve

```

Your local frontend instance will spin up (typically at `http://localhost:3000` or `http://localhost:5000` depending on terminal prompts). Open this address in your browser to test the full-stack pipeline!

---

## 📈 Database Schema Overview

The relational structure consists of four main synchronized tables:

1. **`products`**: Stores details for the coffee shop menu items (ID, title, price, descriptions).
2. **`orders`**: Handles the root order details (ID, billing information, customer contact info, total amount, and fulfillment status).
3. **`order_items`**: A junction table that links individual product selections to their respective parent order, documenting purchase quantity and fixed historical pricing records atomically.
4. **`contacts`**: Collects inquiries and client feedback messages.