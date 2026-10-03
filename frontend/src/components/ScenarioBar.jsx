import React from 'react';
import { Siren, Zap, RefreshCw, AlertTriangle } from 'lucide-react';

export default function ScenarioBar({
  scenarios = {},
  activeScenarioId,
  onSelectScenario,
  onReset
}) {
  return (
    <div className="scenario-bar">
      <div className="scenario-label">
        <Siren size={15} />
        <span>Crisis Presets:</span>
      </div>

      {Object.values(scenarios).map((sc) => {
        const isActive = sc.id === activeScenarioId;

        return (
          <button
            key={sc.id}
            onClick={() => onSelectScenario(sc.id)}
            className={`scenario-chip ${isActive ? 'active' : ''}`}
            title={sc.description}
          >
            {sc.title}
          </button>
        );
      })}

      <button
        onClick={onReset}
        className="scenario-chip"
        style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, color: '#38bdf8' }}
        title="Restore all normal corridor flow"
      >
        <RefreshCw size={13} />
        <span>Reset Baseline</span>
      </button>
    </div>
  );
}
