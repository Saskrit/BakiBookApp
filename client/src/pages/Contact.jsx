import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, Loader2 } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './SitePage.css';

const contactInfo = [
  {
    icon: Mail,
    label: 'Email',
    value: 'support@bakibook.com',
    href: 'mailto:support@bakibook.com',
  },
  {
    icon: Phone,
    label: 'Phone',
    value: '+977 9800000000',
    href: 'tel:+9779800000000',
  },
  {
    icon: MapPin,
    label: 'Location',
    value: 'Kathmandu, Nepal',
  },
  {
    icon: Clock,
    label: 'Support Hours',
    value: 'Sun – Fri, 10:00 AM – 6:00 PM NPT',
  },
];

function Contact() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: 'general',
    message: '',
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSending(true);

    setTimeout(() => {
      setSending(false);
      setSent(true);
      setForm({ name: '', email: '', subject: 'general', message: '' });
    }, 800);
  };

  return (
    <>
      <Header />
      <main>
        <section className="site-page__hero page-hero">
          <div className="page-hero__bg" aria-hidden="true">
            <span className="page-hero__orb page-hero__orb--1" />
            <span className="page-hero__orb page-hero__orb--2" />
            <span className="page-hero__grid" />
          </div>
          <div className="container page-hero__inner site-page__hero-inner">
            <span className="section-label">Contact Us</span>
            <h1>We&apos;d love to hear from you</h1>
            <p>
              Have a question about BakiBook, need help with your account, or want to partner
              with us? Reach out and our team will get back to you as soon as possible.
            </p>
          </div>
        </section>

        <div className="container site-page__body">
          <div className="site-page__contact-layout">
            <div>
              <div className="section-header">
                <span className="section-label">Reach us</span>
                <h2 className="section-title">Get in touch</h2>
              </div>
              <div className="site-page__info-list">
                {contactInfo.map((item) => (
                  <div key={item.label} className="site-page__info-item modern-card">
                    <item.icon size={20} />
                    <div>
                      <strong>{item.label}</strong>
                      {item.href ? (
                        <a href={item.href}>{item.value}</a>
                      ) : (
                        <span>{item.value}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <form className="site-page__form modern-card" onSubmit={handleSubmit}>
              <h2>Send us a message</h2>

              {sent && (
                <p className="site-page__success">
                  Thank you! Your message has been received. We&apos;ll respond within 1–2 business days.
                </p>
              )}

              <div className="site-page__form-row">
                <div className="site-page__field">
                  <label htmlFor="name">Full Name</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Your name"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="site-page__field">
                  <label htmlFor="email">Email Address</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="site-page__field">
                <label htmlFor="subject">Subject</label>
                <select id="subject" name="subject" value={form.subject} onChange={handleChange}>
                  <option value="general">General Inquiry</option>
                  <option value="support">Account Support</option>
                  <option value="partnership">Partnership</option>
                  <option value="feedback">Feedback</option>
                </select>
              </div>

              <div className="site-page__field">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  placeholder="How can we help you?"
                  value={form.message}
                  onChange={handleChange}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary" disabled={sending}>
                {sending ? <Loader2 size={16} className="auth-spinner" /> : <Send size={16} />}
                {sending ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default Contact;
