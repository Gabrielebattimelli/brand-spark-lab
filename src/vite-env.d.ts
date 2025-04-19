/// <reference types="vite/client" />

// Add clearResults to the Window interface to prevent TypeScript errors
interface Window {
  clearResults?: () => void;
}
