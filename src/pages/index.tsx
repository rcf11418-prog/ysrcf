import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { Helmet } from '@dr.pogodin/react-helmet';
import { motion } from 'motion/react';
import {
  Shield, TrendingUp, Users, Package, Award, BarChart2,
  ArrowRight, CheckCircle, ChevronRight
} from 'lucide-react';
import { home } from 'virtual:content';
import { ContentListContext } from '@airo/content';
import { FormattedBoundText } from '@/components/FormattedBoundText';

const iconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  Shield, TrendingUp, Users, Package, Award, BarChart2,
};

function useCountUp(target: number, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}



function SingleStat({ value, label }: { value: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const numericPart = parseInt(value.replace(/[^0-9]/g, ''), 10) || 0;
  const suffix = value.replace(/[0-9]/g, '');
  const count = useCountUp(numericPart, 1800, visible);
  useEffect(() => {
    const obs = new window.IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className="text-center">
      <div className="text-3xl md:text-4xl font-bold text-white mb-1">
        {visible ? count : 0}{suffix}
      </div>
      <div className="text-sm text-white/70 font-medium">{label}</div>
    </div>
  );
}

function StatsBar() {
  return (
    <section style={{ background: 'hsl(var(--secondary))' }} className="py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <SingleStat value="28+" label="States Covered" />
          <SingleStat value="5000+" label="Active Franchisees" />
          <SingleStat value="50+" label="Products" />
          <SingleStat value="50+" label="Years of Excellence" />
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <Helmet>
        <title>RCF Franchise & Dealership Opportunity Across India – RCF</title>
        <meta name="description" content="Join RCF – Rashtriya Chemicals and Fertilizers franchise network. Government-backed agri-business opportunity with subsidies, training, and pan-India support." />
        <link rel="canonical" href="https://rcffranchise.in/" />
        <meta property="og:title" content="RCF Franchise & Dealership Opportunity Across India" />
        <meta property="og:description" content="Partner with India's trusted government fertilizer company. Apply for RCF franchise today." />
        <meta property="og:type" content="website" />
      </Helmet>

      <main>
        {/* ─── HERO ─── */}
        <section className="relative md:min-h-screen flex items-center justify-center overflow-hidden">
          <img
            src="/airo-assets/images/pages/home/hero"
            alt="Indian agricultural fields"
            className="absolute inset-0 w-full h-full object-cover"
            loading="eager"
            fetchPriority="high"
            width={1920}
            height={1080}
          />
          {/* Overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'linear-gradient(135deg, rgba(10,37,88,0.88) 0%, rgba(10,37,88,0.70) 50%, rgba(26,107,58,0.60) 100%)' }}
          />

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 md:pt-32 md:pb-20 w-full">
            <div className="max-w-3xl">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6"
                style={{ background: 'rgba(212,160,23,0.2)', border: '1px solid rgba(212,160,23,0.5)', color: 'hsl(var(--accent))' }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" style={{ background: 'hsl(var(--accent))' }} />
                Government of India Undertaking
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6"
              >
                {home.hero.headline}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-lg md:text-xl text-white/80 leading-relaxed mb-10 max-w-2xl"
              >
                {home.hero.subheadline}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-wrap gap-4"
              >
                <Link
                  to="/apply"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-bold transition-all duration-200 hover:shadow-2xl hover:scale-105"
                  style={{ background: 'hsl(var(--accent))', color: '#1a1a1a' }}
                >
                  {home.hero.ctaPrimary}
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-bold text-white border-2 border-white/60 hover:bg-white/10 transition-all duration-200"
                >
                  {home.hero.ctaSecondary}
                </Link>
              </motion.div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="hidden md:flex absolute bottom-8 left-1/2 -translate-x-1/2 flex-col items-center gap-1 text-white/50">
            <div className="w-px h-10 bg-gradient-to-b from-transparent to-white/40" />
            <span className="text-xs">Scroll</span>
          </div>
        </section>

        {/* ─── STATS BAR ─── */}
        <StatsBar />

        {/* ─── ABOUT / WHY RCF ─── */}
        <section className="py-xxl bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* Left: text */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-semibold mb-5"
                  style={{ background: 'hsl(var(--primary)/0.08)', color: 'hsl(var(--primary))' }}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>{home.about.badge}</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-5" style={{ color: 'hsl(var(--primary))' }}>
                  {home.about.headline}
                </h2>
                <p className="text-gray-600 leading-relaxed mb-8 text-base">
                  {home.about.body}
                </p>
                <ul className="space-y-3 mb-8">
                  <ContentListContext field="home.about.benefits">
                    {home.about.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 mt-0.5 shrink-0" style={{ color: 'hsl(var(--secondary))' }} />
                        <span className="text-gray-700 text-sm">{benefit}</span>
                      </li>
                    ))}
                  </ContentListContext>
                </ul>
                <Link
                  to="/about"
                  className="inline-flex items-center gap-2 font-semibold text-sm transition-colors hover:gap-3"
                  style={{ color: 'hsl(var(--primary))' }}
                >
                  Learn More About RCF <ChevronRight className="w-4 h-4" />
                </Link>
              </motion.div>

              {/* Right: image */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="relative"
              >
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src="/airo-assets/images/pages/home/about-rcf"
                    alt="RCF manufacturing facility"
                    className="w-full h-80 lg:h-[480px] object-cover"
                    loading="lazy"
                    width={800}
                    height={480}
                  />
                  <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to top, rgba(10,37,88,0.4) 0%, transparent 60%)' }} />
                </div>
                {/* Floating badge */}
                <div
                  className="absolute -bottom-5 -left-5 bg-white rounded-xl shadow-xl p-4 flex items-center gap-3"
                >
                  <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0" style={{ background: 'hsl(var(--secondary)/0.1)' }}>
                    <Award className="w-6 h-6" style={{ color: 'hsl(var(--secondary))' }} />
                  </div>
                  <div>
                    <div className="text-lg font-bold" style={{ color: 'hsl(var(--primary))' }}>50+ Years</div>
                    <div className="text-xs text-gray-500">of Excellence</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ─── PRODUCTS ─── */}
        <section className="py-xxl" style={{ background: 'hsl(var(--muted))' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <p className="text-sm font-semibold mb-3" style={{ color: 'hsl(var(--secondary))' }}>OUR PRODUCT RANGE</p>
              <h2 className="text-3xl md:text-4xl font-bold" style={{ color: 'hsl(var(--primary))' }}>
                Quality Products for Every Crop
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <ContentListContext field="home.products">
                {home.products.map((product, i) => {
                  const imgs = [
                    '/airo-assets/images/pages/home/products-urea',
                    '/airo-assets/images/pages/home/products-npk',
                    '/airo-assets/images/pages/home/products-bio',
                    '/airo-assets/images/pages/home/products-micronutrients',
                    '/airo-assets/images/pages/home/products-urea',
                    '/airo-assets/images/pages/home/products-npk',
                  ];
                  return (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: i * 0.07 }}
                      className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group border border-transparent hover:border-secondary/20"
                    >
                      <div className="relative h-44 overflow-hidden">
                        <img
                          src={imgs[i % imgs.length]}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                          width={400}
                          height={176}
                        />
                        <div className="absolute top-3 left-3">
                          <span
                            className="px-2.5 py-1 rounded-full text-xs font-semibold text-white"
                            style={{ background: 'hsl(var(--secondary))' }}
                          >
                            {product.category}
                          </span>
                        </div>
                      </div>
                      <div className="p-5">
                        <h3 className="font-bold text-base mb-2" style={{ color: 'hsl(var(--primary))' }}>
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </ContentListContext>
            </div>

            <div className="text-center mt-10">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm border-2 transition-all duration-200 hover:shadow-md"
                style={{ borderColor: 'hsl(var(--primary))', color: 'hsl(var(--primary))' }}
              >
                View All Products <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ─── FRANCHISE PROCESS ─── */}
        <section className="py-xxl bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-14"
            >
              <p className="text-sm font-semibold mb-3" style={{ color: 'hsl(var(--secondary))' }}>HOW IT WORKS</p>
              <h2 className="text-3xl md:text-4xl font-bold" style={{ color: 'hsl(var(--primary))' }}>
                Franchise Process — Simple & Transparent
              </h2>
            </motion.div>

            <div className="relative">
              {/* Connector line */}
              <div className="hidden lg:block absolute top-10 left-0 right-0 h-0.5 mx-20" style={{ background: 'hsl(var(--border))' }} />

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
                <ContentListContext field="home.process">
                  {home.process.map((step, i) => (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: i * 0.1 }}
                      className="relative flex flex-col items-center text-center"
                    >
                      <div
                        className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white mb-5 relative z-10 shadow-lg"
                        style={{ background: 'hsl(var(--primary))' }}
                      >
                        {step.step}
                      </div>
                      <h3 className="font-bold text-base mb-2" style={{ color: 'hsl(var(--primary))' }}>
                        {step.title}
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{step.description}</p>
                    </motion.div>
                  ))}
                </ContentListContext>
              </div>
            </div>

            <div className="text-center mt-12">
              <Link
                to="/franchise-process"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm text-white transition-all duration-200 hover:shadow-lg hover:scale-105"
                style={{ background: 'hsl(var(--primary))' }}
              >
                View Full 11-Stage Process <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ─── BENEFITS ─── */}
        <section className="py-xxl" style={{ background: 'hsl(var(--primary))' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-14"
            >
              <p className="text-sm font-semibold mb-3" style={{ color: 'hsl(var(--accent))' }}>FRANCHISE BENEFITS</p>
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                Why Choose RCF Franchise?
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <ContentListContext field="home.benefits">
                {home.benefits.map((benefit, i) => {
                  const Icon = iconMap[benefit.icon] || Shield;
                  return (
                    <motion.div
                      key={benefit.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: i * 0.07 }}
                      className="rounded-xl p-6 hover:scale-105 transition-transform duration-300"
                      style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
                    >
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                        style={{ background: 'hsl(var(--accent)/0.15)' }}
                      >
                        {React.createElement(Icon, { className: 'w-6 h-6', style: { color: 'hsl(var(--accent))' } })}
                      </div>
                      <h3 className="font-bold text-white text-base mb-2">{benefit.title}</h3>
                      <p className="text-white/65 text-sm leading-relaxed">{benefit.description}</p>
                    </motion.div>
                  );
                })}
              </ContentListContext>
            </div>
          </div>
        </section>

        {/* ─── INDIA REACH ─── */}
        <section className="py-xxl bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <p className="text-sm font-semibold mb-3" style={{ color: 'hsl(var(--secondary))' }}>PAN-INDIA PRESENCE</p>
                <h2 className="text-3xl md:text-4xl font-bold mb-5" style={{ color: 'hsl(var(--primary))' }}>
                  {home.reach.headline}
                </h2>
                <p className="text-gray-600 leading-relaxed mb-8">{home.reach.subtext}</p>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { value: home.reach.states, label: 'States & UTs' },
                    { value: home.reach.districts, label: 'Districts' },
                    { value: home.reach.farmers, label: 'Farmers Served' },
                  ].map((item, i) => (
                    <div key={i} className="text-center p-4 rounded-xl" style={{ background: 'hsl(var(--muted))' }}>
                      <div className="text-xl font-bold mb-1" style={{ color: 'hsl(var(--primary))' }}>{item.value}</div>
                      <div className="text-xs text-gray-500">{item.label}</div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* India map SVG */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="flex items-center justify-center"
              >
                <div className="relative w-full max-w-md">
                  {/* Stylised India map using SVG path */}
                  <svg viewBox="0 0 400 500" className="w-full h-auto drop-shadow-xl" aria-label="India map showing RCF franchise presence">
                    <defs>
                      <linearGradient id="mapGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="hsl(221 80% 20%)" />
                        <stop offset="100%" stopColor="hsl(142 60% 25%)" />
                      </linearGradient>
                    </defs>
                    {/* Simplified India silhouette */}
                    <path
                      d="M 180 20 L 220 15 L 260 30 L 290 50 L 310 80 L 320 110 L 330 140 L 340 170 L 345 200 L 340 230 L 330 255 L 315 275 L 300 295 L 285 315 L 270 335 L 255 355 L 240 375 L 225 395 L 210 415 L 200 435 L 195 450 L 190 435 L 180 415 L 165 395 L 150 375 L 135 355 L 120 335 L 105 315 L 90 295 L 75 275 L 60 255 L 50 230 L 45 200 L 50 170 L 60 140 L 70 110 L 80 80 L 100 50 L 130 30 L 160 20 Z"
                      fill="url(#mapGrad)"
                      opacity="0.9"
                    />
                    {/* Dots for franchise locations */}
                    {[
                      [200, 120], [160, 150], [240, 150], [130, 200], [270, 190],
                      [200, 200], [150, 250], [250, 240], [180, 300], [220, 290],
                      [200, 350], [170, 180], [230, 220], [190, 260], [210, 170],
                    ].map(([cx, cy], i) => (
                      <circle key={i} cx={cx} cy={cy} r="5" fill="hsl(43 70% 50%)" opacity="0.9" />
                    ))}
                    {/* Pulse rings on key cities */}
                    {[[200, 200], [160, 150], [240, 240]].map(([cx, cy], i) => (
                      <circle key={`ring-${i}`} cx={cx} cy={cy} r="12" fill="none" stroke="hsl(43 70% 50%)" strokeWidth="2" opacity="0.4" />
                    ))}
                    {/* Labels */}
                    <text x="200" y="480" textAnchor="middle" fontSize="12" fill="hsl(221 80% 20%)" fontWeight="600">
                      Franchise Network Across India
                    </text>
                  </svg>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ─── CTA SECTION ─── */}
        <section className="py-xxl" style={{ background: 'hsl(var(--primary))' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-5 leading-tight">
                  <FormattedBoundText
                    devId="home-cta-headline"
                    guard={{
                      file: 'src/pages/index.tsx',
                      tagName: 'h2',
                      sourceKind: 'bound-expression',
                      contentKey: null,
                      contentKeyTemplate: null,
                      expressionHash: 'sha256:home-cta-headline',
                    }}
                  >
                    {home.cta.headline}
                  </FormattedBoundText>
                </h2>
                <p className="text-white/70 text-base leading-relaxed">
                  {home.cta.subtext}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 lg:justify-end"
              >
                <Link
                  to="/apply"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-bold transition-all duration-200 hover:shadow-2xl hover:scale-105"
                  style={{ background: 'hsl(var(--accent))', color: '#1a1a1a' }}
                >
                  {home.cta.ctaPrimary}
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-bold text-white border-2 border-white/40 hover:bg-white/10 transition-all duration-200"
                >
                  {home.cta.ctaSecondary}
                </Link>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
