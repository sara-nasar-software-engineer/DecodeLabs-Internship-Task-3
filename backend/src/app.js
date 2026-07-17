const express = require('express');
const cors = require('cors');

// Importing this establishes the DB connection and applies schema.sql
// immediately — the app refuses to serve traffic on a broken database.
require('./config/database');

const routes = require('./routes');
const requestLogger = require('./middleware/requestLogger');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

// --- Core middleware ---
app.use(cors());
app.use(express.json());
app.use(requestLogger);

// --- Health check ---
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Urban Sips Cafe API is running.',
    database: 'SQLite (connected)'
  });
});

// --- API routes ---
app.use('/api', routes);

// --- Fallbacks ---
app.use(notFound);
app.use(errorHandler);

module.exports = app;