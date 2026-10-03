"""
Emergency Patient & Ambulance Priority Queue System
Demonstrates explicit multi-criteria prioritization (ESI Level, Vital Instability, Arrival Time),
repeatedly selecting the most critical patient and calculating dynamic emergency routing.
"""

import heapq
import time
from typing import Dict, Any, List, Optional
from algorithms.dijkstra import run_dijkstra

def calculate_vital_instability_score(vitals: Dict[str, Any]) -> float:
    """
    Computes an instability penalty (0.0 to 10.0) based on abnormal vital signs.
    Higher score indicates higher clinical danger / urgency.
    """
    score = 0.0
    hr = vitals.get("heart_rate", 80)
    spo2 = vitals.get("spo2", 98)
    sbp = vitals.get("systolic_bp", 120)
    gcs = vitals.get("gcs", 15)

    # Hypoxia
    if spo2 < 88:
        score += 4.0
    elif spo2 < 93:
        score += 2.0

    # Hemodynamic instability / shock
    if sbp < 85:
        score += 3.5
    elif sbp < 100:
        score += 1.5

    # Arrhythmia / severe tachycardia or bradycardia
    if hr > 140 or hr < 45:
        score += 2.5
    elif hr > 115 or hr < 55:
        score += 1.0

    # Glasgow Coma Scale (Severe brain impairment)
    if gcs <= 8:
        score += 3.0
    elif gcs < 13:
        score += 1.5

    return round(score, 2)

class EmergencyPriorityQueue:
    """
    Priority Queue managing incoming trauma ambulances and emergency patients.
    Min-Heap ordering:
      tuple: (esi_level, -vital_instability_score, arrival_time, counter, patient_data)
    Lower tuple values represent HIGHER medical dispatch priority!
    """

    def __init__(self):
        self.heap: List[tuple] = []
        self.counter = 0

    def enqueue(self, patient: Dict[str, Any]) -> Dict[str, Any]:
        """
        Adds a patient to the priority queue with explicit criteria evaluation.
        """
        self.counter += 1
        esi = int(patient.get("esi_level", 3)) # 1 (Critical) to 5 (Non-urgent)
        vitals = patient.get("vitals", {})
        instability = calculate_vital_instability_score(vitals)
        arrival = patient.get("arrival_time", time.time())

        patient["vital_instability_score"] = instability
        patient["queue_id"] = f"PT-{self.counter:03d}"
        
        # Priority criteria tuple:
        # 1. ESI Level (1 is most urgent)
        # 2. -instability (higher instability floats to top)
        # 3. arrival time (earlier arrival first)
        priority_tuple = (esi, -instability, arrival, self.counter, patient)
        heapq.heappush(self.heap, priority_tuple)

        return {
            "status": "ENQUEUED",
            "patient": patient,
            "calculated_priority": {
                "esi_level": esi,
                "vital_instability_score": instability,
                "composite_rank_weight": round(esi * 10 - instability, 2),
                "rationale": f"ESI {esi} ({self.get_esi_label(esi)}) with vital instability score of {instability}/10"
            }
        }

    def dequeue(self) -> Optional[Dict[str, Any]]:
        """
        Extracts and returns the highest priority (lowest tuple) patient.
        """
        if not self.heap:
            return None
        esi, neg_instability, arrival, _, patient = heapq.heappop(self.heap)
        return {
            "patient": patient,
            "priority_criteria": {
                "esi_level": esi,
                "vital_instability_score": -neg_instability,
                "arrival_time": arrival,
                "reason": f"Selected as top priority due to ESI {esi} and vital instability score {-neg_instability}"
            }
        }

    def peek(self) -> Optional[Dict[str, Any]]:
        if not self.heap:
            return None
        return self.heap[0][4]

    def get_all_sorted(self) -> List[Dict[str, Any]]:
        """
        Returns all patients currently in the Priority Queue in order of priority.
        """
        sorted_items = sorted(self.heap, key=lambda x: (x[0], x[1], x[2]))
        result = []
        for rank, (esi, neg_instability, arrival, _, patient) in enumerate(sorted_items, start=1):
            result.append({
                "rank": rank,
                "esi_level": esi,
                "vital_instability_score": -neg_instability,
                "patient": patient,
                "priority_label": self.get_esi_label(esi)
            })
        return result

    def size(self) -> int:
        return len(self.heap)

    def clear(self):
        self.heap.clear()
        self.counter = 0

    @staticmethod
    def get_esi_label(esi: int) -> str:
        labels = {
            1: "ESI 1: Resuscitation / Code Blue (Immediate life threat)",
            2: "ESI 2: Emergent / Stroke / STEMI (Within 10 mins)",
            3: "ESI 3: Urgent / Severe Pain / Fracture (Within 30 mins)",
            4: "ESI 4: Semi-Urgent (Within 60 mins)",
            5: "ESI 5: Non-Urgent / Routine"
        }
        return labels.get(esi, f"ESI {esi}")

# Sample initial patients to populate queue on launch
SAMPLE_PATIENTS = [
    {
        "patient_name": "Ambulance 4 - Code Blue",
        "condition": "Cardiac Arrest / CPR in progress",
        "esi_level": 1,
        "origin_node": "AMB_BAY",
        "target_node": "TRAUMA_1",
        "vitals": {"heart_rate": 35, "spo2": 82, "systolic_bp": 60, "gcs": 3}
    },
    {
        "patient_name": "LifeFlight Air 2 - Acute Stroke",
        "condition": "Sudden Hemiplegia & Aphasia (Stroke Window < 2 hrs)",
        "esi_level": 2,
        "origin_node": "HELIPAD",
        "target_node": "CT_SCAN",
        "vitals": {"heart_rate": 95, "spo2": 95, "systolic_bp": 178, "gcs": 12}
    },
    {
        "patient_name": "Ambulance 9 - STEMI Heart Attack",
        "condition": "Severe Sub-sternal Chest Pain, ST-Elevation",
        "esi_level": 2,
        "origin_node": "AMB_BAY",
        "target_node": "CATH_LAB",
        "vitals": {"heart_rate": 118, "spo2": 91, "systolic_bp": 92, "gcs": 14}
    },
    {
        "patient_name": "Walk-in Patient - Compound Fracture",
        "condition": "Open Tibial Fracture post-MVA",
        "esi_level": 3,
        "origin_node": "MAIN_ENTRANCE",
        "target_node": "OR_2",
        "vitals": {"heart_rate": 102, "spo2": 98, "systolic_bp": 135, "gcs": 15}
    },
    {
        "patient_name": "Ambulance 14 - Pediatric Respiratory",
        "condition": "Acute Stridor & Pediatric Asthma",
        "esi_level": 2,
        "origin_node": "AMB_BAY",
        "target_node": "PEDIATRIC_ER",
        "vitals": {"heart_rate": 145, "spo2": 89, "systolic_bp": 105, "gcs": 14}
    }
]
