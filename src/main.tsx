import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { injectGoogleAnalytics, injectGoogleTagManager } from './lib/analytics';

// Immediately pre-inject Google Tag Manager & Google Analytics scripts if cached in localStorage
// This secures near-instant tag rendering on cold pageloads, enabling Google Tag Assistant
// and tag checking crawlers to detect the system tags instantly and trigger correctly!
try {
  const cachedGtmId = localStorage.getItem("analytics_gtm_id");
  const cachedGaId = localStorage.getItem("analytics_ga_id");
  if (cachedGtmId && cachedGtmId.trim()) {
    injectGoogleTagManager(cachedGtmId);
  }
  if (cachedGaId && cachedGaId.trim()) {
    injectGoogleAnalytics(cachedGaId);
  }
} catch (e) {
  console.warn("Pre-injection of GTM/GA skipped: ", e);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
