import { Helmet } from '@dr.pogodin/react-helmet';
import { motion } from 'motion/react';
import { MapPin, Mail, Clock, Send, CheckCircle } from 'lucide-react';
import { contact } from 'virtual:content';
import { ContentListContext } from '@airo/content';
import { useState } from 'react';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', mobile: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSubmitted(true);
    setLoading(false);
  };

  return (
    <>
      <Helmet>
        <title>Contact Us – RCF Franchise Portal</title>
        <meta name="description" content="Contact RCF's franchise team for enquiries, support, or to schedule a consultation. Email and office addresses." />
        <link rel="canonical" href="https://rcffranchise.in/contact" />
      </Helmet>
      <main>
        {/* Hero */}
        <section className="relative py-20 md:py-28 overflow-hidden" style={{ background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(221 80% 15%) 100%)' }}>
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-5 -translate-y-1/2 translate-x-1/2" style={{ background: 'hsl(var(--accent))' }} />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="text-3xl md:text-5xl font-bold text-white mb-4">{contact.hero.headline}</motion.h1>
            <motion.p initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
              className="text-white/75 text-lg max-w-2xl mx-auto">{contact.hero.subheadline}</motion.p>
          </div>
        </section>

        {/* Main content */}
        <section className="py-xxl" style={{ background: 'hsl(var(--muted))' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
              {/* Left: offices + info */}
              <div className="lg:col-span-2 space-y-6">
                <ContentListContext field="contact.offices">
                  {contact.offices.map((office) => (
                    <div key={office.id} className="bg-white rounded-2xl p-6 shadow-sm">
                      <h3 className="font-bold text-base mb-4" style={{ color: 'hsl(var(--primary))' }}>{office.name}</h3>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <MapPin className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'hsl(var(--secondary))' }} />
                          <span className="text-sm text-gray-600">{office.address}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Mail className="w-4 h-4 shrink-0" style={{ color: 'hsl(var(--secondary))' }} />
                          <span className="text-sm text-gray-600">{office.email}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Clock className="w-4 h-4 shrink-0" style={{ color: 'hsl(var(--secondary))' }} />
                          <span className="text-sm text-gray-600">{office.hours}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </ContentListContext>
              </div>

              {/* Right: contact form */}
              <div className="lg:col-span-3">
                <div className="bg-white rounded-2xl p-8 shadow-sm">
                  <h2 className="text-2xl font-bold mb-2" style={{ color: 'hsl(var(--primary))' }}>{contact.formTitle}</h2>
                  <p className="text-gray-500 text-sm mb-6">{contact.formSubtitle}</p>

                  {submitted ? (
                    <div className="text-center py-12">
                      <CheckCircle className="w-16 h-16 mx-auto mb-4" style={{ color: 'hsl(var(--secondary))' }} />
                      <h3 className="text-xl font-bold mb-2" style={{ color: 'hsl(var(--primary))' }}>Message Sent!</h3>
                      <p className="text-gray-600">Our team will respond within 1 working day.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Full Name *</label>
                          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                            style={{ borderColor: 'hsl(var(--border))' }} placeholder="Your full name" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Mobile Number *</label>
                          <input required value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                            style={{ borderColor: 'hsl(var(--border))' }} placeholder="+91 XXXXX XXXXX" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email Address</label>
                        <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                          style={{ borderColor: 'hsl(var(--border))' }} placeholder="your@email.com" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Subject *</label>
                        <select required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:border-transparent bg-white"
                          style={{ borderColor: 'hsl(var(--border))' }}>
                          <option value="">Select a subject</option>
                          <ContentListContext field="contact.subjects">
                            {contact.subjects.map((s) => (
                              <option key={s.id} value={s.label}>{s.label}</option>
                            ))}
                          </ContentListContext>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Message *</label>
                        <textarea required rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:border-transparent resize-none"
                          style={{ borderColor: 'hsl(var(--border))' }} placeholder="Describe your enquiry in detail..." />
                      </div>
                      <button type="submit" disabled={loading}
                        className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-sm text-white transition-all duration-200 hover:shadow-lg disabled:opacity-70"
                        style={{ background: 'hsl(var(--primary))' }}>
                        {loading ? 'Sending...' : <><Send className="w-4 h-4" /> Send Message</>}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
