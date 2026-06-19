import { Link } from 'react-router-dom';
import { ArrowRight, Store, Receipt, Wallet, Heart } from 'lucide-react';
import './Stats.css';

const statCards = [
  { icon: Store, value: '1000+', label: 'Happy Shopkeepers' },
  { icon: Receipt, value: '50K+', label: 'Transactions Recorded' },
  { icon: Wallet, value: 'Rs. 2Cr+', label: 'Credit Managed' },
  { icon: Heart, value: '99%', label: 'Customer Satisfaction' },
];

function Stats() {
  return (
    <section id="about" className="stats">
      <div className="container stats__grid">
        <div className="stats__content">
          <span className="section-label">Why Choose BakiBook?</span>
          <h2 className="section-title">
            Built for Shopkeepers, Loved by Customers
          </h2>
          <p className="section-subtitle">
            Join thousands of shopkeepers across Nepal who have transformed their
            credit management with BakiBook. Say goodbye to paper registers and
            hello to smart, digital baki tracking.
          </p>
          <Link to="/register" className="btn btn-primary stats__cta">
            Get Started for Free
            <ArrowRight size={18} />
          </Link>
        </div>

        <div className="stats__cards">
          {statCards.map((stat) => (
            <div key={stat.label} className="stats__card">
              <div className="stats__card-icon">
                <stat.icon size={22} />
              </div>
              <span className="stats__card-value">{stat.value}</span>
              <span className="stats__card-label">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Stats;
