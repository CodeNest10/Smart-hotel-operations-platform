import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Grid3X3, CalendarDays,
  Sparkles, BellRing, Search, X, User, Wifi, WifiOff,
} from 'lucide-react';
import { useHotel } from '../context/HotelContext';
import Logo from './Logo';
import './Navbar.css';

const links = [
  { to: '/',             label: 'Dashboard',    Icon: LayoutDashboard },
  { to: '/rooms',        label: 'Rooms',        Icon: Grid3X3 },
  { to: '/reservations', label: 'Reservations', Icon: CalendarDays },
  { to: '/housekeeping', label: 'Housekeeping', Icon: Sparkles },
  { to: '/requests',     label: 'Requests',     Icon: BellRing },
];

function Navbar() {
  const { occupancy } = useHotel();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVal, setSearchVal]   = useState('');
  const [scrolled, setScrolled]     = useState(false);
  const [notifOpen, setNotifOpen]   = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const isAlert = occupancy?.alert;
  const pct     = Math.round(occupancy?.occupancy_pct || 0);

  return (
    <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="navbar-inner">

        {/* Brand — uses the Logo component */}
        <NavLink to="/" className="navbar-brand" style={{ textDecoration: 'none' }}>
          <Logo size={38} showText={true} variant="default" />
        </NavLink>

        {/* Nav links */}
        <ul className="navbar-links">
          {links.map(({ to, label, Icon }) => (
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

          {/* Avatar */}
          <button className="navbar-avatar" title="Staff account">
            <User size={15} />
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
