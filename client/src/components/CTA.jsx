import { Link } from 'react-router-dom';
import { Gift, ArrowRight } from 'lucide-react';
import './CTA.css';

function CTA() {
  return (
    <section className="cta">
      <div className="container">
        <div className="cta__banner">
          <div className="cta__content">
            <Gift size={32} className="cta__icon" />
            <div>
              <h2 className="cta__title">Start Managing Your Baki the Smart Way</h2>
              <p className="cta__subtitle">
                Join thousands of shopkeepers who trust BakiBook for their daily credit management.
              </p>
            </div>
          </div>
          <Link to="/register" className="btn btn-white cta__btn">
            Create Free Account
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default CTA;
