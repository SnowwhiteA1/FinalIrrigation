from flask import Flask, request, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, db

app = Flask(__name__)
CORS(app)

# Firebase Admin SDK Key
cred = credentials.Certificate("firebase_key.json")  # Make sure this file exists
firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://smart-irrigation-system-fd89c-default-rtdb.firebaseio.com/'
})

@app.route('/Sensor', methods=['GET'])
def get_sensor_data():
    try:
        ref = db.reference("/")
        data = ref.get()

        if not data:
            return jsonify({"error": "No data found"}), 404

        sensor = data.get("sensor_data", {})
        device = data.get("device_status", {})
        control = data.get("control_states", {})

        raw_moisture = sensor.get("soil_moisture", 0)
        raw_moisture1 = sensor.get("soil_moisture1", 0)

        # Convert to percentage (0–100%)
        moisture_percent1 = round((raw_moisture / 1023) * 100, 1)
        moisture_percent2 = round((raw_moisture1 / 1023) * 100, 1)

        response = {
            "soil_moisture": moisture_percent1,
            "soil_moisture1": moisture_percent2,
            "temperature": float(sensor.get("temperature", 0)),
            "humidity": float(sensor.get("humidity", 0)),
            "soil_dry": sensor.get("soil_dry", False),
            "soil_dry2": sensor.get("soil_dry2", False),
            "fan": device.get("fan", False),
            "pump1": device.get("pump1", False),
            "pump2": device.get("pump2", False),
            "light": device.get("light", False),
            "mode": "auto" if control.get("auto_mode", False) else "manual"
        }

        return jsonify(response), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/update-device', methods=['POST'])
def update_device():
    try:
        data = request.get_json()
        device = data.get("device")
        status = data.get("status")

        if device not in ["fan", "pump1", "pump2", "light"]:
            return jsonify({"error": "Invalid device name"}), 400

        db.reference("device_status").update({device: status})
        return jsonify({"message": f"{device} set to {status}"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/update-mode', methods=['POST'])
def update_mode():
    try:
        data = request.get_json()
        mode = data.get("mode")
        if mode not in ["auto", "manual"]:
            return jsonify({"error": "Invalid mode"}), 400

        db.reference("control_states").update({"auto_mode": (mode == "auto")})
        return jsonify({"message": f"Mode updated to {mode}"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/ping', methods=['GET'])
def ping():
    return jsonify({"message": "pong"}), 200

if __name__ == '__main__':
    app.run(debug=True)
