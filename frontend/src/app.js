// frontend/app.js
import React, { useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios'; // Import Axios
import NavBar from './components/navbar';
import PostPage from './components/PostPage';
import PostList from './components/PostList';
import ProfilePage from './components/ProfilePage';

// Configure Axios Defaults
axios.defaults.withCredentials = true; // Include cookies with every request
axios.interceptors.request.use((config) => {
  const csrfToken = document.cookie
    .split('; ')
    .find((row) => row.startsWith('XSRF-TOKEN='))
    ?.split('=')[1];

  if (csrfToken) {
    config.headers['X-XSRF-TOKEN'] = csrfToken;
  }
  return config;
});

const App = () => {
  useEffect(() => {
    // Fetch CSRF Token on App Load
    const fetchCsrfToken = async () => {
      try {
        const response = await axios.get('/api/csrf-token'); // Fetch token
        console.log('CSRF token fetched:', response.data.csrfToken);
      } catch (error) {
        console.error('Failed to fetch CSRF token:', error.message);
      }
    };

    fetchCsrfToken(); // Call fetch token function on mount
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
