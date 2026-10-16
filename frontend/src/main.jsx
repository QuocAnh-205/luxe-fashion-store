import React from 'react'
import ReactDOM from 'react-dom/client'
import axios from 'axios'
import App from './App.jsx'
import './index.css'

// Cấu hình Base URL cho Axios khi deploy (Render, Vercel, Docker...)
const rawApiUrl = import.meta.env.VITE_API_URL;
if (rawApiUrl && typeof rawApiUrl === 'string' && rawApiUrl.trim()) {
  let cleanUrl = rawApiUrl.trim().replace(/\/+$/, '');
  if (cleanUrl.endsWith('/api')) {
    cleanUrl = cleanUrl.slice(0, -4);
  }
  axios.defaults.baseURL = cleanUrl;
  console.log(`[LUXE] API Base URL configured: ${cleanUrl}`);
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
