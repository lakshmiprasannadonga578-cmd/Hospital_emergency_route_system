"""
Hospital Emergency Route System - Flask REST API
Serves graph topology, Dijkstra / BFS route calculations with step tracing,
corridor blockage management, triage priority queue, and scenario simulations.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import copy

from graph_data import DEFAULT_NODES, DEFAULT_EDGES, SCENARIOS
from database import (
    init_db, get_all_corridors, update_corridor_state,
    reset_all_corridors, log_dispatch_event, get_recent_dispatches
)
from algorithms.dijkstra import run_dijkstra
from algorithms.bfs import run_bfs
from algorithms.triage_queue import EmergencyPriorityQueue, SAMPLE_PATIENTS

app = Flask(__name__)
CORS(app)

# Initialize database
init_db(DEFAULT_EDGES)

# Global in-memory Priority Queue instance
triage_system = EmergencyPriorityQueue()
for pt in SAMPLE_PATIENTS:
    triage_system.enqueue(copy.deepcopy(pt))

def get_current_edges():
    """
    Fetches the live corridor edge state from database.
    """
    db_edges = get_all_corridors()
    if not db_edges:
        reset_all_corridors(DEFAULT_EDGES)
        db_edges = get_all_corridors()
    return db_edges

@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({"status": "healthy", "service": "Hospital Emergency Route System"})

@app.route("/api/graph", methods=["GET"])
def get_graph():
    edges = get_current_edges()
    return jsonify({
        "nodes": DEFAULT_NODES,
        "edges": edges,
        "total_nodes": len(DEFAULT_NODES),
        "total_edges": len(edges),
        "blocked_corridors_count": sum(1 for e in edges if e.get("status") == "BLOCKED"),
        "congested_corridors_count": sum(1 for e in edges if e.get("status") == "CONGESTED")
    })

@app.route("/api/route/dijkstra", methods=["POST"])
def route_dijkstra():
    data = request.get_json() or {}
    start_node = data.get("start_node")
    target_node = data.get("target_node")
    custom_congestion = data.get("custom_congestion")

    if not start_node or not target_node:
        return jsonify({"error": "start_node and target_node are required"}), 400

    edges = get_current_edges()
    result = run_dijkstra(DEFAULT_NODES, edges, start_node, target_node, custom_congestion)
    return jsonify(result)

@app.route("/api/route/bfs", methods=["POST"])
def route_bfs():
    data = request.get_json() or {}
    start_node = data.get("start_node")
    target_node = data.get("target_node")
    custom_congestion = data.get("custom_congestion")

    if not start_node or not target_node:
        return jsonify({"error": "start_node and target_node are required"}), 400

    edges = get_current_edges()
    result = run_bfs(DEFAULT_NODES, edges, start_node, target_node, custom_congestion)
    return jsonify(result)

@app.route("/api/route/compare", methods=["POST"])
def route_compare():
    data = request.get_json() or {}
    start_node = data.get("start_node")
    target_node = data.get("target_node")
    custom_congestion = data.get("custom_congestion")

    if not start_node or not target_node:
        return jsonify({"error": "start_node and target_node are required"}), 400

    edges = get_current_edges()
    dijkstra_res = run_dijkstra(DEFAULT_NODES, edges, start_node, target_node, custom_congestion)
    bfs_res = run_bfs(DEFAULT_NODES, edges, start_node, target_node, custom_congestion)

    # Comparative synthesis & explanation
    comparison = {
        "start_node": start_node,
        "target_node": target_node,
        "start_name": DEFAULT_NODES[start_node]["name"],
        "target_name": DEFAULT_NODES[target_node]["name"],
        "dijkstra": dijkstra_res,
        "bfs": bfs_res,
        "analysis": {}
    }

    if dijkstra_res.get("success") and bfs_res.get("success"):
        d_time = dijkstra_res["total_cost_seconds"]
        b_time = bfs_res["total_cost_seconds"]
        d_hops = dijkstra_res["hop_count"]
        b_hops = bfs_res["hop_count"]
        d_dist = dijkstra_res["total_distance_meters"]
        b_dist = bfs_res["total_distance_meters"]

        time_diff = round(b_time - d_time, 2)
        hop_diff = d_hops - b_hops

        if time_diff > 1.0:
            winner = "Dijkstra"
            clinical_verdict = f"Dijkstra is faster by {time_diff}s ({d_time}s vs {b_time}s). It intelligently steered around congested or slower hallway corridors, even though it used {d_hops} hops compared to BFS's {b_hops} hops."
        elif time_diff < -1.0:
            winner = "BFS"
            clinical_verdict = f"BFS matched a shorter path of {b_time}s vs {d_time}s."
        else:
            winner = "Identical Performance"
            clinical_verdict = f"Both algorithms selected optimal paths with virtually identical transit times ({d_time}s)."

        comparison["analysis"] = {
            "faster_algorithm": winner,
            "time_saved_seconds": abs(time_diff),
            "hop_difference": hop_diff,
            "same_path": dijkstra_res["path"] == bfs_res["path"],
            "clinical_verdict": clinical_verdict,
            "metrics_table": [
                {
                    "metric": "Transit Time (seconds)",
                    "dijkstra": f"{d_time}s",
                    "bfs": f"{b_time}s",
                    "advantage": "Dijkstra (Weighted Least Cost)" if time_diff > 0 else "Equal"
                },
                {
                    "metric": "Physical Distance",
                    "dijkstra": f"{d_dist}m",
                    "bfs": f"{b_dist}m",
                    "advantage": "Dijkstra" if d_dist <= b_dist else "BFS"
                },
                {
                    "metric": "Corridor Hops (Doorways/Segments)",
                    "dijkstra": f"{d_hops} hops",
                    "bfs": f"{b_hops} hops",
                    "advantage": "BFS (Minimum Hops Unweighted)" if b_hops <= d_hops else "Equal"
                },
                {
                    "metric": "Explored Nodes (Frontier)",
                    "dijkstra": dijkstra_res["metrics"]["settled_nodes_count"],
                    "bfs": bfs_res["metrics"]["visited_nodes_count"],
                    "advantage": "Higher algorithmic focus"
                },
                {
                    "metric": "Data Structure",
                    "dijkstra": "Min-Heap Priority Queue (O((V+E) log V))",
                    "bfs": "FIFO Queue (O(V+E))",
                    "advantage": "Context Dependent"
                }
            ]
        }
    elif dijkstra_res.get("success") and not bfs_res.get("success"):
        comparison["analysis"] = {
            "faster_algorithm": "Dijkstra",
            "clinical_verdict": "Dijkstra found an emergency bypass route, but BFS failed to reach the destination due to blocked corridors."
        }
    elif not dijkstra_res.get("success") and not bfs_res.get("success"):
        comparison["analysis"] = {
            "faster_algorithm": "None",
            "clinical_verdict": "Destination is completely unreachable! All corridors leading to this clinical unit are currently blocked."
        }

    return jsonify(comparison)

@app.route("/api/corridor/toggle", methods=["POST"])
def toggle_corridor():
    data = request.get_json() or {}
    edge_id = data.get("edge_id")
    if not edge_id:
        return jsonify({"error": "edge_id is required"}), 400

    edges = get_current_edges()
    edge = next((e for e in edges if e["id"] == edge_id), None)
    if not edge:
        return jsonify({"error": f"Edge '{edge_id}' not found"}), 404

    new_status = "BLOCKED" if edge.get("status") == "OPEN" else "OPEN"
    update_corridor_state(edge_id, status=new_status)
    return jsonify({
        "success": True,
        "edge_id": edge_id,
        "previous_status": edge.get("status"),
        "new_status": new_status
    })

@app.route("/api/corridor/update", methods=["POST"])
def update_corridor():
    data = request.get_json() or {}
    edge_id = data.get("edge_id")
    status = data.get("status")
    congestion = data.get("congestion")
    hazard_note = data.get("hazard_note")

    if not edge_id:
        return jsonify({"error": "edge_id is required"}), 400

    update_corridor_state(edge_id, status=status, congestion=congestion, hazard_note=hazard_note)
    return jsonify({"success": True, "edge_id": edge_id})

@app.route("/api/corridor/reset", methods=["POST"])
def reset_corridors():
    reset_all_corridors(DEFAULT_EDGES)
    return jsonify({"success": True, "message": "All corridors restored to default operational status."})

@app.route("/api/triage/queue", methods=["GET"])
def get_triage_queue():
    queue_list = triage_system.get_all_sorted()
    return jsonify({
        "queue_size": triage_system.size(),
        "patients": queue_list
    })

@app.route("/api/triage/enqueue", methods=["POST"])
def enqueue_patient():
    patient = request.get_json() or {}
    if not patient.get("patient_name") or not patient.get("origin_node") or not patient.get("target_node"):
        return jsonify({"error": "patient_name, origin_node, and target_node are required"}), 400

    res = triage_system.enqueue(patient)
    return jsonify(res)

@app.route("/api/triage/dispatch", methods=["POST"])
def dispatch_patient():
    item = triage_system.dequeue()
    if not item:
        return jsonify({"success": False, "error": "Triage queue is empty"}), 400

    patient = item["patient"]
    origin = patient.get("origin_node", "AMB_BAY")
    target = patient.get("target_node", "TRAUMA_1")

    edges = get_current_edges()
    route = run_dijkstra(DEFAULT_NODES, edges, origin, target)

    log_record = {
        "patient_name": patient.get("patient_name"),
        "esi_level": patient.get("esi_level"),
        "origin_node": origin,
        "target_node": target,
        "algorithm": "Dijkstra Priority Queue",
        "path_taken": route.get("path", []),
        "transit_time_seconds": route.get("total_cost_seconds", 0.0),
        "total_distance_meters": route.get("total_distance_meters", 0.0),
        "hop_count": route.get("hop_count", 0),
        "status_note": f"Dispatched via priority queue. ESI {patient.get('esi_level')}."
    }
    log_dispatch_event(log_record)

    return jsonify({
        "success": True,
        "patient": patient,
        "priority_criteria": item["priority_criteria"],
        "route": route
    })

@app.route("/api/triage/seed", methods=["POST"])
def seed_triage():
    triage_system.clear()
    for pt in SAMPLE_PATIENTS:
        triage_system.enqueue(copy.deepcopy(pt))
    return jsonify({"success": True, "count": triage_system.size()})

@app.route("/api/scenarios", methods=["GET"])
def get_scenarios():
    return jsonify(SCENARIOS)

@app.route("/api/scenarios/apply", methods=["POST"])
def apply_scenario():
    data = request.get_json() or {}
    scenario_id = data.get("scenario_id")
    if scenario_id not in SCENARIOS:
        return jsonify({"error": f"Scenario '{scenario_id}' not found"}), 404

    scenario = SCENARIOS[scenario_id]

    # First reset corridors
    reset_all_corridors(DEFAULT_EDGES)

    # Apply blocked corridors
    for edge_id in scenario.get("blocked_edges", []):
        update_corridor_state(edge_id, status="BLOCKED", hazard_note="Scenario Hazard Incident")

    # Apply congested corridors
    for edge_id, factor in scenario.get("congested_edges", {}).items():
        update_corridor_state(edge_id, status="CONGESTED", congestion=factor, hazard_note=f"High Congestion ({factor}x)")

    return jsonify({
        "success": True,
        "scenario": scenario,
        "updated_corridors": get_current_edges()
    })

@app.route("/api/dispatches", methods=["GET"])
def get_dispatches():
    return jsonify(get_recent_dispatches(25))

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
