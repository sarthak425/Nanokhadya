package com.nanokhadya.controller;

import com.nanokhadya.model.Device;
import com.nanokhadya.service.DeviceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/devices")
@Tag(name = "Devices", description = "Portable Reader hardware management and heartbeat APIs")
public class DeviceController {

    @Autowired
    private DeviceService deviceService;

    @GetMapping
    @Operation(summary = "List all registered portable readers")
    public ResponseEntity<List<Device>> getAllDevices() {
        return ResponseEntity.ok(deviceService.getAllDevices());
    }

    @PostMapping("/register")
    @Operation(summary = "Register or update an ESP32-S3 portable reader")
    public ResponseEntity<Device> registerDevice(@RequestBody Map<String, String> payload) {
        String serial = payload.get("deviceSerial");
        String model = payload.getOrDefault("modelVersion", "v1.0-ESP32S3");
        String firmware = payload.getOrDefault("firmwareVersion", "1.0.0");
        String location = payload.getOrDefault("assignedLocation", "Field Station");

        Device device = deviceService.registerOrUpdateDevice(serial, model, firmware, location);
        return ResponseEntity.ok(device);
    }

    @PostMapping("/heartbeat")
    @Operation(summary = "Record heartbeat and battery status from reader")
    public ResponseEntity<Map<String, String>> heartbeat(@RequestBody Map<String, Object> payload) {
        String serial = (String) payload.get("deviceSerial");
        Integer battery = payload.containsKey("batteryLevel") ? (Integer) payload.get("batteryLevel") : 100;

        deviceService.recordHeartbeat(serial, battery);
        return ResponseEntity.ok(Map.of("status", "HEARTBEAT_ACKNOWLEDGED"));
    }
}
