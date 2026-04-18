import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles, ArrowUpDown, RefreshCw, CheckCircle2, Wrench, Zap } from 'lucide-react';
import { getHousekeepingQueue, updateRoomStatus } from '../api/housekeepingApi';
import { useToast } from '../components/Toast';
import { SkeletonRow } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import { statusToColor } from '../utils/roomUtils';
import './HousekeepingQueue.css';

const SORT_OPTIONS = [
  { value:'floor',  label:'Floor',  Icon: ArrowUpDown },
  { value:'status', label:'Status', Icon: ArrowUpDown },
  { value:'room',   label:'Room #', Icon: ArrowUpDown },
];

const ACTIONS = {
  DIRTY:       [{ label:'Start Cleaning', status:'CLEANING',    Icon: Sparkles,      cls:'btn-indigo' }],
  CLEANING:    [{ label:'Mark Clean',     status:'CLEAN',       Icon: CheckCircle2,  cls:'btn-success' },
                { label:'Maintenance',    status:'MAINTENANCE', Icon: Wrench,        cls:'btn-amber'  }],
  MAINTENANCE: [{ label:'Mark Available', status:'AVAILABLE',   Icon: Zap,           cls:'btn-success' }],
};

const STATUS_BG = {
  DIRTY: '#FFFBEB', CLEANING: '#EEF2FF', MAINTENANCE: '#F5F3FF',
};

function HousekeepingQueue() {
  const toast = useToast();
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [sortBy, setSortBy] = useState('floor');

  const load = useCallback(async () => {
    try { const r = await getHousekeepingQueue(); setQueue(r.data); }
    catch { toast('Failed to load queue.', 'error'); }
    finally { setLoading(false); }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  async function handleAction(roomId, status, label) {
    setActionLoading(roomId + status);
    try {
      await updateRoomStatus(roomId, status);
      toast(`Room status updated to ${label}`, 'success');
      load();
    } catch (err) { toast(err.response?.data?.error || 'Failed to update.', 'error'); }
    finally { setActionLoading(null); }
  }

  const sorted = [...queue].sort((a,b) => {
    if (sortBy==='floor')  return a.floor - b.floor;
    if (sortBy==='status') return a.status.localeCompare(b.status);
    return a.room_number.localeCompare(b.room_number);
  });

  const dirtyCount   = queue.filter(r=>r.status==='DIRTY').length;
  const cleaningCount= queue.filter(r=>r.status==='CLEANING').length;

  return (
    <div className="hk-page">
      <div className="page-hero">
        <div className="page-hero-inner">
          <div className="page-hero-eyebrow"><Sparkles size={12} /> Housekeeping</div>
          <h1>Housekeeping Queue</h1>
          <p>{dirtyCount} rooms need cleaning · {cleaningCount} in progress</p>
        </div>
      </div>

      <div className="hk-body">
        {/* Toolbar */}
        <div className="card hk-toolbar fade-up">
          <div className="toolbar-left">
            <span className="toolbar-label">Sort by</span>
            {SORT_OPTIONS.map(o => (
              <button key={o.value}
                className={`sort-btn ${sortBy===o.value?'active':''}`}
                onClick={() => setSortBy(o.value)}>
                {o.label}
              </button>
            ))}
          </div>
          <div className="toolbar-right">
            <div className="hk-chips">
              <span className="hk-chip dirty">{dirtyCount} Dirty</span>
              <span className="hk-chip cleaning">{cleaningCount} Cleaning</span>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={load}>
              <RefreshCw size={13} /> Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="card">
            {Array(5).fill(0).map((_,i) => <SkeletonRow key={i} />)}
          </div>
        ) : sorted.length === 0 ? (
          <EmptyState icon="✅" message="All rooms are clean!" sub="No pending housekeeping tasks." />
        ) : (
          <div className="card hk-table-card fade-up" style={{ animationDelay:'60ms' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Room</th><th>Floor</th><th>Type</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map(room => {
                  const actions = ACTIONS[room.status] || [];
                  const rowBg   = STATUS_BG[room.status] || 'transparent';
                  return (
                    <tr key={room.id} style={{ '--row-bg': rowBg }}>
                      <td><strong>Room {room.room_number}</strong></td>
                      <td>Floor {room.floor}</td>
                      <td><span className="type-tag">{room.type}</span></td>
                      <td>
                        <span className="status-pill" style={{ background: statusToColor(room.status) }}>
                          {room.status}
                        </span>
                      </td>
                      <td>
                        <div className="action-cell">
                          {actions.map(a => (
                            <button key={a.status}
                              className={`btn btn-sm ${a.cls}`}
                              disabled={actionLoading === room.id + a.status}
                              onClick={() => handleAction(room.id, a.status, a.label)}>
                              {actionLoading === room.id + a.status
                                ? <RefreshCw size={12} className="spin" />
                                : <a.Icon size={12} />}
                              {a.label}
                            </button>
                          ))}
                          {actions.length === 0 && <span className="no-action">—</span>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default HousekeepingQueue;
