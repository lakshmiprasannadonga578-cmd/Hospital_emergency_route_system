import React, { useState, useEffect } from 'react';
import {
  Activity,
  Layers,
  GitCompare,
  Users,
  ShieldAlert,
  Navigation,
  Siren,
  Hospital,
  Compass,
  Sliders,
  CheckCircle2,
  Cpu
} from 'lucide-react';

import HospitalMap from './components/HospitalMap';
import RouteControls from './components/RouteControls';
import StepTraceVisualizer from './components/StepTraceVisualizer';
import PriorityQueueInspector from './components/PriorityQueueInspector';
import AlgorithmComparison from './components/AlgorithmComparison';
import TriageQueueManager from './components/TriageQueueManager';
import CorridorStatusManager from './components/CorridorStatusManager';
import ScenarioBar from './components/ScenarioBar';

import {
  fetchGraph,
  fetchDijkstraRoute,
  fetchBfsRoute,
  fetchRouteComparison,
  toggleCorridorStatus,
  updateCorridor,
  resetAllCorridors,
  fetchTriageQueue,
  enqueuePatient,
  dispatchNextPatient,
  seedTriageQueue,
  fetchScenarios,
  applyScenario
} from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('routing'); // 'routing' | 'trace' | 'compare' | 'triage' | 'corridors'

  // Graph state
  const [nodes, setNodes] = useState({});
  const [edges, setEdges] = useState([]);
  const [startNode, setStartNode] = useState('AMB_BAY');
  const [targetNode, setTargetNode] = useState('TRAUMA_1');
  const [algorithm, setAlgorithm] = useState('Dijkstra');

  // Route & Execution State
  const [routeResult, setRouteResult] = useState(null);
  const [comparisonResult, setComparisonResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showBfsOverlay, setShowBfsOverlay] = useState(false);

  // Trace state for step-by-step playback
  const [trace, setTrace] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Triage state
  const [triageData, setTriageData] = useState({ queue_size: 0, patients: [] });
  const [isDispatching, setIsDispatching] = useState(false);

  // Scenarios state
  const [scenarios, setScenarios] = useState({});
  const [activeScenarioId, setActiveScenarioId] = useState(null);

  // Notification / Alert message
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Initial load
  useEffect(() => {
    loadGraph();
    loadTriageQueue();
    loadScenarios();
  }, []);

  const loadGraph = async () => {
    try {
      const data = await fetchGraph();
      setNodes(data.nodes || {});
      setEdges(data.edges || []);
    } catch (err) {
      console.error(err);
      showToast('Failed to connect to backend server. Retrying...', 'error');
    }
  };

  const loadTriageQueue = async () => {
    try {
      const data = await fetchTriageQueue();
      setTriageData(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadScenarios = async () => {
    try {
      const data = await fetchScenarios();
      setScenarios(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Compute Route
  const handleCalculateRoute = async (algo = algorithm, origin = startNode, destination = targetNode) => {
    setIsLoading(true);
    try {
      let res;
      if (algo === 'Dijkstra') {
        res = await fetchDijkstraRoute(origin, destination);
      } else {
        res = await fetchBfsRoute(origin, destination);
      }
      setRouteResult(res);
      setTrace(res.trace || []);
      setCurrentStepIndex(res.trace ? res.trace.length - 1 : 0);

      if (res.success) {
        showToast(
          `Optimal route found via ${res.algorithm}! (${res.total_cost_seconds}s transit time, ${res.total_distance_meters}m)`,
          'success'
        );
      } else {
        showToast('Destination unreachable with current corridor blockages!', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Run Comparative Analysis
  const handleCompare = async (origin = startNode, destination = targetNode) => {
    setIsLoading(true);
    try {
      const res = await fetchRouteComparison(origin, destination);
      setComparisonResult(res);
      setRouteResult(res.dijkstra);
      setTrace(res.dijkstra?.trace || []);
      setCurrentStepIndex(res.dijkstra?.trace ? res.dijkstra.trace.length - 1 : 0);
      setShowBfsOverlay(true);
      setActiveTab('compare');
      showToast('DAA benchmark completed: Dijkstra vs BFS comparison generated!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle Corridor Blockage
  const handleToggleCorridor = async (edgeId) => {
    try {
      const res = await toggleCorridorStatus(edgeId);
      // Reload graph edges
      await loadGraph();
      showToast(`Corridor ${edgeId} status toggled to ${res.new_status}`, 'info');

      // Recompute route if active
      if (startNode && targetNode) {
        handleCalculateRoute(algorithm, startNode, targetNode);
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Reset all corridors
  const handleResetCorridors = async () => {
    try {
      await resetAllCorridors();
      await loadGraph();
      setActiveScenarioId(null);
      showToast('All corridors restored to open baseline status.', 'success');
      if (startNode && targetNode) {
        handleCalculateRoute(algorithm, startNode, targetNode);
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Apply Scenario Preset
  const handleApplyScenario = async (scenarioId) => {
    try {
      const res = await applyScenario(scenarioId);
      await loadGraph();
      setActiveScenarioId(scenarioId);

      const sc = res.scenario;
      if (sc.start_node) setStartNode(sc.start_node);
      if (sc.target_node) setTargetNode(sc.target_node);

      showToast(`Emergency Scenario Activated: "${sc.title}"`, 'warning');
      // Compute route automatically
      handleCalculateRoute(algorithm, sc.start_node, sc.target_node);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Map Node Selection
  const handleSelectNode = (nodeId) => {
    if (nodeId === startNode) return;
    if (!startNode) {
      setStartNode(nodeId);
      showToast(`Selected ${nodes[nodeId]?.name || nodeId} as Start Point`, 'info');
    } else {
      setTargetNode(nodeId);
      showToast(`Selected ${nodes[nodeId]?.name || nodeId} as Clinical Destination`, 'info');
      handleCalculateRoute(algorithm, startNode, nodeId);
    }
  };

  // Triage: Dispatch next
  const handleDispatchNext = async () => {
    setIsDispatching(true);
    try {
      const res = await dispatchNextPatient();
      await loadTriageQueue();
      if (res.patient) {
        setStartNode(res.patient.origin_node);
        setTargetNode(res.patient.target_node);
        setRouteResult(res.route);
        setTrace(res.route?.trace || []);
        setCurrentStepIndex(res.route?.trace ? res.route.trace.length - 1 : 0);
        showToast(
          `Dispatched ${res.patient.patient_name} (ESI ${res.patient.esi_level})! Route calculated to ${nodes[res.patient.target_node]?.name || res.patient.target_node}`,
          'success'
        );
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsDispatching(false);
    }
  };

  // Triage: Enqueue
  const handleEnqueuePatient = async (patient) => {
    try {
      await enqueuePatient(patient);
      await loadTriageQueue();
      showToast(`Enqueued ${patient.patient_name} into Priority Heap`, 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Triage: Reseed
  const handleSeedQueue = async () => {
    try {
      await seedTriageQueue();
      await loadTriageQueue();
      showToast('Triage queue reseeded with emergency trauma patients', 'info');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Derive trace highlights at current step
  const currentStep = trace[currentStepIndex] || {};
  const settledAtStep = currentStep.settled_nodes || (routeResult?.path || []);
  const activeEdgesAtStep =
    activeTab === 'trace' && currentStep.edge_id
      ? [currentStep.edge_id]
      : routeResult?.path_edges || [];
  const bfsEdges = comparisonResult?.bfs?.path_edges || [];

  return (
    <div className="app-container">
      {/* Top Header & Navigation */}
      <header className="top-navbar">
        <div className="brand-section">
          <div className="brand-icon-wrapper">
            <Hospital size={24} />
          </div>
          <div>
            <div className="brand-title">Hospital Emergency Route System</div>
            <div className="brand-subtitle">
              Design & Analysis of Algorithms • Dijkstra • Min-Heap Priority Queue • BFS
            </div>
          </div>
        </div>

        {/* Main Tab Navigation */}
        <nav className="nav-tabs">
          {[
            { id: 'routing', label: 'Emergency Routing', icon: Navigation },
            { id: 'trace', label: 'DAA Step Visualizer', icon: Cpu },
            { id: 'compare', label: 'Algorithm Comparison', icon: GitCompare },
            { id: 'triage', label: `Triage Queue (${triageData.queue_size || 0})`, icon: Users },
            { id: 'corridors', label: 'Corridor Hazards', icon: ShieldAlert }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`tab-btn ${isActive ? 'active' : ''}`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </header>

      {/* Scenario Presets Bar */}
      <ScenarioBar
        scenarios={scenarios}
        activeScenarioId={activeScenarioId}
        onSelectScenario={handleApplyScenario}
        onReset={handleResetCorridors}
      />

      {/* Toast Alert */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: 70,
            right: 24,
            zIndex: 1000,
            background:
              toast.type === 'error'
                ? '#ef4444'
                : toast.type === 'success'
                ? '#10b981'
                : toast.type === 'warning'
                ? '#f59e0b'
                : '#0284c7',
            color: '#fff',
            padding: '10px 18px',
            borderRadius: 8,
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            fontSize: '0.84rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            animation: 'fadeIn 0.2s ease'
          }}
        >
          {toast.type === 'success' && <CheckCircle2 size={16} />}
          {toast.type === 'error' && <ShieldAlert size={16} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Main Command Center Grid */}
      <main className="dashboard-grid">
        {/* Left Column: Interactive Hospital Map */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <HospitalMap
            nodes={nodes}
            edges={edges}
            startNode={startNode}
            targetNode={targetNode}
            activeDijkstraEdges={activeEdgesAtStep}
            activeBfsEdges={bfsEdges}
            settledNodes={settledAtStep}
            currentNode={currentStep.current_node}
            onSelectNode={handleSelectNode}
            onToggleCorridor={handleToggleCorridor}
            showBfsOverlay={showBfsOverlay}
          />

          {/* Quick Route Status Summary Bar */}
          {routeResult && (
            <div
              className="glass-panel"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 18px',
                fontSize: '0.82rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: '#06b6d4', fontWeight: 800 }}>ACTIVE ROUTE:</span>
                <span style={{ color: '#cbd5e1' }}>
                  {routeResult.path?.join(' ➔ ') || 'No route available'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 16 }}>
                <span>
                  Est. Transit: <strong style={{ color: '#38bdf8' }}>{routeResult.total_cost_seconds}s</strong>
                </span>
                <span>
                  Distance: <strong style={{ color: '#34d399' }}>{routeResult.total_distance_meters}m</strong>
                </span>
                <span>
                  Corridors: <strong style={{ color: '#a855f7' }}>{routeResult.hop_count} hops</strong>
                </span>
              </div>
            </div>
          )}
        </section>

        {/* Right Column: Active Tab Workstation */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {activeTab === 'routing' && (
            <>
              <RouteControls
                nodes={nodes}
                startNode={startNode}
                targetNode={targetNode}
                onStartChange={setStartNode}
                onTargetChange={setTargetNode}
                algorithm={algorithm}
                onAlgorithmChange={setAlgorithm}
                onCalculateRoute={() => handleCalculateRoute(algorithm, startNode, targetNode)}
                onCompareRoutes={() => handleCompare(startNode, targetNode)}
                isLoading={isLoading}
                routeResult={routeResult}
              />
              <PriorityQueueInspector
                pqSnapshot={currentStep.pq_snapshot || []}
                tentativeDistances={currentStep.tentative_distances || {}}
                settledNodes={currentStep.settled_nodes || []}
                nodes={nodes}
                currentNode={currentStep.current_node}
                algorithm={algorithm}
              />
            </>
          )}

          {activeTab === 'trace' && (
            <>
              <StepTraceVisualizer
                trace={trace}
                currentStepIndex={currentStepIndex}
                onStepChange={setCurrentStepIndex}
                algorithmName={routeResult?.algorithm || algorithm}
              />
              <PriorityQueueInspector
                pqSnapshot={currentStep.pq_snapshot || []}
                tentativeDistances={currentStep.tentative_distances || {}}
                settledNodes={currentStep.settled_nodes || []}
                nodes={nodes}
                currentNode={currentStep.current_node}
                algorithm={algorithm}
              />
            </>
          )}

          {activeTab === 'compare' && (
            <AlgorithmComparison
              comparisonData={comparisonResult}
              showBfsOverlay={showBfsOverlay}
              onToggleBfsOverlay={() => setShowBfsOverlay(!showBfsOverlay)}
              onSelectAlgorithm={setAlgorithm}
            />
          )}

          {activeTab === 'triage' && (
            <TriageQueueManager
              triageData={triageData}
              onDispatchNext={handleDispatchNext}
              onEnqueuePatient={handleEnqueuePatient}
              onSeedQueue={handleSeedQueue}
              nodes={nodes}
              isDispatching={isDispatching}
            />
          )}

          {activeTab === 'corridors' && (
            <CorridorStatusManager
              edges={edges}
              nodes={nodes}
              onToggleCorridor={handleToggleCorridor}
              onUpdateCorridor={updateCorridor}
              onResetCorridors={handleResetCorridors}
            />
          )}
        </aside>
      </main>
    </div>
  );
}
