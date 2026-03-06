
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { GoogleGenAI } from "@google/genai";

// Global fallback for SDK internal references
if (typeof window !== 'undefined') {
  (window as any).GoogleGenerativeAI = GoogleGenAI;
}

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error("Could not find root element to mount to");
  }

  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error) {
  console.error("Critical error during app initialization:", error);
}
