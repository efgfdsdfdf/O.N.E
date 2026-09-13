import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { analyticsService } from '@/services/analyticsService';

export function PublicLayout() {
  useEffect(() => {
    analyticsService.trackSiteVisit();
  }, []);

  return (
    <div className="min-h-screen flex flex-col dark">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
