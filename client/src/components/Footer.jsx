import { Link } from 'react-router-dom';
import { Facebook, Instagram, Youtube, Linkedin } from 'lucide-react';
import BrandLogo from './BrandLogo';
import './Footer.css';

const productLinks = [
  { label: 'Features', href: '/#features', isRoute: true },
  { label: 'How It Works', href: '/#how-it-works', isRoute: true },
  { label: 'Updates', href: '/#home', isRoute: true },
];

const companyLinks = [
  { label: 'About Us', href: '/about', isRoute: true },
  { label: 'Blog', href: '/#home', isRoute: true },
  { label: 'Privacy Policy', href: '/legal/data-policy', isRoute: true },
  { label: 'Terms & Conditions', href: '/terms', isRoute: true },
];

const supportLinks = [
  { label: 'Help Center', href: '/contact', isRoute: true },
  { label: 'Contact Us', href: '/contact', isRoute: true },
  { label: 'Guide', href: '/#how-it-works', isRoute: true },
  { label: 'FAQs', href: '/contact', isRoute: true },
];

const socialLinks = [
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Youtube, href: '#', label: 'YouTube' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
];

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div className="footer__brand">
            <BrandLogo to="/" size={32} showText className="footer__logo" />
            <p className="footer__tagline">Digital Baki, Smart Pasal</p>
            <p className="footer__desc">
              The all-in-one digital solution for shopkeepers to manage credit,
              track payments, and build lasting customer relationships.
            </p>
          </div>

          <div className="footer__column">
            <h4>Product</h4>
            <ul>
              {productLinks.map((link) => (
                <li key={link.label}>
                  {link.isRoute ? (
                    <Link to={link.href}>{link.label}</Link>
                  ) : (
                    <a href={link.href}>{link.label}</a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="footer__column">
            <h4>Company</h4>
            <ul>
              {companyLinks.map((link) => (
                <li key={link.label}>
                  {link.isRoute ? (
                    <Link to={link.href}>{link.label}</Link>
                  ) : (
                    <a href={link.href}>{link.label}</a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="footer__column">
            <h4>Support</h4>
            <ul>
              {supportLinks.map((link) => (
                <li key={link.label}>
                  {link.isRoute ? (
                    <Link to={link.href}>{link.label}</Link>
                  ) : (
                    <a href={link.href}>{link.label}</a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="footer__column footer__social-col">
            <h4>Follow Us</h4>
            <div className="footer__social">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="footer__social-link"
                >
                  <social.icon size={18} />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="footer__bottom">
          <p>&copy; {new Date().getFullYear()} BakiBook. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
