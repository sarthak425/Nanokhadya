/*
 * NanoKhadya-Check Portable Reader Firmware
 * Target: ESP32-S3 with OV2640 Camera & 1.3" I2C OLED
 * Smart India Hackathon - Problem Statement 26235
 *
 * Subsystems:
 * 1. OV2640 Camera in Closed Optical Chamber (Fixed Exposure/Gain/WB)
 * 2. 4x High-CRI White LEDs on PWM Dimmer
 * 3. SH1106 / SSD1306 1.3" I2C OLED Display
 * 4. Tactile Pushbuttons & Piezo Buzzer
 * 5. Wi-Fi Client with REST HTTP JSON & Image Streaming
 */

#include "esp_camera.h"
#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

// ===================== CONFIGURATION =====================
const char* WIFI_SSID = "Your_WiFi_SSID";
const char* WIFI_PASS = "Your_WiFi_Password";
const char* SERVER_BASE_URL = "http://192.168.1.100:8080";
const char* CV_SERVICE_URL  = "http://192.168.1.100:8000/analyze/image";

#define DEVICE_SERIAL "READER-ESP32S3-001"

// Pin Definitions for Standard ESP32-S3-CAM
#define PWDN_GPIO_NUM     -1
#define RESET_GPIO_NUM    -1
#define XCLK_GPIO_NUM     15
#define SIOD_GPIO_NUM      4
#define SIOC_GPIO_NUM      5
#define Y9_GPIO_NUM       16
#define Y8_GPIO_NUM       17
#define Y7_GPIO_NUM       18
#define Y6_GPIO_NUM       12
#define Y5_GPIO_NUM       10
#define Y4_GPIO_NUM        8
#define Y3_GPIO_NUM        9
#define Y2_GPIO_NUM       11
#define VSYNC_GPIO_NUM     6
#define HREF_GPIO_NUM      7
#define PCLK_GPIO_NUM     13

// Peripheral Pins
#define LED_RING_PIN       48  // Constant Current LED Dimmer (PWM)
#define BUZZER_PIN          2  // Piezo Buzzer
#define BUTTON_TEST_PIN     0  // Action Switch (Active Low)
#define OLED_SDA           21
#define OLED_SCL           22

#define SCREEN_WIDTH      128
#define SCREEN_HEIGHT      64
#define OLED_RESET         -1
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

enum ReaderState {
  STATE_IDLE,
  STATE_COUNTDOWN,
  STATE_IMAGING,
  STATE_UPLOADING,
  STATE_RESULT
};

ReaderState currentState = STATE_IDLE;
unsigned long stateStartTime = 0;
const int INCUBATION_SECONDS = 60;
String lastResultText = "READY";

// ===================== HELPER FUNCTIONS =====================
void playTone(int freq, int durationMs) {
  tone(BUZZER_PIN, freq, durationMs);
  delay(durationMs);
  noTone(BUZZER_PIN);
}

void setIllumination(uint8_t brightness) {
  analogWrite(LED_RING_PIN, brightness);
}

void updateOled(const String& line1, const String& line2, const String& line3) {
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 0);
  display.println("== NANOKHADYA READER ==");
  
  display.setCursor(0, 18);
  display.setTextSize(1);
  display.println(line1);

  display.setCursor(0, 32);
  display.setTextSize(1);
  display.println(line2);

  display.setCursor(0, 48);
  display.setTextSize(1);
  display.println(line3);

  display.display();
}

bool initCamera() {
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
  config.pin_sccb_sda = SIOD_GPIO_NUM;
  config.pin_sccb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.pixel_format = PIXFORMAT_JPEG;
  config.frame_size = FRAMESIZE_SVGA; // 800x600 for sharp microfluidic ROI
  config.jpeg_quality = 10;           // High quality JPEG
  config.fb_count = 2;

  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("Camera init failed: 0x%x\n", err);
    return false;
  }

  // Lock camera parameters to prevent ambient auto-gain/exposure drift
  sensor_t * s = esp_camera_sensor_get();
  s->set_whitebal(s, 0);       // Disable Auto White Balance
  s->set_awb_gain(s, 0);       // Lock AWB gain
  s->set_wb_mode(s, 0);        // Manual WB
  s->set_exposure_ctrl(s, 0);  // Disable Auto Exposure
  s->set_aec_value(s, 300);    // Fixed exposure time (300)
  s->set_gain_ctrl(s, 0);      // Disable Auto Gain
  s->set_agc_gain(s, 2);       // Fixed gain

  return true;
}

void captureAndAnalyze() {
  updateOled("CAPTURING OPTICAL...", "LED Array: ON", "Exposure: Locked");
  
  // 1. Turn on calibrated high-CRI chamber LEDs
  setIllumination(220);
  delay(250); // Allow optical stabilization

  // 2. Discard first frame (flush buffer)
  camera_fb_t * fb = esp_camera_fb_get();
  if (fb) esp_camera_fb_return(fb);

  // 3. Acquire measurement frame
  fb = esp_camera_fb_get();
  setIllumination(0); // Turn off LEDs immediately to prevent heating

  if (!fb) {
    updateOled("CAMERA ERROR", "Frame acquisition", "FAILED");
    playTone(400, 500);
    currentState = STATE_IDLE;
    return;
  }

  updateOled("TRANSMITTING IMAGE", "Payload: " + String(fb->len / 1024) + " KB", "To Cloud Server...");

  // 4. HTTP POST multipart image to Python CV Microservice / Spring Boot
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(CV_SERVICE_URL);
    
    String boundary = "----NanoKhadyaBoundary7MA4YWxkTrZu0gW";
    http.addHeader("Content-Type", "multipart/form-data; boundary=" + boundary);

    String head = "--" + boundary + "\r\nContent-Disposition: form-data; name=\"file\"; filename=\"cartridge.jpg\"\r\nContent-Type: image/jpeg\r\n\r\n";
    String tail = "\r\n--" + boundary + "--\r\n";

    uint32_t totalLen = head.length() + fb->len + tail.length();
    uint8_t * buf = (uint8_t*) malloc(totalLen);
    
    if (buf) {
      memcpy(buf, head.c_str(), head.length());
      memcpy(buf + head.length(), fb->buf, fb->len);
      memcpy(buf + head.length() + fb->len, tail.c_str(), tail.length());

      int httpResponseCode = http.POST(buf, totalLen);
      free(buf);

      if (httpResponseCode == 200) {
        String response = http.getString();
        Serial.println("CV Analysis Response: " + response);
        playTone(1800, 300);
        lastResultText = "TEST COMPLETE - OK";
      } else {
        Serial.printf("HTTP Error: %d\n", httpResponseCode);
        playTone(500, 400);
        lastResultText = "UPLOAD FAULT " + String(httpResponseCode);
      }
    }
    http.end();
  } else {
    lastResultText = "NO WI-FI SYNC";
  }

  esp_camera_fb_return(fb);
  currentState = STATE_RESULT;
  stateStartTime = millis();
}

// ===================== ARDUINO SETUP =====================
void setup() {
  Serial.begin(115200);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(LED_RING_PIN, OUTPUT);
  pinMode(BUTTON_TEST_PIN, INPUT_PULLUP);
  setIllumination(0);

  Wire.begin(OLED_SDA, OLED_SCL);
  display.begin(SSD1306_SWITCHCAPVCC, 0x3C);
  updateOled("System Initializing", "NanoKhadya v1.0", "Checking Camera...");

  if (!initCamera()) {
    updateOled("HARDWARE FAULT", "Camera init failed!", "Check ribbon cable");
    while (1) { playTone(500, 100); delay(200); }
  }

  // Connect to Wi-Fi
  updateOled("Connecting Wi-Fi", WIFI_SSID, "Please wait...");
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 15) {
    delay(500);
    attempts++;
  }

  playTone(1200, 150);
  currentState = STATE_IDLE;
}

// ===================== ARDUINO MAIN LOOP =====================
void loop() {
  switch (currentState) {
    case STATE_IDLE:
      updateOled("Status: STANDBY", "Insert Cartridge", "Press BTN to Start");
      if (digitalRead(BUTTON_TEST_PIN) == LOW) {
        delay(50); // Debounce
        if (digitalRead(BUTTON_TEST_PIN) == LOW) {
          playTone(1500, 100);
          currentState = STATE_COUNTDOWN;
          stateStartTime = millis();
        }
      }
      delay(150);
      break;

    case STATE_COUNTDOWN: {
      unsigned long elapsed = (millis() - stateStartTime) / 1000;
      int remaining = INCUBATION_SECONDS - elapsed;
      if (remaining > 0) {
        updateOled("REACTION INCUBATING", "Time Left: " + String(remaining) + "s", "Keep Chamber Closed");
        if (remaining <= 5) playTone(1000, 50);
        delay(1000);
      } else {
        playTone(2000, 200);
        currentState = STATE_IMAGING;
      }
      break;
    }

    case STATE_IMAGING:
      captureAndAnalyze();
      break;

    case STATE_RESULT:
      updateOled("SCREENING REPORT", lastResultText, "Dashboard Synced");
      if (millis() - stateStartTime > 8000) {
        currentState = STATE_IDLE;
      }
      delay(200);
      break;
  }
}
