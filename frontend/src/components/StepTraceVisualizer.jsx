import React, { useEffect, useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  FastForward,
  Layers,
  ArrowRight,
  ShieldAlert,
  CheckCircle,
  HelpCircle,
  Cpu
} from 'lucide-react';

export default function StepTraceVisualizer({
  trace = [],
  currentStepIndex = 0,
  onStepChange,
  algorithmName = "Dijkstra"
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedMs, setSpeedMs] = useState(800);

  const totalSteps = trace.length;
  const currentStep = trace[currentStepIndex] || {};

  // Auto-playback loop
  useEffect(() => {
    let timer = null;
    if (isPlaying) {
      timer = setInterval(() => {
        onStepChange((prev) => {
          if (prev >= totalSteps - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, speedMs);
    }
    return () => clearInterval(timer);
  }, [isPlaying, totalSteps, speedMs, onStepChange]);

  const handleNext = () => {
    if (currentStepIndex < totalSteps - 1) {
      onStepChange(currentStepIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      onStepChange(currentStepIndex - 1);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    onStepChange(0);
  };

  const handleEnd = () => {
    setIsPlaying(false);
    onStepChange(totalSteps - 1);
  };

  const getActionBadgeColor = (action) => {
    switch (action) {
      case 'POP_MIN':
      case 'POP_FIFO':
        return '#0284c7';
      case 'RELAX_EDGE':
      case 'ENQUEUE_NEIGHBOR':
        return '#10b981';
      case 'BLOCKED_EDGE':
        return '#ef4444';
      case 'TARGET_REACHED':
        return '#a855f7';
      default:
        return '#64748b';
    }
  };

  if (!trace || trace.length === 0) {
    return (
      <div className="glass-panel" style={{ textAlign: 'center', padding: '24px' }}>
        <Cpu size={32} color="#64748b" style={{ margin: '0 auto 10px' }} />
        <div style={{ color: '#94a3b8', fontSize: '0.88rem' }}>
          Select Start & Target to execute algorithm trace.
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Header & Playback Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: '0.72rem', color: '#06b6d4', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Algorithm Execution Engine
          </span>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
            {algorithmName} Step Tracer
          </h3>
        </div>

        {/* Step Counter Badge */}
        <div
          style={{
            background: 'rgba(6, 182, 212, 0.15)',
            border: '1px solid rgba(6, 182, 212, 0.3)',
            borderRadius: 20,
            padding: '4px 12px',
            fontSize: '0.78rem',
            fontFamily: 'var(--font-mono)',
            color: '#38bdf8',
            fontWeight: 700
          }}
        >
          Step {currentStepIndex + 1} / {totalSteps}
        </div>
      </div>

      {/* Progress Scrubber */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <input
          type="range"
          min="0"
          max={Math.max(0, totalSteps - 1)}
          value={currentStepIndex}
          onChange={(e) => {
            setIsPlaying(false);
            onStepChange(Number(e.target.value));
          }}
          style={{
            flex: 1,
            accentColor: '#06b6d4',
            cursor: 'pointer'
          }}
        />
      </div>

      {/* Playback Control Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={handleReset}
            className="btn-secondary"
            style={{ padding: '6px 10px' }}
            title="Jump to Start"
          >
            <RotateCcw size={15} />
          </button>
          <button
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
            className="btn-secondary"
            style={{ padding: '6px 12px' }}
            title="Step Back"
          >
            <SkipBack size={15} />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="btn-primary"
            style={{ padding: '6px 16px' }}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            <span>{isPlaying ? 'Pause' : 'Play'}</span>
          </button>
          <button
            onClick={handleNext}
            disabled={currentStepIndex >= totalSteps - 1}
            className="btn-secondary"
            style={{ padding: '6px 12px' }}
            title="Step Forward"
          >
            <SkipForward size={15} />
          </button>
          <button
            onClick={handleEnd}
            className="btn-secondary"
            style={{ padding: '6px 10px' }}
            title="Jump to End"
          >
            <FastForward size={15} />
          </button>
        </div>

        {/* Speed Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Speed:</span>
          {[
            { label: '0.5x', ms: 1400 },
            { label: '1x', ms: 800 },
            { label: '2x', ms: 400 },
            { label: '4x', ms: 180 }
          ].map((sp) => (
            <button
              key={sp.label}
              onClick={() => setSpeedMs(sp.ms)}
              style={{
                background: speedMs === sp.ms ? '#0284c7' : 'rgba(30, 41, 59, 0.6)',
                border: 'none',
                color: speedMs === sp.ms ? '#fff' : '#94a3b8',
                padding: '3px 8px',
                borderRadius: 4,
                fontSize: '0.72rem',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              {sp.label}
            </button>
          ))}
        </div>
      </div>

      {/* Current Step Action Card */}
      <div
        style={{
          background: 'rgba(15, 23, 42, 0.75)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 10,
          padding: '12px 16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span
            style={{
              background: getActionBadgeColor(currentStep.action),
              color: '#ffffff',
              padding: '3px 8px',
              borderRadius: 6,
              fontSize: '0.72rem',
              fontWeight: 800,
              letterSpacing: '0.04em'
            }}
          >
            {currentStep.action || 'STEP'}
          </span>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            Current Node: <strong style={{ color: '#f8fafc' }}>{currentStep.current_node}</strong>
          </span>
          {currentStep.current_dist !== undefined && (
            <span style={{ fontSize: '0.8rem', color: '#38bdf8', marginLeft: 'auto', fontFamily: 'var(--font-mono)' }}>
              Cost: {currentStep.current_dist}s
            </span>
          )}
        </div>

        {/* Human-Readable Decision Rationale */}
        <div
          style={{
            fontSize: '0.84rem',
            lineHeight: 1.5,
            color: '#e2e8f0',
            background: 'rgba(7, 13, 24, 0.6)',
            padding: '10px 12px',
            borderRadius: 8,
            borderLeft: `3px solid ${getActionBadgeColor(currentStep.action)}`
          }}
        >
          {currentStep.explanation || 'No step explanation available.'}
        </div>

        {/* Relaxation Details if RELAX_EDGE */}
        {currentStep.action === 'RELAX_EDGE' && (
          <div
            style={{
              marginTop: 10,
              padding: '8px 12px',
              borderRadius: 6,
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.78rem'
            }}
          >
            <div style={{ color: '#a7f3d0' }}>
              Target: <strong>{currentStep.neighbor}</strong> | Edge Cost: {currentStep.edge_cost}s
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-mono)' }}>
              <span style={{ color: '#f87171', textDecoration: 'line-through' }}>{currentStep.old_dist}</span>
              <ArrowRight size={13} color="#34d399" />
              <span style={{ color: '#34d399', fontWeight: 700 }}>{currentStep.new_dist}s</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
