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

# API to receive sensor data (automatic logic)
@app.route('/Sensor', methods=['GET'])
def get_sensor_data():
    try:
        # Read data from Firebase at path /Sensor
        sensor_ref = db.reference("/Sensor")
        sensor_data = sensor_ref.get()

        print("Fetched sensor data:", sensor_data)  # Debugging line

        if sensor_data is None:
            return jsonify({"error": "No data found at /Sensor"}), 404

        return jsonify(sensor_data)

    except Exception as e:
        print("Error:", str(e))
        return jsonify({"error": str(e)}), 500

#@app.route('/temperature', methods=['POST'])
#def receive_temperature_data():
 #   data = request.get_json()
#temperature = data.get("temperature")
    #moisture = data.get("moisture")
   # location = data.get("location", "UMP Main Campus")
    #rain_status = data.get("rain_status", False)
    #timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    #if temperature is None or moisture is None:
     #   return jsonify({"error": "Missing required fields"}), 400

    #temperature_ref = db.reference("/temperature_history")
    #temperature_ref.push({
      #  "temperature": temperature,
      #  "moisture": moisture,
     #   "location": location,
     #   "rain_status": rain_status,
    #    "timestamp": timestamp
   # })

   # return jsonify({"status": "temperature data saved"})

# API to get system status
#@app.route('/Sensor', methods=['POST'])
#def get_status():
 #   ref = db.reference("/Sensor")
  #  return jsonify(ref.get())
# ✅ NEW: Weather endpoint to save weather info from frontend
#@app.route('/weather', methods=['POST'])
#def save_weather_data():
 ##  temperature = data.get("temperature")
   # description = data.get("description")
    #location = data.get("location", "Unknown")
    #rain_status = data.get("rain_status", False)
    #rain_volume = data.get("rain_volume", 0)
    #timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    #    return jsonify({"error": "Missing weather data"}), 400

    #weather_ref = db.reference("/weather_history")
    #weather_ref.push({
     #   "temperature": temperature,
      #  "description": description,
       # "location": location,
       # "rain_status": rain_status,
       # "rain_volume": rain_volume,
       # "timestamp": timestamp
    #})

  #  return jsonify({"status": "weather data saved"})


# Manual pump control
#@app.route('/control', methods=['POST'])
#def control_pump():
    #data = request.get_json()
    #pump_status = data.get('pump')
    #if pump_status not in ['ON', 'OFF']:
     #   return jsonify({'error': 'Invalid pump status'}), 400

    #db.reference('/Sensor').update({
     #   'pump': pump_status,
    #    'auto_mode': False
   # })

   # return jsonify({'status': 'pump updated', 'pump': pump_status})

# Ping route
@app.route('/ping', methods=['GET'])
def ping():
    return jsonify({"message": "pong"})

# Graph generation endpoint
#@app.route('/moisture-graph', methods=['GET'])
#def generate_graph():
   # history_ref = db.reference("/moisture_history")
  #  history_data = history_ref.get()

 #   if not history_data:
#        return jsonify({"error": "No moisture history data found"}), 404

    #timestamps = []
    #moisture_levels = []

    #for key in sorted(history_data.keys()):
       # entry = history_data[key]
      #  timestamps.append(entry['timestamp'])
     #   moisture_levels.append(entry['moisture'])

    # Create graph
    #plt.figure(figsize=(10, 5))
    #plt.plot(timestamps, moisture_levels, marker='o', linestyle='-', color='blue')
    #plt.title("Moisture Levels Over Time")
    #plt.xlabel("Timestamp")
    #plt.ylabel("Moisture Level (%)")
    #plt.xticks(rotation=45)
    #plt.tight_layout()

    #img_bytes = io.BytesIO()
   # plt.savefig(img_bytes, format='png')
   # img_bytes.seek(0)
    #plt.close()

   # return send_file(img_bytes, mimetype='image/png')

 # db =firestore.client()

# Run the app
if __name__ == '__main__':
    app.run(debug=True)
