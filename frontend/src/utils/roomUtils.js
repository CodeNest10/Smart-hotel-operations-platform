export const STATUS_COLORS = {
  AVAILABLE:   '#22c55e', // green
  RESERVED:    '#3b82f6', // blue
  OCCUPIED:    '#ef4444', // red
  DIRTY:       '#f59e0b', // yellow/amber
  CLEANING:    '#6366f1', // indigo
  MAINTENANCE: '#6b7280', // gray
};

export const STATUS_LABELS = {
  AVAILABLE:   'Available',
  RESERVED:    'Reserved',
  OCCUPIED:    'Occupied',
  DIRTY:       'Dirty',
  CLEANING:    'Cleaning',
  MAINTENANCE: 'Maintenance',
};

export function statusToColor(status) {
  return STATUS_COLORS[status] || '#9ca3af';
}

export function statusToLabel(status) {
  return STATUS_LABELS[status] || status;
}

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

export function formatTime(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit',
  });
}

export function occupancyColor(pct) {
  if (pct >= 90) return '#ef4444';
  if (pct >= 70) return '#f59e0b';
  return '#22c55e';
}
