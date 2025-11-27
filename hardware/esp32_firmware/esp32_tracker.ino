/*
 * Smart Meter GPS Tracker - ESP32 Firmware
 * 
 * Hardware Required:
 * - ESP32 Development Board
 * - NEO-6M GPS Module
 * - SIM800L or SIM7600E GSM/GPRS Module
 * - LiPo Battery (3.7V, 2000mAh recommended)
 * - TP4056 Charging Module
 * 
 * Connections:
 * GPS (NEO-6M):
 *   - VCC -> 3.3V
 *   - GND -> GND
 *   - TX -> GPIO16 (RX2)
 *   - RX -> GPIO17 (TX2)
 * 
 * SIM800L:
 *   - VCC -> 4.2V (from battery)
 *   - GND -> GND
 *   - TX -> GPIO26
 *   - RX -> GPIO27
 * 
 * Battery Monitor:
 *   - Battery+ -> GPIO34 (ADC) via voltage divider (10K + 10K)
 */

#include <TinyGPS++.h>
#include <HardwareSerial.h>
#include <HTTPClient.h>
#include <WiFi.h>

// Configuration
#define DEVICE_ID "TRACKER_001"  // Unique device ID - change for each tracker
#define SUPABASE_URL "https://your-project.supabase.co/functions/v1/tracker-update"
#define SUPABASE_ANON_KEY "your_supabase_anon_key"

// Update intervals
#define UPDATE_INTERVAL 300000  // 5 minutes in milliseconds
#define GPS_TIMEOUT 60000       // 1 minute GPS timeout
#define SLEEP_DURATION 300      // 5 minutes sleep in seconds

// Pin definitions
#define GPS_RX_PIN 16
#define GPS_TX_PIN 17
#define GSM_RX_PIN 26
#define GSM_TX_PIN 27
#define BATTERY_PIN 34

// GPS and GSM Serial
HardwareSerial gpsSerial(2);  // Use UART2 for GPS
HardwareSerial gsmSerial(1);  // Use UART1 for GSM
TinyGPSPlus gps;

// Global variables
String currentStatus = "in_storage";  // Default status
String meterID = "";                  // Optional meter ID
unsigned long lastUpdate = 0;
int batteryLevel = 100;

// Function prototypes
void setupGPS();
void setupGSM();
bool getGPSLocation(double &lat, double &lng);
int getBatteryLevel();
bool sendDataToServer(double lat, double lng, int battery, String status);
void goToSleep();
bool initGPRS();
String sendATCommand(String command, unsigned long timeout = 1000);

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("Smart Meter GPS Tracker Starting...");
  Serial.println("Device ID: " + String(DEVICE_ID));
  
  // Setup GPS
  setupGPS();
  
  // Setup GSM
  setupGSM();
  
  // Configure battery monitoring
  pinMode(BATTERY_PIN, INPUT);
  
  Serial.println("Setup complete!");
}

void loop() {
  unsigned long currentMillis = millis();
  
  // Check if it's time to update
  if (currentMillis - lastUpdate >= UPDATE_INTERVAL) {
    Serial.println("\n=== Starting Update Cycle ===");
    
    // Get battery level
    batteryLevel = getBatteryLevel();
    Serial.println("Battery Level: " + String(batteryLevel) + "%");
    
    // Get GPS location
    double latitude = 0.0;
    double longitude = 0.0;
    
    Serial.println("Waiting for GPS fix...");
    bool gpsSuccess = getGPSLocation(latitude, longitude);
    
    if (gpsSuccess) {
      Serial.println("GPS Location: " + String(latitude, 6) + ", " + String(longitude, 6));
      
      // Initialize GPRS
      if (initGPRS()) {
        // Send data to server
        bool success = sendDataToServer(latitude, longitude, batteryLevel, currentStatus);
        
        if (success) {
          Serial.println("Data sent successfully!");
          lastUpdate = currentMillis;
        } else {
          Serial.println("Failed to send data");
        }
      } else {
        Serial.println("Failed to initialize GPRS");
      }
    } else {
      Serial.println("Failed to get GPS location");
    }
    
    Serial.println("=== Update Cycle Complete ===\n");
    
    // Go to deep sleep to save battery
    goToSleep();
  }
  
  delay(1000);
}

void setupGPS() {
  Serial.println("Initializing GPS...");
  gpsSerial.begin(9600, SERIAL_8N1, GPS_RX_PIN, GPS_TX_PIN);
  delay(1000);
  Serial.println("GPS initialized");
}

void setupGSM() {
  Serial.println("Initializing GSM...");
  gsmSerial.begin(9600, SERIAL_8N1, GSM_RX_PIN, GSM_TX_PIN);
  delay(3000);
  
  // Test AT command
  sendATCommand("AT");
  delay(500);
  
  // Disable echo
  sendATCommand("ATE0");
  delay(500);
  
  // Check SIM card
  String response = sendATCommand("AT+CPIN?", 5000);
  if (response.indexOf("READY") > 0) {
    Serial.println("SIM card ready");
  } else {
    Serial.println("SIM card error!");
  }
  
  // Check signal strength
  response = sendATCommand("AT+CSQ");
  Serial.println("Signal: " + response);
  
  Serial.println("GSM initialized");
}

bool getGPSLocation(double &lat, double &lng) {
  unsigned long startTime = millis();
  
  while (millis() - startTime < GPS_TIMEOUT) {
    while (gpsSerial.available() > 0) {
      char c = gpsSerial.read();
      gps.encode(c);
      
      if (gps.location.isUpdated() && gps.location.isValid()) {
        lat = gps.location.lat();
        lng = gps.location.lng();
        
        // Validate coordinates (basic check)
        if (lat != 0.0 && lng != 0.0) {
          return true;
        }
      }
    }
    delay(100);
  }
  
  return false;
}

int getBatteryLevel() {
  // Read battery voltage through voltage divider
  int rawValue = analogRead(BATTERY_PIN);
  
  // Convert to voltage (ESP32 ADC: 0-4095 = 0-3.3V)
  // With voltage divider (10K + 10K), max input is 6.6V
  float voltage = (rawValue / 4095.0) * 3.3 * 2.0;
  
  // LiPo battery: 4.2V (full) to 3.0V (empty)
  float percentage = ((voltage - 3.0) / (4.2 - 3.0)) * 100.0;
  
  // Constrain to 0-100
  if (percentage > 100) percentage = 100;
  if (percentage < 0) percentage = 0;
  
  return (int)percentage;
}

bool initGPRS() {
  Serial.println("Initializing GPRS...");
  
  // Attach to GPRS
  sendATCommand("AT+SAPBR=3,1,\"CONTYPE\",\"GPRS\"");
  delay(500);
  
  // Set APN (change according to your SIM provider)
  // For Jio: "jionet"
  // For Airtel: "airtelgprs.com"
  // For Vodafone: "www"
  sendATCommand("AT+SAPBR=3,1,\"APN\",\"jionet\"");
  delay(500);
  
  // Enable GPRS
  String response = sendATCommand("AT+SAPBR=1,1", 5000);
  delay(2000);
  
  // Check GPRS status
  response = sendATCommand("AT+SAPBR=2,1", 2000);
  
  if (response.indexOf("1,1") > 0) {
    Serial.println("GPRS connected");
    return true;
  }
  
  Serial.println("GPRS connection failed");
  return false;
}

bool sendDataToServer(double lat, double lng, int battery, String status) {
  Serial.println("Sending data to server...");
  
  // Initialize HTTP
  sendATCommand("AT+HTTPINIT");
  delay(500);
  
  // Set HTTP parameters
  sendATCommand("AT+HTTPPARA=\"CID\",1");
  delay(500);
  
  // Set URL
  sendATCommand("AT+HTTPPARA=\"URL\",\"" + String(SUPABASE_URL) + "\"");
  delay(500);
  
  // Set content type
  sendATCommand("AT+HTTPPARA=\"CONTENT\",\"application/json\"");
  delay(500);
  
  // Prepare JSON data
  String jsonData = "{";
  jsonData += "\"device_id\":\"" + String(DEVICE_ID) + "\",";
  jsonData += "\"latitude\":" + String(lat, 6) + ",";
  jsonData += "\"longitude\":" + String(lng, 6) + ",";
  jsonData += "\"battery_level\":" + String(battery) + ",";
  jsonData += "\"status\":\"" + status + "\"";
  if (meterID != "") {
    jsonData += ",\"meter_id\":\"" + meterID + "\"";
  }
  jsonData += "}";
  
  Serial.println("JSON: " + jsonData);
  
  // Set data length
  sendATCommand("AT+HTTPDATA=" + String(jsonData.length()) + ",10000");
  delay(500);
  
  // Send data
  gsmSerial.print(jsonData);
  delay(2000);
  
  // Add authorization header
  sendATCommand("AT+HTTPPARA=\"USERDATA\",\"apikey: " + String(SUPABASE_ANON_KEY) + "\"");
  delay(500);
  
  // Execute POST request
  String response = sendATCommand("AT+HTTPACTION=1", 10000);
  delay(5000);
  
  // Read response
  response = sendATCommand("AT+HTTPREAD", 5000);
  Serial.println("Server response: " + response);
  
  // Terminate HTTP
  sendATCommand("AT+HTTPTERM");
  
  // Check if successful
  if (response.indexOf("\"success\":true") > 0 || response.indexOf("200") > 0) {
    return true;
  }
  
  return false;
}

String sendATCommand(String command, unsigned long timeout) {
  String response = "";
  
  gsmSerial.println(command);
  
  unsigned long startTime = millis();
  while (millis() - startTime < timeout) {
    while (gsmSerial.available()) {
      char c = gsmSerial.read();
      response += c;
    }
    
    if (response.indexOf("OK") > 0 || response.indexOf("ERROR") > 0) {
      break;
    }
  }
  
  Serial.println("CMD: " + command);
  Serial.println("RSP: " + response);
  
  return response;
}

void goToSleep() {
  Serial.println("Going to deep sleep for " + String(SLEEP_DURATION) + " seconds...");
  Serial.flush();
  
  // Configure wake up timer
  esp_sleep_enable_timer_wakeup(SLEEP_DURATION * 1000000ULL);
  
  // Enter deep sleep
  esp_deep_sleep_start();
}
