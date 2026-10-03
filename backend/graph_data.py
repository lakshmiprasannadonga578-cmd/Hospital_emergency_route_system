"""
Hospital Campus Topology & Graph Representation
Represents clinical zones, emergency entrances, diagnostic suites, intensive care pods,
and corridors with realistic distances (meters), speeds (m/s), and congestion modifiers.
"""

# Initial Hospital Graph Nodes
# x and y represent normalized canvas coordinates (0 - 1000 width, 0 - 650 height)
DEFAULT_NODES = {
    "AMB_BAY": {
        "id": "AMB_BAY",
        "name": "Ambulance Bay Entrance",
        "code": "AMB",
        "zone": "Entrance",
        "floor": 1,
        "x": 80,
        "y": 140,
        "type": "entrance",
        "icon": "ambulance",
        "capacity": 4,
        "current_load": 1,
        "description": "Primary vehicle drop-off for trauma and critical ambulance arrivals."
    },
    "HELIPAD": {
        "id": "HELIPAD",
        "name": "Rooftop Helipad Air Transport",
        "code": "HELI",
        "zone": "Entrance",
        "floor": 3,
        "x": 80,
        "y": 480,
        "type": "entrance",
        "icon": "plane",
        "capacity": 2,
        "current_load": 0,
        "description": "Helicopter landing pad for critical aeromedical airlifts and organ transfers."
    },
    "MAIN_ENTRANCE": {
        "id": "MAIN_ENTRANCE",
        "name": "Hospital Main Public Entrance",
        "code": "MAIN",
        "zone": "Entrance",
        "floor": 1,
        "x": 80,
        "y": 320,
        "type": "entrance",
        "icon": "door-open",
        "capacity": 10,
        "current_load": 3,
        "description": "Public walk-in entrance and reception."
    },
    "J_AMB": {
        "id": "J_AMB",
        "name": "Ambulance Airlock Junction",
        "code": "J-AMB",
        "zone": "Transit",
        "floor": 1,
        "x": 220,
        "y": 140,
        "type": "junction",
        "icon": "git-commit",
        "description": "Sanitized rapid decontamination airlock entering Emergency Department."
    },
    "TRIAGE": {
        "id": "TRIAGE",
        "name": "Emergency Triage Assessment",
        "code": "TRG",
        "zone": "Emergency",
        "floor": 1,
        "x": 220,
        "y": 320,
        "type": "clinical",
        "icon": "clipboard-pulse",
        "capacity": 6,
        "current_load": 2,
        "description": "First-line ESI triage evaluation and rapid vital signs stabilization."
    },
    "J_ER_HALL": {
        "id": "J_ER_HALL",
        "name": "Emergency Main Concourse",
        "code": "J-ER",
        "zone": "Transit",
        "floor": 1,
        "x": 350,
        "y": 200,
        "type": "junction",
        "icon": "git-commit",
        "description": "Central junction connecting ER bays, Triage, and Central Concourse."
    },
    "TRAUMA_1": {
        "id": "TRAUMA_1",
        "name": "Trauma Resuscitation Bay 1",
        "code": "TR-1",
        "zone": "Emergency",
        "floor": 1,
        "x": 350,
        "y": 80,
        "type": "critical",
        "icon": "heart-pulse",
        "capacity": 1,
        "current_load": 0,
        "description": "Level 1 Trauma resuscitation suite equipped for immediate surgical chest tubes, intubation."
    },
    "TRAUMA_2": {
        "id": "TRAUMA_2",
        "name": "Trauma Resuscitation Bay 2",
        "code": "TR-2",
        "zone": "Emergency",
        "floor": 1,
        "x": 480,
        "y": 80,
        "type": "critical",
        "icon": "heart-pulse",
        "capacity": 1,
        "current_load": 1,
        "description": "Secondary critical resuscitation bay with rapid blood transfusion infusers."
    },
    "PEDIATRIC_ER": {
        "id": "PEDIATRIC_ER",
        "name": "Pediatric Emergency Pod",
        "code": "PED-ER",
        "zone": "Emergency",
        "floor": 1,
        "x": 220,
        "y": 480,
        "type": "clinical",
        "icon": "baby",
        "capacity": 4,
        "current_load": 1,
        "description": "Dedicated pediatric trauma and acute medical observation wing."
    },
    "J_CENTRAL": {
        "id": "J_CENTRAL",
        "name": "Central Concourse Hub",
        "code": "J-CTR",
        "zone": "Transit",
        "floor": 1,
        "x": 500,
        "y": 280,
        "type": "junction",
        "icon": "git-merge",
        "description": "Major hospital crossroads linking Emergency, Diagnostics, and Surgery."
    },
    "RAMP_EAST": {
        "id": "RAMP_EAST",
        "name": "East Gurney Service Ramp",
        "code": "RMP-E",
        "zone": "Transit",
        "floor": 1,
        "x": 400,
        "y": 420,
        "type": "junction",
        "icon": "arrow-up-right",
        "description": "Wide, smooth incline ramp designed for high-weight bariatric and surgical gurney transport."
    },
    "ELEV_BANK_A": {
        "id": "ELEV_BANK_A",
        "name": "Priority Trauma Elevators Bank A",
        "code": "ELEV-A",
        "zone": "Vertical",
        "floor": 1,
        "x": 580,
        "y": 180,
        "type": "elevator",
        "icon": "chevrons-up-down",
        "capacity": 2,
        "current_load": 0,
        "description": "Direct express elevator keyed for Code Blue emergency override to Operating Theatres & ICU."
    },
    "ELEV_BANK_B": {
        "id": "ELEV_BANK_B",
        "name": "Standard Service Elevators Bank B",
        "code": "ELEV-B",
        "zone": "Vertical",
        "floor": 1,
        "x": 520,
        "y": 460,
        "type": "elevator",
        "icon": "chevrons-up-down",
        "capacity": 4,
        "current_load": 2,
        "description": "General hospital vertical transit connecting Lower Ground imaging to Upper Floors."
    },
    "STAIR_WEST": {
        "id": "STAIR_WEST",
        "name": "Stairwell West (Emergency Walkers)",
        "code": "STR-W",
        "zone": "Vertical",
        "floor": 1,
        "x": 320,
        "y": 550,
        "type": "stair",
        "icon": "footprints",
        "accessible_for": ["walking"],
        "description": "Rapid pedestrian stairs. Inaccessible for gurneys and crash carts."
    },
    "J_IMAGING": {
        "id": "J_IMAGING",
        "name": "Diagnostic Imaging Concourse",
        "code": "J-IMG",
        "zone": "Transit",
        "floor": 1,
        "x": 650,
        "y": 400,
        "type": "junction",
        "icon": "git-commit",
        "description": "Lead-shielded corridor feeding MRI, CT, and Interventional Radiology."
    },
    "CT_SCAN": {
        "id": "CT_SCAN",
        "name": "Rapid Multi-Slice CT Scanner Suite",
        "code": "CT-1",
        "zone": "Diagnostics",
        "floor": 1,
        "x": 780,
        "y": 420,
        "type": "diagnostic",
        "icon": "scan",
        "capacity": 1,
        "current_load": 0,
        "description": "Ultra-fast CT angiography essential for stroke code thrombolysis assessment."
    },
    "MRI_SUITE": {
        "id": "MRI_SUITE",
        "name": "High-Field 3T MRI Suite",
        "code": "MRI",
        "zone": "Diagnostics",
        "floor": 1,
        "x": 800,
        "y": 540,
        "type": "diagnostic",
        "icon": "activity",
        "capacity": 1,
        "current_load": 1,
        "description": "Magnetic Resonance Imaging suite with strict ferromagnetic exclusion zone."
    },
    "XRAY_LAB": {
        "id": "XRAY_LAB",
        "name": "Digital X-Ray & Stat Blood Lab",
        "code": "XRAY",
        "zone": "Diagnostics",
        "floor": 1,
        "x": 640,
        "y": 540,
        "type": "diagnostic",
        "icon": "flask-conical",
        "capacity": 3,
        "current_load": 1,
        "description": "Rapid turnaround laboratory diagnostics and skeletal radiography."
    },
    "J_SURGERY": {
        "id": "J_SURGERY",
        "name": "Surgical Airlock Sterile Concourse",
        "code": "J-SURG",
        "zone": "Transit",
        "floor": 2,
        "x": 720,
        "y": 140,
        "type": "junction",
        "icon": "git-commit",
        "description": "Positive-pressure sterile buffer leading to main surgical theatres."
    },
    "OR_1": {
        "id": "OR_1",
        "name": "Emergency Operating Theatre 1",
        "code": "OR-1",
        "zone": "Surgical",
        "floor": 2,
        "x": 860,
        "y": 80,
        "type": "critical",
        "icon": "scissors",
        "capacity": 1,
        "current_load": 0,
        "description": "Dedicated emergency laparotomy and vascular trauma surgical suite, on 24/7 standby."
    },
    "OR_2": {
        "id": "OR_2",
        "name": "Emergency Operating Theatre 2",
        "code": "OR-2",
        "zone": "Surgical",
        "floor": 2,
        "x": 920,
        "y": 180,
        "type": "critical",
        "icon": "scissors",
        "capacity": 1,
        "current_load": 1,
        "description": "Orthopedic & neurotrauma emergency operating suite with intraoperative fluoroscopy."
    },
    "CATH_LAB": {
        "id": "CATH_LAB",
        "name": "Cardiac Catheterization Lab",
        "code": "CATH",
        "zone": "Critical Care",
        "floor": 2,
        "x": 720,
        "y": 270,
        "type": "critical",
        "icon": "zap",
        "capacity": 1,
        "current_load": 0,
        "description": "Immediate percutaneous coronary intervention (PCI) for STEMI acute heart attacks."
    },
    "PACU": {
        "id": "PACU",
        "name": "Post-Anesthesia Care Unit (Recovery)",
        "code": "PACU",
        "zone": "Critical Care",
        "floor": 2,
        "x": 880,
        "y": 290,
        "type": "clinical",
        "icon": "bed",
        "capacity": 6,
        "current_load": 4,
        "description": "Monitored post-surgical recovery before ICU or general ward transfer."
    },
    "J_CRITICAL": {
        "id": "J_CRITICAL",
        "name": "Intensive Care Security Corridor",
        "code": "J-ICU",
        "zone": "Transit",
        "floor": 2,
        "x": 800,
        "y": 350,
        "type": "junction",
        "icon": "git-commit",
        "description": "Restricted entry corridor connecting Cardiac Cath Lab and Intensive Care pods."
    },
    "ICU_A": {
        "id": "ICU_A",
        "name": "Intensive Care Unit - Pod Alpha",
        "code": "ICU-A",
        "zone": "Critical Care",
        "floor": 2,
        "x": 920,
        "y": 380,
        "type": "critical",
        "icon": "monitor-heart",
        "capacity": 4,
        "current_load": 3,
        "description": "Extracorporeal life support, mechanical ventilation, and continuous hemodynamic monitoring."
    },
    "ICU_B": {
        "id": "ICU_B",
        "name": "Intensive Care Unit - Pod Beta",
        "code": "ICU-B",
        "zone": "Critical Care",
        "floor": 2,
        "x": 920,
        "y": 490,
        "type": "critical",
        "icon": "monitor-heart",
        "capacity": 4,
        "current_load": 2,
        "description": "Neuro-ICU and post-cardiac arrest hypothermia protocol beds."
    }
}

# Hospital Corridors and Connections (Edges)
# distance: meters
# base_speed: meters/second (Gurney speed ~ 1.5 m/s, Ambulance road ~ 8.0 m/s, elevator wait+transit speed ~ 1.0 m/s)
# congestion_factor: 1.0 = clear hallway, 2.5 = heavy foot traffic / gurney congestion
# status: "OPEN" | "BLOCKED" | "CONGESTED" | "CLEANING"
DEFAULT_EDGES = [
    # Ambulance Entrance Route
    {"id": "E_AMB_JAMB", "u": "AMB_BAY", "v": "J_AMB", "distance": 35, "base_speed": 2.5, "congestion": 1.0, "status": "OPEN", "name": "Ambulance Transfer Ramp"},
    {"id": "E_JAMB_TRG", "u": "J_AMB", "v": "TRIAGE", "distance": 45, "base_speed": 1.5, "congestion": 1.0, "status": "OPEN", "name": "Airlock to Triage Corridor"},
    {"id": "E_JAMB_JER", "u": "J_AMB", "v": "J_ER_HALL", "distance": 40, "base_speed": 1.6, "congestion": 1.0, "status": "OPEN", "name": "Direct Resuscitation Expressway"},
    
    # Main Entrance Connections
    {"id": "E_MAIN_TRG", "u": "MAIN_ENTRANCE", "v": "TRIAGE", "distance": 30, "base_speed": 1.3, "congestion": 1.2, "status": "OPEN", "name": "Public Triage Walkway"},
    {"id": "E_MAIN_PED", "u": "MAIN_ENTRANCE", "v": "PEDIATRIC_ER", "distance": 45, "base_speed": 1.4, "congestion": 1.0, "status": "OPEN", "name": "Pediatric Access Hall"},
    {"id": "E_MAIN_RMPE", "u": "MAIN_ENTRANCE", "v": "RAMP_EAST", "distance": 65, "base_speed": 1.3, "congestion": 1.1, "status": "OPEN", "name": "South Entrance Concourse"},
    
    # Helipad Connections (Elevator & Ramp access from Rooftop)
    {"id": "E_HELI_PED", "u": "HELIPAD", "v": "PEDIATRIC_ER", "distance": 50, "base_speed": 1.5, "congestion": 1.0, "status": "OPEN", "name": "Helipad Lower Air Transit"},
    {"id": "E_HELI_STRW", "u": "HELIPAD", "v": "STAIR_WEST", "distance": 40, "base_speed": 1.1, "congestion": 1.0, "status": "OPEN", "name": "Helipad Emergency Stairs"},
    {"id": "E_HELI_ELEVB", "u": "HELIPAD", "v": "ELEV_BANK_B", "distance": 80, "base_speed": 1.5, "congestion": 1.2, "status": "OPEN", "name": "Rooftop Lift Linkage"},

    # Emergency Department Core
    {"id": "E_JER_TR1", "u": "J_ER_HALL", "v": "TRAUMA_1", "distance": 25, "base_speed": 1.7, "congestion": 1.0, "status": "OPEN", "name": "Trauma Bay 1 Direct Airlock"},
    {"id": "E_JER_TR2", "u": "J_ER_HALL", "v": "TRAUMA_2", "distance": 45, "base_speed": 1.7, "congestion": 1.0, "status": "OPEN", "name": "Trauma Bay 2 Corridor"},
    {"id": "E_TR1_TR2", "u": "TRAUMA_1", "v": "TRAUMA_2", "distance": 30, "base_speed": 1.5, "congestion": 1.0, "status": "OPEN", "name": "Resuscitation Inter-Bay Portal"},
    {"id": "E_TRG_JER", "u": "TRIAGE", "v": "J_ER_HALL", "distance": 35, "base_speed": 1.4, "congestion": 1.2, "status": "OPEN", "name": "Triage to ER Staging"},
    
    # Central Concourse Crossings
    {"id": "E_JER_JCTR", "u": "J_ER_HALL", "v": "J_CENTRAL", "distance": 50, "base_speed": 1.6, "congestion": 1.3, "status": "OPEN", "name": "Central ER Spine Corridor"},
    {"id": "E_TRG_RMPE", "u": "TRIAGE", "v": "RAMP_EAST", "distance": 55, "base_speed": 1.4, "congestion": 1.0, "status": "OPEN", "name": "Triage South Connector"},
    {"id": "E_RMPE_JCTR", "u": "RAMP_EAST", "v": "J_CENTRAL", "distance": 45, "base_speed": 1.5, "congestion": 1.1, "status": "OPEN", "name": "Service Ramp North Feed"},
    
    # Priority Vertical Transit (Elevators & Stairs)
    {"id": "E_TR2_ELEVA", "u": "TRAUMA_2", "v": "ELEV_BANK_A", "distance": 35, "base_speed": 1.8, "congestion": 1.0, "status": "OPEN", "name": "Code Blue Red Corridor"},
    {"id": "E_JCTR_ELEVA", "u": "J_CENTRAL", "v": "ELEV_BANK_A", "distance": 35, "base_speed": 1.5, "congestion": 1.1, "status": "OPEN", "name": "Concourse to Trauma Elevators"},
    {"id": "E_JCTR_ELEVB", "u": "J_CENTRAL", "v": "ELEV_BANK_B", "distance": 45, "base_speed": 1.3, "congestion": 1.4, "status": "OPEN", "name": "Concourse to Service Lifts"},
    {"id": "E_RMPE_STRW", "u": "RAMP_EAST", "v": "STAIR_WEST", "distance": 35, "base_speed": 1.2, "congestion": 1.0, "status": "OPEN", "name": "South West Stair Entry"},
    {"id": "E_STRW_XRAY", "u": "STAIR_WEST", "v": "XRAY_LAB", "distance": 70, "base_speed": 1.2, "congestion": 1.0, "status": "OPEN", "name": "Lower Stair to X-Ray Hall"},

    # Diagnostics Wing
    {"id": "E_JCTR_JIMG", "u": "J_CENTRAL", "v": "J_IMAGING", "distance": 45, "base_speed": 1.5, "congestion": 1.2, "status": "OPEN", "name": "Diagnostics North Arterial"},
    {"id": "E_ELEVB_JIMG", "u": "ELEV_BANK_B", "v": "J_IMAGING", "distance": 30, "base_speed": 1.4, "congestion": 1.1, "status": "OPEN", "name": "Imaging Lift Vestibule"},
    {"id": "E_JIMG_CT", "u": "J_IMAGING", "v": "CT_SCAN", "distance": 25, "base_speed": 1.6, "congestion": 1.0, "status": "OPEN", "name": "Fast-Track Stroke CT Portal"},
    {"id": "E_JIMG_MRI", "u": "J_IMAGING", "v": "MRI_SUITE", "distance": 45, "base_speed": 1.3, "congestion": 1.0, "status": "OPEN", "name": "MRI Safety Shield Corridor"},
    {"id": "E_JIMG_XRAY", "u": "J_IMAGING", "v": "XRAY_LAB", "distance": 35, "base_speed": 1.4, "congestion": 1.1, "status": "OPEN", "name": "Radiology Sub-hall"},
    {"id": "E_CT_MRI", "u": "CT_SCAN", "v": "MRI_SUITE", "distance": 35, "base_speed": 1.2, "congestion": 1.0, "status": "OPEN", "name": "Imaging Interconnect Hall"},

    # Surgical & Critical Floor (Floor 2 Connections via Express Elevators)
    {"id": "E_ELEVA_JSURG", "u": "ELEV_BANK_A", "v": "J_SURGERY", "distance": 30, "base_speed": 1.6, "congestion": 1.0, "status": "OPEN", "name": "Floor 2 Sterile Elevator Lock"},
    {"id": "E_JSURG_OR1", "u": "J_SURGERY", "v": "OR_1", "distance": 25, "base_speed": 1.7, "congestion": 1.0, "status": "OPEN", "name": "Operating Room 1 Entry"},
    {"id": "E_JSURG_OR2", "u": "J_SURGERY", "v": "OR_2", "distance": 40, "base_speed": 1.6, "congestion": 1.0, "status": "OPEN", "name": "Operating Room 2 Entry"},
    {"id": "E_OR1_OR2", "u": "OR_1", "v": "OR_2", "distance": 30, "base_speed": 1.4, "congestion": 1.0, "status": "OPEN", "name": "Inter-Theatre Scrub Tunnel"},

    # Cardiac Cath Lab & Intensive Care
    {"id": "E_ELEVA_CATH", "u": "ELEV_BANK_A", "v": "CATH_LAB", "distance": 35, "base_speed": 1.7, "congestion": 1.0, "status": "OPEN", "name": "STEMI Cardiac Express Corridor"},
    {"id": "E_JSURG_CATH", "u": "J_SURGERY", "v": "CATH_LAB", "distance": 35, "base_speed": 1.5, "congestion": 1.0, "status": "OPEN", "name": "Surgical to Cath Lab Transfer"},
    {"id": "E_CATH_PACU", "u": "CATH_LAB", "v": "PACU", "distance": 40, "base_speed": 1.4, "congestion": 1.0, "status": "OPEN", "name": "Cath Recovery Pathway"},
    {"id": "E_OR2_PACU", "u": "OR_2", "v": "PACU", "distance": 35, "base_speed": 1.5, "congestion": 1.0, "status": "OPEN", "name": "Surgical Recovery Transit"},
    
    # ICU Access
    {"id": "E_CATH_JCRIT", "u": "CATH_LAB", "v": "J_CRITICAL", "distance": 30, "base_speed": 1.5, "congestion": 1.0, "status": "OPEN", "name": "Critical Care Access Vestibule"},
    {"id": "E_PACU_JCRIT", "u": "PACU", "v": "J_CRITICAL", "distance": 25, "base_speed": 1.4, "congestion": 1.0, "status": "OPEN", "name": "PACU to ICU Transfer Hall"},
    {"id": "E_JCRIT_ICUA", "u": "J_CRITICAL", "v": "ICU_A", "distance": 25, "base_speed": 1.6, "congestion": 1.0, "status": "OPEN", "name": "ICU Pod Alpha Airlock"},
    {"id": "E_JCRIT_ICUB", "u": "J_CRITICAL", "v": "ICU_B", "distance": 40, "base_speed": 1.5, "congestion": 1.0, "status": "OPEN", "name": "ICU Pod Beta Airlock"},
    {"id": "E_ICUA_ICUB", "u": "ICU_A", "v": "ICU_B", "distance": 30, "base_speed": 1.3, "congestion": 1.0, "status": "OPEN", "name": "ICU Nursing Communication Bay"},

    # Bypass & Lower Floor Links (Connecting Diagnostics directly up to Floor 2 ICU)
    {"id": "E_ELEVB_JCRIT", "u": "ELEV_BANK_B", "v": "J_CRITICAL", "distance": 65, "base_speed": 1.3, "congestion": 1.3, "status": "OPEN", "name": "Secondary Lift to Critical Care"}
]

# Emergency Scenarios for Quick DAA Demonstration
SCENARIOS = {
    "code_blue_baseline": {
        "id": "code_blue_baseline",
        "title": "Code Blue: Ambulance to Trauma Bay 1",
        "description": "Standard high-priority arrival. All major corridors clear. Demonstrates optimal shortest weighted path.",
        "start_node": "AMB_BAY",
        "target_node": "TRAUMA_1",
        "triage_esi": 1,
        "blocked_edges": []
    },
    "central_spill_detour": {
        "id": "central_spill_detour",
        "title": "Biohazard Spill: Central Concourse Blocked",
        "description": "Chemical spill shuts down Central ER Spine. Forces Dijkstra to route via the service ramp and bypass corridors.",
        "start_node": "AMB_BAY",
        "target_node": "CT_SCAN",
        "triage_esi": 2,
        "blocked_edges": ["E_JER_JCTR", "E_JCTR_JIMG"]
    },
    "stroke_fasttrack": {
        "id": "stroke_fasttrack",
        "title": "Acute Stroke Alert: Helipad to CT Scanner to Cath Lab",
        "description": "Time-critical thrombolysis path. Tests multi-leg routing through diagnostic imaging into cardiac interventions.",
        "start_node": "HELIPAD",
        "target_node": "CT_SCAN",
        "triage_esi": 2,
        "blocked_edges": []
    },
    "trauma_elevator_outage": {
        "id": "trauma_elevator_outage",
        "title": "Elevator Bank A Maintenance: Code Blue Reroute to OR",
        "description": "Trauma express lift is offline. Forces algorithm to utilize secondary lift Bank B or evaluate alternative surgical access.",
        "start_node": "TRAUMA_1",
        "target_node": "OR_1",
        "triage_esi": 1,
        "blocked_edges": ["E_TR2_ELEVA", "E_ELEVA_JSURG"]
    },
    "mass_casualty_congestion": {
        "id": "mass_casualty_congestion",
        "title": "Mass Casualty Event: ER Hallway Heavy Congestion",
        "description": "Severe crowding in ER Main Hallway (3.5x delay). Demonstrates how Dijkstra bypasses congested corridors while BFS still falls into the trap of fewest hops.",
        "start_node": "AMB_BAY",
        "target_node": "ICU_A",
        "triage_esi": 1,
        "congested_edges": {
            "E_JAMB_JER": 3.5,
            "E_JER_JCTR": 4.0
        },
        "blocked_edges": []
    }
}
