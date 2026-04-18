import React, { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff, LogIn, ShieldCheck, Zap } from 'lucide-react';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const QUICK_ACCOUNTS = [
  { label: 'Manager',      email: 'manager@manager.com',       pw: 'demo1234', role: 'MANAGER'      },
  { label: 'Front Desk',   email: 'alex@frontdesk.com',        pw: 'demo1234', role: 'FRONT_DESK'   },
  { label: 'Housekeeping', email: 'maria@housekeeping.com',    pw: 'demo1234', role: 'HOUSEKEEPING' },
];

function Login() {
  const { login, loading, error, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [localErr, setLocalErr] = useState(null);

  const from = location.state?.from?.pathname || '/';

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const submit = async (e) => {
    e.preventDefault();
    setLocalErr(null);
    if (!email || !password) {
      setLocalErr('Enter email and password.');
      return;
    }
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch {
      /* error already surfaced via context */
    }
  };

  const fillQuick = (acc) => {
    setEmail(acc.email);
    setPassword(acc.pw);
    setLocalErr(null);
  };

  return (
    <div className="login-shell">
      {/* Left marketing panel */}
      <aside className="login-side">
        <div className="login-side-inner">
          <Logo size={48} showText={true} variant="white" />
          <h2 className="login-side-title">
            Run your hotel<br />in real time.
          </h2>
          <p className="login-side-sub">
            Live occupancy, housekeeping flow, and guest requests —
            streamed from Kafka to your dashboard in milliseconds.
          </p>
          <ul className="login-side-bullets">
            <li><Zap size={14} /> Sub-second SSE updates</li>
            <li><ShieldCheck size={14} /> Role-based access</li>
            <li><LogIn size={14} /> Event-driven microservices</li>
          </ul>
          <div className="login-side-orb orb-a" />
          <div className="login-side-orb orb-b" />
          <div className="login-side-orb orb-c" />
        </div>
      </aside>

      {/* Right form panel */}
      <main className="login-main">
        <div className="login-card">
          <div className="login-brand-sm">
            <Logo size={36} showText={true} />
          </div>

          <h1 className="login-title">Welcome back</h1>
          <p className="login-sub">Sign in to the operations console.</p>

          <form className="login-form" onSubmit={submit} noValidate>
            <label className="login-field">
              <span className="login-field-label">Email</span>
              <div className="login-input-wrap">
                <Mail size={15} className="login-input-icon" />
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </label>

            <label className="login-field">
              <span className="login-field-label">Password</span>
              <div className="login-input-wrap">
                <Lock size={15} className="login-input-icon" />
                <input
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Minimum 4 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  className="login-pw-toggle"
                  onClick={() => setShowPw((v) => !v)}
                  tabIndex={-1}
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </label>

            {(localErr || error) && (
              <div className="msg error">{localErr || error}</div>
            )}

            <button type="submit" className="btn btn-primary btn-lg login-submit" disabled={loading}>
              {loading ? 'Signing in…' : (<><LogIn size={15} /> Sign in</>)}
            </button>
          </form>

          <div className="login-divider"><span>or try a demo account</span></div>

          <div className="login-quick">
            {QUICK_ACCOUNTS.map((a) => (
              <button
                key={a.role}
                type="button"
                className="login-quick-chip"
                onClick={() => fillQuick(a)}
                disabled={loading}
              >
                <span className={`login-role-dot role-${a.role.toLowerCase()}`} />
                {a.label}
              </button>
            ))}
          </div>

          <p className="login-foot">
            Protected area · All activity is logged.
          </p>
        </div>
      </main>
    </div>
  );
}

export default Login;
