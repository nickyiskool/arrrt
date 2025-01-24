import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { UserProvider } from './userContext';import axios from 'axios';

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

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);

root.render(
    <UserProvider>
      <App />
    </UserProvider>
);
