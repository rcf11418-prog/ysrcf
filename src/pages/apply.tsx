import { Helmet } from '@dr.pogodin/react-helmet';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useRef, useEffect } from 'react';
import { CheckCircle, Upload, AlertCircle, ChevronRight, ChevronLeft, FileText, User, MapPin, Building2, Paperclip, ClipboardList } from 'lucide-react';
import { apply } from 'virtual:content';
import { ContentListContext } from '@airo/content';
import { apiFetch } from '@/lib/useDashboard';

type FormData = Record<string, string>;
type FileData = Record<string, { base64: string; name: string; size: number } | null>;

const stepIcons = [User, MapPin, Building2, ClipboardList, Paperclip, CheckCircle];

function InputField({ label, name, value, onChange, required, type = 'text', placeholder, maxLength, pattern, hint }: {
  label: string; name: string; value: string; onChange: (n: string, v: string) => void;
  required?: boolean; type?: string; placeholder?: string; maxLength?: number; pattern?: string; hint?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        type={type} value={value} required={required} placeholder={placeholder}
        maxLength={maxLength} pattern={pattern}
        onChange={(e) => onChange(name, e.target.value)}
        className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all"
        style={{ borderColor: 'hsl(var(--border))' }}
      />
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

function SelectField({ label, name, value, onChange, required, options, placeholder }: {
  label: string; name: string; value: string; onChange: (n: string, v: string) => void;
  required?: boolean; options: { value: string; label?: string }[]; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <select value={value} required={required} onChange={(e) => onChange(name, e.target.value)}
        className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:border-transparent bg-white transition-all"
        style={{ borderColor: 'hsl(var(--border))' }}>
        <option value="">{placeholder || 'Select...'}</option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label || o.value}</option>)}
      </select>
    </div>
  );
}

export default function ApplyPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({});
  const [fileData, setFileData] = useState<FileData>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [applicationId, setApplicationId] = useState('');
  const [error, setError] = useState('');
  const [franchiseTypes, setFranchiseTypes] = useState(apply.franchiseTypes.map((type) => type.value));
  const [franchiseTypesError, setFranchiseTypesError] = useState('');
  const [franchiseTypesLoading, setFranchiseTypesLoading] = useState(true);
  const [franchiseSettingsAttempt, setFranchiseSettingsAttempt] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    setFranchiseTypesLoading(true);
    setFranchiseTypesError('');
    apiFetch<{ franchiseTypes: string[] }>('/api/franchise-settings', { cache: 'no-store' })
      .then((settings) => {
        if (!Array.isArray(settings.franchiseTypes) || settings.franchiseTypes.length === 0
          || !settings.franchiseTypes.every((type) => typeof type === 'string' && type.trim())) {
          throw new Error('The current franchise options are invalid.');
        }
        setFranchiseTypes(settings.franchiseTypes);
        setFormData((current) => settings.franchiseTypes.includes(current.franchiseType ?? '')
          ? current
          : { ...current, franchiseType: '' });
      })
      .catch((loadError) => {
        console.error('application.franchise-types.load.failed', loadError);
        setFranchiseTypesError(loadError instanceof Error ? loadError.message : 'Unable to load current franchise options.');
      })
      .finally(() => setFranchiseTypesLoading(false));
  }, [franchiseSettingsAttempt]);

  const totalSteps = apply.steps.length;

  const setField = (name: string, value: string) => setFormData((p) => ({ ...p, [name]: value }));

  const handleFileChange = async (field: string, file: File | null) => {
    if (!file) { setFileData((p) => ({ ...p, [field]: null })); return; }
    if (file.size > 1.5 * 1024 * 1024) {
      setError('Each document must be 1.5 MB or smaller.');
      return;
    }
    setError('');
    const reader = new FileReader();
    reader.onload = (e) => {
      setFileData((p) => ({ ...p, [field]: { base64: e.target?.result as string, name: file.name, size: file.size } }));
    };
    reader.readAsDataURL(file);
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) setCurrentStep((s) => s + 1);
  };
  const handleBack = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      const payload: Record<string, string> = { ...formData };
      // Attach file data
      for (const [field, fd] of Object.entries(fileData)) {
        if (fd) {
          payload[field] = fd.base64;
          payload[`${field}Name`] = fd.name;
        }
      }
      const data = await apiFetch<{ applicationId: string }>('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setApplicationId(data.applicationId);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <>
        <Helmet>
          <title>Application Submitted – RCF Franchise Portal</title>
        </Helmet>
        <main className="min-h-screen flex items-center justify-center py-20 px-4" style={{ background: 'hsl(var(--muted))' }}>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
            className="bg-white rounded-3xl p-10 max-w-lg w-full text-center shadow-xl">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: 'hsl(var(--secondary)/0.1)' }}>
              <CheckCircle className="w-10 h-10" style={{ color: 'hsl(var(--secondary))' }} />
            </div>
            <h1 className="text-2xl font-bold mb-2" style={{ color: 'hsl(var(--primary))' }}>Application Submitted!</h1>
            <p className="text-gray-500 mb-6">Your application has been received. Keep your Application ID to check its current status. Submission is not approval.</p>
            <div className="rounded-2xl p-5 mb-6" style={{ background: 'hsl(var(--primary)/0.05)', border: '2px dashed hsl(var(--primary)/0.2)' }}>
              <p className="text-xs text-gray-500 mb-1">Your Application ID</p>
              <p className="text-2xl font-bold tracking-wider" style={{ color: 'hsl(var(--primary))' }}>{applicationId}</p>
              <p className="text-xs text-gray-400 mt-1">This ID is required to check your application status. Keep it private.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              <a href="/application-status" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white transition-all duration-200 hover:shadow-lg"
                style={{ background: 'hsl(var(--primary))' }}>Check Application Status</a>
              <a href="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 hover:shadow-lg"
                style={{ background: 'hsl(var(--muted))', color: 'hsl(var(--primary))' }}>Back to Home</a>
            </div>
          </motion.div>
        </main>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Apply for RCF Franchise | RCF Franchise Portal</title>
        <meta name="description" content="Apply online for an RCF franchise. Fill in personal, business, and financial details to get your instant Application ID." />
        <link rel="canonical" href="https://rcffranchise.in/apply" />
      </Helmet>
      <main>
        {/* Hero */}
        <section className="relative py-16 md:py-20 overflow-hidden" style={{ background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(221 80% 15%) 100%)' }}>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="text-2xl md:text-4xl font-bold text-white mb-2">{apply.hero.headline}</motion.h1>
            <motion.p initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
              className="text-white/70 text-sm max-w-xl mx-auto">{apply.hero.subheadline}</motion.p>
          </div>
        </section>

        {/* Stepper + Form */}
        <section className="py-10" style={{ background: 'hsl(var(--muted))' }}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Step indicators */}
            <div className="mb-8 overflow-x-auto">
              <div className="flex items-center min-w-max mx-auto justify-center gap-0">
                <ContentListContext field="apply.steps">
                  {apply.steps.map((step, i) => {
                    const Icon = stepIcons[i] || User;
                    const done = i < currentStep;
                    const active = i === currentStep;
                    return (
                      <div key={step.id} className="flex items-center">
                        <div className="flex flex-col items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${done ? 'text-white' : active ? 'text-white' : 'text-gray-400'}`}
                            style={{ background: done ? 'hsl(var(--secondary))' : active ? 'hsl(var(--primary))' : 'hsl(var(--border))' }}>
                            {done ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                          </div>
                          <span className={`text-xs mt-1 font-medium hidden sm:block ${active ? '' : 'text-gray-400'}`}
                            style={active ? { color: 'hsl(var(--primary))' } : {}}>
                            {step.label}
                          </span>
                        </div>
                        {i < apply.steps.length - 1 && (
                          <div className="w-8 sm:w-12 h-0.5 mx-1 mb-4" style={{ background: i < currentStep ? 'hsl(var(--secondary))' : 'hsl(var(--border))' }} />
                        )}
                      </div>
                    );
                  })}
                </ContentListContext>
              </div>
            </div>

            {/* Form card */}
            <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b" style={{ borderColor: 'hsl(var(--border))', background: 'hsl(var(--primary)/0.03)' }}>
                <h2 className="font-bold text-base" style={{ color: 'hsl(var(--primary))' }}>
                  Step {currentStep + 1} of {totalSteps}: {apply.steps[currentStep]?.label}
                </h2>
                <p className="text-xs text-gray-500">{apply.steps[currentStep]?.desc}</p>
              </div>

              <form ref={formRef} className="p-6 md:p-8">
                <AnimatePresence mode="wait">
                  <motion.div key={currentStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>

                    {/* Step 0: Personal Details */}
                    {currentStep === 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="sm:col-span-2">
                          <InputField label="Full Name (as per PAN)" name="fullName" value={formData.fullName || ''} onChange={setField} required placeholder="Enter your full name" />
                        </div>
                        <InputField label="Mobile Number" name="mobile" value={formData.mobile || ''} onChange={setField} required type="tel" placeholder="+91 XXXXX XXXXX" maxLength={13} />
                        <InputField label="WhatsApp Number" name="whatsapp" value={formData.whatsapp || ''} onChange={setField} type="tel" placeholder="Same as mobile if same" maxLength={13} />
                        <InputField label="Email Address" name="email" value={formData.email || ''} onChange={setField} required type="email" placeholder="your@email.com" />
                        <InputField label="Date of Birth" name="dateOfBirth" value={formData.dateOfBirth || ''} onChange={setField} type="date" />
                        <SelectField label="Gender" name="gender" value={formData.gender || ''} onChange={setField}
                          options={[{ value: 'Male' }, { value: 'Female' }, { value: 'Other' }]} />
                        <InputField label="PAN Number" name="panNumber" value={formData.panNumber || ''} onChange={setField} required placeholder="ABCDE1234F" maxLength={10} hint="10-character alphanumeric PAN" />
                        <InputField label="Aadhaar Number" name="aadhaarNumber" value={formData.aadhaarNumber || ''} onChange={setField} required placeholder="XXXX XXXX XXXX" maxLength={12} hint="12-digit Aadhaar number" />
                        <div className="sm:col-span-2">
                          <InputField label="GST Number (if applicable)" name="gstNumber" value={formData.gstNumber || ''} onChange={setField} placeholder="22AAAAA0000A1Z5" maxLength={15} />
                        </div>
                      </div>
                    )}

                    {/* Step 1: Address */}
                    {currentStep === 1 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="sm:col-span-2">
                          <InputField label="Address Line 1" name="addressLine1" value={formData.addressLine1 || ''} onChange={setField} required placeholder="House/Flat No., Street, Area" />
                        </div>
                        <div className="sm:col-span-2">
                          <InputField label="Address Line 2" name="addressLine2" value={formData.addressLine2 || ''} onChange={setField} placeholder="Landmark, Colony (optional)" />
                        </div>
                        <InputField label="City / Town" name="city" value={formData.city || ''} onChange={setField} required placeholder="City or Town" />
                        <InputField label="District" name="district" value={formData.district || ''} onChange={setField} required placeholder="District name" />
                        <SelectField label="State" name="state" value={formData.state || ''} onChange={setField} required
                          options={apply.indianStates.map((s) => ({ value: s.value }))} placeholder="Select State" />
                        <InputField label="PIN Code" name="pincode" value={formData.pincode || ''} onChange={setField} required placeholder="6-digit PIN" maxLength={6} />
                      </div>
                    )}

                    {/* Step 2: Business Details */}
                    {currentStep === 2 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="sm:col-span-2">
                          <InputField label="Business / Firm Name" name="businessName" value={formData.businessName || ''} onChange={setField} placeholder="Registered business name (if any)" />
                        </div>
                        <SelectField label="Business Type" name="businessType" value={formData.businessType || ''} onChange={setField}
                          options={[{ value: 'Proprietorship' }, { value: 'Partnership' }, { value: 'Private Limited' }, { value: 'LLP' }, { value: 'Individual' }]} />
                        <SelectField label="Years in Business" name="yearsInBusiness" value={formData.yearsInBusiness || ''} onChange={setField}
                          options={[{ value: 'New / No Business' }, { value: '1–2 years' }, { value: '3–5 years' }, { value: '5–10 years' }, { value: '10+ years' }]} />
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Are you an existing fertilizer dealer?</label>
                          <div className="flex gap-4">
                            {['Yes', 'No'].map((opt) => (
                              <label key={opt} className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="existingFertilizerDealer" value={opt === 'Yes' ? 'true' : 'false'}
                                  checked={formData.existingFertilizerDealer === (opt === 'Yes' ? 'true' : 'false')}
                                  onChange={(e) => setField('existingFertilizerDealer', e.target.value)}
                                  className="w-4 h-4" />
                                <span className="text-sm text-gray-700">{opt}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                        {formData.existingFertilizerDealer === 'true' && (
                          <div className="sm:col-span-2">
                            <InputField label="Current Brands / Companies" name="currentBrands" value={formData.currentBrands || ''} onChange={setField} placeholder="e.g. IFFCO, Coromandel, etc." />
                          </div>
                        )}
                        <InputField label="Shop / Outlet Area (sq ft)" name="shopArea" value={formData.shopArea || ''} onChange={setField} placeholder="e.g. 500" />
                        <InputField label="Warehouse Area (sq ft)" name="warehouseArea" value={formData.warehouseArea || ''} onChange={setField} placeholder="e.g. 1000" />
                      </div>
                    )}

                    {/* Step 3: Franchise Preference */}
                    {currentStep === 3 && (
                      <div className="space-y-6">
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-3">
                            Franchise Type<span className="text-red-500 ml-0.5">*</span>
                          </label>
                          {franchiseTypesError && (
                            <div role="alert" className="mb-3 text-sm text-red-700">
                              {franchiseTypesError}{' '}
                              <button type="button" className="font-semibold underline" onClick={() => setFranchiseSettingsAttempt((attempt) => attempt + 1)}>Retry</button>
                            </div>
                          )}
                          {franchiseTypesLoading && <p className="mb-3 text-sm text-gray-500">Loading current franchise options…</p>}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {franchiseTypes.map((type) => (
                              <label key={type} className={`cursor-pointer rounded-xl p-4 border-2 transition-all duration-200 ${formData.franchiseType === type ? 'border-primary' : 'border-border hover:border-primary/40'}`}
                                style={formData.franchiseType === type ? { borderColor: 'hsl(var(--primary))', background: 'hsl(var(--primary)/0.04)' } : { borderColor: 'hsl(var(--border))' }}>
                                <input type="radio" name="franchiseType" value={type} checked={formData.franchiseType === type}
                                  onChange={(e) => setField('franchiseType', e.target.value)} className="sr-only" />
                                <div className="font-bold text-sm mb-0.5" style={{ color: 'hsl(var(--primary))' }}>{type}</div>
                                <div className="text-xs text-gray-500 mb-1">Subject to eligibility and company review.</div>
                                <div className="text-xs font-semibold" style={{ color: 'hsl(var(--accent))' }}>Investment to be confirmed by the company.</div>
                              </label>
                            ))}
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          <div className="sm:col-span-2">
                            <InputField label="Preferred Location / Area" name="preferredLocation" value={formData.preferredLocation || ''} onChange={setField} required placeholder="Village, Block, District, State" />
                          </div>
                          <div className="sm:col-span-2">
                            <InputField label="Coverage Area Description" name="coverageArea" value={formData.coverageArea || ''} onChange={setField} placeholder="Describe the area you plan to cover" />
                          </div>
                          <div className="sm:col-span-2">
                            <InputField label="Investment Capacity (₹)" name="investmentCapacity" value={formData.investmentCapacity || ''} onChange={setField} required type="number" placeholder="e.g. 1000000" hint="Enter amount in Rupees" />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 4: Documents */}
                    {currentStep === 4 && (
                      <div className="space-y-4">
                        <p className="text-sm text-gray-500 mb-4">Upload clear, legible copies. Accepted formats: PDF, JPG, PNG. Max 1.5 MB per file.</p>
                        <ContentListContext field="apply.requiredDocs">
                          {apply.requiredDocs.map((doc) => {
                            const fd = fileData[doc.field];
                            return (
                              <div key={doc.id} className="flex items-center gap-4 p-4 rounded-xl border" style={{ borderColor: 'hsl(var(--border))' }}>
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: fd ? 'hsl(var(--secondary)/0.1)' : 'hsl(var(--muted))' }}>
                                  {fd ? <CheckCircle className="w-5 h-5" style={{ color: 'hsl(var(--secondary))' }} /> : <FileText className="w-5 h-5 text-gray-400" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-semibold text-gray-700">
                                    {doc.label}{doc.required && <span className="text-red-500 ml-0.5">*</span>}
                                  </div>
                                  {fd && <div className="text-xs text-gray-400 truncate">{fd.name} ({(fd.size / 1024).toFixed(0)} KB)</div>}
                                </div>
                                <label className="cursor-pointer flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all"
                                  style={{ background: 'hsl(var(--primary)/0.08)', color: 'hsl(var(--primary))' }}>
                                  <Upload className="w-3.5 h-3.5" />
                                  {fd ? 'Replace' : 'Upload'}
                                  <input type="file" accept={doc.accept} className="sr-only"
                                    onChange={(e) => handleFileChange(doc.field, e.target.files?.[0] || null)} />
                                </label>
                              </div>
                            );
                          })}
                        </ContentListContext>
                        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
                      </div>
                    )}

                    {/* Step 5: Review & Submit */}
                    {currentStep === 5 && (
                      <div className="space-y-6">
                        <div className="p-4 rounded-xl text-sm" style={{ background: 'hsl(var(--secondary)/0.06)', color: 'hsl(var(--secondary))' }}>
                          Please review your details carefully before submitting. Once submitted, you will receive an Application ID.
                        </div>

                        {/* Summary sections */}
                        {[
                          { title: 'Personal Details', fields: [
                            ['Full Name', formData.fullName], ['Mobile', formData.mobile], ['Email', formData.email],
                            ['PAN', formData.panNumber], ['Aadhaar', formData.aadhaarNumber ? '••••' + formData.aadhaarNumber.slice(-4) : ''],
                            ['GST', formData.gstNumber || '—'],
                          ]},
                          { title: 'Address', fields: [
                            ['Address', [formData.addressLine1, formData.addressLine2].filter(Boolean).join(', ')],
                            ['City / District', [formData.city, formData.district].filter(Boolean).join(', ')],
                            ['State / PIN', [formData.state, formData.pincode].filter(Boolean).join(' – ')],
                          ]},
                          { title: 'Franchise Preference', fields: [
                            ['Type', formData.franchiseType], ['Location', formData.preferredLocation],
                            ['Investment', formData.investmentCapacity ? `₹${Number(formData.investmentCapacity).toLocaleString('en-IN')}` : ''],
                          ]},
                          { title: 'Documents', fields: apply.requiredDocs.map((d) => [d.label, fileData[d.field]?.name || (d.required ? '⚠ Not uploaded' : 'Not uploaded')]) },
                        ].map((section) => (
                          <div key={section.title} className="rounded-xl border overflow-hidden" style={{ borderColor: 'hsl(var(--border))' }}>
                            <div className="px-4 py-2.5 text-xs font-bold" style={{ background: 'hsl(var(--primary)/0.06)', color: 'hsl(var(--primary))' }}>{section.title}</div>
                            <div className="divide-y" style={{ borderColor: 'hsl(var(--border))' }}>
                              {section.fields.map(([label, value]) => (
                                <div key={label} className="flex items-start gap-3 px-4 py-2.5">
                                  <span className="text-xs text-gray-400 w-32 shrink-0">{label}</span>
                                  <span className="text-xs text-gray-700 font-medium">{value || '—'}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}

                        {error && (
                          <div className="flex items-center gap-2 p-4 rounded-xl text-sm text-red-700 bg-red-50 border border-red-200">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>{error}</span>
                          </div>
                        )}

                        <div className="flex items-start gap-3">
                          <input type="checkbox" id="declaration" required className="mt-0.5 w-4 h-4 shrink-0" />
                          <label htmlFor="declaration" className="text-xs text-gray-600 leading-relaxed">
                            I hereby declare that all information provided is true and correct to the best of my knowledge. I understand that any false information may result in rejection of my application.
                          </label>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </form>

              {/* Navigation */}
              <div className="px-6 md:px-8 pb-6 flex items-center justify-between gap-4 border-t pt-5" style={{ borderColor: 'hsl(var(--border))' }}>
                <button onClick={handleBack} disabled={currentStep === 0}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
                  style={{ background: 'hsl(var(--muted))', color: 'hsl(var(--primary))' }}>
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <div className="text-xs text-gray-400">{currentStep + 1} / {totalSteps}</div>
                {currentStep < totalSteps - 1 ? (
                  <button onClick={handleNext}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:shadow-lg"
                    style={{ background: 'hsl(var(--primary))' }}>
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button onClick={handleSubmit} disabled={submitting || franchiseTypesLoading || Boolean(franchiseTypesError) || franchiseTypes.length === 0}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:shadow-lg disabled:opacity-70"
                    style={{ background: 'hsl(var(--secondary))' }}>
                    {submitting ? 'Submitting...' : <><CheckCircle className="w-4 h-4" /> Submit Application</>}
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
