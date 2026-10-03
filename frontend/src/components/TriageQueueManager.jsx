import React, { useState } from 'react';
import {
  Users,
  AlertOctagon,
  HeartPulse,
  Activity,
  Send,
  UserPlus,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export default function TriageQueueManager({
  triageData,
  onDispatchNext,
  onEnqueuePatient,
  onSeedQueue,
  nodes,
  isDispatching = false
}) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    patient_name: 'Ambulance 18 - Acute Trauma',
    condition: 'Multi-system blunt trauma, tachycardic',
    esi_level: 1,
    origin_node: 'AMB_BAY',
    target_node: 'TRAUMA_1',
    heart_rate: 135,
    spo2: 89,
    systolic_bp: 85,
    gcs: 10
  });

  const patients = triageData.patients || [];

  const handleSubmit = (e) => {
    e.preventDefault();
    onEnqueuePatient({
      patient_name: formData.patient_name,
      condition: formData.condition,
      esi_level: Number(formData.esi_level),
      origin_node: formData.origin_node,
      target_node: formData.target_node,
      vitals: {
        heart_rate: Number(formData.heart_rate),
        spo2: Number(formData.spo2),
        systolic_bp: Number(formData.systolic_bp),
        gcs: Number(formData.gcs)
      }
    });
    setShowAddModal(false);
  };

  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <span style={{ fontSize: '0.72rem', color: '#06b6d4', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Emergency Dispatch Priority Queue
          </span>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
            Triage & Rapid Ambulance Dispatch
          </h3>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-secondary"
            style={{ fontSize: '0.78rem', padding: '6px 12px' }}
          >
            <UserPlus size={14} />
            <span>Admit Patient</span>
          </button>
          <button
            onClick={onSeedQueue}
            className="btn-secondary"
            style={{ fontSize: '0.78rem', padding: '6px 10px' }}
            title="Reset to Sample Patients"
          >
            <RefreshCw size={14} />
          </button>
          <button
            onClick={onDispatchNext}
            disabled={patients.length === 0 || isDispatching}
            className="btn-primary"
            style={{ fontSize: '0.78rem', padding: '6px 14px' }}
          >
            <Send size={14} />
            <span>{isDispatching ? 'Dispatching...' : 'Dispatch Highest Priority'}</span>
          </button>
        </div>
      </div>

      {/* Explicit Prioritization Rule Rationale */}
      <div
        style={{
          background: 'rgba(15, 23, 42, 0.7)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 8,
          padding: '10px 14px',
          fontSize: '0.78rem',
          color: '#94a3b8',
          display: 'flex',
          alignItems: 'center',
          gap: 10
        }}
      >
        <AlertOctagon size={18} color="#f59e0b" style={{ flexShrink: 0 }} />
        <div>
          <strong style={{ color: '#f8fafc' }}>Explicit Priority Criteria: </strong>
          1. ESI Urgency Tier (ESI 1 Resuscitation ➔ ESI 5 Non-Urgent) |
          2. Vital Instability Index (SpO2 &lt; 90, SBP &lt; 90, Arrhythmia) |
          3. Arrival FIFO Timestamp.
        </div>
      </div>

      {/* Patient Queue Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: '360px', overflowY: 'auto' }}>
        {patients.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px', color: '#64748b', fontSize: '0.85rem' }}>
            No patients currently in triage queue. All emergency arrivals cleared.
          </div>
        ) : (
          patients.map((item) => {
            const p = item.patient;
            const isRank1 = item.rank === 1;

            return (
              <div
                key={p.queue_id || item.rank}
                className={`patient-card ${isRank1 ? 'rank-1' : ''}`}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: 10
                }}
              >
                <div style={{ display: 'flex', gap: 12 }}>
                  {/* Rank Badge */}
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: isRank1 ? '#ef4444' : 'rgba(30, 41, 59, 0.9)',
                      border: isRank1 ? '1px solid #fca5a5' : '1px solid rgba(255, 255, 255, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      color: '#ffffff',
                      flexShrink: 0
                    }}
                  >
                    #{item.rank}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                      <span style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.9rem' }}>
                        {p.patient_name}
                      </span>
                      <span className={`badge badge-esi-${p.esi_level}`}>
                        ESI {p.esi_level}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: 6 }}>
                      {p.condition}
                    </div>

                    {/* Vitals Pill */}
                    {p.vitals && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          fontSize: '0.72rem',
                          background: 'rgba(7, 13, 24, 0.6)',
                          padding: '4px 8px',
                          borderRadius: 6,
                          width: 'fit-content'
                        }}
                      >
                        <span style={{ color: p.vitals.spo2 < 92 ? '#ef4444' : '#94a3b8' }}>
                          SpO₂: <strong>{p.vitals.spo2}%</strong>
                        </span>
                        <span style={{ color: p.vitals.systolic_bp < 90 ? '#ef4444' : '#94a3b8' }}>
                          BP: <strong>{p.vitals.systolic_bp} mmHg</strong>
                        </span>
                        <span style={{ color: p.vitals.heart_rate > 120 || p.vitals.heart_rate < 50 ? '#f59e0b' : '#94a3b8' }}>
                          HR: <strong>{p.vitals.heart_rate} bpm</strong>
                        </span>
                        <span>
                          GCS: <strong>{p.vitals.gcs}/15</strong>
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Destination & Action */}
                <div style={{ textAlign: 'right', fontSize: '0.76rem' }}>
                  <div style={{ color: '#64748b', marginBottom: 2 }}>
                    From: <strong style={{ color: '#cbd5e1' }}>{p.origin_node}</strong>
                  </div>
                  <div style={{ color: '#64748b', marginBottom: 4 }}>
                    Assigned: <strong style={{ color: '#38bdf8' }}>{nodes[p.target_node]?.name || p.target_node}</strong>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 600 }}>
                    Instability: {item.vital_instability_score}/10
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Patient Modal */}
      {showAddModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 20
          }}
        >
          <div
            className="glass-panel"
            style={{ width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto' }}
          >
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', marginBottom: 12 }}>
              Admit New Emergency Arrival
            </h3>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>
                  Patient / Ambulance Identifier
                </label>
                <input
                  type="text"
                  value={formData.patient_name}
                  onChange={(e) => setFormData({ ...formData, patient_name: e.target.value })}
                  style={{
                    width: '100%',
                    background: 'rgba(15, 23, 42, 0.9)',
                    border: '1px solid var(--border-glass)',
                    padding: '8px 12px',
                    borderRadius: 6,
                    color: '#fff',
                    fontSize: '0.85rem'
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>
                  Clinical Condition & Symptoms
                </label>
                <input
                  type="text"
                  value={formData.condition}
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                  style={{
                    width: '100%',
                    background: 'rgba(15, 23, 42, 0.9)',
                    border: '1px solid var(--border-glass)',
                    padding: '8px 12px',
                    borderRadius: 6,
                    color: '#fff',
                    fontSize: '0.85rem'
                  }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>
                    Emergency Severity Index (ESI)
                  </label>
                  <select
                    value={formData.esi_level}
                    onChange={(e) => setFormData({ ...formData, esi_level: e.target.value })}
                    style={{
                      width: '100%',
                      background: 'rgba(15, 23, 42, 0.9)',
                      border: '1px solid var(--border-glass)',
                      padding: '8px 12px',
                      borderRadius: 6,
                      color: '#fff',
                      fontSize: '0.85rem'
                    }}
                  >
                    <option value={1}>ESI 1 - Resuscitation / Code Blue</option>
                    <option value={2}>ESI 2 - Emergent (Stroke / STEMI)</option>
                    <option value={3}>ESI 3 - Urgent</option>
                    <option value={4}>ESI 4 - Semi-Urgent</option>
                    <option value={5}>ESI 5 - Non-Urgent</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>
                    Entrance Origin
                  </label>
                  <select
                    value={formData.origin_node}
                    onChange={(e) => setFormData({ ...formData, origin_node: e.target.value })}
                    style={{
                      width: '100%',
                      background: 'rgba(15, 23, 42, 0.9)',
                      border: '1px solid var(--border-glass)',
                      padding: '8px 12px',
                      borderRadius: 6,
                      color: '#fff',
                      fontSize: '0.85rem'
                    }}
                  >
                    <option value="AMB_BAY">Ambulance Bay Entrance</option>
                    <option value="HELIPAD">Helipad Air Transport</option>
                    <option value="MAIN_ENTRANCE">Main Public Entrance</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>
                  Assigned Clinical Destination
                </label>
                <select
                  value={formData.target_node}
                  onChange={(e) => setFormData({ ...formData, target_node: e.target.value })}
                  style={{
                    width: '100%',
                    background: 'rgba(15, 23, 42, 0.9)',
                    border: '1px solid var(--border-glass)',
                    padding: '8px 12px',
                    borderRadius: 6,
                    color: '#fff',
                    fontSize: '0.85rem'
                  }}
                >
                  {Object.values(nodes).map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.name} ({n.zone})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                <div>
                  <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: 3 }}>
                    Heart Rate
                  </label>
                  <input
                    type="number"
                    value={formData.heart_rate}
                    onChange={(e) => setFormData({ ...formData, heart_rate: e.target.value })}
                    style={{ width: '100%', background: '#0e1726', border: '1px solid #334155', padding: '6px', borderRadius: 4, color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: 3 }}>
                    SpO₂ (%)
                  </label>
                  <input
                    type="number"
                    value={formData.spo2}
                    onChange={(e) => setFormData({ ...formData, spo2: e.target.value })}
                    style={{ width: '100%', background: '#0e1726', border: '1px solid #334155', padding: '6px', borderRadius: 4, color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: 3 }}>
                    Systolic BP
                  </label>
                  <input
                    type="number"
                    value={formData.systolic_bp}
                    onChange={(e) => setFormData({ ...formData, systolic_bp: e.target.value })}
                    style={{ width: '100%', background: '#0e1726', border: '1px solid #334155', padding: '6px', borderRadius: 4, color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: 3 }}>
                    GCS Score
                  </label>
                  <input
                    type="number"
                    value={formData.gcs}
                    onChange={(e) => setFormData({ ...formData, gcs: e.target.value })}
                    style={{ width: '100%', background: '#0e1726', border: '1px solid #334155', padding: '6px', borderRadius: 4, color: '#fff' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Enqueue Patient into Priority Heap
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
