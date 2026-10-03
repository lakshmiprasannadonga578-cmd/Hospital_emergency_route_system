/**
 * API service for communicating with Flask backend.
 */

const API_BASE = '/api';

export async function fetchGraph() {
  const res = await fetch(`${API_BASE}/graph`);
  if (!res.ok) throw new Error('Failed to fetch hospital graph');
  return res.json();
}

export async function fetchDijkstraRoute(startNode, targetNode, customCongestion = null) {
  const res = await fetch(`${API_BASE}/route/dijkstra`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ start_node: startNode, target_node: targetNode, custom_congestion: customCongestion }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to calculate Dijkstra route');
  }
  return res.json();
}

export async function fetchBfsRoute(startNode, targetNode, customCongestion = null) {
  const res = await fetch(`${API_BASE}/route/bfs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ start_node: startNode, target_node: targetNode, custom_congestion: customCongestion }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to calculate BFS route');
  }
  return res.json();
}

export async function fetchRouteComparison(startNode, targetNode, customCongestion = null) {
  const res = await fetch(`${API_BASE}/route/compare`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ start_node: startNode, target_node: targetNode, custom_congestion: customCongestion }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to compare routes');
  }
  return res.json();
}

export async function toggleCorridorStatus(edgeId) {
  const res = await fetch(`${API_BASE}/corridor/toggle`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ edge_id: edgeId }),
  });
  if (!res.ok) throw new Error('Failed to toggle corridor');
  return res.json();
}

export async function updateCorridor(edgeId, status, congestion, hazardNote) {
  const res = await fetch(`${API_BASE}/corridor/update`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ edge_id: edgeId, status, congestion, hazard_note: hazardNote }),
  });
  if (!res.ok) throw new Error('Failed to update corridor');
  return res.json();
}

export async function resetAllCorridors() {
  const res = await fetch(`${API_BASE}/corridor/reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('Failed to reset corridors');
  return res.json();
}

export async function fetchTriageQueue() {
  const res = await fetch(`${API_BASE}/triage/queue`);
  if (!res.ok) throw new Error('Failed to fetch triage queue');
  return res.json();
}

export async function enqueuePatient(patient) {
  const res = await fetch(`${API_BASE}/triage/enqueue`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patient),
  });
  if (!res.ok) throw new Error('Failed to enqueue patient');
  return res.json();
}

export async function dispatchNextPatient() {
  const res = await fetch(`${API_BASE}/triage/dispatch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to dispatch patient');
  }
  return res.json();
}

export async function seedTriageQueue() {
  const res = await fetch(`${API_BASE}/triage/seed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('Failed to reseed triage queue');
  return res.json();
}

export async function fetchScenarios() {
  const res = await fetch(`${API_BASE}/scenarios`);
  if (!res.ok) throw new Error('Failed to fetch scenarios');
  return res.json();
}

export async function applyScenario(scenarioId) {
  const res = await fetch(`${API_BASE}/scenarios/apply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scenario_id: scenarioId }),
  });
  if (!res.ok) throw new Error('Failed to apply scenario');
  return res.json();
}

export async function fetchDispatches() {
  const res = await fetch(`${API_BASE}/dispatches`);
  if (!res.ok) throw new Error('Failed to fetch dispatch history');
  return res.json();
}
