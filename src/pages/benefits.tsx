import { Helmet } from '@dr.pogodin/react-helmet';
import { motion } from 'motion/react';
import { Truck, BookOpen, Monitor, Headphones, Megaphone, FileText, IndianRupee, TrendingUp, Clock, BarChart2 } from 'lucide-react';
import { benefits } from 'virtual:content';
import { ContentListContext } from '@airo/content';
import { Link } from 'react-router';

const supportIcons: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  Truck, BookOpen, Monitor, Headphones, Megaphone, FileText,
};

export default function BenefitsPage() {
  return (
    <>
      <Helmet>
        <title>Benefits & Subsidy Schemes – RCF Franchise | RCF Franchise Portal</title>
        <meta name="description" content="Discover RCF franchise benefits: attractive profit margins, government subsidies (NBS, Urea), operational support, and investment tiers from ₹5 Lakh." />
        <link rel="canonical" href="https://rcffranchise.in/benefits" />
      </Helmet>
      <main>
        {/* Hero */}
        <section className="relative py-20 md:py-28 overflow-hidden" style={{ background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(221 80% 15%) 100%)' }}>
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-5 -translate-y-1/2 translate-x-1/2" style={{ background: 'hsl(var(--accent))' }} />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="text-3xl md:text-5xl font-bold text-white mb-4">{benefits.hero.headline}</motion.h1>
            <motion.p initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
              className="text-white/75 text-lg max-w-2xl mx-auto">{benefits.hero.subheadline}</motion.p>
          </div>
        </section>

        {/* Financial Benefits */}
        <section className="py-xxl bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="text-sm font-semibold mb-2" style={{ color: 'hsl(var(--secondary))' }}>FINANCIAL OPPORTUNITY</p>
              <h2 className="text-3xl md:text-4xl font-bold" style={{ color: 'hsl(var(--primary))' }}>Financial Benefits at a Glance</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <ContentListContext field="benefits.financialBenefits">
                {benefits.financialBenefits.map((fb, i) => {
                  const icons = [IndianRupee, TrendingUp, BarChart2, Clock];
                  const Icon = icons[i % icons.length];
                  return (
                    <motion.div key={fb.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.1 }}
                      className="rounded-2xl p-6 text-center border-2 hover:shadow-lg transition-all duration-300"
                      style={{ borderColor: 'hsl(var(--primary)/0.15)' }}>
                      <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'hsl(var(--primary)/0.08)' }}>
                        <Icon className="w-7 h-7" style={{ color: 'hsl(var(--primary))' }} />
                      </div>
                      <div className="text-2xl font-bold mb-2" style={{ color: 'hsl(var(--accent))' }}>{fb.value}</div>
                      <div className="font-semibold text-sm mb-2" style={{ color: 'hsl(var(--primary))' }}>{fb.title}</div>
                      <p className="text-xs text-gray-500 leading-relaxed">{fb.desc}</p>
                    </motion.div>
                  );
                })}
              </ContentListContext>
            </div>
          </div>
        </section>

        {/* Subsidy Schemes */}
        <section className="py-xxl" style={{ background: 'hsl(var(--muted))' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="text-sm font-semibold mb-2" style={{ color: 'hsl(var(--secondary))' }}>GOVERNMENT SUPPORT</p>
              <h2 className="text-3xl md:text-4xl font-bold" style={{ color: 'hsl(var(--primary))' }}>Government Subsidy Schemes</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ContentListContext field="benefits.subsidySchemes">
                {benefits.subsidySchemes.map((ss, i) => (
                  <motion.div key={ss.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.1 }}
                    className="bg-white rounded-2xl p-6 shadow-sm border-l-4" style={{ borderLeftColor: 'hsl(var(--secondary))' }}>
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-bold text-base" style={{ color: 'hsl(var(--primary))' }}>{ss.scheme}</h3>
                    </div>
                    <p className="text-xs text-gray-400 mb-3">{ss.ministry}</p>
                    <p className="text-sm text-gray-600 leading-relaxed mb-4">{ss.desc}</p>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'hsl(var(--secondary)/0.08)' }}>
                      <IndianRupee className="w-4 h-4 shrink-0" style={{ color: 'hsl(var(--secondary))' }} />
                      <span className="text-sm font-semibold" style={{ color: 'hsl(var(--secondary))' }}>{ss.benefit}</span>
                    </div>
                  </motion.div>
                ))}
              </ContentListContext>
            </div>
          </div>
        </section>

        {/* Operational Support */}
        <section className="py-xxl bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="text-sm font-semibold mb-2" style={{ color: 'hsl(var(--secondary))' }}>PARTNER SUPPORT</p>
              <h2 className="text-3xl md:text-4xl font-bold" style={{ color: 'hsl(var(--primary))' }}>Operational Support Provided</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <ContentListContext field="benefits.operationalSupport">
                {benefits.operationalSupport.map((os, i) => {
                  const Icon = supportIcons[os.icon] || Truck;
                  return (
                    <motion.div key={os.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.07 }}
                      className="rounded-xl p-6 hover:shadow-md transition-all duration-300" style={{ background: 'hsl(var(--muted))' }}>
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: 'hsl(var(--primary)/0.08)' }}>
                        <Icon className="w-6 h-6" style={{ color: 'hsl(var(--primary))' }} />
                      </div>
                      <h3 className="font-bold text-sm mb-2" style={{ color: 'hsl(var(--primary))' }}>{os.title}</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{os.desc}</p>
                    </motion.div>
                  );
                })}
              </ContentListContext>
            </div>
          </div>
        </section>

        {/* Investment Tiers */}
        <section className="py-xxl" style={{ background: 'hsl(var(--primary))' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="text-sm font-semibold mb-2" style={{ color: 'hsl(var(--accent))' }}>INVESTMENT OPTIONS</p>
              <h2 className="text-3xl md:text-4xl font-bold text-white">Choose Your Franchise Tier</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <ContentListContext field="benefits.investmentTiers">
                {benefits.investmentTiers.map((it, i) => (
                  <motion.div key={it.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.1 }}
                    className="rounded-2xl p-6 text-center" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}>
                    <div className="text-lg font-bold text-white mb-1">{it.tier}</div>
                    <div className="text-2xl font-bold mb-3" style={{ color: 'hsl(var(--accent))' }}>{it.investment}</div>
                    <div className="space-y-2 text-left">
                      <div className="text-xs text-white/60">Area: <span className="text-white/90">{it.area}</span></div>
                      <div className="text-xs text-white/60">Products: <span className="text-white/90">{it.products}</span></div>
                      <div className="text-xs text-white/60">Support: <span className="text-white/90">{it.support}</span></div>
                    </div>
                  </motion.div>
                ))}
              </ContentListContext>
            </div>
            <div className="text-center mt-10">
              <Link to="/apply" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-bold transition-all duration-200 hover:shadow-2xl hover:scale-105"
                style={{ background: 'hsl(var(--accent))', color: '#1a1a1a' }}>
                Apply for Franchise
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
