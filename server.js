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


const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
});


(async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');
  } catch (error) {
    console.error('Unable to connect to DB:', error);
  }
})();

app.use(cookieParser());
app.use(express.json());

app.use(cors({
  origin: 'http://localhost:3000', 
  credentials: true,               
}));


app.use('/api/users', usersRoutes);

const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // true in production
    sameSite: 'lax',
  },
});

app.use('/api/comments', csrfProtection, commentsRoutes);
app.use('/api/posts', csrfProtection, postsRoutes);
app.user('/api/users', csrfProtection, usersRoutes)

app.use(express.static(path.join(__dirname, 'frontend/dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/dist', 'index.html'));
});

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

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
