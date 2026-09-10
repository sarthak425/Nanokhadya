package com.nanokhadya.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "devices")
public class Device {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "device_serial", unique = true, nullable = false)
    private String deviceSerial;

    @Column(name = "model_version", nullable = false)
    private String modelVersion = "v1.0-ESP32S3";

    @Column(name = "firmware_version", nullable = false)
    private String firmwareVersion = "1.0.0";

    @Column(name = "assigned_location")
    private String assignedLocation;

    @Column(name = "battery_level")
    private Integer batteryLevel = 100;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DeviceStatus status = DeviceStatus.ACTIVE;

    @Column(name = "last_heartbeat")
    private LocalDateTime lastHeartbeat = LocalDateTime.now();

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum DeviceStatus {
        ACTIVE,
        OFFLINE,
        CALIBRATION_REQUIRED,
        DECOMMISSIONED
    }

    public Device() {}

    public Device(String deviceSerial, String modelVersion, String firmwareVersion, String assignedLocation) {
        this.deviceSerial = deviceSerial;
        this.modelVersion = modelVersion;
        this.firmwareVersion = firmwareVersion;
        this.assignedLocation = assignedLocation;
        this.status = DeviceStatus.ACTIVE;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getDeviceSerial() { return deviceSerial; }
    public void setDeviceSerial(String deviceSerial) { this.deviceSerial = deviceSerial; }

    public String getModelVersion() { return modelVersion; }
    public void setModelVersion(String modelVersion) { this.modelVersion = modelVersion; }

    public String getFirmwareVersion() { return firmwareVersion; }
    public void setFirmwareVersion(String firmwareVersion) { this.firmwareVersion = firmwareVersion; }

    public String getAssignedLocation() { return assignedLocation; }
    public void setAssignedLocation(String assignedLocation) { this.assignedLocation = assignedLocation; }

    public Integer getBatteryLevel() { return batteryLevel; }
    public void setBatteryLevel(Integer batteryLevel) { this.batteryLevel = batteryLevel; }

    public DeviceStatus getStatus() { return status; }
    public void setStatus(DeviceStatus status) { this.status = status; }

    public LocalDateTime getLastHeartbeat() { return lastHeartbeat; }
    public void setLastHeartbeat(LocalDateTime lastHeartbeat) { this.lastHeartbeat = lastHeartbeat; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
