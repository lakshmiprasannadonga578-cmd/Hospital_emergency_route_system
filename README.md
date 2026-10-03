# Hospital Emergency Route System

An algorithm-centric, interactive hospital campus routing and emergency dispatch command center built with **Python (Flask)** and **React (Vite)**. The system models hospital topology and implements **Dijkstra's Algorithm (Min-Heap Priority Queue)**, **Breadth-First Search (BFS)**, and **Multi-Criteria Patient Triage Queues** to solve time-critical emergency navigation and demonstrate core Design and Analysis of Algorithms (DAA) concepts.

---

## 1. Problem Statement
In emergency medicine, seconds save lives. When an ambulance or emergency patient arrives at a hospital or medical campus, clinical staff must rapidly navigate corridors, airlocks, and elevators to reach the appropriate care unit (Trauma Bay, CT Scanner for acute stroke, Cath Lab for cardiac arrest, Operating Theatre, or ICU).

However, real-world hospital corridors frequently encounter dynamic hazards:
- **Corridor blockages**: Biohazard spills, code red airlock lockdowns, construction, or maintenance closures.
- **Congestion delays**: Gurney traffic, crash cart staging, or floor sanitization.
- **Vertical transit constraints**: Express trauma elevators under maintenance, leaving only service elevators or stairs.

### Project Objective
- Convert the real-world emergency dispatch requirement into an algorithm-centric prototype.
- Make every decision visible: tentative distances, edge relaxations, frontier exploration, settled nodes, and live Min-Heap states.
- Compare weighted shortest-time routing (**Dijkstra**) against unweighted minimum-hop routing (**BFS**).
- Manage incoming emergency patients via an explicit **Priority Queue (ESI & Vital Instability scoring)** with automated routing dispatch.

---

## 2. Core DAA Algorithms & Data Structures

### A. Dijkstra's Shortest Path Algorithm
- **Data Structure**: Min-Heap Priority Queue (`heapq`).
- **Time Complexity**: $\mathcal{O}((V + E) \log V)$
- **Space Complexity**: $\mathcal{O}(V + E)$
- **Edge Weight Function**:
  $$\text{Cost}(e) = \left(\frac{\text{Distance (m)}}{\text{Base Speed (m/s)}}\right) \times \text{Congestion Factor}$$
  If a corridor is marked `BLOCKED`, $\text{Cost}(e) = \infty$.
- **Explainability**: Tracks tentative distances (`dist[u]`), predecessor maps, and logs step-by-step traces (`POP_MIN`, `RELAX_EDGE`, `BLOCKED_EDGE`, `TARGET_REACHED`) with human-readable rationale.

### B. Breadth-First Search (BFS)
- **Data Structure**: First-In First-Out Queue (`collections.deque`).
- **Time Complexity**: $\mathcal{O}(V + E)$
- **Space Complexity**: $\mathcal{O}(V)$
- **Purpose**: Explores the graph level-by-level to identify the path with the minimum number of corridor hops (door transitions). Also evaluates graph connectivity and department reachability under heavy blockages.
- **Comparative Rationale**: Demonstrates that while BFS minimizes physical door transitions, it often selects congested corridors resulting in significantly higher patient transit times compared to Dijkstra's weighted detour.

### C. Emergency Priority Queue (Triage Dispatch)
- **Data Structure**: Multi-Criteria Min-Heap.
- **Priority Criteria (Explicit)**:
  1. **Primary Key**: Emergency Severity Index tier (ESI 1 = Resuscitation / Code Blue, ESI 2 = Emergent, ESI 3 = Urgent, ESI 4 = Semi-Urgent, ESI 5 = Non-Urgent).
  2. **Secondary Key**: Vital Instability Index ($0.0 - 10.0$) computed from abnormal vitals ($\text{SpO}_2 < 90\%$, Systolic $\text{BP} < 90\text{ mmHg}$, severe tachycardia/bradycardia, $\text{GCS} \le 8$).
  3. **Tertiary Key**: Arrival timestamp (FIFO within the same tier).
- **Dispatch**: Repeatedly extracts the most critical patient from the heap and calculates the optimal real-time route to the designated clinical unit.

---

## 3. System Architecture & Tech Stack

```
hospital-emergency-route-system/
├── backend/
│   ├── app.py                      # Flask REST API with CORS and DB hooks
│   ├── graph_data.py               # Campus topology (26 nodes, 41 edges, scenarios)
│   ├── database.py                 # SQLite persistence for corridors & dispatch logs
│   ├── requirements.txt            # Python dependencies
│   └── algorithms/
│       ├── dijkstra.py             # Dijkstra algorithm with Min-Heap & step tracing
│       ├── bfs.py                  # Breadth-First Search with FIFO queue tracing
│       └── triage_queue.py         # Multi-criteria emergency triage priority queue
└── frontend/
    ├── package.json
    ├── vite.config.js              # Vite server with API proxy to port 5000
    ├── index.html                  # Medical command center metadata
    └── src/
        ├── App.jsx                 # Master command center dashboard
        ├── index.css               # Dark theme, glassmorphism, glowing route animations
        ├── components/
        │   ├── HospitalMap.jsx     # Interactive SVG campus map with hazard toggles
        │   ├── RouteControls.jsx   # Origin, destination & algorithm controls
        │   ├── StepTraceVisualizer.jsx # Step playback scrubber & action inspector
        │   ├── PriorityQueueInspector.jsx # Live Min-Heap state & tentative distances
        │   ├── AlgorithmComparison.jsx # DAA benchmark table & clinical verdict
        │   ├── TriageQueueManager.jsx # Patient intake & priority dispatch
        │   ├── CorridorStatusManager.jsx # Dynamic blockage & congestion controls
        │   └── ScenarioBar.jsx     # 1-click crisis scenarios
        └── services/
            └── api.js              # Fetch client connecting to Flask API
```

---

## 4. Key Interactive Features

1. **Interactive SVG Campus Map**:
   - 26 realistic clinical departments across 3 zones (Emergency Core, Diagnostic Imaging, Surgical & ICU).
   - Animated glowing cyan routes for Dijkstra, amber dashed overlays for BFS.
   - Click any corridor on the map to toggle its status (`BLOCKED` vs `OPEN`) and watch instant rerouting.
   - Click any node to set Start or Destination.

2. **Step-by-Step DAA Visualizer**:
   - Scrub through each algorithmic step forward and backward.
   - Play/pause auto-advance with speed toggles ($0.5\times, 1\times, 2\times, 4\times$).
   - Live visual Min-Heap showing current queue elements and smallest tentative keys.
   - Tentative distance table (`dist[u]`) updated in real time.

3. **DAA Comparative Benchmark (Dijkstra vs. BFS)**:
   - Side-by-side metric comparison: Transit Time, Physical Distance, Corridor Hops, Nodes Explored, Queue Operations.
   - Clinical analysis explaining when and why each approach succeeds or fails.

4. **Emergency Crisis Presets**:
   - **Code Blue Baseline**: Standard optimal arrival from Ambulance Bay to Trauma Bay 1.
   - **Biohazard Spill**: Shuts down Central Concourse, forcing reroute via East Gurney Service Ramp.
   - **Acute Stroke Alert**: Rapid air transit from Rooftop Helipad to CT Scanner Suite.
   - **Trauma Elevator Maintenance**: Priority Lift A offline, forcing secondary lift or stairwell transit.
   - **Mass Casualty Congestion**: $3.5\times$ crowding delay in ER Hallway, demonstrating Dijkstra's detour over BFS's flawed hop route.

5. **Patient Triage Priority Queue**:
   - Live ESI tier monitoring with vital signs instability index.
   - 1-click dispatch of the highest priority patient with automated route computation and SQLite audit logging.

---

## 5. Running the Application Locally

### Prerequisites
- **Python 3.10+**
- **Node.js 18+** and **npm**

### Step 1: Start the Backend (Flask API)
```bash
cd backend
python -m pip install -r requirements.txt
python app.py
```
*Backend runs on `http://127.0.0.1:5000`.*

### Step 2: Start the Frontend (Vite Dev Server)
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

Open your browser and navigate to `http://localhost:5173` to explore the Hospital Emergency Route System!
