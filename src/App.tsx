import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { BackgroundGlow } from './components/layout/BackgroundGlow';
import { ToastProvider } from './components/ui/Toast';

// Pages
import { HomePage } from './pages/HomePage';
import { ServicesPage } from './pages/ServicesPage';
import { ProductsPage } from './pages/ProductsPage';
import { EventsPage } from './pages/EventsPage';
import { CareersPage } from './pages/CareersPage';
import { InternshipsPage } from './pages/InternshipsPage';
import { ClassesPage } from './pages/ClassesPage';
import { ContactPage } from './pages/ContactPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { GalleryPage } from './pages/GalleryPage';
import { BlogPage } from './pages/BlogPage';

// Scroll to top or target hash upon route change
const ScrollToTop: React.FC = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const targetId = hash.replace('#', '');
      const el = document.getElementById(targetId);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth' });
        }, 80);
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
};

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <Router>
        <ScrollToTop />
        <div className="relative min-h-screen flex flex-col bg-background text-foreground overflow-x-hidden">
          {/* Ambient Cyber Background Mesh */}
          <BackgroundGlow />

          {/* Sticky Header */}
          <Navbar />

          {/* Main App Content Views */}
          <main className="flex-1 relative z-10">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<Navigate to="/#about" replace />} />
              <Route path="/classes" element={<ClassesPage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/careers" element={<CareersPage />} />
              <Route path="/interns" element={<InternshipsPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/gallery" element={<GalleryPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/admin/login" element={<AdminLoginPage />} />
              {/* Fallback wildcard */}
              <Route path="*" element={<HomePage />} />
            </Routes>
          </main>

          {/* Global Footer */}
          <Footer />
        </div>
      </Router>
    </ToastProvider>
  );
};

export default App;
