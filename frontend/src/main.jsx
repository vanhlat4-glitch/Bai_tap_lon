import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './app/store';
import { ThemeLanguageProvider } from './context/ThemeLanguageContext';
import App from './App.jsx';
import './index.css';

// Lesson 13 - Redux-toolkit: Wrap App with Redux Provider & ThemeLanguageProvider
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeLanguageProvider>
        <App />
      </ThemeLanguageProvider>
    </Provider>
  </StrictMode>
);
