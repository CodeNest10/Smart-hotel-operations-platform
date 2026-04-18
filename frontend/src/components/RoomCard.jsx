import React from 'react';
import { BedSingle, BedDouble, Crown, Star, Wifi, Wind } from 'lucide-react';
import { statusToColor, statusToLabel } from '../utils/roomUtils';
import './RoomCard.css';

const TYPE_CONFIG = {
  SINGLE: { Icon: BedSingle, gradient: 'linear-gradient(135deg,#667eea,#764ba2)', amenities: ['WiFi','A/C'] },
  DOUBLE: { Icon: BedDouble, gradient: 'linear-gradient(135deg,#0070CC,#009BDE)', amenities: ['WiFi','A/C'] },
  SUITE:  { Icon: Crown,     gradient: 'linear-gradient(135deg,#F093FB,#F5576C)', amenities: ['WiFi','A/C','★'] },
};

const STATUS_PULSE = ['CLEANING', 'OCCUPIED'];

function RoomCard({ room }) {
  const cfg         = TYPE_CONFIG[room.type] || TYPE_CONFIG.SINGLE;
  const statusColor = statusToColor(room.status);
  const isPulsing   = STATUS_PULSE.includes(room.status);

  return (
    <div className="room-card">
      {/* Image area */}
      <div className="room-card-img" style={{ background: cfg.gradient }}>
        <cfg.Icon size={28} color="rgba(255,255,255,0.9)" strokeWidth={1.5} />

        {/* Pulse ring for active statuses */}
        {isPulsing && <div className="room-pulse-ring" style={{ borderColor: statusColor }} />}

        {/* Status badge */}
        <div className={`room-status-badge ${isPulsing ? 'badge-pulse' : ''}`}
             style={{ background: statusColor }}>
          {statusToLabel(room.status)}
        </div>

        {/* Floor chip */}
        <div className="room-floor-chip">F{room.floor}</div>
      </div>

      {/* Body */}
      <div className="room-card-body">
        <div className="room-card-top">
          <span className="room-number">Room {room.room_number}</span>
          {room.type === 'SUITE' && <Star size={12} fill="#FFC72C" color="#FFC72C" />}
        </div>
        <div className="room-type-tag">{room.type}</div>
        <div className="room-amenities">
          <Wifi size={11} color="#A0A0A0" />
          <span>WiFi</span>
          <Wind size={11} color="#A0A0A0" />
          <span>A/C</span>
        </div>
        {room.price_per_night && (
          <div className="room-price">
            <span className="price-amount">${room.price_per_night}</span>
            <span className="price-night">/night</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default RoomCard;
