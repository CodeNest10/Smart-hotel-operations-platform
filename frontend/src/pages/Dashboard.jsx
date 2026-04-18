import React, { useEffect } from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement,
} from 'chart.js';
import {
  BedDouble, CheckCircle2, Sparkles, Wrench,
  TriangleAlert, Activity, TrendingUp, Clock,
} from 'lucide-react';
import useSSE from '../hooks/useSSE';
import useCountUp from '../hooks/useCountUp';
import { useHotel } from '../context/HotelContext';
import AlertBanner from '../components/AlertBanner';
import { SkeletonStatCard } from '../components/Skeleton';
import { getHousekeepingAnalytics } from '../api/analyticsApi';
import './Dashboard.css';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const STATUS_META = [
  { key: 'occupied',    label: 'Occupied',    Icon: BedDouble,     color: '#EF4444', bg: '#FEF2F2' },
  { key: 'available',   label: 'Available',   Icon: CheckCircle2,  color: '#10B981', bg: '#ECFDF5' },
  { key: 'dirty',       label: 'Needs Clean', Icon: TriangleAlert, color: '#F59E0B', bg: '#FFFBEB' },
  { key: 'cleaning',    label: 'Cleaning',    Icon: Sparkles,      color: '#6366F1', bg: '#EEF2FF' },
  { key: 'maintenance', label: 'Maintenance', Icon: Wrench,        color: '#8B5CF6', bg: '#F5F3FF' },
];

function AnimatedStat({ value, label, Icon, color, bg, delay = 0 }) {
  const count = useCountUp(value, 900);
  return (
    <div className="stat-card fade-up" style={{ '--accent': color, '--bg': bg, animationDelay: `${delay}ms` }}>
      <div className="stat-card-icon-wrap" style={{ background: bg }}>
        <Icon size={20} color={color} strokeWidth={2} />
      </div>
      <div className="stat-card-value">{count}</div>
      <div className="stat-card-label">{label}</div>
      <div className="stat-card-bar">
        <div className="stat-card-bar-fill" style={{ background: color, width: `${Math.min((value / 50) * 100, 100)}%` }} />
      </div>
    </div>
  );
}

function Dashboard() {
  const { data, connected } = useSSE('/api/analytics/stream/occupancy');
  const { updateOccupancy } = useHotel();
  const [hkData, setHkData] = React.useState(null);

  useEffect(() => { if (data) updateOccupancy(data); }, [data, updateOccupancy]);
  useEffect(() => { getHousekeepingAnalytics().then(r => setHkData(r.data)).catch(() => {}); }, []);

  const live = data || { occupancy_pct: 0, occupied: 0, available: 0, dirty: 0, cleaning: 0, maintenance: 0, alert: false };
  const pct  = Math.round(live.occupancy_pct || 0);
  const pctCount = useCountUp(pct, 1200);

  const pctColor = pct >= 90 ? '#EF4444' : pct >= 70 ? '#F59E0B' : '#10B981';
  const totalRooms = STATUS_META.reduce((s, m) => s + (live[m.key] || 0), 0);

  const doughnutData = {
    labels: STATUS_META.map(s => s.label),
    datasets: [{
      data: STATUS_META.map(s => live[s.key] || 0),
      backgroundColor: STATUS_META.map(s => s.color),
      borderWidth: 4, borderColor: '#fff', hoverOffset: 10,
    }],
  };

  const barData = hkData ? {
    labels: hkData.map(d => `Floor ${d.floor}`),
    datasets: [{
      label: 'Minutes',
      data: hkData.map(d => d.avg_minutes),
      backgroundColor: (ctx) => {
        const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 300);
        g.addColorStop(0, '#0070CC');
        g.addColorStop(1, '#60A5FA');
        return g;
      },
      borderRadius: 8,
      barThickness: 36,
    }],
  } : null;

  return (
    <div className="dashboard-page">
      {/* Glassmorphism Hero */}
      <div className="dashboard-hero">
        <div className="hero-bg-orbs">
          <div className="orb orb-1" /><div className="orb orb-2" /><div className="orb orb-3" />
        </div>
        <div className="hero-inner">
          <div className="hero-top-row">
            <div>
              <div className="hero-eyebrow">
                <Activity size={13} />
                <span>Real-time Operations</span>
              </div>
              <h1 className="hero-title">Occupancy Dashboard</h1>
              <p className="hero-sub">Live data from {totalRooms} rooms across all floors</p>
            </div>
            <div className="hero-live-badge">
              <span className={`live-dot ${connected ? 'live' : 'offline'}`} />
              <span>{connected ? 'Live Stream' : 'Reconnecting…'}</span>
            </div>
          </div>

          {/* Hero metric strip */}
          <div className="hero-metrics">
            <div className="hero-metric">
              <div className="hero-metric-value" style={{ color: pctColor }}>{pctCount}%</div>
              <div className="hero-metric-label">Occupancy Rate</div>
            </div>
            <div className="hero-metric-divider" />
            <div className="hero-metric">
              <div className="hero-metric-value">{live.occupied || 0}</div>
              <div className="hero-metric-label">Guests In-House</div>
            </div>
            <div className="hero-metric-divider" />
            <div className="hero-metric">
              <div className="hero-metric-value">{live.available || 0}</div>
              <div className="hero-metric-label">Rooms Available</div>
            </div>
            <div className="hero-metric-divider" />
            <div className="hero-metric">
              <TrendingUp size={22} color={pctColor} />
              <div className="hero-metric-label" style={{ color: pctColor }}>
                {pct >= 90 ? 'Critical' : pct >= 70 ? 'High' : 'Normal'}
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="hero-progress-wrap">
            <div className="hero-progress-track">
              <div
                className="hero-progress-fill"
                style={{ width: `${pct}%`, background: pctColor }}
              />
              <div className="hero-progress-marker" style={{ left: '70%' }} title="High threshold" />
              <div className="hero-progress-marker" style={{ left: '90%' }} title="Critical threshold" />
            </div>
            <div className="hero-progress-labels">
              <span>0%</span><span style={{marginLeft:'68%'}}>70%</span><span>90%</span><span style={{marginLeft:'auto'}}>100%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        {live.alert && <AlertBanner pct={pct} />}

        {/* Stat cards */}
        <div className="stat-cards-grid">
          {!data
            ? Array(5).fill(0).map((_, i) => <SkeletonStatCard key={i} />)
            : STATUS_META.map((s, i) => (
                <AnimatedStat
                  key={s.key}
                  value={live[s.key] || 0}
                  label={s.label}
                  Icon={s.Icon}
                  color={s.color}
                  bg={s.bg}
                  delay={i * 80}
                />
              ))
          }
        </div>

        {/* Charts */}
        <div className="charts-grid">
          <div className="chart-card fade-up">
            <div className="chart-card-header">
              <div className="chart-card-title">Room Status Breakdown</div>
              <span className="chart-chip">{totalRooms} total</span>
            </div>
            <div className="chart-wrap">
              <Doughnut
                data={doughnutData}
                options={{
                  responsive: true, maintainAspectRatio: false, cutout: '68%',
                  animation: { animateRotate: true, duration: 900 },
                  plugins: {
                    legend: { position: 'bottom', labels: { padding: 16, usePointStyle: true, font: { size: 12 } } },
                    tooltip: { callbacks: { label: (ctx) => ` ${ctx.label}: ${ctx.raw} rooms` } },
                  },
                }}
              />
            </div>
          </div>

          <div className="chart-card fade-up" style={{ animationDelay: '100ms' }}>
            <div className="chart-card-header">
              <div className="chart-card-title">
                <Clock size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                Avg Housekeeping Time per Floor
              </div>
              <span className="chart-chip">minutes</span>
            </div>
            {barData ? (
              <div className="chart-wrap">
                <Bar
                  data={barData}
                  options={{
                    responsive: true, maintainAspectRatio: false,
                    animation: { duration: 800, easing: 'easeOutQuart' },
                    plugins: { legend: { display: false } },
                    scales: {
                      y: { beginAtZero: true, grid: { color: '#F0F4FF' }, ticks: { font: { size: 11 } } },
                      x: { grid: { display: false }, ticks: { font: { size: 11 } } },
                    },
                  }}
                />
              </div>
            ) : (
              <div className="chart-empty">
                <Clock size={32} color="#D5D5D5" />
                <p>No housekeeping data yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
