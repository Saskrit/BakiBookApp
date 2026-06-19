import {
  LayoutDashboard,
  Users,
  ArrowLeftRight,
  CreditCard,
  Bell,
  FileText,
  Settings,
} from 'lucide-react';
import './DashboardMockup.css';

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Dashboard', active: true },
  { icon: Users, label: 'Customers' },
  { icon: ArrowLeftRight, label: 'Transactions' },
  { icon: CreditCard, label: 'Payments' },
  { icon: Bell, label: 'Notifications' },
  { icon: FileText, label: 'Reports' },
  { icon: Settings, label: 'Settings' },
];

const statCards = [
  { label: 'Total Customers', value: '248', trend: '+12%', up: true },
  { label: 'Total Outstanding', value: 'Rs. 1.2L', trend: '-5%', up: false },
  { label: 'Total Credit', value: 'Rs. 3.5L', trend: '+8%', up: true },
  { label: 'Total Received', value: 'Rs. 2.3L', trend: '+15%', up: true },
];

const topDebtors = [
  { name: 'Ram Shrestha', amount: 'Rs. 12,500' },
  { name: 'Anita Poudel', amount: 'Rs. 8,200' },
  { name: 'Mohan KC', amount: 'Rs. 6,750' },
];

function DashboardMockup() {
  return (
    <div className="dashboard-mockup">
      <div className="dashboard-mockup__window">
        <div className="dashboard-mockup__sidebar">
          <div className="dashboard-mockup__sidebar-logo">
            <img src="/bakibook.png" alt="" />
          </div>
          {sidebarItems.map((item) => (
            <div
              key={item.label}
              className={`dashboard-mockup__sidebar-item ${item.active ? 'dashboard-mockup__sidebar-item--active' : ''}`}
              title={item.label}
            >
              <item.icon size={18} />
            </div>
          ))}
        </div>

        <div className="dashboard-mockup__main">
          <div className="dashboard-mockup__header">
            <span>Dashboard</span>
            <span className="dashboard-mockup__date">May 30, 2026</span>
          </div>

          <div className="dashboard-mockup__stats">
            {statCards.map((card) => (
              <div key={card.label} className="dashboard-mockup__stat">
                <span className="dashboard-mockup__stat-label">{card.label}</span>
                <span className="dashboard-mockup__stat-value">{card.value}</span>
                <span className={`dashboard-mockup__stat-trend ${card.up ? 'up' : 'down'}`}>
                  {card.trend}
                </span>
              </div>
            ))}
          </div>

          <div className="dashboard-mockup__charts">
            <div className="dashboard-mockup__chart">
              <span className="dashboard-mockup__chart-title">Credit vs Payment Overview</span>
              <div className="dashboard-mockup__line-chart">
                <svg viewBox="0 0 300 80" preserveAspectRatio="none">
                  <polyline
                    points="0,60 50,45 100,50 150,30 200,35 250,20 300,25"
                    fill="none"
                    stroke="#6A7E3F"
                    strokeWidth="2"
                  />
                  <polyline
                    points="0,70 50,55 100,60 150,45 200,50 250,40 300,35"
                    fill="none"
                    stroke="#D96868"
                    strokeWidth="2"
                  />
                </svg>
              </div>
            </div>

            <div className="dashboard-mockup__debtors">
              <span className="dashboard-mockup__chart-title">Top Due Customers</span>
              {topDebtors.map((debtor) => (
                <div key={debtor.name} className="dashboard-mockup__debtor">
                  <span>{debtor.name}</span>
                  <span className="dashboard-mockup__debtor-amount">{debtor.amount}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardMockup;
