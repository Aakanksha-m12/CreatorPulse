import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CreatorPulseLogo from './CreatorPulseLogo';
import { useAuth } from './AuthContext';

const NAV_SECTIONS = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', icon: '▣', path: '/dashboard', enabled: true },
      { label: 'Creator Profile', icon: '◉', path: '/edit-profile', enabled: true },
    ],
  },
  {
    title: 'AI Tools',
    items: [
      { label: 'Thumbnail Intelligence', icon: '◇', path: '/thumbnail-scorer', enabled: true },
      { label: 'Content Optimizer', icon: '◇', path: '/hashtag-optimizer', enabled: true },
      { label: 'Best Time', icon: '◇', path: '/posting-time', enabled: true },
    ],
  },
  {
    title: 'Account',
    items: [
      { label: 'Subscription', icon: '◇', path: '/premium', enabled: true },
    ],
  },
];
const PREMIUM_ITEM = null;

export default function AppShell({ children, active }) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sidebarBody = (
    <div className="sidebar-inner">
      <div className="sidebar-brand">
        <CreatorPulseLogo size={36} />
        {!collapsed && <span className="sidebar-brand-text">CreatorPulse</span>}
      </div>

      <nav className="sidebar-nav">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title || section.items[0].path} className="sidebar-section">
            {section.title && !collapsed && <div className="sidebar-section-title">{section.title}</div>}
            {section.items.map((item) => (
              <button
                key={item.path}
                className={`sidebar-item ${active === item.path ? 'active' : ''}`}
                title={collapsed ? item.label : undefined}
                onClick={() => {
                  setMobileOpen(false);
                  navigate(item.path);
                }}
              >
                <span className="sidebar-item-icon">{item.icon}</span>
                {!collapsed && (
                  <>
                    <span className="sidebar-item-label">{item.label}</span>
                    {!item.enabled && <span className="sidebar-item-lock">🔒</span>}
                  </>
                )}
              </button>
            ))}
            {section.title && !collapsed && <div className="sidebar-divider" />}
          </div>
        ))}

      </nav>

      <div className="sidebar-footer">
        <button className="sidebar-collapse-btn" onClick={() => setCollapsed(!collapsed)} title={collapsed ? 'Expand' : 'Collapse'}>
          {collapsed ? '»' : '«'}
        </button>
        <button className="sidebar-logout" onClick={handleLogout} title="Logout">
          <span className="sidebar-item-icon">🚪</span>
          {!collapsed && <span className="sidebar-item-label">Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className={`app-shell ${collapsed ? 'sidebar-collapsed' : ''}`}>
      {mobileOpen && <div className="mobile-sidebar-overlay" onClick={() => setMobileOpen(false)} />}
      <aside className={`app-sidebar ${mobileOpen ? 'mobile-open' : ''}`}>{sidebarBody}</aside>

      <div className="shell-main">
        <button className="mobile-hamburger mobile-hamburger-float" onClick={() => setMobileOpen(true)} aria-label="Menu">
          ☰
        </button>
        <main className="shell-content">{children}</main>
      </div>
    </div>
  );
}
