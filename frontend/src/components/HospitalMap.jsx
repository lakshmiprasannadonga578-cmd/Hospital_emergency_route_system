import React, { useState } from 'react';
import {
  Ambulance,
  HeartPulse,
  Activity,
  Layers,
  ShieldAlert,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Navigation,
  Compass,
  ChevronsUpDown,
  Scissors,
  Scan,
  Bed,
  CheckCircle2,
  XCircle
} from 'lucide-react';

export default function HospitalMap({
  nodes,
  edges,
  startNode,
  targetNode,
  activeDijkstraEdges = [],
  activeBfsEdges = [],
  settledNodes = [],
  frontierNodes = [],
  currentNode = null,
  onSelectNode,
  onToggleCorridor,
  showBfsOverlay = false
}) {
  const [zoom, setZoom] = useState(1);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [hoveredEdge, setHoveredEdge] = useState(null);

  // Helper to get node coordinates
  const getNodePos = (nodeId) => {
    const node = nodes[nodeId];
    return node ? { x: node.x, y: node.y } : { x: 0, y: 0 };
  };

  const handleZoom = (delta) => {
    setZoom((prev) => Math.max(0.7, Math.min(1.6, prev + delta)));
  };

  const resetZoom = () => setZoom(1);

  // Hospital Department Type Colors
  const getTypeColor = (type, id) => {
    if (id === startNode) return '#10b981'; // Green beacon
    if (id === targetNode) return '#ef4444'; // Red beacon
    if (id === currentNode) return '#eab308'; // Active explorer

    switch (type) {
      case 'entrance':
        return '#0284c7';
      case 'critical':
        return '#e11d48';
      case 'diagnostic':
        return '#9333ea';
      case 'surgical':
        return '#4f46e5';
      case 'elevator':
      case 'stair':
        return '#059669';
      default:
        return '#334155';
    }
  };

  return (
    <div className="map-viewport" style={{ position: 'relative' }}>
      {/* Top Map Toolbar */}
      <div
        style={{
          position: 'absolute',
          top: 14,
          left: 16,
          right: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pointerEvents: 'none',
          zIndex: 20
        }}
      >
        <div
          style={{
            pointerEvents: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(10, 18, 30, 0.85)',
            backdropFilter: 'blur(10px)',
            padding: '6px 14px',
            borderRadius: 10,
            border: '1px solid rgba(56, 189, 248, 0.2)',
            fontSize: '0.8rem',
            color: '#94a3b8'
          }}
        >
          <Compass size={16} color="#06b6d4" />
          <span>Interactive Campus Topology</span>
          <span style={{ color: '#475569' }}>|</span>
          <span style={{ color: '#38bdf8' }}>Click corridor to Toggle Blockage</span>
        </div>

        {/* Zoom Controls */}
        <div
          style={{
            pointerEvents: 'auto',
            display: 'flex',
            gap: 6,
            background: 'rgba(10, 18, 30, 0.85)',
            backdropFilter: 'blur(10px)',
            padding: '4px',
            borderRadius: 10,
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <button
            onClick={() => handleZoom(0.15)}
            className="btn-secondary"
            style={{ padding: '6px 10px' }}
            title="Zoom In"
          >
            <ZoomIn size={15} />
          </button>
          <button
            onClick={() => handleZoom(-0.15)}
            className="btn-secondary"
            style={{ padding: '6px 10px' }}
            title="Zoom Out"
          >
            <ZoomOut size={15} />
          </button>
          <button
            onClick={resetZoom}
            className="btn-secondary"
            style={{ padding: '6px 10px' }}
            title="Reset Zoom"
          >
            <Maximize2 size={15} />
          </button>
        </div>
      </div>

      {/* SVG Canvas Map */}
      <svg
        className="map-svg"
        viewBox="0 0 1020 630"
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: 'center center',
          transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        <defs>
          {/* Subtle Grid Filter */}
          <pattern id="hospitalGrid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          </pattern>

          {/* Glowing Filters */}
          <filter id="glowDijkstra" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="glowBeacon" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect width="100%" height="100%" fill="url(#hospitalGrid)" />

        {/* Clinical Zones Background Patches */}
        <g opacity="0.35">
          {/* Emergency Core */}
          <rect
            x="200"
            y="50"
            width="320"
            height="260"
            rx="20"
            fill="rgba(239, 68, 68, 0.08)"
            stroke="rgba(239, 68, 68, 0.2)"
            strokeDasharray="6 4"
          />
          <text x="215" y="75" fill="#f87171" fontSize="12" fontWeight="700" letterSpacing="0.05em">
            ZONE A: EMERGENCY & RESUSCITATION
          </text>

          {/* Diagnostics Wing */}
          <rect
            x="610"
            y="360"
            width="250"
            height="230"
            rx="20"
            fill="rgba(168, 85, 247, 0.08)"
            stroke="rgba(168, 85, 247, 0.2)"
            strokeDasharray="6 4"
          />
          <text x="625" y="385" fill="#c084fc" fontSize="12" fontWeight="700" letterSpacing="0.05em">
            ZONE B: DIAGNOSTIC IMAGING & LAB
          </text>

          {/* Surgical & Critical Care Floor */}
          <rect
            x="670"
            y="50"
            width="330"
            height="300"
            rx="20"
            fill="rgba(59, 130, 246, 0.08)"
            stroke="rgba(59, 130, 246, 0.2)"
            strokeDasharray="6 4"
          />
          <text x="685" y="75" fill="#60a5fa" fontSize="12" fontWeight="700" letterSpacing="0.05em">
            ZONE C: OR THEATRES & CRITICAL CARE
          </text>
        </g>

        {/* Corridors / Edges */}
        <g id="corridors-layer">
          {edges.map((edge) => {
            const p1 = getNodePos(edge.u);
            const p2 = getNodePos(edge.v);
            const isDijkstraPath = activeDijkstraEdges.includes(edge.id);
            const isBfsPath = showBfsOverlay && activeBfsEdges.includes(edge.id);
            const isBlocked = edge.status === 'BLOCKED';
            const isCongested = edge.status === 'CONGESTED' || edge.congestion > 1.5;
            const midX = (p1.x + p2.x) / 2;
            const midY = (p1.y + p2.y) / 2;

            let edgeClass = 'edge-line edge-open';
            if (isBlocked) edgeClass = 'edge-line edge-blocked';
            else if (isCongested) edgeClass = 'edge-line edge-congested';

            return (
              <g
                key={edge.id}
                onClick={() => onToggleCorridor && onToggleCorridor(edge.id)}
                onMouseEnter={() => setHoveredEdge(edge)}
                onMouseLeave={() => setHoveredEdge(null)}
                style={{ cursor: 'pointer' }}
              >
                {/* Base Corridor Track */}
                <line
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  className={edgeClass}
                />

                {/* BFS Overlay Path (if comparison mode enabled) */}
                {isBfsPath && !isDijkstraPath && (
                  <line
                    x1={p1.x}
                    y1={p1.y}
                    x2={p2.x}
                    y2={p2.y}
                    className="edge-path-bfs"
                  />
                )}

                {/* Dijkstra Active Route Path with animated glow */}
                {isDijkstraPath && (
                  <line
                    x1={p1.x}
                    y1={p1.y}
                    x2={p2.x}
                    y2={p2.y}
                    className="edge-path-dijkstra"
                    filter="url(#glowDijkstra)"
                  />
                )}

                {/* Corridor Interaction Hitbox */}
                <line
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke="transparent"
                  strokeWidth="20"
                />

                {/* Blocked corridor indicator icon */}
                {isBlocked && (
                  <g transform={`translate(${midX - 10}, ${midY - 10})`}>
                    <circle cx="10" cy="10" r="11" fill="#ef4444" />
                    <line x1="6" y1="6" x2="14" y2="14" stroke="#ffffff" strokeWidth="2.5" />
                    <line x1="14" y1="6" x2="6" y2="14" stroke="#ffffff" strokeWidth="2.5" />
                  </g>
                )}

                {/* Congestion indicator icon */}
                {isCongested && !isBlocked && (
                  <g transform={`translate(${midX - 8}, ${midY - 8})`}>
                    <circle cx="8" cy="8" r="9" fill="#d97706" />
                    <text x="8" y="11" fill="#ffffff" fontSize="9" fontWeight="800" textAnchor="middle">
                      !
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </g>

        {/* Nodes Layer */}
        <g id="nodes-layer">
          {Object.values(nodes).map((node) => {
            const isStart = node.id === startNode;
            const isTarget = node.id === targetNode;
            const isSettled = settledNodes.includes(node.id);
            const isFrontier = frontierNodes.includes(node.id);
            const isCurrent = node.id === currentNode;
            const nodeColor = getTypeColor(node.type, node.id);

            const isKeyNode = ['entrance', 'critical', 'diagnostic', 'surgical'].includes(node.type);
            const radius = isKeyNode ? 22 : 14;

            return (
              <g
                key={node.id}
                className="node-group"
                transform={`translate(${node.x}, ${node.y})`}
                onClick={() => onSelectNode && onSelectNode(node.id)}
                onMouseEnter={() => setHoveredNode(node)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                {/* Radiating Beacon Halo for Start/Target/Current */}
                {(isStart || isTarget || isCurrent) && (
                  <circle
                    r={radius + 8}
                    fill="none"
                    stroke={isStart ? '#10b981' : isTarget ? '#ef4444' : '#eab308'}
                    strokeWidth="3"
                    className="node-halo"
                    filter="url(#glowBeacon)"
                  />
                )}

                {/* Node Outer Ring */}
                <circle
                  r={radius}
                  fill="#0e1726"
                  stroke={nodeColor}
                  strokeWidth={isStart || isTarget || isCurrent ? 3.5 : 2}
                  filter={isStart || isTarget ? 'url(#glowBeacon)' : undefined}
                />

                {/* Settled / Frontier Status Inner Ring */}
                {isSettled && !isStart && !isTarget && (
                  <circle r={radius - 4} fill="rgba(6, 182, 212, 0.25)" />
                )}
                {isFrontier && !isSettled && (
                  <circle r={radius - 4} fill="rgba(234, 179, 8, 0.25)" />
                )}

                {/* Node Center Label */}
                <text
                  textAnchor="middle"
                  dy="4"
                  fill="#ffffff"
                  fontSize={isKeyNode ? '10' : '8'}
                  fontWeight="700"
                  letterSpacing="-0.02em"
                  pointerEvents="none"
                >
                  {node.code || node.id.substring(0, 4)}
                </text>

                {/* Department Name Tag Below */}
                <text
                  textAnchor="middle"
                  y={radius + 15}
                  fill={isStart ? '#34d399' : isTarget ? '#f87171' : '#cbd5e1'}
                  fontSize="10"
                  fontWeight={isStart || isTarget ? '800' : '600'}
                  pointerEvents="none"
                >
                  {node.name.length > 20 ? node.name.substring(0, 18) + '...' : node.name}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      {/* Corridor Hover Tooltip */}
      {hoveredEdge && (
        <div
          style={{
            position: 'absolute',
            bottom: 60,
            left: 20,
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: 10,
            padding: '10px 14px',
            fontSize: '0.8rem',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 20px rgba(0,0,0,0.5)',
            zIndex: 30
          }}
        >
          <div style={{ fontWeight: 700, color: '#f8fafc', marginBottom: 3 }}>
            Corridor: {hoveredEdge.name || hoveredEdge.id}
          </div>
          <div style={{ color: '#94a3b8', display: 'flex', gap: 12 }}>
            <span>Distance: <strong>{hoveredEdge.distance}m</strong></span>
            <span>Speed: <strong>{hoveredEdge.base_speed} m/s</strong></span>
            <span>Status: <strong style={{ color: hoveredEdge.status === 'BLOCKED' ? '#ef4444' : hoveredEdge.status === 'CONGESTED' ? '#f59e0b' : '#10b981' }}>{hoveredEdge.status}</strong></span>
          </div>
          <div style={{ marginTop: 5, fontSize: '0.72rem', color: '#38bdf8' }}>
            Click corridor to toggle BLOCKED / OPEN
          </div>
        </div>
      )}

      {/* Node Hover Tooltip */}
      {hoveredNode && !hoveredEdge && (
        <div
          style={{
            position: 'absolute',
            bottom: 60,
            right: 20,
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: 10,
            padding: '10px 14px',
            fontSize: '0.8rem',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 20px rgba(0,0,0,0.5)',
            zIndex: 30,
            maxWidth: 280
          }}
        >
          <div style={{ fontWeight: 700, color: '#f8fafc', marginBottom: 2 }}>
            {hoveredNode.name}
          </div>
          <div style={{ color: '#06b6d4', fontSize: '0.75rem', fontWeight: 600, marginBottom: 4 }}>
            Zone: {hoveredNode.zone} (Floor {hoveredNode.floor || 1})
          </div>
          <div style={{ color: '#94a3b8', fontSize: '0.74rem', marginBottom: 6 }}>
            {hoveredNode.description}
          </div>
          <div style={{ display: 'flex', gap: 6, fontSize: '0.72rem' }}>
            <span style={{ color: '#34d399' }}>Click to select Start/Destination</span>
          </div>
        </div>
      )}

      {/* Map Legend */}
      <div
        style={{
          position: 'absolute',
          bottom: 12,
          left: 16,
          right: 16,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 16,
          background: 'rgba(10, 18, 30, 0.85)',
          backdropFilter: 'blur(10px)',
          padding: '8px 16px',
          borderRadius: 10,
          border: '1px solid rgba(255, 255, 255, 0.08)',
          fontSize: '0.75rem',
          color: '#94a3b8'
        }}
      >
        <span style={{ fontWeight: 700, color: '#f8fafc' }}>LEGEND:</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 16, height: 4, background: '#06b6d4', borderRadius: 2 }} />
          <span>Dijkstra Least-Cost Route</span>
        </div>
        {showBfsOverlay && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 16, height: 4, background: '#f59e0b', borderRadius: 2 }} />
            <span>BFS Min-Hop Route</span>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 16, height: 4, background: '#ef4444', border: '1px dashed #ef4444', borderRadius: 2 }} />
          <span>Blocked Corridor</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 16, height: 4, background: '#d97706', borderRadius: 2 }} />
          <span>Congested Corridor</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }} />
          <span>Start Point</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} />
          <span>Target Point</span>
        </div>
      </div>
    </div>
  );
}
