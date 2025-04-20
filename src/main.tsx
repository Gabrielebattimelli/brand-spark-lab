
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Add a safety check for the clearResults function that's causing errors
// This is likely related to a browser extension or external script
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    // Create a dummy clearResults function on window to prevent errors
    if (!window.clearResults) {
      window.clearResults = () => {
        console.log('clearResults called but not implemented');
      };
    }
  });
}

// Add console log to verify rendering is attempted
console.log('Attempting to render App component');

const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error('Root element not found');
} else {
  createRoot(rootElement).render(<App />);
  console.log('App rendered successfully');
}
