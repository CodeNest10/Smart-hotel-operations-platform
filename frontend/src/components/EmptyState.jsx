import React from 'react';
import { PackageOpen } from 'lucide-react';
import './EmptyState.css';

function EmptyState({ icon, message = 'No data available.', sub = '' }) {
  return (
    <div className="empty-state">
      <div className="empty-icon-wrap">
        {icon ? <span className="empty-emoji">{icon}</span> : <PackageOpen size={32} color="#D0D0D0" />}
      </div>
      <p className="empty-msg">{message}</p>
      {sub && <p className="empty-sub">{sub}</p>}
    </div>
  );
}

export default EmptyState;
