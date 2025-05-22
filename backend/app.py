import firebase_admin 
from firebase_admin import credentials, db
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from datetime import datetime
import matplotlib.pyplot as plt
import io

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Initialize Firebase
cred = credentials.Certificate("firebase_key.json")
firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://smart-irrigation-system-fd89c-default-rtdb.firebaseio.com/'
})

# ✅ API to get complete sensor system data and component status
@app.route('/Sensor', methods=['GET'])
def get_sensor_data():
    try:
        root_ref = db.reference("/")

        control = root_ref.child("Control").get()
        location = root_ref.child("Location").get()
        pump = root_ref.child("Pump").get()
        sensor = root_ref.child("Sensor").get()
        weather = root_ref.child("Weather").get()
        status = root_ref.child("status").get()

        # System component statuses
        component_status = {
            "Pump": "Active" if pump and pump.get("Status") in ["ON", "OFF"] else "Inactive",
            "Sensor": "Active" if sensor and isinstance(sensor.get("MoisturePercent"), (int, float)) else "Inactive",
            "Weather": "Active" if weather and weather.get("Condition") else "Inactive",
            "ManualOverride": "Enabled" if control and control.get("ManualOverride") else "Disabled",
            "Mode": control.get("Mode") if control and control.get("Mode") else "Unknown"
        }

        # Extract required fields for frontend dashboard
        moisture = sensor.get("MoisturePercent") if sensor else None
        pump_status = pump.get("Status") if pump else "Unknown"
        last_irrigation = pump.get("LastIrrigation") if pump and pump.get("LastIrrigation") else "Unavailable"
        nodemcu_status = "connected" if sensor and pump else "disconnected"

        # Pack all data
        data = {
            "moisture": moisture,
            "pump": pump_status,
            "last_irrigation": last_irrigation,
            "nodemcu_status": nodemcu_status,
            "Control": control,
            "Location": location,
            "Pump": pump,
            "Sensor": sensor,
            "Weather": weather,
            "Status": status,
            "ComponentStatus": component_status
        }

        if not any(data.values()):
            return jsonify({"error": "No data found"}), 404

        return jsonify(data)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ✅ New API to update Last Irrigation timestamp
@app.route('/update-last-irrigation', methods=['POST'])
def update_last_irrigation():
    try:
        # Get current UTC time in ISO 8601 format
        now_iso = datetime.utcnow().isoformat() + 'Z'  # Add 'Z' to indicate UTC

        # Update the LastIrrigation timestamp under Pump node
        pump_ref = db.reference('Pump')
        pump_ref.update({"LastIrrigation": now_iso})

        return jsonify({"message": "Last irrigation timestamp updated", "timestamp": now_iso})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ✅ Ping route
@app.route('/ping', methods=['GET'])
def ping():
    return jsonify({"message": "pong"})

# ✅ Graph generation (optional)
@app.route('/moisture-graph', methods=['GET'])
def generate_graph():
    history_ref = db.reference("/moisture_history")
    history_data = history_ref.get()

    if not history_data:
        return jsonify({"error": "No moisture history data found"}), 404

    timestamps = []
    moisture_levels = []

    for key in sorted(history_data.keys()):
        entry = history_data[key]
        timestamps.append(entry['timestamp'])
        moisture_levels.append(entry['moisture'])

    plt.figure(figsize=(10, 5))
    plt.plot(timestamps, moisture_levels, marker='o', linestyle='-', color='blue')
    plt.title("Moisture Levels Over Time")
    plt.xlabel("Timestamp")
    plt.ylabel("Moisture Level (%)")
    plt.xticks(rotation=45)
    plt.tight_layout()

    img_bytes = io.BytesIO()
    plt.savefig(img_bytes, format='png')
    img_bytes.seek(0)
    plt.close()

    return send_file(img_bytes, mimetype='image/png')

# ✅ Run the Flask app
if __name__ == '__main__':
    app.run(debug=True)
