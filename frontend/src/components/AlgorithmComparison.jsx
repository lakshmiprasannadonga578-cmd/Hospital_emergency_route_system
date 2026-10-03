import React from 'react';
import {
  GitCompare,
  TrendingDown,
  Clock,
  Navigation,
  Layers,
  Zap,
  CheckCircle,
  Eye,
  EyeOff,
  Scale
} from 'lucide-react';

export default function AlgorithmComparison({
  comparisonData,
  showBfsOverlay,
  onToggleBfsOverlay,
  onSelectAlgorithm
}) {
  if (!comparisonData || !comparisonData.analysis) {
    return (
      <div className="glass-panel" style={{ textAlign: 'center', padding: '30px' }}>
        <GitCompare size={36} color="#64748b" style={{ margin: '0 auto 12px' }} />
        <h4 style={{ color: '#f8fafc', marginBottom: 6 }}>Run Comparative Analysis</h4>
        <p style={{ color: '#94a3b8', fontSize: '0.82rem' }}>
          Compute route comparison between Dijkstra (Weighted Min-Heap) and BFS (Unweighted FIFO).
        </p>
      </div>
    );
  }

  const { dijkstra, bfs, analysis, start_name, target_name } = comparisonData;
  const metrics = analysis.metrics_table || [];

  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: '0.72rem', color: '#06b6d4', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            DAA Comparative Evaluation
          </span>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
            Dijkstra vs. BFS Benchmark
          </h3>
        </div>

        <button
          onClick={onToggleBfsOverlay}
          className="btn-secondary"
          style={{ fontSize: '0.78rem', padding: '6px 12px' }}
        >
          {showBfsOverlay ? <EyeOff size={14} /> : <Eye size={14} />}
          <span>{showBfsOverlay ? 'Hide BFS Map Overlay' : 'Show BFS Map Overlay'}</span>
        </button>
      </div>

      {/* Origin -> Target Route Banner */}
      <div
        style={{
          background: 'rgba(15, 23, 42, 0.7)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 8,
          padding: '8px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontSize: '0.82rem'
        }}
      >
        <span style={{ color: '#10b981', fontWeight: 700 }}>{start_name}</span>
        <span style={{ color: '#64748b' }}>➔</span>
        <span style={{ color: '#ef4444', fontWeight: 700 }}>{target_name}</span>
        <span style={{ marginLeft: 'auto', color: '#38bdf8', fontSize: '0.75rem' }}>
          Winner: <strong>{analysis.faster_algorithm}</strong>
        </span>
      </div>

      {/* Clinical Verdict Callout */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.12), rgba(15, 23, 42, 0.8))',
          borderLeft: '4px solid #06b6d4',
          borderRadius: 8,
          padding: '12px 14px',
          fontSize: '0.84rem',
          lineHeight: 1.5,
          color: '#e2e8f0'
        }}
      >
        <strong style={{ color: '#38bdf8', display: 'block', marginBottom: 4 }}>
          Algorithmic Decision Verdict:
        </strong>
        {analysis.clinical_verdict}
      </div>

      {/* Metrics Comparison Table */}
      <div
        style={{
          background: 'rgba(7, 13, 24, 0.75)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 8,
          overflow: 'hidden'
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
          <thead>
            <tr style={{ background: 'rgba(30, 41, 59, 0.9)', color: '#94a3b8', textAlign: 'left' }}>
              <th style={{ padding: '8px 12px' }}>Evaluation Metric</th>
              <th style={{ padding: '8px 12px', color: '#06b6d4' }}>Dijkstra (Weighted)</th>
              <th style={{ padding: '8px 12px', color: '#f59e0b' }}>BFS (Unweighted FIFO)</th>
              <th style={{ padding: '8px 12px' }}>Advantage</th>
            </tr>
          </thead>
          <tbody>
            {metrics.map((row, idx) => (
              <tr
                key={idx}
                style={{
                  borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                  background: idx % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.015)'
                }}
              >
                <td style={{ padding: '8px 12px', fontWeight: 600, color: '#f8fafc' }}>
                  {row.metric}
                </td>
                <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', color: '#38bdf8', fontWeight: 700 }}>
                  {row.dijkstra}
                </td>
                <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', color: '#fbbf24', fontWeight: 700 }}>
                  {row.bfs}
                </td>
                <td style={{ padding: '8px 12px', color: '#a7f3d0', fontSize: '0.75rem' }}>
                  {row.advantage}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Path Sequence Comparison */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {/* Dijkstra Path Box */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.7)',
            border: '1px solid rgba(6, 182, 212, 0.3)',
            borderRadius: 8,
            padding: '10px 12px'
          }}
        >
          <div style={{ fontSize: '0.72rem', color: '#06b6d4', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>
            Dijkstra Chosen Path
          </div>
          <div style={{ fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.6 }}>
            {dijkstra.path?.join(' ➔ ') || 'No path'}
          </div>
          <div style={{ marginTop: 8, fontSize: '0.72rem', color: '#64748b' }}>
            Total Transit Time: <strong style={{ color: '#06b6d4' }}>{dijkstra.total_cost_seconds}s</strong>
          </div>
        </div>

        {/* BFS Path Box */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.7)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: 8,
            padding: '10px 12px'
          }}
        >
          <div style={{ fontSize: '0.72rem', color: '#f59e0b', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>
            BFS Chosen Path
          </div>
          <div style={{ fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.6 }}>
            {bfs.path?.join(' ➔ ') || 'No path'}
          </div>
          <div style={{ marginTop: 8, fontSize: '0.72rem', color: '#64748b' }}>
            Total Transit Time: <strong style={{ color: '#f59e0b' }}>{bfs.total_cost_seconds}s</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
