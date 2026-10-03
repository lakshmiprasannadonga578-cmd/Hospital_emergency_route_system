"""
Breadth-First Search (BFS) Algorithm
Explores graph level-by-level using a FIFO Queue to find minimum-hop / corridor paths,
demonstrating reachability and contrasting with weighted Dijkstra.
"""

from collections import deque
import time
from typing import Dict, Any, List, Optional
from algorithms.dijkstra import compute_edge_weight

def run_bfs(
    nodes: Dict[str, Any],
    edges: List[Dict[str, Any]],
    start_node: str,
    target_node: str,
    custom_congestion: Optional[Dict[str, float]] = None
) -> Dict[str, Any]:
    """
    Runs Breadth-First Search (BFS) with step-by-step trace generation.
    """
    start_time = time.perf_counter()

    if start_node not in nodes:
        return {"success": False, "error": f"Start node '{start_node}' not found."}
    if target_node not in nodes:
        return {"success": False, "error": f"Target node '{target_node}' not found."}

    # Build adjacency list: node -> list of (neighbor_id, edge_id, edge_obj)
    adj: Dict[str, List[Dict[str, Any]]] = {nid: [] for nid in nodes}
    edge_map = {}
    for e in edges:
        u = e.get("u")
        v = e.get("v")
        if u not in nodes or v not in nodes:
            continue
        eid = e.get("id", f"{u}_{v}")
        edge_map[eid] = e
        adj[u].append({"neighbor": v, "edge_id": eid, "edge": e})
        adj[v].append({"neighbor": u, "edge_id": eid, "edge": e})

    queue = deque([start_node])
    visited = {start_node}
    predecessors: Dict[str, Optional[str]] = {nid: None for nid in nodes}
    predecessor_edges: Dict[str, Optional[str]] = {nid: None for nid in nodes}
    hop_distances: Dict[str, int] = {nid: -1 for nid in nodes}
    hop_distances[start_node] = 0

    trace = []
    step_num = 0
    queue_pushes = 1
    queue_pops = 0

    trace.append({
        "step": 1,
        "action": "INIT",
        "current_node": start_node,
        "fifo_queue": list(queue),
        "visited_nodes": list(visited),
        "hop_level": 0,
        "explanation": f"Initialized BFS at '{nodes[start_node]['name']}' (Hop Level 0). Enqueued into FIFO queue."
    })
    step_num = 1

    found_target = False

    while queue:
        u = queue.popleft()
        queue_pops += 1
        curr_hops = hop_distances[u]

        step_num += 1
        trace.append({
            "step": step_num,
            "action": "POP_FIFO",
            "current_node": u,
            "fifo_queue": list(queue),
            "visited_nodes": list(visited),
            "hop_level": curr_hops,
            "explanation": f"Dequeued '{nodes[u]['name']}' ({u}) from FIFO front at Hop Level {curr_hops}. Exploring unvisited adjacent hallways."
        })

        if u == target_node:
            found_target = True
            step_num += 1
            trace.append({
                "step": step_num,
                "action": "TARGET_REACHED",
                "current_node": u,
                "fifo_queue": list(queue),
                "visited_nodes": list(visited),
                "hop_level": curr_hops,
                "explanation": f"Target '{nodes[target_node]['name']}' reached in {curr_hops} corridor hops!"
            })
            break

        for conn in adj[u]:
            v = conn["neighbor"]
            eid = conn["edge_id"]
            edge = conn["edge"]
            edge_name = edge.get("name", eid)

            # Check if blocked
            if edge.get("status", "OPEN").upper() == "BLOCKED":
                step_num += 1
                trace.append({
                    "step": step_num,
                    "action": "BLOCKED_EDGE",
                    "current_node": u,
                    "neighbor": v,
                    "edge_id": eid,
                    "fifo_queue": list(queue),
                    "visited_nodes": list(visited),
                    "hop_level": curr_hops,
                    "explanation": f"Corridor '{edge_name}' is BLOCKED. Cannot expand BFS frontier across this path."
                })
                continue

            if v not in visited:
                visited.add(v)
                predecessors[v] = u
                predecessor_edges[v] = eid
                hop_distances[v] = curr_hops + 1
                queue.append(v)
                queue_pushes += 1

                step_num += 1
                trace.append({
                    "step": step_num,
                    "action": "ENQUEUE_NEIGHBOR",
                    "current_node": u,
                    "neighbor": v,
                    "edge_id": eid,
                    "fifo_queue": list(queue),
                    "visited_nodes": list(visited),
                    "hop_level": curr_hops + 1,
                    "explanation": f"Discovered '{nodes[v]['name']}' at Hop Level {curr_hops + 1}. Added to FIFO queue tail."
                })

    # Path Reconstruction
    path = []
    path_edges = []
    total_distance_m = 0.0
    total_cost_s = 0.0

    if target_node in visited and found_target:
        curr = target_node
        while curr is not None:
            path.append(curr)
            eid = predecessor_edges[curr]
            if eid:
                path_edges.append(eid)
                e = edge_map.get(eid, {})
                total_distance_m += float(e.get("distance", 0.0))
                total_cost_s += compute_edge_weight(e, custom_congestion)
            curr = predecessors[curr]
        path.reverse()
        path_edges.reverse()

    exec_time_ms = round((time.perf_counter() - start_time) * 1000, 3)

    return {
        "success": len(path) > 0,
        "algorithm": "Breadth-First Search (BFS FIFO)",
        "start_node": start_node,
        "target_node": target_node,
        "path": path,
        "path_edges": path_edges,
        "hop_count": len(path_edges),
        "total_cost_seconds": round(total_cost_s, 2) if path else None,
        "total_distance_meters": round(total_distance_m, 1) if path else None,
        "trace": trace,
        "metrics": {
            "execution_time_ms": exec_time_ms,
            "visited_nodes_count": len(visited),
            "total_nodes_in_graph": len(nodes),
            "queue_pushes": queue_pushes,
            "queue_pops": queue_pops
        }
    }
