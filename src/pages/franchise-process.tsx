import { Helmet } from '@dr.pogodin/react-helmet';
import { motion } from 'motion/react';
import { Clock, FileText, User, ChevronDown, ChevronUp } from 'lucide-react';
import { franchiseprocess } from 'virtual:content';
import { ContentListContext } from '@airo/content';
import { useState } from 'react';
import { Link } from 'react-router';

const statusColors: Record<string, string> = {
  applicant: 'hsl(var(--accent))',
  rcf: 'hsl(var(--secondary))',
  complete: 'hsl(142 60% 35%)',
};
function getStatusLabel(status: string): string {
  if (status === 'applicant') return 'Your Action';
  if (status === 'rcf') return 'RCF Action';
  return 'Completed';
}

export default function FranchiseProcessPage() {
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  return (
    <>
      <Helmet>
        <title>Franchise Process – Step by Step | RCF Franchise Portal</title>
        <meta name="description" content="Learn the complete RCF franchise process — from online application to franchise activation in 30–45 days. Transparent, step-by-step guide." />
        <link rel="canonical" href="https://rcffranchise.in/franchise-process" />
      </Helmet>
      <main>
        {/* Hero */}
        <section className="relative py-20 md:py-28 overflow-hidden" style={{ background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(221 80% 15%) 100%)' }}>
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-5 -translate-y-1/2 translate-x-1/2" style={{ background: 'hsl(var(--accent))' }} />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="text-3xl md:text-5xl font-bold text-white mb-4">{franchiseprocess.hero.headline}</motion.h1>
            <motion.p initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
              className="text-white/75 text-lg max-w-2xl mx-auto">{franchiseprocess.hero.subheadline}</motion.p>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold"
              style={{ background: 'rgba(212,160,23,0.2)', border: '1px solid rgba(212,160,23,0.4)', color: 'hsl(var(--accent))' }}>
              <Clock className="w-4 h-4" />
              <span>Total Timeline: {franchiseprocess.timeline.total}</span>
            </motion.div>
          </div>
        </section>

        {/* Legend */}
        <section className="py-6 bg-white border-b" style={{ borderColor: 'hsl(var(--border))' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap gap-6 justify-center">
              {(['applicant', 'rcf', 'complete'] as const).map((key) => (
                <div key={key} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: statusColors[key] }} />
                  <span className="text-sm text-gray-600">{getStatusLabel(key)}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Process Steps */}
        <section className="py-xxl" style={{ background: 'hsl(var(--muted))' }}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative">
              <div className="absolute left-8 top-0 bottom-0 w-0.5" style={{ background: 'hsl(var(--border))' }} />
              <div className="space-y-6">
                <ContentListContext field="franchiseprocess.stages">
                  {franchiseprocess.stages.map((stage, i) => (
                    <motion.div key={stage.id} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.05 }}
                      className="relative flex gap-6">
                      {/* Step circle */}
                      <div className="w-16 h-16 rounded-full flex items-center justify-center shrink-0 z-10 text-white font-bold text-lg shadow-lg"
                        style={{ background: statusColors[stage.status] || 'hsl(var(--primary))' }}>
                        {stage.step}
                      </div>
                      {/* Content */}
                      <div className="flex-1 bg-white rounded-2xl p-5 shadow-sm mb-2">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-bold text-base" style={{ color: 'hsl(var(--primary))' }}>{stage.title}</h3>
                          <div className="flex items-center gap-2 shrink-0 ml-4">
                            <span className="text-xs px-2.5 py-1 rounded-full font-medium"
                              style={{ background: `${statusColors[stage.status]}20`, color: statusColors[stage.status] }}>
                              {getStatusLabel(stage.status)}
                            </span>
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />{stage.duration}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed mb-3">{stage.desc}</p>
                        {stage.docs.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {stage.docs.map((doc, di) => (
                              <span key={di} className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full"
                                style={{ background: 'hsl(var(--muted))', color: 'hsl(var(--primary))' }}>
                                <FileText className="w-3 h-3" />{doc}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </ContentListContext>
              </div>
            </div>
            <p className="text-center text-sm text-gray-500 mt-8">{franchiseprocess.timeline.note}</p>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-xxl bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold" style={{ color: 'hsl(var(--primary))' }}>Common Questions</h2>
            </div>
            <div className="space-y-3">
              <ContentListContext field="franchiseprocess.faq">
                {franchiseprocess.faq.map((fq) => (
                  <div key={fq.id} className="border rounded-xl overflow-hidden" style={{ borderColor: 'hsl(var(--border))' }}>
                    <button onClick={() => setOpenFaq(openFaq === fq.id ? null : fq.id)}
                      className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors">
                      <span className="font-semibold text-sm" style={{ color: 'hsl(var(--primary))' }}>{fq.q}</span>
                      {openFaq === fq.id ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
                    </button>
                    {openFaq === fq.id && (
                      <div className="px-5 pb-5 text-sm text-gray-600 leading-relaxed">{fq.a}</div>
                    )}
                  </div>
                ))}
              </ContentListContext>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16" style={{ background: 'hsl(var(--primary))' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Ready to Start Your Journey?</h2>
            <p className="text-white/70 mb-8">Apply online and our team will guide you through every step.</p>
            <Link to="/apply" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-bold hover:scale-105 transition-all duration-200"
              style={{ background: 'hsl(var(--accent))', color: '#1a1a1a' }}>
              <User className="w-5 h-5" /> Apply Now
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
