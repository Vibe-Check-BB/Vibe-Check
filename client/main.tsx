import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import Root from './Root.tsx'
import { AuthProvider } from './Components/AuthContext.tsx'

createRoot(document.getElementById('root')!).render(
  <AuthProvider>
    <Root />
  </AuthProvider>
);
