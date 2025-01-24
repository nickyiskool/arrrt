const express = require('express');
const csrf = require('csurf');
const cookieParser = require('cookie-parser');
const path = require('path');
const { Sequelize } = require('sequelize');
const cors = require('cors');
require('dotenv').config();

const { router: usersRoutes } = require('./routes/users');
const commentsRoutes = require('./routes/comments');
const postsRoutes = require('./routes/posts');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Sequelize
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
});

// Authenticate DB connection
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');
  } catch (error) {
    console.error('Unable to connect to DB:', error);
  }
})();

// Middleware
app.use(cookieParser());
app.use(express.json());

// CORS Configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// CSRF Protection Middleware
const csrfProtection = csrf({
  cookie: {
    httpOnly: false, // Allow the frontend to read the cookie
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  },
});

// CSRF Token Route
app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.cookie('XSRF-TOKEN', req.csrfToken(), {
    httpOnly: false, // Allow the frontend to read the cookie
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  });
  res.json({ csrfToken: req.csrfToken() });
});

// API Routes
app.use('/api/comments', csrfProtection, commentsRoutes);
app.use('/api/posts', csrfProtection, postsRoutes);
app.use('/api/users', csrfProtection, usersRoutes);

// Serve React Frontend
app.use(express.static(path.join(__dirname, 'frontend/dist')));

// Wildcard Route for React SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/dist', 'index.html'));
});

// Global Error Handler
app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    console.error('Invalid CSRF token:', err);
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }
  console.error('Error:', err);
  return res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
