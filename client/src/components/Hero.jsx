import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Zap, Users } from 'lucide-react';
import DashboardMockup from './DashboardMockup';
import './Hero.css';

const metrics = [
  { icon: Users, value: '1000+', label: 'Shopkeepers' },
  { icon: Zap, value: 'Real-time', label: 'Payment sync' },
  { icon: ShieldCheck, value: 'Secure', label: 'Cloud backup' },
];

export default function Hero() {
  return (
    <section id="home" className="hero">
      <div className="hero__bg" aria-hidden="true">
        <span className="hero__orb hero__orb--1" />
        <span className="hero__orb hero__orb--2" />
        <span className="hero__mesh" />
      </div>

      <div className="container hero__inner">
        <div className="hero__content">
          <span className="hero__eyebrow">Digital Baki, Smart Pasal</span>

          <h1 className="hero__title">
            Manage <span className="hero__gradient">Baki</span> easily.
            <span className="hero__title-sub">Build trust with every transaction.</span>
          </h1>

          <p className="hero__lead">
            Track credit, record payments, and remind customers - all from one simple
            dashboard built for local shopkeepers in Nepal.
          </p>

          <div className="hero__actions">
            <Link to="/register" className="btn btn-primary hero__btn-primary">
              Get Started Free
              <ArrowRight size={16} />
            </Link>
            <a href="#how-it-works" className="btn btn-outline hero__btn-secondary">
              See how it works
            </a>
          </div>

          <div className="hero__metrics">
            {metrics.map(({ icon: Icon, value, label }) => (
              <div key={label} className="hero__metric">
                <span className="hero__metric-icon">
                  <Icon size={15} />
                </span>
                <div>
                  <strong>{value}</strong>
                  <span>{label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="hero__visual">
          <div className="hero__visual-glow" aria-hidden="true" />
          <div className="hero__visual-frame">
            <DashboardMockup />
          </div>
          <div className="hero__chip hero__chip--1">Live balance sync</div>
          <div className="hero__chip hero__chip--2">Rs. 1.2L tracked today</div>
        </div>
      </div>
    </section>
  );
}
