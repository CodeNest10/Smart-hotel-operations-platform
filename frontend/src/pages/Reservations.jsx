import React, { useState, useEffect, useCallback } from 'react';
import { CalendarDays, LogIn, LogOut, PlusCircle, RefreshCw } from 'lucide-react';
import {
  getTodayReservations, getAvailableRooms,
  createReservation, checkIn, checkOut,
} from '../api/reservationApi';
import { useToast } from '../components/Toast';
import { SkeletonRow } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import { formatDate } from '../utils/roomUtils';
import './Reservations.css';

function Reservations() {
  const toast = useToast();
  const [reservations, setReservations] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [form, setForm] = useState({ guest_name:'', room_id:'', check_in:'', check_out:'' });

  const load = useCallback(async () => {
    try {
      const [r, rm] = await Promise.all([getTodayReservations(), getAvailableRooms()]);
      setReservations(r.data); setAvailableRooms(rm.data);
    } catch { toast('Failed to load reservation data.', 'error'); }
    finally { setLoading(false); }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  async function handleSubmit(e) {
    e.preventDefault(); setSubmitting(true);
    try {
      await createReservation(form);
      toast('Reservation created successfully!', 'success');
      setForm({ guest_name:'', room_id:'', check_in:'', check_out:'' });
      load();
    } catch (err) { toast(err.response?.data?.error || 'Failed to create reservation.', 'error'); }
    finally { setSubmitting(false); }
  }

  async function handleAction(id, action) {
    setActionLoading(id + action);
    try {
      if (action === 'checkin') { await checkIn(id);  toast('Guest checked in!', 'success'); }
      else                      { await checkOut(id); toast('Guest checked out. Room marked dirty.', 'info'); }
      load();
    } catch (err) { toast(err.response?.data?.error || 'Action failed.', 'error'); }
    finally { setActionLoading(null); }
  }

  return (
    <div className="reservations-page">
      <div className="page-hero">
        <div className="page-hero-inner">
          <div className="page-hero-eyebrow"><CalendarDays size={12} /> Front Desk</div>
          <h1>Reservations</h1>
          <p>Manage bookings, arrivals and departures</p>
        </div>
      </div>

      <div className="res-body">
        {/* Form card */}
        <div className="card res-form-card fade-up">
          <div className="res-card-title">
            <PlusCircle size={18} color="#0070CC" />
            New Reservation
          </div>
          <form className="res-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <label className="form-group">
                Guest Name
                <input className="form-control" required value={form.guest_name}
                  onChange={e => setForm({...form, guest_name: e.target.value})}
                  placeholder="e.g. John Smith" />
              </label>
              <label className="form-group">
                Room
                <select className="form-control" required value={form.room_id}
                  onChange={e => setForm({...form, room_id: e.target.value})}>
                  <option value="">Select available room…</option>
                  {availableRooms.map(r => (
                    <option key={r.id} value={r.id}>
                      Room {r.room_number} — Floor {r.floor} ({r.type}) · ${r.price_per_night}/night
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="form-row">
              <label className="form-group">
                Check-In Date
                <input className="form-control" type="date" required value={form.check_in}
                  onChange={e => setForm({...form, check_in: e.target.value})} />
              </label>
              <label className="form-group">
                Check-Out Date
                <input className="form-control" type="date" required value={form.check_out}
                  onChange={e => setForm({...form, check_out: e.target.value})} />
              </label>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? <RefreshCw size={14} className="spin" /> : <PlusCircle size={14} />}
                {submitting ? 'Creating…' : 'Create Reservation'}
              </button>
              <button type="button" className="btn btn-ghost"
                onClick={() => setForm({ guest_name:'', room_id:'', check_in:'', check_out:'' })}>
                Clear
              </button>
            </div>
          </form>
        </div>

        {/* Table card */}
        <div className="card res-table-card fade-up" style={{ animationDelay:'80ms' }}>
          <div className="res-table-header">
            <div className="res-card-title">
              <CalendarDays size={17} color="#0070CC" />
              Today's Arrivals & Departures
            </div>
            <button className="btn btn-ghost btn-sm" onClick={load}>
              <RefreshCw size={13} /> Refresh
            </button>
          </div>

          {loading ? (
            <div>{Array(4).fill(0).map((_,i) => <SkeletonRow key={i} />)}</div>
          ) : reservations.length === 0 ? (
            <EmptyState icon="📅" message="No reservations today." />
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Guest</th><th>Room</th><th>Check-In</th>
                    <th>Check-Out</th><th>Status</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reservations.map(r => (
                    <tr key={r.id}>
                      <td><strong>{r.guest_name}</strong></td>
                      <td>Room {r.room_number}</td>
                      <td>{formatDate(r.check_in)}</td>
                      <td>{formatDate(r.check_out)}</td>
                      <td><span className={`badge badge-${r.status?.toLowerCase()}`}>{r.status}</span></td>
                      <td>
                        <div className="action-cell">
                          {r.status === 'CONFIRMED' && (
                            <button className="btn btn-sm btn-success"
                              disabled={actionLoading === r.id+'checkin'}
                              onClick={() => handleAction(r.id,'checkin')}>
                              {actionLoading === r.id+'checkin'
                                ? <RefreshCw size={12} className="spin" />
                                : <LogIn size={12} />} Check In
                            </button>
                          )}
                          {r.status === 'CHECKED_IN' && (
                            <button className="btn btn-sm btn-danger"
                              disabled={actionLoading === r.id+'checkout'}
                              onClick={() => handleAction(r.id,'checkout')}>
                              {actionLoading === r.id+'checkout'
                                ? <RefreshCw size={12} className="spin" />
                                : <LogOut size={12} />} Check Out
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Reservations;
