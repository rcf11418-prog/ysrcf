import { Link } from 'react-router';
import { Mail, Facebook, Twitter, Linkedin, Youtube } from 'lucide-react';

const footerLinks = {
  company: [
    { label: 'About RCF', href: '/about' },
    { label: 'Products', href: '/products' },
    { label: 'Franchise / Dealership', href: '/franchise' },
    { label: 'Benefits & Subsidy', href: '/benefits' },
    { label: 'Franchise Process', href: '/franchise-process' },
  ],
  support: [
    { label: 'FAQ', href: '/faq' },
    { label: 'Contact Us', href: '/contact' },
    { label: 'Apply Now', href: '/apply' },
    { label: 'Franchise Login', href: '/login' },
    { label: 'Privacy Policy', href: '/privacy' },
  ],
};

export default function Footer() {
  return (
    <footer style={{ background: 'hsl(var(--primary))' }} className="text-white">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand column */}
          <div className="lg:col-span-1">
            <Link to="/" className="inline-block mb-5">
              <img
                src="/airo-assets/images/logo/horizontal/dark"
                alt="RCF – Rashtriya Chemicals and Fertilizers"
                className="block h-auto max-h-14 w-auto max-w-[180px] object-contain"
              />
            </Link>
            <p className="text-white/70 text-sm leading-relaxed mb-5">
              Rashtriya Chemicals and Fertilizers Limited — A Government of India Undertaking under
              the Ministry of Chemicals &amp; Fertilizers.
            </p>
            <div className="flex items-center gap-3">
              {[
                { icon: Facebook, href: '#' },
                { icon: Twitter, href: '#' },
                { icon: Linkedin, href: '#' },
                { icon: Youtube, href: '#' },
              ].map(({ icon: Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                  style={{ background: 'rgba(255,255,255,0.1)' }}
                  aria-label="Social media link"
                >
                  <Icon className="w-4 h-4 text-white/80" />
                </a>
              ))}
            </div>
          </div>

          {/* Company links */}
          <div>
            <h3 className="text-sm font-semibold text-white/50 uppercase tracking-widest mb-4">
              Company
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-white/75 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support links */}
          <div>
            <h3 className="text-sm font-semibold text-white/50 uppercase tracking-widest mb-4">
              Support
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-white/75 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-white/50 uppercase tracking-widest mb-4">
              Contact
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-accent shrink-0" />
                <span className="text-sm text-white/75">info@rcf.services</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-accent shrink-0" />
                <span className="text-sm text-white/75">cc@rcf.services</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ background: 'rgba(0,0,0,0.25)' }} className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-xs text-white/50">
            © {new Date().getFullYear()} Rashtriya Chemicals and Fertilizers Limited. All rights reserved.
          </p>
          <p className="text-xs text-white/40 text-center">
            Registered under Companies Act, 1956
          </p>
        </div>
      </div>
    </footer>
  );
}
