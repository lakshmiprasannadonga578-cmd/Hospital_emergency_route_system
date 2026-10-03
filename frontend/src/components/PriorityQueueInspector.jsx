import React from 'react';
import { Layers, Database, CheckCircle2, Clock, ArrowDown } from 'lucide-react';

export default function PriorityQueueInspector({
  pqSnapshot = [],
  tentativeDistances = {},
  settledNodes = [],
  nodes = {},
  currentNode = null,
  algorithm = "Dijkstra"
}) {
  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Layers size={18} color="#06b6d4" />
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
            {algorithm === "Dijkstra" ? "Priority Queue (Min-Heap State)" : "FIFO Queue State"}
          </h3>
        </div>
        <span
          style={{
            fontSize: '0.72rem',
            color: '#94a3b8',
            background: 'rgba(255, 255, 255, 0.05)',
            padding: '3px 8px',
            borderRadius: 6
          }}
        >
          {pqSnapshot.length} Active Elements
        </span>
      </div>

      {/* Heap Elements Visualizer */}
      <div
        style={{
          background: 'rgba(7, 13, 24, 0.75)',
          border: '1px solid rgba(56, 189, 248, 0.15)',
          borderRadius: 8,
          padding: '10px 12px'
        }}
      >
        <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', marginBottom: 8, fontWeight: 700 }}>
          {algorithm === "Dijkstra" ? "Min-Heap Priority Order (Cheapest Tentative Distance First)" : "FIFO Discovery Order (Head to Tail)"}
        </div>

        {pqSnapshot.length === 0 ? (
          <div style={{ color: '#64748b', fontSize: '0.78rem', fontStyle: 'italic', padding: '6px 0' }}>
            Queue is empty (all reachable nodes processed or settled).
          </div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, maxHeight: '110px', overflowY: 'auto' }}>
            {pqSnapshot.map((item, idx) => {
              const nodeId = typeof item === 'string' ? item : item.node;
              const cost = typeof item === 'object' && item.cost !== undefined ? item.cost : null;
              const nodeObj = nodes[nodeId] || { name: nodeId };
              const isMin = idx === 0;

              return (
                <div
                  key={`${nodeId}-${idx}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    background: isMin ? 'rgba(6, 182, 212, 0.25)' : 'rgba(30, 41, 59, 0.7)',
                    border: isMin ? '1px solid #06b6d4' : '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 6,
                    padding: '4px 8px',
                    fontSize: '0.76rem',
                    boxShadow: isMin ? '0 0 10px rgba(6, 182, 212, 0.3)' : 'none'
                  }}
                >
                  {isMin && <span style={{ color: '#38bdf8', fontSize: '0.68rem', fontWeight: 800 }}>MIN</span>}
                  <span style={{ fontWeight: 600, color: '#f8fafc' }}>{nodeId}</span>
                  {cost !== null && (
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        color: isMin ? '#38bdf8' : '#94a3b8',
                        fontSize: '0.72rem'
                      }}
                    >
                      {cost}s
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Tentative Distances Table */}
      {Object.keys(tentativeDistances).length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
              Live Tentative Costs Table (dist[u])
            </span>
            <span style={{ fontSize: '0.72rem', color: '#10b981' }}>
              Settled: {settledNodes.length} / {Object.keys(nodes).length}
            </span>
          </div>

          <div
            style={{
              maxHeight: '160px',
              overflowY: 'auto',
              background: 'rgba(7, 13, 24, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 8
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
              <thead>
                <tr style={{ background: 'rgba(30, 41, 59, 0.8)', color: '#94a3b8', textAlign: 'left' }}>
                  <th style={{ padding: '6px 10px' }}>Node</th>
                  <th style={{ padding: '6px 10px' }}>Dept Name</th>
                  <th style={{ padding: '6px 10px' }}>Cost</th>
                  <th style={{ padding: '6px 10px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(tentativeDistances).map(([nodeId, cost]) => {
                  const isSettled = settledNodes.includes(nodeId);
                  const isCurrent = nodeId === currentNode;
                  const nodeObj = nodes[nodeId] || { name: nodeId };

                  return (
                    <tr
                      key={nodeId}
                      style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                        background: isCurrent ? 'rgba(234, 179, 8, 0.15)' : isSettled ? 'rgba(6, 182, 212, 0.05)' : 'transparent'
                      }}
                    >
                      <td style={{ padding: '5px 10px', fontWeight: 700, color: '#f8fafc' }}>
                        {nodeId}
                      </td>
                      <td style={{ padding: '5px 10px', color: '#94a3b8', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {nodeObj.name}
                      </td>
                      <td style={{ padding: '5px 10px', fontFamily: 'var(--font-mono)', color: cost === 'inf' ? '#64748b' : '#38bdf8' }}>
                        {cost === 'inf' ? '∞' : `${cost}s`}
                      </td>
                      <td style={{ padding: '5px 10px' }}>
                        {isSettled ? (
                          <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <CheckCircle2 size={12} /> Settled
                          </span>
                        ) : cost !== 'inf' ? (
                          <span style={{ color: '#f59e0b' }}>In Frontier</span>
                        ) : (
                          <span style={{ color: '#475569' }}>Unreached</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
