import React, { lazy, Suspense, useLayoutEffect, useSyncExternalStore } from 'react';
import ReactDOM from 'react-dom/client';
import { Cybersecurity } from './pages/Cybersecurity';

const VerificationPortal = lazy(() => import('./App'));

function subscribeToHash(callback: () => void) {
  window.addEventListener('hashchange', callback);
  return () => window.removeEventListener('hashchange', callback);
}

function isVerificationRoute() {
  return window.location.hash.startsWith('#/');
}

function Site() {
  const showPortal = useSyncExternalStore(subscribeToHash, isVerificationRoute);

  useLayoutEffect(() => {
    if (showPortal) window.scrollTo(0, 0);
  }, [showPortal]);

  if (!showPortal) return <Cybersecurity />;

  return (
    <Suspense fallback={<p role="status">Cargando el portal de verificación…</p>}>
      <VerificationPortal />
    </Suspense>
  );
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <Site />
  </React.StrictMode>
);
