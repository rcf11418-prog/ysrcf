import { Helmet } from '@dr.pogodin/react-helmet';
import { motion } from 'motion/react';
import { Shield, Award, Users, Factory } from 'lucide-react';
import { about } from 'virtual:content';
import { ContentListContext } from '@airo/content';

export default function AboutPage() {
  return (
    <>
      <Helmet>
        <title>About RCF – Rashtriya Chemicals and Fertilizers | RCF Franchise Portal</title>
        <meta name="description" content="Learn about Rashtriya Chemicals and Fertilizers Limited (RCF) — a Government of India enterprise with 50+ years of excellence in fertilizer manufacturing." />
        <link rel="canonical" href="https://rcffranchise.in/about" />
      </Helmet>
      <main>
        {/* Hero */}
        <section className="relative py-20 md:py-28 overflow-hidden" style={{ background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(221 80% 15%) 100%)' }}>
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-5 -translate-y-1/2 translate-x-1/2" style={{ background: 'hsl(var(--accent))' }} />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-5"
              style={{ background: 'rgba(212,160,23,0.2)', border: '1px solid rgba(212,160,23,0.4)', color: 'hsl(var(--accent))' }}>
              <span>{about.hero.badge}</span>
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
              className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
              {about.hero.headline}
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
              className="text-white/75 text-lg max-w-2xl mx-auto">
              {about.hero.subheadline}
            </motion.p>
          </div>
        </section>

        {/* Overview */}
        <section className="py-xxl bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{ color: 'hsl(var(--primary))' }}>{about.overview.headline}</h2>
                <p className="text-gray-600 leading-relaxed mb-4">{about.overview.body1}</p>
                <p className="text-gray-600 leading-relaxed mb-8">{about.overview.body2}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border" style={{ borderColor: 'hsl(var(--border))' }}>
                    <Factory className="w-5 h-5 mb-2" style={{ color: 'hsl(var(--secondary))' }} />
                    <div className="text-lg font-bold" style={{ color: 'hsl(var(--primary))' }}>{about.overview.established}</div>
                    <div className="text-xs text-gray-500">Established</div>
                  </div>
                  <div className="p-4 rounded-xl border" style={{ borderColor: 'hsl(var(--border))' }}>
                    <Users className="w-5 h-5 mb-2" style={{ color: 'hsl(var(--secondary))' }} />
                    <div className="text-lg font-bold" style={{ color: 'hsl(var(--primary))' }}>{about.overview.employees}</div>
                    <div className="text-xs text-gray-500">Employees</div>
                  </div>
                  <div className="p-4 rounded-xl border" style={{ borderColor: 'hsl(var(--border))' }}>
                    <Shield className="w-5 h-5 mb-2" style={{ color: 'hsl(var(--secondary))' }} />
                    <div className="text-lg font-bold" style={{ color: 'hsl(var(--primary))' }}>{about.overview.plants}</div>
                    <div className="text-xs text-gray-500">Plants</div>
                  </div>
                  <div className="p-4 rounded-xl border" style={{ borderColor: 'hsl(var(--border))' }}>
                    <Award className="w-5 h-5 mb-2" style={{ color: 'hsl(var(--secondary))' }} />
                    <div className="text-lg font-bold" style={{ color: 'hsl(var(--primary))' }}>{about.overview.capacity}</div>
                    <div className="text-xs text-gray-500">Capacity</div>
                  </div>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                <img src="/airo-assets/images/pages/home/about-rcf" alt="RCF manufacturing facility" className="w-full h-96 object-cover rounded-2xl shadow-xl" loading="lazy" width={600} height={384} />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-xxl" style={{ background: 'hsl(var(--muted))' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold" style={{ color: 'hsl(var(--primary))' }}>{about.mission.headline}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: 'hsl(var(--primary)/0.08)' }}>
                  <Shield className="w-6 h-6" style={{ color: 'hsl(var(--primary))' }} />
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ color: 'hsl(var(--primary))' }}>Our Mission</h3>
                <p className="text-gray-600 leading-relaxed">{about.mission.mission}</p>
              </div>
              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: 'hsl(var(--secondary)/0.08)' }}>
                  <Award className="w-6 h-6" style={{ color: 'hsl(var(--secondary))' }} />
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ color: 'hsl(var(--primary))' }}>Our Vision</h3>
                <p className="text-gray-600 leading-relaxed">{about.mission.vision}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <ContentListContext field="about.mission.values">
                {about.mission.values.map((v) => (
                  <div key={v.id} className="bg-white rounded-xl p-5 text-center shadow-sm">
                    <div className="text-lg font-bold mb-1" style={{ color: 'hsl(var(--primary))' }}>{v.title}</div>
                    <div className="text-sm text-gray-500">{v.desc}</div>
                  </div>
                ))}
              </ContentListContext>
            </div>
          </div>
        </section>

        {/* Milestones */}
        <section className="py-xxl bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold" style={{ color: 'hsl(var(--primary))' }}>Our Journey</h2>
            </div>
            <div className="relative">
              <div className="absolute left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2 hidden md:block" style={{ background: 'hsl(var(--border))' }} />
              <div className="space-y-8">
                <ContentListContext field="about.milestones">
                  {about.milestones.map((m, i) => (
                    <motion.div key={m.id} initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
                      className={`flex items-center gap-6 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                      <div className="flex-1">
                        <div className="bg-white border rounded-xl p-5 shadow-sm inline-block" style={{ borderColor: 'hsl(var(--border))' }}>
                          <div className="text-sm font-bold mb-1" style={{ color: 'hsl(var(--accent))' }}>{m.year}</div>
                          <div className="text-gray-700 text-sm">{m.event}</div>
                        </div>
                      </div>
                      <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 text-white text-xs font-bold" style={{ background: 'hsl(var(--primary))' }}>
                        {m.year.slice(2)}
                      </div>
                      <div className="flex-1 hidden md:block" />
                    </motion.div>
                  ))}
                </ContentListContext>
              </div>
            </div>
          </div>
        </section>

        {/* Awards */}
        <section className="py-xxl" style={{ background: 'hsl(var(--muted))' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold" style={{ color: 'hsl(var(--primary))' }}>Awards & Recognition</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <ContentListContext field="about.awards">
                {about.awards.map((a) => (
                  <div key={a.id} className="bg-white rounded-xl p-6 text-center shadow-sm border-t-4" style={{ borderTopColor: 'hsl(var(--accent))' }}>
                    <Award className="w-8 h-8 mx-auto mb-3" style={{ color: 'hsl(var(--accent))' }} />
                    <div className="font-bold text-sm mb-1" style={{ color: 'hsl(var(--primary))' }}>{a.title}</div>
                    <div className="text-xs text-gray-500">{a.body}</div>
                  </div>
                ))}
              </ContentListContext>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
