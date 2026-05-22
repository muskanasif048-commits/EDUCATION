import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, HelpCircle, AlertCircle, CheckCircle } from 'lucide-react';

interface ContactProps {
  toast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export default function Contact({ toast }: ContactProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('support');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmitContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      toast("Please fill out all contact fields.", "error");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      toast("Message sent successfully! Our academic team will respond shortly.", "success");
      // reset
      setName('');
      setEmail('');
      setMessage('');
    }, 1000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Title */}
      <div className="text-center space-y-3">
        <span className="bg-brand-50 text-brand-700 text-xs font-semibold px-3 py-1 rounded-full uppercase">
          Support Desk
        </span>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-905 font-display md:text-5xl">
          Get in Touch with Our Team
        </h1>
        <p className="text-slate-500 text-sm md:text-base max-w-xl mx-auto">
          Have a feature improvement request, institutional partnership proposal, or require direct technical assistance? Reach out below.
        </p>
      </div>

      <div className="grid md:grid-cols-12 gap-8 items-start">
        
        {/* Left contacts list */}
        <div className="md:col-span-5 bg-gradient-to-br from-brand-900 to-brand-950 text-white rounded-3xl p-6 md:p-8 space-y-6 relative overflow-hidden shadow-md">
          <div className="space-y-2 z-10 relative">
            <h3 className="font-bold text-xl font-display">EnglishMate Headquarters</h3>
            <p className="text-xs text-brand-300 leading-relaxed font-sans">
              Our academic researchers are stationed around Pakistan to design localized tutoring curriculum.
            </p>
          </div>

          <div className="space-y-4 z-10 relative text-xs md:text-sm">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-brand-800 rounded-xl flex items-center justify-center">
                <Mail className="w-4 h-4 text-brand-300" />
              </div>
              <span>support@englishmate.ai</span>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-brand-800 rounded-xl flex items-center justify-center">
                <Phone className="w-4 h-4 text-brand-300" />
              </div>
              <span>+92 (300) 123-4567</span>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-brand-800 rounded-xl flex items-center justify-center">
                <MapPin className="w-4 h-4 text-brand-300" />
              </div>
              <span>DHA Phase 5, Lahore, Pakistan</span>
            </div>
          </div>

          <div className="p-4 bg-brand-800 text-brand-100/90 text-[11px] rounded-2xl leading-relaxed z-10 relative">
            💡 <strong>Tip for partners:</strong> If you are a school or higher education representative seeking bulk accounts for student exam preps, specify &quot;Institutional Integration&quot; in your message body.
          </div>

          {/* background blob */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-48 h-48 bg-brand-500 rounded-full blur-[100px] opacity-25"></div>
        </div>

        {/* Right input form */}
        <div className="md:col-span-7 bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-sm">
          {success && (
            <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl text-xs flex items-start gap-2 mb-4">
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <div>
                <strong>Inquiry successfully dispatched!</strong> We appreciate your feedback. Our support agents generally reach back inside 24 to 48 hours.
              </div>
            </div>
          )}

          <form onSubmit={handleSubmitContact} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Your Name</label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Bilal Khan"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs md:text-sm focus:outline-none focus:border-brand-500 bg-slate-50/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Email Address</label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs md:text-sm focus:outline-none focus:border-brand-500 bg-slate-50/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Inquiry Topic</label>
              <select
                id="contact-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs md:text-sm focus:outline-none focus:border-brand-500 bg-slate-50/20"
              >
                <option value="support">Technical Support (معاونت)</option>
                <option value="partner">Institutional Partnerships</option>
                <option value="feedback">Feedback & Feature Ideas</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Your Message</label>
              <textarea
                id="contact-message"
                rows={4}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="How can EnglishMate assist your studies today?"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs md:text-sm focus:outline-none focus:border-brand-500 bg-slate-50/20"
              />
            </div>

            <button
              id="contact-submit-btn"
              type="submit"
              disabled={loading}
              className="cursor-pointer w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold transition-all text-xs shadow-md flex items-center justify-center gap-1.5"
            >
              {loading ? "Sending Message..." : (
                <>
                  <Send className="w-4 h-4" />
                  Send Support Message
                </>
              )}
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}
