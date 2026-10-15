import { Helmet } from '@dr.pogodin/react-helmet';
import { motion } from 'motion/react';
import { Store, Building2, Landmark, CheckCircle, ArrowRight } from 'lucide-react';
import { franchise } from 'virtual:content';
import { ContentListContext } from '@airo/content';
import { Link } from 'react-router';

const typeIcons: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = { Store, Building2, Landmark };

export default function FranchisePage() {
  return (
    <>
      <Helmet>
        <title>RCF Franchise & Dealership Opportunity | RCF Franchise Portal</title>
        <meta name="description" content="Become an authorised RCF franchise partner. Exclusive territory rights, government subsidy benefits, and full operational support. Apply today." />
        <link rel="canonical" href="https://rcffranchise.in/franchise" />
      </Helmet>
      <main>
        {/* Hero */}
        <section className="relative py-20 md:py-28 overflow-hidden" style={{ background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(221 80% 15%) 100%)' }}>
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-5 -translate-y-1/2 translate-x-1/2" style={{ background: 'hsl(var(--accent))' }} />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="text-3xl md:text-5xl font-bold text-white mb-4">{franchise.hero.headline}</motion.h1>
            <motion.p initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
              className="text-white/75 text-lg max-w-2xl mx-auto">{franchise.hero.subheadline}</motion.p>
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="mt-8 flex flex-wrap gap-4 justify-center">
              <Link to="/apply" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-bold hover:scale-105 transition-all duration-200"
                style={{ background: 'hsl(var(--accent))', color: '#1a1a1a' }}>
                Apply Now <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/franchise-process" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-bold text-white border-2 border-white/40 hover:bg-white/10 transition-all duration-200">
                View Process
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Overview */}
        <section className="py-xxl bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                <h2 className="text-3xl md:text-4xl font-bold mb-5" style={{ color: 'hsl(var(--primary))' }}>{franchise.overview.headline}</h2>
                <p className="text-gray-600 leading-relaxed mb-8">{franchise.overview.body}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ContentListContext field="franchise.overview.highlights">
                    {franchise.overview.highlights.map((h) => (
                      <div key={h.id} className="p-4 rounded-xl border" style={{ borderColor: 'hsl(var(--border))' }}>
                        <div className="font-bold text-sm mb-1" style={{ color: 'hsl(var(--primary))' }}>{h.label}</div>
                        <div className="text-xs text-gray-500">{h.desc}</div>
                      </div>
                    ))}
                  </ContentListContext>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                <img src="/airo-assets/images/pages/home/farmer-partner" alt="RCF franchise partner" className="w-full h-96 object-cover rounded-2xl shadow-xl" loading="lazy" width={600} height={384} />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Franchise Types */}
        <section className="py-xxl" style={{ background: 'hsl(var(--muted))' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="text-sm font-semibold mb-2" style={{ color: 'hsl(var(--secondary))' }}>FRANCHISE TYPES</p>
              <h2 className="text-3xl md:text-4xl font-bold" style={{ color: 'hsl(var(--primary))' }}>Choose Your Partnership Level</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ContentListContext field="franchise.types">
                {franchise.types.map((t, i) => {
                  const Icon = typeIcons[t.icon] || Store;
                  return (
                    <motion.div key={t.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.1 }}
                      className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5" style={{ background: 'hsl(var(--primary)/0.08)' }}>
                        <Icon className="w-7 h-7" style={{ color: 'hsl(var(--primary))' }} />
                      </div>
                      <h3 className="text-xl font-bold mb-1" style={{ color: 'hsl(var(--primary))' }}>{t.type}</h3>
                      <div className="text-lg font-bold mb-1" style={{ color: 'hsl(var(--accent))' }}>{t.investment}</div>
                      <div className="text-xs text-gray-400 mb-4">{t.territory}</div>
                      <p className="text-sm text-gray-600 leading-relaxed mb-5">{t.desc}</p>
                      <div className="space-y-2">
                        {t.requirements.map((req, ri) => (
                          <div key={ri} className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 shrink-0" style={{ color: 'hsl(var(--secondary))' }} />
                            <span className="text-xs text-gray-600">{req}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  );
                })}
              </ContentListContext>
            </div>
          </div>
        </section>

        {/* Eligibility */}
        <section className="py-xxl bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold" style={{ color: 'hsl(var(--primary))' }}>{franchise.eligibility.headline}</h2>
              </div>
              <div className="space-y-3">
                <ContentListContext field="franchise.eligibility.criteria">
                  {franchise.eligibility.criteria.map((c) => (
                    <div key={c.id} className="flex items-center gap-3 p-4 rounded-xl" style={{ background: 'hsl(var(--muted))' }}>
                      <CheckCircle className="w-5 h-5 shrink-0" style={{ color: 'hsl(var(--secondary))' }} />
                      <span className="text-gray-700 text-sm">{c.item}</span>
                    </div>
                  ))}
                </ContentListContext>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-xxl" style={{ background: 'hsl(var(--primary))' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{franchise.cta.headline}</h2>
            <p className="text-white/70 text-lg mb-8 max-w-xl mx-auto">{franchise.cta.body}</p>
            <Link to="/apply" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-bold hover:scale-105 transition-all duration-200"
              style={{ background: 'hsl(var(--accent))', color: '#1a1a1a' }}>
              {franchise.cta.button} <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
