import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { UserProvider } from './userContext';

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);

root.render(
    <UserProvider>
      <App />
    </UserProvider>
);
