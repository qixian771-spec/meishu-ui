import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { AccentThemeProvider } from './theme/AccentThemeContext';
import './liquid/liquid.css';
import './glass/css/index.css';
import './demo/css/index.css';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AccentThemeProvider>
      <App />
    </AccentThemeProvider>
  </React.StrictMode>,
);
