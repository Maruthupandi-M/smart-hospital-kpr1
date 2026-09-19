from backend.app import require_auth
from backend import app
import uuid

@app.route("/api/simulation/state", methods=["GET"])
@require_auth
def get_simulation_state():
    return jsonify({
        "status": "Active",
        "events": [],
        "metrics": {
            "beds_utilized": 85,
            "doctors_utilized": 90,
            "patient_waiting_avg": 25
        }
    }), 200

@app.route("/api/simulation/demand-surge", methods=["POST"])
@require_auth
def simulate_surge():
    data = request.json
    return jsonify({"message": f"Demand surge of severity {data.get('severity')} initiated."}), 200

@app.route("/api/simulation/resource-change", methods=["POST"])
@require_auth
def simulate_resource_change():
    data = request.json
    return jsonify({"message": f"Resource change applied: {data.get('resourceType')} change by {data.get('delta')}."}), 200

@app.route("/api/simulation/action", methods=["POST"])
@require_auth
def simulate_action():
    data = request.json
    return jsonify({"message": f"Action {data.get('action')} initiated."}), 200
