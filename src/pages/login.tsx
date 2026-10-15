import { Helmet } from '@dr.pogodin/react-helmet';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { motion } from 'motion/react';
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import { signIn } from '@/lib/auth/auth-client';
import { login } from 'virtual:content';
import { ContentListContext } from '@airo/content';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await signIn.email({ email, password, callbackURL: '/dashboard' });
      if (result?.error) {
        setError(result.error.message || 'Invalid email or password.');
      } else {
        navigate('/dashboard');
      }
    } catch {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Franchise Login – RCF Franchise Portal</title>
        <meta name="description" content="Login to your RCF Franchise Partner portal to manage your franchise, payments, documents and more." />
        <link rel="canonical" href="https://rcffranchise.in/login" />
        <meta name="robots" content="noindex" />
      </Helmet>
      <main className="min-h-screen flex" style={{ background: 'hsl(var(--muted))' }}>
        {/* Left panel */}
        <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden"
          style={{ background: 'linear-gradient(145deg, hsl(var(--primary)) 0%, hsl(221 80% 12%) 100%)' }}>
          <div className="absolute inset-0 opacity-10 pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, hsl(var(--accent)) 0%, transparent 50%), radial-gradient(circle at 80% 20%, hsl(var(--secondary)) 0%, transparent 50%)' }} />
          <div className="relative z-10">
            <a href="/" className="flex items-center gap-3">
              <img src="/airo-assets/images/logo/horizontal/dark" alt="RCF Logo" className="h-10 w-auto object-contain" />
            </a>
          </div>
          <div className="relative z-10">
            <h2 className="text-3xl font-bold text-white mb-4 leading-tight">
              <span>{login.leftPanel.heading}</span><br />
              <span style={{ color: 'hsl(var(--accent))' }}>{login.leftPanel.headingHighlight}</span>
            </h2>
            <p className="text-white/60 text-sm leading-relaxed mb-8">{login.leftPanel.description}</p>
            <div className="grid grid-cols-2 gap-4">
              <ContentListContext field="login.features">
                {login.features.map((item) => (
                  <div key={item.id} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div className="text-sm font-semibold text-white mb-0.5">{item.label}</div>
                    <div className="text-xs text-white/50">{item.desc}</div>
                  </div>
                ))}
              </ContentListContext>
            </div>
          </div>
          <div className="relative z-10 text-white/30 text-xs">{login.footer}</div>
        </div>

        {/* Right panel */}
        <div className="flex-1 flex items-center justify-center p-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
            className="w-full max-w-md">
            <div className="bg-white rounded-3xl shadow-sm p-8 md:p-10">
              <div className="mb-8">
                <div className="lg:hidden mb-6">
                  <a href="/"><img src="/airo-assets/images/logo/horizontal" alt="RCF" className="h-9 w-auto object-contain" /></a>
                </div>
                <h1 className="text-2xl font-bold mb-1" style={{ color: 'hsl(var(--primary))' }}>{login.hero.headline}</h1>
                <p className="text-sm text-gray-500">{login.hero.subheadline}</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email Address</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                    placeholder="your@email.com" autoComplete="email"
                    className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all"
                    style={{ borderColor: 'hsl(var(--border))' }} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Password</label>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} value={password}
                      onChange={(e) => setPassword(e.target.value)} required
                      placeholder="Enter your password" autoComplete="current-password"
                      className="w-full px-4 py-3 pr-11 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all"
                      style={{ borderColor: 'hsl(var(--border))' }} />
                    <button type="button" onClick={() => setShowPassword((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-xl text-sm text-red-700 bg-red-50 border border-red-200">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button type="submit" disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white transition-all hover:shadow-lg disabled:opacity-70"
                  style={{ background: 'hsl(var(--primary))' }}>
                  {loading ? 'Signing in...' : <><LogIn className="w-4 h-4" /> Sign In</>}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t text-center" style={{ borderColor: 'hsl(var(--border))' }}>
                <p className="text-xs text-gray-500">
                  <span>{login.applyPrompt} </span>
                  <Link to="/apply" className="font-semibold hover:underline" style={{ color: 'hsl(var(--primary))' }}>
                    {login.applyLinkText}
                  </Link>
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  <a href="/" className="hover:underline">← Back to main website</a>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </>
  );
}
