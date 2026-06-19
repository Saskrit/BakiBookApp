import { UserPlus, ShoppingCart, Bell, CheckCircle } from 'lucide-react';
import './HowItWorks.css';

const steps = [
  {
    number: 1,
    icon: UserPlus,
    title: 'Add Customer',
    description: 'Register your customers with name, phone, and photo in seconds.',
    mockup: 'customer',
  },
  {
    number: 2,
    icon: ShoppingCart,
    title: 'Add Credit',
    description: 'Record purchased items, quantities, and prices with auto-totals.',
    mockup: 'credit',
  },
  {
    number: 3,
    icon: Bell,
    title: 'Customer Notified',
    description: 'Customer receives instant notification about new credit added.',
    mockup: 'notify',
  },
  {
    number: 4,
    icon: CheckCircle,
    title: 'Record Payment',
    description: 'Record full or partial payments and update balance automatically.',
    mockup: 'payment',
  },
];

function StepMockup({ type }) {
  if (type === 'customer') {
    return (
      <div className="step-mockup">
        <div className="step-mockup__avatar">RS</div>
        <div className="step-mockup__line" />
        <div className="step-mockup__line step-mockup__line--short" />
        <div className="step-mockup__btn">Add Customer</div>
      </div>
    );
  }

  if (type === 'credit') {
    return (
      <div className="step-mockup">
        <div className="step-mockup__item"><span>Rice</span><span>Rs. 500</span></div>
        <div className="step-mockup__item"><span>Oil</span><span>Rs. 350</span></div>
        <div className="step-mockup__item"><span>Sugar</span><span>Rs. 150</span></div>
        <div className="step-mockup__btn step-mockup__btn--primary">Add Credit</div>
      </div>
    );
  }

  if (type === 'notify') {
    return (
      <div className="step-mockup">
        <div className="step-mockup__notification">
          <Bell size={14} />
          <div>
            <strong>New Credit Added</strong>
            <p>Rs. 1,000 added to your account</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="step-mockup">
      <div className="step-mockup__success">
        <CheckCircle size={28} />
        <strong>Payment Rs. 1,000</strong>
        <span>Recorded successfully</span>
      </div>
    </div>
  );
}

function HowItWorks() {
  return (
    <section id="how-it-works" className="how-it-works">
      <div className="container">
        <div className="section-header section-header--center">
          <span className="section-label">How It Works</span>
          <h2 className="section-title">Simple Steps for Smart Management</h2>
          <p className="section-subtitle">
            From adding a customer to recording payments — get up and running in minutes.
          </p>
        </div>

        <div className="how-it-works__track">
          {steps.map((step) => (
            <article key={step.number} className="how-it-works__step">
              <div className="how-it-works__step-marker">
                <span className="how-it-works__step-number">{step.number}</span>
                <step.icon size={16} className="how-it-works__step-icon" />
              </div>

              <div className="how-it-works__card">
                <div className="how-it-works__mockup-wrap">
                  <StepMockup type={step.mockup} />
                </div>
                <h3 className="how-it-works__step-title">{step.title}</h3>
                <p className="how-it-works__step-desc">{step.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
