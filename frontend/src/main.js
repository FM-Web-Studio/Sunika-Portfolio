import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import '@fontsource/fredoka/500.css';
import '@fontsource/fredoka/600.css';
import '@fontsource/fredoka/700.css';
import '@fontsource/nunito/400.css';
import '@fontsource/nunito/600.css';
import '@fontsource/nunito/700.css';
import '@fontsource/nunito/800.css';
import './styles/tokens.css';
import './styles/base.css';
import App from './App';
import { PrefsProvider } from './hooks/usePrefs';
import { SiteProvider } from './context/SiteContext';
import { ToastProvider } from './components/Toast';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <PrefsProvider>
        <ToastProvider>
          <SiteProvider>
            <App />
          </SiteProvider>
        </ToastProvider>
      </PrefsProvider>
    </BrowserRouter>
  </StrictMode>,
);
