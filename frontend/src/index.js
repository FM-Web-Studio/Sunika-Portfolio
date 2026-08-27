import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, useNavigate, useLocation } from 'react-router-dom';
import App from './App';
import { ErrorBoundary } from './components';

import './styles/Theme.css';
import './styles/Wrappers.css';
import './styles/Components.css';

function ErrorBoundaryWrapper({ children }) {
  const navigate  = useNavigate();
  const location  = useLocation();
  return (
    <ErrorBoundary
      fallbackPath="/"
      navigate={navigate}
      onGoHome={() => navigate('/')}
      resetKey={location.pathname}
    >
      {children}
    </ErrorBoundary>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ErrorBoundaryWrapper>
        <App />
      </ErrorBoundaryWrapper>
    </BrowserRouter>
  </React.StrictMode>
);
