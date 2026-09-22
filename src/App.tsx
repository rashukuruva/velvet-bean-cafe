import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { CartProvider, useCart } from './context/CartContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { Footer } from './components/Footer.tsx';
import { CartDrawer } from './components/CartDrawer.tsx';
import { AuthModal } from './components/AuthModal.tsx';

import { HomePage } from './pages/HomePage.tsx';
import { MenuPage } from './pages/MenuPage.tsx';
import { ReservationPage } from './pages/ReservationPage.tsx';
import { GalleryPage } from './pages/GalleryPage.tsx';
import { AboutPage } from './pages/AboutPage.tsx';
import { ReviewsPage } from './pages/ReviewsPage.tsx';
import { ContactPage } from './pages/ContactPage.tsx';
import { CustomerDashboard } from './pages/CustomerDashboard.tsx';
import { AdminDashboard } from './pages/AdminDashboard.tsx';

function MainLayout() {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>(() => {
    const hash = window.location.hash.replace('#', '');
    return hash || 'home';
  });
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);

  // Sync tab with URL hash for browser back/forward and bookmarking
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        setCurrentTab(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTab = (tab: string) => {
    setCurrentTab(tab);
    window.location.hash = tab;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAuthSuccess = (role: 'customer' | 'admin') => {
    if (role === 'admin') {
      navigateTab('admin');
    } else {
      navigateTab('customer-dashboard');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF8F2] text-[#3E2723] font-sans antialiased selection:bg-[#D7CCC8] selection:text-[#3E2723]">
      {/* Sticky Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={navigateTab}
        onOpenAuth={() => setAuthModalOpen(true)}
      />

      {/* Main Page Router */}
      <main className="flex-grow">
        {currentTab === 'home' && <HomePage onNavigate={navigateTab} />}
        {currentTab === 'menu' && <MenuPage />}
        {currentTab === 'reservations' && (
          <ReservationPage onNavigateToDashboard={() => navigateTab('customer-dashboard')} />
        )}
        {currentTab === 'gallery' && <GalleryPage />}
        {currentTab === 'about' && <AboutPage />}
        {currentTab === 'reviews' && <ReviewsPage />}
        {currentTab === 'contact' && <ContactPage />}
        {currentTab === 'customer-dashboard' && (
          isAuthenticated ? (
            <CustomerDashboard onNavigate={navigateTab} />
          ) : (
            <div className="pt-40 pb-32 text-center max-w-md mx-auto px-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#EFEBE9] flex items-center justify-center mx-auto text-2xl">
                ☕
              </div>
              <h2 className="font-serif-title font-bold text-2xl text-[#3E2723]">
                Welcome to the Coffee Lounge
              </h2>
              <p className="text-xs text-[#795548] leading-relaxed">
                Please sign in to view your orders, live tracking, coffee moods, and reserved tables.
              </p>
              <button
                onClick={() => setAuthModalOpen(true)}
                className="px-6 py-2.5 bg-[#4E342E] text-white rounded-full text-xs font-bold shadow-md hover:bg-[#3E2723] transition-colors"
              >
                Sign In to Continue
              </button>
            </div>
          )
        )}
        {currentTab === 'admin' && (
          isAdmin ? (
            <AdminDashboard />
          ) : (
            <div className="pt-40 pb-32 text-center max-w-md mx-auto px-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto text-2xl text-amber-800">
                🔒
              </div>
              <h2 className="font-serif-title font-bold text-2xl text-[#3E2723]">
                Admin Access Required
              </h2>
              <p className="text-xs text-[#795548] leading-relaxed">
                Please log in with administrator credentials (or click "Demo Admin" in the sign in window) to access the café operations portal.
              </p>
              <button
                onClick={() => setAuthModalOpen(true)}
                className="px-6 py-2.5 bg-[#4E342E] text-white rounded-full text-xs font-bold shadow-md hover:bg-[#3E2723] transition-colors"
              >
                Sign In as Admin
              </button>
            </div>
          )
        )}
      </main>

      {/* Slide-over Cart & Checkout */}
      <CartDrawer onNavigateToDashboard={() => navigateTab('customer-dashboard')} />

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccessRole={handleAuthSuccess}
      />

      {/* Aesthetic Footer */}
      <Footer setCurrentTab={navigateTab} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <MainLayout />
      </CartProvider>
    </AuthProvider>
  );
}
