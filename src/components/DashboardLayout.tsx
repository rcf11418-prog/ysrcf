import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import {
  LayoutDashboard, TrendingUp, CreditCard, FileText, Package,
  Truck, FolderOpen, Bell, HeadphonesIcon, User, KeyRound,
  LogOut, Menu, X, ChevronRight
} from 'lucide-react';
import { signOut, useSession } from '@/lib/auth/auth-client';

const navItems = [
  { path: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { path: '/dashboard/progress', label: 'Franchise Progress', icon: TrendingUp },
  { path: '/dashboard/payments', label: 'Payments', icon: CreditCard },
  { path: '/dashboard/invoices', label: 'Invoices', icon: FileText },
  { path: '/dashboard/stock', label: 'Stock & Orders', icon: Package },
  { path: '/dashboard/delivery', label: 'Delivery Tracking', icon: Truck },
  { path: '/dashboard/documents', label: 'Documents', icon: FolderOpen },
  { path: '/dashboard/notifications', label: 'Notifications', icon: Bell },
  { path: '/dashboard/support', label: 'Support', icon: HeadphonesIcon },
  { path: '/dashboard/profile', label: 'My Profile', icon: User },
  { path: '/dashboard/password', label: 'Change Password', icon: KeyRound },
];

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
  unreadCount?: number;
}

export default function DashboardLayout({ children, title, unreadCount = 0 }: DashboardLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user: sessionUser } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const Sidebar = () => (
    <aside className="flex flex-col h-full" style={{ background: 'hsl(var(--primary))' }}>
      {/* Logo */}
      <div className="p-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
        <a href="/" className="block">
          <img src="/airo-assets/images/logo/horizontal/dark" alt="RCF" className="h-8 w-auto object-contain" />
        </a>
        <div className="mt-3 text-xs text-white/40 font-medium">Franchise Portal</div>
      </div>

      {/* User info */}
      <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
            style={{ background: 'hsl(var(--accent))', color: 'hsl(var(--primary))' }}>
            {sessionUser?.name?.charAt(0)?.toUpperCase() ?? 'F'}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-white truncate">{sessionUser?.name || 'Franchisee'}</div>
            <div className="text-xs text-white/40 truncate">{sessionUser?.email || ''}</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.path;
          const isNotif = item.path === '/dashboard/notifications';
          return (
            <Link key={item.path} to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 text-sm font-medium transition-all duration-150 ${active ? 'text-white' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
              style={active ? { background: 'rgba(255,255,255,0.12)' } : {}}>
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {isNotif && unreadCount > 0 && (
                <span className="text-xs font-bold px-1.5 py-0.5 rounded-full" style={{ background: 'hsl(var(--accent))', color: 'hsl(var(--primary))' }}>
                  {unreadCount}
                </span>
              )}
              {active && <ChevronRight className="w-3 h-3 opacity-50" />}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-all">
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'hsl(var(--muted))' }}>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-col w-60 shrink-0 h-full">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-64 h-full flex flex-col">
            <Sidebar />
          </div>
          <button onClick={() => setSidebarOpen(false)}
            className="absolute top-4 right-4 text-white z-10">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b px-4 md:px-6 py-3 flex items-center gap-4 shrink-0"
          style={{ borderColor: 'hsl(var(--border))' }}>
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500 hover:text-gray-700">
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-base flex-1 truncate" style={{ color: 'hsl(var(--primary))' }}>
            {title || 'Dashboard'}
          </h1>
          <Link to="/dashboard/notifications" className="relative text-gray-500 hover:text-gray-700">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-xs font-bold flex items-center justify-center"
                style={{ background: 'hsl(var(--accent))', color: 'hsl(var(--primary))' }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>
          <Link to="/dashboard/profile" className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
            style={{ background: 'hsl(var(--primary))', color: 'white' }}>
            {sessionUser?.name?.charAt(0)?.toUpperCase() ?? 'F'}
          </Link>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
