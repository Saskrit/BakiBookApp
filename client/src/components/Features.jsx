import { BookOpen, Users, Bell, BarChart3, ShieldCheck } from 'lucide-react';
import './Features.css';

const features = [
  {
    icon: BookOpen,
    title: 'Digital Baki Ledger',
    description: 'Track every credit transaction with automatic balance calculation.',
    tag: 'Core',
  },
  {
    icon: Users,
    title: 'Customer Friendly',
    description: 'Let customers view dues, payments, and statements anytime.',
    tag: 'Portal',
  },
  {
    icon: Bell,
    title: 'Smart Notifications',
    description: 'Send due reminders automatically via SMS and email.',
    tag: 'Alerts',
  },
  {
    icon: BarChart3,
    title: 'Reports & Analytics',
    description: 'Generate daily, weekly, and monthly reports in one click.',
    tag: 'Insights',
  },
  {
    icon: ShieldCheck,
    title: 'Secure & Reliable',
    description: 'JWT auth, encrypted data, and role-based access control.',
    tag: 'Security',
  },
];

function Features() {
  return (
    <section id="features" className="features">
      <div className="features__glow" aria-hidden="true" />

      <div className="container">
        <div className="features__header">
          <span className="section-label">Features</span>
          <h2 className="section-title">Built for How Shopkeepers Actually Work</h2>
          <p className="section-subtitle">
            Five essential tools in one platform — no complicated setup, no paper registers.
          </p>
        </div>

        <div className="features__grid">
          {features.map((feature) => (
            <article key={feature.title} className="features__card">
              <div className="features__icon-ring">
                <div className="features__icon">
                  <feature.icon size={22} strokeWidth={1.75} />
                </div>
              </div>

              <span className="features__tag">{feature.tag}</span>
              <h3 className="features__title">{feature.title}</h3>
              <p className="features__desc">{feature.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Features;
