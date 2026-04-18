import React, { useState } from 'react';
import { Grid3X3, SlidersHorizontal, Radio, WifiOff } from 'lucide-react';
import useRooms from '../hooks/useRooms';
import RoomCard from '../components/RoomCard';
import { SkeletonCard } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import { STATUS_COLORS } from '../utils/roomUtils';
import './RoomGrid.css';

const STATUSES = ['ALL','AVAILABLE','RESERVED','OCCUPIED','DIRTY','CLEANING','MAINTENANCE'];

const STATUS_ICONS = {
  ALL: '🏨', AVAILABLE:'🟢', RESERVED:'🔵', OCCUPIED:'🔴',
  DIRTY:'🟡', CLEANING:'🟣', MAINTENANCE:'⚙️',
};

function RoomGrid() {
  const { rooms, loading, streaming, lastUpdatedId } = useRooms();
  const [filter, setFilter] = useState('ALL');

  const filtered = filter === 'ALL' ? rooms : rooms.filter(r => r.status === filter);

  return (
    <div className="roomgrid-page">
      {/* Hero */}
      <div className="page-hero">
        <div className="page-hero-inner">
          <div className="page-hero-eyebrow"><Grid3X3 size={12} /> Room Management</div>
          <h1>Room Grid</h1>
          <p>
            {streaming
              ? 'Live stream — rooms update the instant their status changes.'
              : 'Reconnecting to live stream… falling back to periodic refresh.'}
          </p>
        </div>
      </div>

      <div className="roomgrid-body">
        {/* Toolbar card */}
        <div className="roomgrid-toolbar card">
          <div className="toolbar-left">
            <SlidersHorizontal size={15} color="#767676" />
            <span className="toolbar-label">Filter</span>
            <div className="filter-tabs">
              {STATUSES.map(s => {
                const count = s === 'ALL' ? rooms.length : rooms.filter(r => r.status === s).length;
                return (
                  <button
                    key={s}
                    className={`filter-tab ${filter === s ? 'active' : ''} ${count === 0 && s !== 'ALL' ? 'dim' : ''}`}
                    onClick={() => setFilter(s)}
                  >
                    <span className="tab-icon">{STATUS_ICONS[s]}</span>
                    <span className="tab-label">{s === 'ALL' ? 'All' : s.charAt(0)+s.slice(1).toLowerCase()}</span>
                    <span className="tab-count">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="toolbar-right">
            <div className={`stream-chip ${streaming ? 'live' : 'offline'}`}>
              {streaming ? <Radio size={12} /> : <WifiOff size={12} />}
              <span>{streaming ? 'Live' : 'Polling'}</span>
            </div>
            <div className="legend">
              {Object.entries(STATUS_COLORS).map(([s,c]) => (
                <span key={s} className="legend-item">
                  <span className="legend-dot" style={{ background: c }} />
                  {s.charAt(0)+s.slice(1).toLowerCase()}
                </span>
              ))}
            </div>
            <span className="count-chip">{filtered.length} shown</span>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="room-grid">
            {Array(12).fill(0).map((_,i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState icon="🚪" message="No rooms match this filter." />
        ) : (
          <div className="room-grid">
            {filtered.map((room, i) => {
              const justUpdated = room.id === lastUpdatedId;
              return (
                <div
                  key={room.id}
                  className={`fade-up ${justUpdated ? 'room-flash' : ''}`}
                  style={{ animationDelay: justUpdated ? '0ms' : `${i * 40}ms` }}
                >
                  <RoomCard room={room} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default RoomGrid;
