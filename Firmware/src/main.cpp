#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <ArduinoJson.h>

// Pin definitions
#define SOIL_MOISTURE_PIN A0
#define RELAY_PIN D1

// WiFi credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// Backend server
const char* backendUrl = "http://YOUR_BACKEND_IP:5000";  // Change to your backend address

void setup() {
  Serial.begin(9600);
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, LOW);

  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nConnected to WiFi");
}

void loop() {
  int moistureValue = analogRead(SOIL_MOISTURE_PIN);
  int moisturePercent = map(moistureValue, 1023, 0, 0, 100);  // adjust range if needed

  Serial.print("Moisture: ");
  Serial.print(moisturePercent);
  Serial.println("%");

  bool autoMode = true;  // default to true
  String currentPumpStatus = "OFF";

  // Step 1: Fetch auto_mode from backend
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(String(backendUrl) + "/status");

    int httpCode = http.GET();

    if (httpCode == 200) {
      String response = http.getString();
      Serial.println("Status Response: " + response);

      StaticJsonDocument<256> doc;
      deserializeJson(doc, response);

      autoMode = doc["auto_mode"];
      currentPumpStatus = doc["pump"] | "OFF";
    } else {
      Serial.print("Failed to get /status. Code: ");
      Serial.println(httpCode);
    }

    http.end();
  }

  // Step 2: If auto mode is enabled, decide to turn pump on or off
  String newPumpStatus = currentPumpStatus;
  if (autoMode) {
    newPumpStatus = (moisturePercent < 50) ? "ON" : "OFF";
    digitalWrite(RELAY_PIN, (newPumpStatus == "ON") ? HIGH : LOW);
  } else {
    Serial.println("Auto Mode is OFF. Manual control only.");
  }

  // Step 3: Send moisture reading to backend
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(String(backendUrl) + "/sensor");
    http.addHeader("Content-Type", "application/json");

    StaticJsonDocument<200> json;
    json["moisture"] = moisturePercent;

    String requestBody;
    serializeJson(json, requestBody);

    int responseCode = http.POST(requestBody);
    String response = http.getString();

    Serial.print("POST /sensor Response: ");
    Serial.println(response);

    http.end();
  }

  delay(5000);  // Delay before next reading
}
