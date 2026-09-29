import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { BackgroundGlow } from './components/layout/BackgroundGlow';
import { ToastProvider } from './components/ui/Toast';

// Pages
import { HomePage } from './pages/HomePage';
const AboutPage = React.lazy(() => import('./pages/AboutPage').then((m) => ({ default: m.AboutPage })));
const ServicesPage = React.lazy(() => import('./pages/ServicesPage').then((m) => ({ default: m.ServicesPage })));
const ProductsPage = React.lazy(() => import('./pages/ProductsPage').then((m) => ({ default: m.ProductsPage })));
const EventsPage = React.lazy(() => import('./pages/EventsPage').then((m) => ({ default: m.EventsPage })));
const CareersPage = React.lazy(() => import('./pages/CareersPage').then((m) => ({ default: m.CareersPage })));
const InternshipsPage = React.lazy(() => import('./pages/InternshipsPage').then((m) => ({ default: m.InternshipsPage })));
const ClassesPage = React.lazy(() => import('./pages/ClassesPage').then((m) => ({ default: m.ClassesPage })));
const ContactPage = React.lazy(() => import('./pages/ContactPage').then((m) => ({ default: m.ContactPage })));
const AdminLoginPage = React.lazy(() => import('./pages/AdminLoginPage').then((m) => ({ default: m.AdminLoginPage })));
const GalleryPage = React.lazy(() => import('./pages/GalleryPage').then((m) => ({ default: m.GalleryPage })));
const BlogPage = React.lazy(() => import('./pages/BlogPage').then((m) => ({ default: m.BlogPage })));
const BlueprintPage = React.lazy(() => import('./pages/BlueprintPage').then((m) => ({ default: m.BlueprintPage })));

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

// Conditional Footer rendering - hides footer on Home page
const AppFooter: React.FC = () => {
  const { pathname } = useLocation();
  if (pathname === '/') {
    return null;
  }
  return <Footer />;
};

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <Router>
        <ScrollToTop />
        <div className="relative min-h-screen flex flex-col bg-background text-foreground">
          {/* Ambient Cyber Background Mesh */}
          <BackgroundGlow />

          {/* Sticky Header */}
          <Navbar />

          {/* Main App Content Views */}
          <main className="flex-1 relative z-10">
            <React.Suspense fallback={null}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/about" element={<AboutPage />} />
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
                <Route path="/blueprint" element={<BlueprintPage />} />
                {/* Fallback wildcard */}
                <Route path="*" element={<HomePage />} />
              </Routes>
            </React.Suspense>
          </main>

          {/* Footer (conditionally rendered, hidden on Home) */}
          <AppFooter />
        </div>
      </Router>
    </ToastProvider>
  );
};

export default App;
