import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

try {
  let testKey = '__test__';
  window.localStorage.setItem(testKey, testKey);
  window.localStorage.removeItem(testKey);

  const originalGetItem = window.localStorage.getItem;
  window.localStorage.getItem = function(key) {
    const val = originalGetItem.call(window.localStorage, key);
    if (key === 'userInfo' && val) {
      if (val === 'undefined' || val === 'null') {
         window.localStorage.removeItem(key);
         return null;
      }
      try {
         JSON.parse(val);
      } catch (e) {
         window.localStorage.removeItem(key);
         return null;
      }
    }
    return val;
  };
} catch (e) {
  console.warn('localStorage is not available, falling back to in-memory storage');
  const storage = {};
  const mockStorage = {
    getItem: (key) => storage[key] || null,
    setItem: (key, value) => { storage[key] = String(value); },
    removeItem: (key) => { delete storage[key]; },
    clear: () => { Object.keys(storage).forEach(k => delete storage[k]); },
    get length() { return Object.keys(storage).length; },
    key: (i) => Object.keys(storage)[i] || null
  };
  try {
    Object.defineProperty(window, 'localStorage', {
      value: mockStorage,
      configurable: true,
      enumerable: true,
      writable: true
    });
  } catch (err) {
    console.error('Failed to redefine localStorage', err);
  }
}

import App from './App.jsx'
import { LanguageProvider } from './contexts/LanguageContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </StrictMode>,
)
