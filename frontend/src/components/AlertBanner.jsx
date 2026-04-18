import React from 'react';
import { ShieldAlert, TrendingUp } from 'lucide-react';
import './AlertBanner.css';

function AlertBanner({ pct }) {
  return (
    <div className="alert-banner" role="alert">
      <div className="alert-icon-wrap">
        <ShieldAlert size={20} />
      </div>
      <div className="alert-content">
        <div className="alert-title">High Occupancy Alert</div>
        <div className="alert-body">
          Hotel is at <strong>{pct}%</strong> capacity — plan additional staffing immediately.
        </div>
      </div>
      <div className="alert-badge">
        <TrendingUp size={13} />
        {pct}%
      </div>
    </div>
  );
}

export default AlertBanner;
