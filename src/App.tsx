import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { ScrollToTop } from '@/components/shared/ScrollToTop';

// Layouts
import { PublicLayout } from '@/components/layout/PublicLayout';
import { AdminLayout } from '@/components/layout/AdminLayout';

// Public Pages
import HomePage from '@/pages/public/HomePage';
import VehiclesPage from '@/pages/public/VehiclesPage';
import ProductsPage from '@/pages/public/ProductsPage';
import ListingDetailPage from '@/pages/public/ListingDetailPage';
import ShowroomPage from '@/pages/public/ShowroomPage';
import ContactPage from '@/pages/public/ContactPage';
import AboutPage from '@/pages/public/AboutPage';

// Admin Pages
import AdminLoginPage from '@/pages/admin/AdminLoginPage';
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage';
import AdminListingsPage from '@/pages/admin/AdminListingsPage';
import AdminListingFormPage from '@/pages/admin/AdminListingFormPage';
import AdminCategoriesPage from '@/pages/admin/AdminCategoriesPage';
import AdminBrandsPage from '@/pages/admin/AdminBrandsPage';
import AdminEnquiriesPage from '@/pages/admin/AdminEnquiriesPage';
import AdminSettingsPage from '@/pages/admin/AdminSettingsPage';

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/vehicles" element={<VehiclesPage />} />
          <Route path="/vehicles/:slug" element={<ListingDetailPage />} />
          
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:slug" element={<ListingDetailPage />} />
          
          <Route path="/accessories" element={<ProductsPage />} />
          <Route path="/spare-parts" element={<ProductsPage />} />
          <Route path="/tyres-rims" element={<ProductsPage />} />
          <Route path="/motorcycles" element={<ProductsPage />} />
          
          <Route path="/showroom" element={<ShowroomPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/search" element={<ProductsPage />} />
        </Route>

        {/* Admin Auth Route */}
        <Route path="/admin" element={<AdminLoginPage />} />

        {/* Protected Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="listings" element={<AdminListingsPage />} />
          <Route path="listings/new" element={<AdminListingFormPage />} />
          <Route path="listings/:id/edit" element={<AdminListingFormPage />} />
          <Route path="categories" element={<AdminCategoriesPage />} />
          <Route path="brands" element={<AdminBrandsPage />} />
          <Route path="enquiries" element={<AdminEnquiriesPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
