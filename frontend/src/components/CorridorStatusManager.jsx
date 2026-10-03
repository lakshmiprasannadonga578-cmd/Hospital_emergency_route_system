import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  RotateCcw,
  CheckCircle,
  Filter,
  Sliders,
  XCircle
} from 'lucide-react';

export default function CorridorStatusManager({
  edges = [],
  nodes = {},
  onToggleCorridor,
  onUpdateCorridor,
  onResetCorridors
}) {
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'BLOCKED' | 'CONGESTED'
  const [search, setSearch] = useState('');

  const filteredEdges = edges.filter((e) => {
    if (filter === 'BLOCKED' && e.status !== 'BLOCKED') return false;
    if (filter === 'CONGESTED' && e.status !== 'CONGESTED' && e.congestion <= 1.2) return false;
    if (search) {
      const q = search.toLowerCase();
      const name = (e.name || '').toLowerCase();
      const u = (nodes[e.u]?.name || e.u).toLowerCase();
      const v = (nodes[e.v]?.name || e.v).toLowerCase();
      return name.includes(q) || u.includes(q) || v.includes(q);
    }
    return true;
  });

  const blockedCount = edges.filter((e) => e.status === 'BLOCKED').length;
  const congestedCount = edges.filter((e) => e.status === 'CONGESTED' || e.congestion > 1.2).length;

  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <span style={{ fontSize: '0.72rem', color: '#06b6d4', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Campus Network Management
          </span>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
            Dynamic Corridor & Obstacle Controls
          </h3>
        </div>

        <button
          onClick={onResetCorridors}
          className="btn-secondary"
          style={{ fontSize: '0.78rem', padding: '6px 12px' }}
        >
          <RotateCcw size={14} />
          <span>Restore All Clear</span>
        </button>
      </div>

      {/* Filter and Stats Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {[
            { id: 'ALL', label: `All Corridors (${edges.length})` },
            { id: 'BLOCKED', label: `Blocked (${blockedCount})` },
            { id: 'CONGESTED', label: `Congested (${congestedCount})` }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id)}
              style={{
                background: filter === item.id ? '#0284c7' : 'rgba(30, 41, 59, 0.6)',
                border: 'none',
                color: filter === item.id ? '#fff' : '#94a3b8',
                padding: '4px 10px',
                borderRadius: 6,
                fontSize: '0.75rem',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Search hallway..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 6,
            padding: '4px 10px',
            color: '#fff',
            fontSize: '0.76rem',
            width: 140
          }}
        />
      </div>

      {/* Corridors Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: '380px', overflowY: 'auto' }}>
        {filteredEdges.map((edge) => {
          const isBlocked = edge.status === 'BLOCKED';
          const isCongested = edge.status === 'CONGESTED' || edge.congestion > 1.2;
          const uName = nodes[edge.u]?.name || edge.u;
          const vName = nodes[edge.v]?.name || edge.v;

          return (
            <div
              key={edge.id}
              style={{
                background: isBlocked
                  ? 'rgba(239, 68, 68, 0.08)'
                  : isCongested
                  ? 'rgba(245, 158, 11, 0.08)'
                  : 'rgba(15, 23, 42, 0.6)',
                border: `1px solid ${
                  isBlocked
                    ? 'rgba(239, 68, 68, 0.35)'
                    : isCongested
                    ? 'rgba(245, 158, 11, 0.35)'
                    : 'rgba(255, 255, 255, 0.06)'
                }`,
                borderRadius: 8,
                padding: '10px 12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 10
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                  <span style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.84rem' }}>
                    {edge.name || edge.id}
                  </span>
                  {isBlocked ? (
                    <span style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', padding: '2px 6px', borderRadius: 4, fontSize: '0.68rem', fontWeight: 800 }}>
                      BLOCKED
                    </span>
                  ) : isCongested ? (
                    <span style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#fde68a', padding: '2px 6px', borderRadius: 4, fontSize: '0.68rem', fontWeight: 800 }}>
                      CONGESTED ({edge.congestion}x)
                    </span>
                  ) : (
                    <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#a7f3d0', padding: '2px 6px', borderRadius: 4, fontSize: '0.68rem', fontWeight: 700 }}>
                      CLEAR
                    </span>
                  )}
                </div>

                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  {uName} ➔ {vName} ({edge.distance}m @ {edge.base_speed}m/s)
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button
                  onClick={() => onToggleCorridor(edge.id)}
                  style={{
                    background: isBlocked ? '#10b981' : '#dc2626',
                    border: 'none',
                    color: '#fff',
                    padding: '5px 10px',
                    borderRadius: 6,
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {isBlocked ? 'Reopen' : 'Block'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
