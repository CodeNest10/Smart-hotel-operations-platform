import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Grid3X3, CalendarDays,
  Sparkles, BellRing, Search, X, Wifi, WifiOff,
  LogOut, ShieldCheck,
} from 'lucide-react';
import { useHotel } from '../context/HotelContext';
import { useAuth, ROLES } from '../context/AuthContext';
import Logo from './Logo';
import './Navbar.css';

const ALL_LINKS = [
  { to: '/',             label: 'Dashboard',    Icon: LayoutDashboard, roles: [ROLES.MANAGER, ROLES.FRONT_DESK, ROLES.HOUSEKEEPING] },
  { to: '/rooms',        label: 'Rooms',        Icon: Grid3X3,         roles: [ROLES.MANAGER, ROLES.FRONT_DESK, ROLES.HOUSEKEEPING] },
  { to: '/reservations', label: 'Reservations', Icon: CalendarDays,    roles: [ROLES.MANAGER, ROLES.FRONT_DESK] },
  { to: '/housekeeping', label: 'Housekeeping', Icon: Sparkles,        roles: [ROLES.MANAGER, ROLES.HOUSEKEEPING] },
  { to: '/requests',     label: 'Requests',     Icon: BellRing,        roles: [ROLES.MANAGER, ROLES.FRONT_DESK, ROLES.HOUSEKEEPING] },
];

const ROLE_LABELS = {
  MANAGER:      'Manager',
  FRONT_DESK:   'Front Desk',
  HOUSEKEEPING: 'Housekeeping',
};

function Navbar() {
  const { occupancy } = useHotel();
  const { user, logout, hasRole, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVal, setSearchVal]   = useState('');
  const [scrolled, setScrolled]     = useState(false);
  const [notifOpen, setNotifOpen]   = useState(false);
  const [userOpen, setUserOpen]     = useState(false);

  const userRef = useRef(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    if (!userOpen) return;
    const onClick = (e) => {
      if (userRef.current && !userRef.current.contains(e.target)) setUserOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [userOpen]);

  // Don't show navbar on login screen.
  if (!isAuthenticated) return null;

  const isAlert = occupancy?.alert;
  const pct     = Math.round(occupancy?.occupancy_pct || 0);

  const visibleLinks = ALL_LINKS.filter((l) => hasRole(l.roles));

  const initials = (user?.name || user?.email || '?')
    .split(/\s|@/)[0]
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = () => {
    setUserOpen(false);
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="navbar-inner">

        {/* Brand */}
        <NavLink to="/" className="navbar-brand" style={{ textDecoration: 'none' }}>
          <Logo size={38} showText={true} variant="default" />
        </NavLink>

        {/* Nav links (filtered by role) */}
        <ul className="navbar-links">
          {visibleLinks.map(({ to, label, Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === '/'}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <Icon size={15} strokeWidth={2} />
                <span>{label}</span>
                {to === '/requests' && occupancy?.alert && (
                  <span className="nav-alert-dot" />
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Right controls */}
        <div className="navbar-right">
          {/* Search */}
          <div className={`search-wrap ${searchOpen ? 'open' : ''}`}>
            {searchOpen ? (
              <div className="search-input-wrap">
                <Search size={14} className="search-icon-inside" />
                <input
                  autoFocus
                  className="search-input"
                  placeholder="Search rooms, guests…"
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                />
                <button className="search-close" onClick={() => { setSearchOpen(false); setSearchVal(''); }}>
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button className="icon-btn" onClick={() => setSearchOpen(true)} title="Search">
                <Search size={17} />
              </button>
            )}
          </div>

          {/* Live indicator */}
          <div className="live-chip" title={`Occupancy: ${pct}%`}>
            {pct > 0 ? <Wifi size={13} /> : <WifiOff size={13} />}
            <span>{pct > 0 ? `${pct}% occ.` : 'Offline'}</span>
          </div>

          {/* Notification bell */}
          <div className="notif-wrap">
            <button
              className={`icon-btn ${isAlert ? 'icon-btn-alert' : ''}`}
              onClick={() => setNotifOpen((v) => !v)}
              title="Notifications"
            >
              <BellRing size={17} />
              {isAlert && <span className="notif-badge" />}
            </button>
            {notifOpen && (
              <div className="notif-dropdown">
                <div className="notif-header">
                  <span>Notifications</span>
                  <button className="notif-close" onClick={() => setNotifOpen(false)}><X size={13} /></button>
                </div>
                {isAlert ? (
                  <div className="notif-item notif-danger">
                    <span className="notif-item-icon">⚠️</span>
                    <div>
                      <div className="notif-item-title">High Occupancy Alert</div>
                      <div className="notif-item-sub">Hotel is at {pct}% capacity. Plan staffing now.</div>
                    </div>
                  </div>
                ) : (
                  <div className="notif-empty">
                    <span>✅</span>
                    <p>All systems normal</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User avatar + dropdown */}
          <div className="user-wrap" ref={userRef}>
            <button
              className="navbar-avatar"
              title={user?.name || 'Account'}
              onClick={() => setUserOpen((v) => !v)}
            >
              {initials}
            </button>
            {userOpen && (
              <div className="user-dropdown">
                <div className="user-dropdown-head">
                  <div className="user-dd-avatar">{initials}</div>
                  <div className="user-dd-meta">
                    <div className="user-dd-name">{user?.name || 'Staff'}</div>
                    <div className="user-dd-email">{user?.email}</div>
                  </div>
                </div>
                <div className="user-dd-role">
                  <ShieldCheck size={13} />
                  <span>{ROLE_LABELS[user?.role] || user?.role}</span>
                </div>
                <button className="user-dd-item danger" onClick={handleLogout}>
                  <LogOut size={14} />
                  <span>Sign out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
