import { useEffect } from 'react';
import { Navigate, Outlet, useLocation, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Car, Package, Tags, Settings, 
  MessageSquare, LogOut, Menu, X, ArrowUpRight
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Logo } from '@/components/shared/Logo';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { enquiryService } from '@/services/enquiryService';

const sidebarLinks = [
  { icon: <LayoutDashboard size={20} />, label: 'Dashboard', href: '/admin/dashboard' },
  { icon: <Car size={20} />, label: 'Listings', href: '/admin/listings' },
  { icon: <Package size={20} />, label: 'Categories', href: '/admin/categories' },
  { icon: <Tags size={20} />, label: 'Brands', href: '/admin/brands' },
  { icon: <MessageSquare size={20} />, label: 'Enquiries', href: '/admin/enquiries' },
  { icon: <Settings size={20} />, label: 'Settings', href: '/admin/settings' },
];

export function AdminLayout() {
  const { session, loading, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [newEnquiries, setNewEnquiries] = useState(0);

  useEffect(() => {
    if (session) {
      enquiryService.getNewCount().then(setNewEnquiries).catch(console.error);
    }
  }, [session, location.pathname]);

  if (loading) {
    return <div className="min-h-screen bg-one-black flex items-center justify-center">Loading...</div>;
  }

  if (!session) {
    return <Navigate to="/admin" state={{ from: location }} replace />;
  }

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin');
  };

  return (
    <div className="dark bg-one-black min-h-screen w-full max-w-full flex overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/80 z-40 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-one-charcoal border-r border-white/10 flex flex-col transition-transform duration-300",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="h-16 flex items-center px-6 border-b border-white/10 shrink-0">
          <Logo size="sm" variant="light" />
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {sidebarLinks.map((link) => {
            const active = location.pathname === link.href || location.pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  active 
                    ? "bg-one-red text-one-black" 
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                )}
              >
                {link.icon}
                {link.label}
                {link.label === 'Enquiries' && newEnquiries > 0 && (
                  <span className="ml-auto bg-white text-one-red text-xs font-bold px-2 py-0.5 rounded-full">
                    {newEnquiries}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10 shrink-0 space-y-2">
          <Link to="/" target="_blank">
            <Button variant="outline" className="w-full gap-2 text-gray-300 border-white/20 hover:text-white">
              View Site <ArrowUpRight size={16} />
            </Button>
          </Link>
          <Button 
            variant="ghost" 
            className="w-full gap-2 text-gray-400 hover:text-white hover:bg-white/5 justify-start"
            onClick={handleSignOut}
          >
            <LogOut size={18} />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 max-w-full h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden h-16 bg-one-charcoal border-b border-white/10 flex items-center justify-between px-4 shrink-0">
          <Logo size="sm" variant="light" />
          <Button variant="ghost" size="icon" className="text-white" onClick={() => setSidebarOpen(true)}>
            <Menu size={24} />
          </Button>
        </header>

        {/* Page Content */}
        <main className="flex-1 min-w-0 max-w-full overflow-x-hidden overflow-y-auto bg-one-black p-3 sm:p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
