// frontend/app.js
import React, { useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavBar from './components/navbar';
import PostPage from './components/PostPage';
import PostList from './components/PostList';
import ProfilePage from './components/ProfilePage';
import axios from 'axios';

// Configure Axios Defaults
axios.defaults.withCredentials = true; // Include cookies with every request
axios.interceptors.request.use(config => {
  const csrfToken = document.cookie
    .split('; ')
    .find(row => row.startsWith('XSRF-TOKEN='))
    ?.split('=')[1];
  
  if (csrfToken) {
    config.headers['X-XSRF-TOKEN'] = csrfToken;
  }
  return config;
});

const App = () => {
  useEffect(() => {
    // Initial request to trigger CSRF cookie set by the server
    const fetchInitialData = async () => {
      try {
        const response = await fetch('/api/posts', {
          method: 'GET',
          credentials: 'include', // Include cookies
        });
        console.log('Initial request successful:', response.data);
      } catch (error) {
        console.error('Initial request failed:', error.message);
      }
    };

    fetchInitialData();
  }, []);

  return (
    <Router>
      <div className="app">
        <NavBar />
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/" element={<PostList />} />
            <Route path="/users/:slug" element={<ProfilePage />} />
            <Route path="/users/:username/posts/:postId" element={<PostPage />} />
            <Route path="*" element={<h1>404 Not Found</h1>} />
          </Routes>
        </Suspense>
      </div>
    </Router>
  );
};

export default App;
