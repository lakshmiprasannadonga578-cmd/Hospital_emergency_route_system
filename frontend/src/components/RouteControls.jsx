import React from 'react';
import { Navigation, Play, GitCompare, RotateCcw, Clock, MapPin, Zap } from 'lucide-react';

export default function RouteControls({
  nodes = {},
  startNode,
  targetNode,
  onStartChange,
  onTargetChange,
  algorithm,
  onAlgorithmChange,
  onCalculateRoute,
  onCompareRoutes,
  isLoading,
  routeResult
}) {
  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: '0.72rem', color: '#06b6d4', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Emergency Navigation Config
          </span>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
            Origin & Destination Dispatch
          </h3>
        </div>
      </div>

      {/* Origin & Target Pickers */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div>
          <label style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
            Start / Origin Point
          </label>
          <select
            value={startNode}
            onChange={(e) => onStartChange(e.target.value)}
            style={{
              width: '100%',
              background: 'rgba(15, 23, 42, 0.9)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: 6,
              padding: '8px 10px',
              color: '#fff',
              fontSize: '0.82rem'
            }}
          >
            {Object.values(nodes).map((n) => (
              <option key={n.id} value={n.id}>
                {n.name} ({n.zone})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ fontSize: '0.75rem', color: '#f87171', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} />
            Target / Clinical Unit
          </label>
          <select
            value={targetNode}
            onChange={(e) => onTargetChange(e.target.value)}
            style={{
              width: '100%',
              background: 'rgba(15, 23, 42, 0.9)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 6,
              padding: '8px 10px',
              color: '#fff',
              fontSize: '0.82rem'
            }}
          >
            {Object.values(nodes).map((n) => (
              <option key={n.id} value={n.id}>
                {n.name} ({n.zone})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Algorithm Mode Switcher */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={() => onAlgorithmChange('Dijkstra')}
          style={{
            flex: 1,
            padding: '7px 10px',
            borderRadius: 6,
            border: algorithm === 'Dijkstra' ? '1px solid #06b6d4' : '1px solid rgba(255, 255, 255, 0.1)',
            background: algorithm === 'Dijkstra' ? 'rgba(6, 182, 212, 0.2)' : 'rgba(30, 41, 59, 0.6)',
            color: algorithm === 'Dijkstra' ? '#38bdf8' : '#94a3b8',
            fontSize: '0.78rem',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          Dijkstra (Weighted Min-Heap)
        </button>

        <button
          onClick={() => onAlgorithmChange('BFS')}
          style={{
            flex: 1,
            padding: '7px 10px',
            borderRadius: 6,
            border: algorithm === 'BFS' ? '1px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.1)',
            background: algorithm === 'BFS' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(30, 41, 59, 0.6)',
            color: algorithm === 'BFS' ? '#fbbf24' : '#94a3b8',
            fontSize: '0.78rem',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          BFS (Unweighted FIFO)
        </button>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: 10 }}>
        <button
          onClick={onCalculateRoute}
          disabled={isLoading || startNode === targetNode}
          className="btn-primary"
          style={{ flex: 2 }}
        >
          <Navigation size={16} />
          <span>{isLoading ? 'Computing Route...' : 'Compute Fastest Route'}</span>
        </button>

        <button
          onClick={onCompareRoutes}
          disabled={isLoading || startNode === targetNode}
          className="btn-secondary"
          style={{ flex: 1.2, color: '#f59e0b', borderColor: 'rgba(245, 158, 11, 0.3)' }}
        >
          <GitCompare size={15} />
          <span>Compare Both</span>
        </button>
      </div>

      {/* Result Metrics Pill if route available */}
      {routeResult && routeResult.success && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 8,
            marginTop: 4
          }}
        >
          <div className="metric-card">
            <div className="metric-value">{routeResult.total_cost_seconds}s</div>
            <div className="metric-title">Transit Time</div>
          </div>
          <div className="metric-card">
            <div className="metric-value" style={{ color: '#34d399' }}>{routeResult.total_distance_meters}m</div>
            <div className="metric-title">Distance</div>
          </div>
          <div className="metric-card">
            <div className="metric-value" style={{ color: '#a855f7' }}>{routeResult.hop_count}</div>
            <div className="metric-title">Corridor Hops</div>
          </div>
          <div className="metric-card">
            <div className="metric-value" style={{ color: '#fbbf24' }}>
              {routeResult.metrics?.settled_nodes_count || routeResult.metrics?.visited_nodes_count || 0}
            </div>
            <div className="metric-title">Nodes Visited</div>
          </div>
        </div>
      )}

      {routeResult && !routeResult.success && (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 8,
            padding: '10px 14px',
            color: '#fca5a5',
            fontSize: '0.82rem',
            textAlign: 'center'
          }}
        >
          <strong>Impassable Route:</strong> Destination cannot be reached due to blocked corridors! Try opening corridors or choosing an alternative unit.
        </div>
      )}
    </div>
  );
}
