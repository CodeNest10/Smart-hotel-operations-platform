import React, { useState, useEffect, useCallback } from 'react';
import { BellRing, Send, CheckCheck, RefreshCw, Clock, User, Hash } from 'lucide-react';
import { getPendingRequests, submitRequest, resolveRequest } from '../api/analyticsApi';
import { useToast } from '../components/Toast';
import { SkeletonRow } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import { formatTime, formatDate } from '../utils/roomUtils';
import './GuestRequests.css';

const CATEGORIES = ['Housekeeping','Room Service','Maintenance','Concierge','Other'];
const CAT_META = {
  Housekeeping:  { icon:'🧹', color:'#6366F1', bg:'#EEF2FF' },
  'Room Service':{ icon:'🍽️', color:'#F59E0B', bg:'#FFFBEB' },
  Maintenance:   { icon:'🔧', color:'#EF4444', bg:'#FEF2F2' },
  Concierge:     { icon:'🛎️', color:'#0070CC', bg:'#EBF3FF' },
  Other:         { icon:'💬', color:'#6B7280', bg:'#F4F4F4'  },
};

function GuestRequests() {
  const toast = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ guest_name:'', room_id:'', category:'Housekeeping', description:'' });

  const load = useCallback(async () => {
    try { const r = await getPendingRequests(); setRequests(r.data); }
    catch { toast('Failed to load requests.', 'error'); }
    finally { setLoading(false); }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  async function handleSubmit(e) {
    e.preventDefault(); setSubmitting(true);
    try {
      await submitRequest(form);
      toast('Request submitted! Staff notified.', 'success');
      setForm({ guest_name:'', room_id:'', category:'Housekeeping', description:'' });
      load();
    } catch (err) { toast(err.response?.data?.error || 'Failed to submit.', 'error'); }
    finally { setSubmitting(false); }
  }

  async function handleResolve(id) {
    setResolving(id);
    try {
      await resolveRequest(id);
      toast('Request resolved!', 'success');
      load();
    } catch (err) { toast(err.response?.data?.error || 'Failed to resolve.', 'error'); }
    finally { setResolving(null); }
  }

  // Stat chips
  const statChips = CATEGORIES.map(c => ({
    ...CAT_META[c], label: c,
    count: requests.filter(r => r.category === c).length,
  })).filter(c => c.count > 0);

  return (
    <div className="requests-page">
      <div className="page-hero">
        <div className="page-hero-inner">
          <div className="page-hero-eyebrow"><BellRing size={12} /> Guest Services</div>
          <h1>Guest Requests</h1>
          <p>{requests.length} pending · Submit, track and resolve all service requests</p>
        </div>
      </div>

      <div className="req-body">
        {/* Stat chips */}
        {statChips.length > 0 && (
          <div className="req-stat-chips fade-up">
            <div className="req-stat-chip">
              <div className="chip-icon" style={{ background:'#EBF3FF' }}>
                <BellRing size={18} color="#0070CC" />
              </div>
              <div>
                <div className="chip-val">{requests.length}</div>
                <div className="chip-lbl">Total Pending</div>
              </div>
            </div>
            {statChips.map(c => (
              <div className="req-stat-chip" key={c.label}>
                <div className="chip-icon" style={{ background: c.bg }}>
                  <span style={{ fontSize:'1.1rem' }}>{c.icon}</span>
                </div>
                <div>
                  <div className="chip-val" style={{ color: c.color }}>{c.count}</div>
                  <div className="chip-lbl">{c.label}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Submit form */}
        <div className="card req-form-card fade-up" style={{ animationDelay:'60ms' }}>
          <div className="req-card-title">
            <Send size={17} color="#0070CC" />
            Submit New Request
          </div>
          <form className="req-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <label className="form-group">
                <span><User size={12} style={{verticalAlign:'middle', marginRight:4}} />Guest Name</span>
                <input className="form-control" required value={form.guest_name}
                  onChange={e => setForm({...form, guest_name: e.target.value})}
                  placeholder="e.g. Jane Doe" />
              </label>
              <label className="form-group">
                <span><Hash size={12} style={{verticalAlign:'middle', marginRight:4}} />Room Number</span>
                <input className="form-control" required value={form.room_id}
                  onChange={e => setForm({...form, room_id: e.target.value})}
                  placeholder="e.g. 204" />
              </label>
            </div>
            <div className="form-row">
              <label className="form-group">
                Category
                <div className="cat-selector">
                  {CATEGORIES.map(c => (
                    <button key={c} type="button"
                      className={`cat-btn ${form.category === c ? 'active' : ''}`}
                      style={ form.category===c ? { background:CAT_META[c].bg, borderColor:CAT_META[c].color, color:CAT_META[c].color } : {}}
                      onClick={() => setForm({...form, category: c})}>
                      {CAT_META[c].icon} {c}
                    </button>
                  ))}
                </div>
              </label>
              <label className="form-group">
                Description
                <input className="form-control" required value={form.description}
                  onChange={e => setForm({...form, description: e.target.value})}
                  placeholder="e.g. Extra towels please" />
              </label>
            </div>
            <div>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? <RefreshCw size={14} className="spin" /> : <Send size={14} />}
                {submitting ? 'Submitting…' : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>

        {/* Table */}
        <div className="card req-table-card fade-up" style={{ animationDelay:'120ms' }}>
          <div className="req-table-header">
            <div className="req-card-title" style={{marginBottom:0, paddingBottom:0, borderBottom:'none'}}>
              <Clock size={17} color="#0070CC" />
              Pending Requests
            </div>
            <div style={{display:'flex',gap:8,alignItems:'center'}}>
              <span className="pending-chip">{requests.length} open</span>
              <button className="btn btn-ghost btn-sm" onClick={load}>
                <RefreshCw size={13} /> Refresh
              </button>
            </div>
          </div>

          {loading ? (
            <div style={{marginTop:16}}>{Array(4).fill(0).map((_,i)=><SkeletonRow key={i}/>)}</div>
          ) : requests.length === 0 ? (
            <EmptyState icon="🎉" message="All caught up!" sub="No pending guest requests." />
          ) : (
            <div className="table-wrap" style={{marginTop:16}}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Category</th><th>Guest</th><th>Room</th>
                    <th>Description</th><th>Submitted</th><th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map(req => {
                    const meta = CAT_META[req.category] || CAT_META.Other;
                    return (
                      <tr key={req._id || req.id}>
                        <td>
                          <span className="cat-pill" style={{ background: meta.bg, color: meta.color }}>
                            {meta.icon} {req.category}
                          </span>
                        </td>
                        <td><strong>{req.guest_name}</strong></td>
                        <td><span className="room-tag">Room {req.room_id}</span></td>
                        <td><span className="desc-cell" title={req.description}>{req.description}</span></td>
                        <td>
                          <div className="time-cell">
                            <span>{formatDate(req.created_at)}</span>
                            <span className="time-sub">{formatTime(req.created_at)}</span>
                          </div>
                        </td>
                        <td>
                          <button className="btn btn-sm btn-success"
                            disabled={resolving === (req._id||req.id)}
                            onClick={() => handleResolve(req._id||req.id)}>
                            {resolving === (req._id||req.id)
                              ? <RefreshCw size={12} className="spin" />
                              : <CheckCheck size={12} />}
                            Resolve
                          </button>
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
    </div>
  );
}

export default GuestRequests;
