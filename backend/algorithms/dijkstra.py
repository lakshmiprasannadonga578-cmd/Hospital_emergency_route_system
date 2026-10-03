"""
Dijkstra's Shortest Path Algorithm with Priority Queue (Min-Heap)
Produces exact step-by-step execution traces, queue states, edge relaxations,
and algorithmic performance metrics for educational and dispatch transparency.
"""

import heapq
import time
from typing import Dict, Any, List, Optional, Tuple

def compute_edge_weight(edge: Dict[str, Any], custom_congestion: Optional[Dict[str, float]] = None) -> float:
    """
    Computes real-time dynamic travel cost (in seconds).
    weight = (distance_meters / base_speed_mps) * congestion_factor
    Returns infinity if the corridor is blocked.
    """
    status = edge.get("status", "OPEN").upper()
    if status == "BLOCKED":
        return float('inf')

    distance = float(edge.get("distance", 10.0))
    speed = max(float(edge.get("base_speed", 1.5)), 0.1)
    base_time = distance / speed

    # Check for scenario or dynamic congestion override
    edge_id = edge.get("id")
    if custom_congestion and edge_id in custom_congestion:
        congestion = float(custom_congestion[edge_id])
    else:
        congestion = float(edge.get("congestion", 1.0))

    if status == "CONGESTED":
        congestion = max(congestion, 2.5)
    elif status == "CLEANING":
        congestion = max(congestion, 1.8)

    return round(base_time * congestion, 2)

def run_dijkstra(
    nodes: Dict[str, Any],
    edges: List[Dict[str, Any]],
    start_node: str,
    target_node: str,
    custom_congestion: Optional[Dict[str, float]] = None
) -> Dict[str, Any]:
    """
    Runs Dijkstra's Algorithm with detailed step-by-step tracing for UI visualization.
    """
    start_time = time.perf_counter()

    if start_node not in nodes:
        return {"success": False, "error": f"Start node '{start_node}' not found."}
    if target_node not in nodes:
        return {"success": False, "error": f"Target node '{target_node}' not found."}

    # Build adjacency list: node -> list of (neighbor_id, edge_id, weight, distance, edge_name)
    adj: Dict[str, List[Tuple[str, str, float, float, str]]] = {nid: [] for nid in nodes}
    for e in edges:
        u = e.get("u")
        v = e.get("v")
        if u not in nodes or v not in nodes:
            continue
        w = compute_edge_weight(e, custom_congestion)
        d = float(e.get("distance", 0.0))
        name = e.get("name", f"{u}-{v}")
        eid = e.get("id", f"{u}_{v}")
        
        # Corridors are bidirectional in standard hospital hallways
        adj[u].append((v, eid, w, d, name))
        adj[v].append((u, eid, w, d, name))

    # Priority Queue stores: (tentative_cost, counter, node_id)
    # Counter breaks ties deterministically without comparing dicts/strings
    pq = []
    counter = 0
    
    tentative_distances: Dict[str, float] = {nid: float('inf') for nid in nodes}
    tentative_distances[start_node] = 0.0
    
    predecessors: Dict[str, Optional[str]] = {nid: None for nid in nodes}
    predecessor_edges: Dict[str, Optional[str]] = {nid: None for nid in nodes}
    settled = set()

    # Step trace for front-end playback
    trace = []
    step_num = 0
    pq_push_count = 0
    pq_pop_count = 0
    edges_relaxed_count = 0

    # Initial state
    heapq.heappush(pq, (0.0, counter, start_node))
    pq_push_count += 1

    def make_pq_snapshot(heap_list):
        # Sort a copy for readable display of Priority Queue state
        sorted_copy = sorted(heap_list, key=lambda x: (x[0], x[1]))
        return [{"node": item[2], "cost": round(item[0], 2)} for item in sorted_copy]

    step_num += 1
    trace.append({
        "step": step_num,
        "action": "INIT",
        "current_node": start_node,
        "current_dist": 0.0,
        "pq_snapshot": make_pq_snapshot(pq),
        "settled_nodes": list(settled),
        "tentative_distances": {k: (round(v, 2) if v != float('inf') else "inf") for k, v in tentative_distances.items()},
        "explanation": f"Initialized Dijkstra at start node '{nodes[start_node]['name']}' with cost 0.0s. Pushed to Priority Queue."
    })

    found_target = False

    while pq:
        curr_dist, _, u = heapq.heappop(pq)
        pq_pop_count += 1

        if u in settled:
            continue

        settled.add(u)
        step_num += 1
        trace.append({
            "step": step_num,
            "action": "POP_MIN",
            "current_node": u,
            "current_dist": round(curr_dist, 2),
            "pq_snapshot": make_pq_snapshot(pq),
            "settled_nodes": list(settled),
            "tentative_distances": {k: (round(v, 2) if v != float('inf') else "inf") for k, v in tentative_distances.items()},
            "explanation": f"Extracted '{nodes[u]['name']}' ({u}) from Priority Queue with lowest tentative cost {round(curr_dist, 2)}s. Node is now settled."
        })

        if u == target_node:
            found_target = True
            step_num += 1
            trace.append({
                "step": step_num,
                "action": "TARGET_REACHED",
                "current_node": u,
                "current_dist": round(curr_dist, 2),
                "pq_snapshot": make_pq_snapshot(pq),
                "settled_nodes": list(settled),
                "tentative_distances": {k: (round(v, 2) if v != float('inf') else "inf") for k, v in tentative_distances.items()},
                "explanation": f"Destination '{nodes[target_node]['name']}' reached! Optimal emergency path confirmed at {round(curr_dist, 2)}s transit time."
            })
            break

        # Explore outgoing corridors
        for v, eid, weight, dist, edge_name in adj[u]:
            if v in settled:
                continue

            if weight == float('inf'):
                step_num += 1
                trace.append({
                    "step": step_num,
                    "action": "BLOCKED_EDGE",
                    "current_node": u,
                    "neighbor": v,
                    "edge_id": eid,
                    "pq_snapshot": make_pq_snapshot(pq),
                    "settled_nodes": list(settled),
                    "tentative_distances": {k: (round(v_node, 2) if v_node != float('inf') else "inf") for k, v_node in tentative_distances.items()},
                    "explanation": f"Corridor '{edge_name}' to '{nodes[v]['name']}' is BLOCKED/IMPASSABLE. Skipped."
                })
                continue

            new_dist = curr_dist + weight
            old_dist = tentative_distances[v]

            if new_dist < old_dist:
                tentative_distances[v] = new_dist
                predecessors[v] = u
                predecessor_edges[v] = eid
                counter += 1
                heapq.heappush(pq, (new_dist, counter, v))
                pq_push_count += 1
                edges_relaxed_count += 1

                step_num += 1
                old_str = f"{round(old_dist, 2)}s" if old_dist != float('inf') else "inf"
                trace.append({
                    "step": step_num,
                    "action": "RELAX_EDGE",
                    "current_node": u,
                    "neighbor": v,
                    "edge_id": eid,
                    "edge_cost": round(weight, 2),
                    "old_dist": old_str,
                    "new_dist": round(new_dist, 2),
                    "pq_snapshot": make_pq_snapshot(pq),
                    "settled_nodes": list(settled),
                    "tentative_distances": {k: (round(v_node, 2) if v_node != float('inf') else "inf") for k, v_node in tentative_distances.items()},
                    "explanation": f"Relaxed edge '{edge_name}': Tentative cost to '{nodes[v]['name']}' improved from {old_str} to {round(new_dist, 2)}s. Pushed to Priority Queue."
                })

    # Path Reconstruction
    path = []
    path_edges = []
    total_distance_m = 0.0

    if tentative_distances[target_node] != float('inf'):
        curr = target_node
        while curr is not None:
            path.append(curr)
            edge_id = predecessor_edges[curr]
            if edge_id:
                path_edges.append(edge_id)
                # find distance
                for e in edges:
                    if e.get("id") == edge_id:
                        total_distance_m += float(e.get("distance", 0.0))
                        break
            curr = predecessors[curr]
        path.reverse()
        path_edges.reverse()

    exec_time_ms = round((time.perf_counter() - start_time) * 1000, 3)

    return {
        "success": len(path) > 0,
        "algorithm": "Dijkstra (Weighted Min-Heap)",
        "start_node": start_node,
        "target_node": target_node,
        "path": path,
        "path_edges": path_edges,
        "total_cost_seconds": round(tentative_distances[target_node], 2) if path else None,
        "total_distance_meters": round(total_distance_m, 1) if path else None,
        "hop_count": len(path_edges),
        "trace": trace,
        "metrics": {
            "execution_time_ms": exec_time_ms,
            "settled_nodes_count": len(settled),
            "total_nodes_in_graph": len(nodes),
            "edges_relaxed": edges_relaxed_count,
            "pq_pushes": pq_push_count,
            "pq_pops": pq_pop_count
        }
    }
