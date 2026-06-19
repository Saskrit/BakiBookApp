import { Link } from 'react-router-dom';
import { Target, Heart, Users, Shield, ArrowRight } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './SitePage.css';

const values = [
  {
    icon: Target,
    title: 'Our Mission',
    text: 'To digitize credit management for local shopkeepers and customers across Nepal, making every transaction transparent and trustworthy.',
  },
  {
    icon: Heart,
    title: 'Our Vision',
    text: 'A future where no shopkeeper loses track of baki and every customer can view their dues with confidence — anytime, anywhere.',
  },
  {
    icon: Users,
    title: 'Who We Serve',
    text: 'Small and medium shopkeepers, kirana pasals, and their customers who rely on credit-based daily commerce.',
  },
  {
    icon: Shield,
    title: 'Trust First',
    text: 'We build tools that protect relationships between shopkeepers and customers through accurate records and clear communication.',
  },
];

function About() {
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
            <span className="section-label">About BakiBook</span>
            <h1>Digital Baki, Smart Pasal</h1>
            <p>
              BakiBook is a digital credit management platform built to help shopkeepers and
              customers in Nepal manage credit transactions, payments, and account records
              electronically — replacing messy notebooks with a smart, reliable system.
            </p>
          </div>
        </section>

        <div className="container site-page__body">
          <section className="site-page__section">
            <div className="section-header">
              <span className="section-label">Our Story</span>
              <h2 className="section-title">Built for everyday pasals</h2>
            </div>
            <p>
              In neighborhoods across Nepal, shopkeepers still record daily credit in paper
              notebooks. Payments get missed, amounts get disputed, and trust suffers when records
              are unclear. BakiBook was created as a Final Year Project to solve this everyday
              problem with technology that is simple enough for any pasal owner to use.
            </p>
            <p>
              From tracking who owes what, to sending due reminders and generating reports,
              BakiBook brings the entire credit workflow into one place — designed specifically
              for the way local businesses actually work.
            </p>
          </section>

          <section className="site-page__section">
            <div className="section-header section-header--center">
              <span className="section-label">What drives us</span>
              <h2 className="section-title">Our values</h2>
            </div>
            <div className="site-page__grid">
              {values.map((item) => (
                <article key={item.title} className="site-page__card modern-card modern-card--lift">
                  <div className="site-page__card-icon">
                    <item.icon size={22} />
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="site-page__section">
            <div className="site-page__stats">
              <div className="site-page__stat">
                <strong>1000+</strong>
                <span>Shopkeepers</span>
              </div>
              <div className="site-page__stat">
                <strong>50K+</strong>
                <span>Transactions</span>
              </div>
              <div className="site-page__stat">
                <strong>Rs. 2Cr+</strong>
                <span>Credit Managed</span>
              </div>
              <div className="site-page__stat">
                <strong>99%</strong>
                <span>Satisfaction</span>
              </div>
            </div>
          </section>

          <section className="site-page__cta">
            <h2>Ready to go digital with your pasal?</h2>
            <p>Join shopkeepers who are managing baki smarter with BakiBook.</p>
            <Link to="/register" className="btn btn-primary">
              Get Started for Free
              <ArrowRight size={16} />
            </Link>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default About;
