import React from 'react';

export const StatusBadge = ({ value, type = 'status' }) => {
  if (!value) return null;

  const normalized = String(value).trim();

  // Colors & styles configuration
  let bg = '#f1f5f9';
  let color = '#475569';
  let border = '#cbd5e1';

  switch (normalized.toLowerCase()) {
    // Approved / Verified / Completed
    case 'approved':
    case 'verified':
    case 'completed':
    case 'active':
    case 'pass':
    case 'verified match':
      bg = '#ecfdf5';
      color = '#059669';
      border = '#a7f3d0';
      break;

    // In Progress / Scrutiny / Review / Confirmed
    case 'in progress':
    case 'scrutiny':
    case 'evc / review':
    case 'confirmed':
    case 'physical on-site':
    case 'medium':
      bg = '#eff6ff';
      color = '#2563eb';
      border = '#bfdbfe';
      break;

    // SAC/SHC / Final Decision / Submitted / Proposed
    case 'submitted':
    case 'sac/shc':
    case 'final decision':
    case 'proposed':
    case 'pending':
    case 'low':
      bg = '#fffbeb';
      color = '#d97706';
      border = '#fde68a';
      break;

    // Returned / Rescheduled / Flagged
    case 'returned':
    case 'returned for deficiency':
    case 'rescheduled':
    case 'flagged':
    case 'discrepancy found':
      bg = '#faf5ff';
      color = '#7c3aed';
      border = '#e9d5ff';
      break;

    // Rejected / Cancelled / Overdue / High / Critical
    case 'rejected':
    case 'cancelled':
    case 'overdue':
    case 'high':
    case 'critical':
    case 'fail':
    case 'inactive':
      bg = '#fef2f2';
      color = '#dc2626';
      border = '#fecaca';
      break;

    default:
      bg = '#f8fafc';
      color = '#475569';
      border = '#e2e8f0';
      break;
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 9px',
        borderRadius: '9999px',
        fontSize: '12px',
        fontWeight: 600,
        backgroundColor: bg,
        color: color,
        border: `1px solid ${border}`,
        whiteSpace: 'nowrap',
        letterSpacing: '0.02em',
        lineHeight: 1.3
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: color,
          marginRight: '6px'
        }}
      />
      {value}
    </span>
  );
};
