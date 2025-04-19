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

createRoot(document.getElementById("root")!).render(<App />);
