import { Helmet } from '@dr.pogodin/react-helmet';
import { useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle, Leaf, Beaker, Droplets } from 'lucide-react';
import { products } from 'virtual:content';
import { ContentListContext } from '@airo/content';

const catIcons: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  'Nitrogenous': Beaker,
  'Complex': Leaf,
  'Bio / Organic': Leaf,
  'Specialty': Droplets,
  'Industrial': Beaker,
};

export default function ProductsPage() {
  const [activeCategory, setActiveCategory] = useState('All Products');

  return (
    <>
      <Helmet>
        <title>RCF Products – Fertilizers & Agri-Inputs | RCF Franchise Portal</title>
        <meta name="description" content="Explore RCF's complete range of fertilizers including Urea, NPK Complex, Bio-fertilizers, Micronutrients, and Water Soluble fertilizers for all crops." />
        <link rel="canonical" href="https://rcffranchise.in/products" />
      </Helmet>
      <main>
        {/* Hero */}
        <section className="relative py-20 md:py-28 overflow-hidden" style={{ background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(221 80% 15%) 100%)' }}>
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-5 -translate-y-1/2 translate-x-1/2" style={{ background: 'hsl(var(--accent))' }} />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="text-3xl md:text-5xl font-bold text-white mb-4">{products.hero.headline}</motion.h1>
            <motion.p initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
              className="text-white/75 text-lg max-w-2xl mx-auto">{products.hero.subheadline}</motion.p>
          </div>
        </section>

        {/* Filter tabs */}
        <section className="py-8 bg-white border-b" style={{ borderColor: 'hsl(var(--border))' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap gap-2 justify-center">
              <ContentListContext field="products.categories">
                {products.categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.label)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${activeCategory === cat.label ? 'text-white shadow-md' : 'text-gray-600 hover:text-gray-900'}`}
                    style={activeCategory === cat.label ? { background: 'hsl(var(--primary))' } : { background: 'hsl(var(--muted))' }}
                  >
                    {cat.label}
                  </button>
                ))}
              </ContentListContext>
            </div>
          </div>
        </section>

        {/* Products grid — all rendered, filtered by CSS visibility */}
        <section className="py-xxl" style={{ background: 'hsl(var(--muted))' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ContentListContext field="products.products">
                {products.products.map((p, i) => {
                  const Icon = catIcons[p.category] || Leaf;
                  const visible = activeCategory === 'All Products' || p.category === activeCategory;
                  return (
                    <motion.div key={p.id}
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.05 }}
                      className={`bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-transparent hover:border-secondary/20 ${visible ? '' : 'hidden'}`}>
                      {p.image && (
                        <img src={p.image} alt={p.crops} loading="lazy" className="w-full h-40 object-cover" />
                      )}
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'hsl(var(--secondary)/0.1)' }}>
                            <Icon className="w-6 h-6" style={{ color: 'hsl(var(--secondary))' }} />
                          </div>
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: 'hsl(var(--primary)/0.08)', color: 'hsl(var(--primary))' }}>
                            {p.category}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold mb-1" style={{ color: 'hsl(var(--primary))' }}>{p.name}</h3>
                        <div className="flex gap-3 mb-3">
                          <span className="text-xs text-gray-500">NPK: <strong>{p.npk}</strong></span>
                          <span className="text-xs text-gray-500">Form: <strong>{p.form}</strong></span>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed mb-4">{p.desc}</p>
                        <div className="space-y-1.5">
                          {p.benefits.map((b, bi) => (
                            <div key={bi} className="flex items-center gap-2">
                              <CheckCircle className="w-3.5 h-3.5 shrink-0" style={{ color: 'hsl(var(--secondary))' }} />
                              <span className="text-xs text-gray-600">{b}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="px-6 pb-5">
                        <div className="text-xs text-gray-400 pt-3 border-t" style={{ borderColor: 'hsl(var(--border))' }}>
                          Suitable for: <span className="font-medium text-gray-600">{p.crops}</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </ContentListContext>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
