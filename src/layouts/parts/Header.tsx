import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router';
import { Menu, X, ChevronDown } from 'lucide-react';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'About RCF', href: '/about' },
  { label: 'Products', href: '/products' },
  {
    label: 'Franchise',
    href: '/franchise',
    children: [
      { label: 'Franchise / Dealership', href: '/franchise' },
      { label: 'Franchise Process', href: '/franchise-process' },
      { label: 'Benefits & Subsidy', href: '/benefits' },
    ],
  },
  { label: 'FAQ', href: '/faq' },
  { label: 'Contact', href: '/contact' },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setDropdownOpen(null);
  }, [location.pathname]);

  return (
    <header
      style={{ background: 'hsl(var(--primary))' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'shadow-lg' : 'shadow-sm'
      }`}
    >
      {/* Top bar */}
      <div style={{ background: 'hsl(var(--primary))' }} className="py-1.5 px-4 hidden md:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-white/80">
          <span>Government of India Undertaking — Ministry of Chemicals &amp; Fertilizers</span>
          <div className="flex items-center gap-4">
            <span>Mon–Sat: 9:00 AM – 6:00 PM</span>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center shrink-0 min-w-0">
            <img
              src="/airo-assets/images/logo/horizontal"
              alt="RCF – Rashtriya Chemicals and Fertilizers"
              className="block h-auto max-h-12 md:max-h-14 w-auto max-w-[200px] object-contain"
            />
          </Link>

          {/* Desktop nav */}
          <nav aria-label="Main navigation" className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) =>
              link.children ? (
                <div
                  key={link.label}
                  className="relative"
                  onMouseEnter={() => setDropdownOpen(link.label)}
                  onMouseLeave={() => setDropdownOpen(null)}
                >
                  <button
                    className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      location.pathname.startsWith(link.href)
                        ? 'text-white font-semibold'
                        : 'text-white/85 hover:text-white'
                    }`}
                  >
                    {link.label}
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  {dropdownOpen === link.label && (
                    <div className="absolute top-full left-0 mt-1 w-52 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-50">
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          to={child.href}
                          className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-primary/5 hover:text-primary transition-colors"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    location.pathname === link.href
                      ? 'text-white font-semibold'
                      : 'text-white/85 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              )
            )}
          </nav>

          {/* CTA buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-semibold rounded-lg border-2 border-white text-white transition-all duration-200 hover:bg-white hover:text-primary hover:shadow-md"
            >
              Franchise Login
            </Link>
            <Link
              to="/apply"
              className="px-5 py-2 text-sm font-semibold rounded-lg transition-all duration-200 hover:shadow-lg hover:scale-105"
              style={{ background: 'hsl(var(--accent))', color: '#1a1a1a' }}
            >
              Apply Now
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <button
            className="lg:hidden p-2 rounded-md text-white hover:text-white/80"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-white/10 shadow-lg" style={{ background: 'hsl(var(--primary))' }}>
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <div key={link.label}>
                <Link
                  to={link.href}
                  className="block px-3 py-2.5 text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                >
                  {link.label}
                </Link>
                {link.children && (
                  <div className="ml-4 mt-1 space-y-1">
                    {link.children.map((child) => (
                      <Link
                        key={child.href}
                        to={child.href}
                        className="block px-3 py-2 text-sm text-white/75 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div className="pt-3 flex flex-col gap-2 border-t border-white/10 mt-2">
              <Link
                to="/login"
                className="w-full text-center px-4 py-2.5 text-sm font-semibold rounded-lg border-2 border-white text-white transition-colors"
              >
                Franchise Login
              </Link>
              <Link
                to="/apply"
                className="w-full text-center px-4 py-2.5 text-sm font-semibold rounded-lg transition-colors"
                style={{ background: 'hsl(var(--accent))', color: '#1a1a1a' }}
              >
                Apply Now
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
