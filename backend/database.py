"""
Database persistence layer using SQLite (PostgreSQL compatible schema)
Maintains corridor states, incident logs, dynamic hazards, and dispatch history.
"""

import sqlite3
import json
import os
from typing import Dict, Any, List, Optional

DB_FILE = os.path.join(os.path.dirname(__file__), "hospital_routes.db")

def get_db_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db(default_edges: List[Dict[str, Any]]):
    """
    Initializes tables and seeds initial corridor network state if empty.
    """
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
    CREATE TABLE IF NOT EXISTS corridors (
        id TEXT PRIMARY KEY,
        name TEXT,
        u TEXT NOT NULL,
        v TEXT NOT NULL,
        distance REAL NOT NULL,
        base_speed REAL NOT NULL,
        congestion REAL NOT NULL,
        status TEXT NOT NULL,
        hazard_note TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS dispatch_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_name TEXT,
        esi_level INTEGER,
        origin_node TEXT,
        target_node TEXT,
        algorithm TEXT,
        path_taken TEXT,
        transit_time_seconds REAL,
        total_distance_meters REAL,
        hop_count INTEGER,
        status_note TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Seed corridors if empty
    cur.execute("SELECT COUNT(*) FROM corridors")
    count = cur.fetchone()[0]
    if count == 0:
        for edge in default_edges:
            cur.execute("""
            INSERT INTO corridors (id, name, u, v, distance, base_speed, congestion, status, hazard_note)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                edge["id"],
                edge.get("name", edge["id"]),
                edge["u"],
                edge["v"],
                edge["distance"],
                edge["base_speed"],
                edge.get("congestion", 1.0),
                edge.get("status", "OPEN"),
                ""
            ))
        conn.commit()

    conn.close()

def get_all_corridors() -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM corridors")
    rows = cur.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def update_corridor_state(edge_id: str, status: Optional[str] = None, congestion: Optional[float] = None, hazard_note: Optional[str] = None):
    conn = get_db_connection()
    cur = conn.cursor()
    updates = []
    params = []

    if status is not None:
        updates.append("status = ?")
        params.append(status.upper())
    if congestion is not None:
        updates.append("congestion = ?")
        params.append(congestion)
    if hazard_note is not None:
        updates.append("hazard_note = ?")
        params.append(hazard_note)

    if updates:
        params.append(edge_id)
        query = f"UPDATE corridors SET {', '.join(updates)}, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
        cur.execute(query, params)
        conn.commit()
    conn.close()

def reset_all_corridors(default_edges: List[Dict[str, Any]]):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM corridors")
    for edge in default_edges:
        cur.execute("""
        INSERT INTO corridors (id, name, u, v, distance, base_speed, congestion, status, hazard_note)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            edge["id"],
            edge.get("name", edge["id"]),
            edge["u"],
            edge["v"],
            edge["distance"],
            edge["base_speed"],
            edge.get("congestion", 1.0),
            edge.get("status", "OPEN"),
            ""
        ))
    conn.commit()
    conn.close()

def log_dispatch_event(record: Dict[str, Any]):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
    INSERT INTO dispatch_logs (patient_name, esi_level, origin_node, target_node, algorithm, path_taken, transit_time_seconds, total_distance_meters, hop_count, status_note)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        record.get("patient_name", "Unknown"),
        record.get("esi_level", 3),
        record.get("origin_node"),
        record.get("target_node"),
        record.get("algorithm", "Dijkstra"),
        json.dumps(record.get("path_taken", [])),
        record.get("transit_time_seconds", 0.0),
        record.get("total_distance_meters", 0.0),
        record.get("hop_count", 0),
        record.get("status_note", "Dispatched")
    ))
    conn.commit()
    conn.close()

def get_recent_dispatches(limit: int = 20) -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM dispatch_logs ORDER BY timestamp DESC LIMIT ?", (limit,))
    rows = cur.fetchall()
    conn.close()
    result = []
    for r in rows:
        d = dict(r)
        try:
            d["path_taken"] = json.loads(d["path_taken"])
        except Exception:
            pass
        result.append(d)
    return result
