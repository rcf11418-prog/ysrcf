import { motion } from 'motion/react';

interface PageHeroProps {
  badge?: string;
  headline: string;
  subheadline: string;
  bgClass?: string;
}

export default function PageHero({ badge, headline, subheadline, bgClass }: PageHeroProps) {
  return (
    <section
      className={`relative py-20 md:py-28 overflow-hidden ${bgClass || ''}`}
      style={!bgClass ? { background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(221 80% 15%) 100%)' } : undefined}
    >
      {/* Decorative circles */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-5 -translate-y-1/2 translate-x-1/2"
        style={{ background: 'hsl(var(--accent))' }} />
      <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-5 translate-y-1/2 -translate-x-1/2"
        style={{ background: 'hsl(var(--secondary))' }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {badge && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-5"
            style={{ background: 'rgba(212,160,23,0.2)', border: '1px solid rgba(212,160,23,0.4)', color: 'hsl(var(--accent))' }}
          >
            {badge}
          </motion.div>
        )}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight"
        >
          {headline}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-white/75 text-lg max-w-2xl mx-auto"
        >
          {subheadline}
        </motion.p>
      </div>
    </section>
  );
}
