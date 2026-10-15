import { Helmet } from '@dr.pogodin/react-helmet';
import { motion } from 'motion/react';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';
import { faq } from 'virtual:content';
import { ContentListContext } from '@airo/content';
import { useState } from 'react';
import { Link } from 'react-router';

export default function FAQPage() {
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('General');
  const [search, setSearch] = useState('');

  return (
    <>
      <Helmet>
        <title>FAQ – Frequently Asked Questions | RCF Franchise Portal</title>
        <meta name="description" content="Get answers to common questions about RCF franchise application, investment, products, operations, and government subsidy schemes." />
        <link rel="canonical" href="https://rcffranchise.in/faq" />
      </Helmet>
      <main>
        {/* Hero */}
        <section className="relative py-20 md:py-28 overflow-hidden" style={{ background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(221 80% 15%) 100%)' }}>
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-5 -translate-y-1/2 translate-x-1/2" style={{ background: 'hsl(var(--accent))' }} />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="text-3xl md:text-5xl font-bold text-white mb-4">{faq.hero.headline}</motion.h1>
            <motion.p initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
              className="text-white/75 text-lg max-w-2xl mx-auto mb-8">{faq.hero.subheadline}</motion.p>
            {/* Search */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
              className="max-w-lg mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search questions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl text-gray-800 text-sm focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': 'hsl(var(--accent))' } as React.CSSProperties}
              />
            </motion.div>
          </div>
        </section>

        {/* Category tabs */}
        <section className="py-6 bg-white border-b" style={{ borderColor: 'hsl(var(--border))' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap gap-2 justify-center">
              <ContentListContext field="faq.categories">
                {faq.categories.map((cat) => (
                  <button key={cat.id} onClick={() => setActiveCategory(cat.label)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${activeCategory === cat.label ? 'text-white shadow-md' : 'text-gray-600 hover:text-gray-900'}`}
                    style={activeCategory === cat.label ? { background: 'hsl(var(--primary))' } : { background: 'hsl(var(--muted))' }}>
                    {cat.label}
                  </button>
                ))}
              </ContentListContext>
            </div>
          </div>
        </section>

        {/* FAQ list */}
        <section className="py-xxl" style={{ background: 'hsl(var(--muted))' }}>
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-3">
              <ContentListContext field="faq.faqs">
                {faq.faqs.map((f) => {
                  const matchesCategory = f.cat === activeCategory;
                  const matchesSearch = search === '' || f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase());
                  const visible = matchesCategory && matchesSearch;
                  return (
                    <div key={f.id} className={visible ? '' : 'hidden'}>
                      <div className="bg-white border rounded-xl overflow-hidden shadow-sm" style={{ borderColor: 'hsl(var(--border))' }}>
                        <button onClick={() => setOpenFaq(openFaq === f.id ? null : f.id)}
                          className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors">
                          <span className="font-semibold text-sm pr-4" style={{ color: 'hsl(var(--primary))' }}>{f.q}</span>
                          {openFaq === f.id ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
                        </button>
                        {openFaq === f.id && (
                          <div className="px-5 pb-5 text-sm text-gray-600 leading-relaxed border-t pt-4" style={{ borderColor: 'hsl(var(--border))' }}>
                            {f.a}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </ContentListContext>
            </div>
          </div>
        </section>

        {/* Still have questions */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-bold mb-3" style={{ color: 'hsl(var(--primary))' }}>Still have questions?</h2>
            <p className="text-gray-600 mb-6">Our franchise team is happy to help. Reach out to us directly.</p>
            <Link to="/contact" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white transition-all duration-200 hover:shadow-lg"
              style={{ background: 'hsl(var(--primary))' }}>
              Contact Us
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
