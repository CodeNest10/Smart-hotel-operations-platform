import React from 'react';
import './Skeleton.css';

export function Skeleton({ width = '100%', height = '16px', radius = '6px', className = '' }) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ width, height, borderRadius: radius }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <Skeleton height="90px" radius="0" />
      <div className="skeleton-card-body">
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
          <Skeleton width="60%" height="14px" />
          <Skeleton width="25%" height="14px" />
        </div>
        <Skeleton width="40%" height="12px" />
        <div style={{ marginTop:10 }}>
          <Skeleton width="50%" height="16px" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonStatCard() {
  return (
    <div className="skeleton-stat-card">
      <Skeleton width="36px" height="36px" radius="8px" />
      <Skeleton width="50px" height="28px" radius="6px" />
      <Skeleton width="70%" height="12px" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="skeleton-row">
      <Skeleton width="15%" height="14px" />
      <Skeleton width="20%" height="14px" />
      <Skeleton width="12%" height="14px" />
      <Skeleton width="12%" height="22px" radius="999px" />
      <Skeleton width="25%" height="14px" />
    </div>
  );
}

export default Skeleton;
