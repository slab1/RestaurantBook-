import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from './components/ui/toaster'
import { I18nProvider } from './contexts/I18nContext'
import { Layout } from './components/layout/Layout'
import { HomePage } from './pages/HomePage'
import { RestaurantsPage } from './pages/RestaurantsPage'
import { RestaurantDetailsPage } from './pages/RestaurantDetailsPage'
import { BookingPage } from './pages/BookingPage'
import { ProfilePage } from './pages/ProfilePage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { LoyaltyPage } from './pages/LoyaltyPage'
import { ARViewerPage } from './pages/ARViewerPage'
import { LanguagePage } from './pages/LanguagePage'
import { SettingsPage } from './pages/SettingsPage'
import { OfflinePage } from './pages/OfflinePage'
import { PWAInstaller } from './components/pwa/PWAInstaller'
import { ServiceWorkerManager } from './components/pwa/ServiceWorkerManager'
import { NotificationManager } from './components/pwa/NotificationManager'
import './App.css'

function App() {
  return (
    <Router>
      <I18nProvider>
        <div className="App min-h-screen bg-background">
          <ServiceWorkerManager />
          <NotificationManager />
          
          <Routes>
            {/* Auth routes (no layout) */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Main app routes (with layout) */}
            <Route path="/*" element={
              <Layout>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/restaurants" element={<RestaurantsPage />} />
                  <Route path="/restaurants/:id" element={<RestaurantDetailsPage />} />
                  <Route path="/booking/:restaurantId?" element={<BookingPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/loyalty" element={<LoyaltyPage />} />
                  <Route path="/ar/:restaurantId" element={<ARViewerPage />} />
                  <Route path="/language" element={<LanguagePage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/offline" element={<OfflinePage />} />
                </Routes>
              </Layout>
            } />
          </Routes>

          <PWAInstaller />
          <Toaster />
        </div>
      </I18nProvider>
    </Router>
  )
}

export default App
