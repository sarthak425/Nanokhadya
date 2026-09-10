package com.nanokhadya.service;

import com.nanokhadya.model.Device;
import com.nanokhadya.repository.DeviceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class DeviceService {

    @Autowired
    private DeviceRepository deviceRepository;

    public Device registerOrUpdateDevice(String serialNumber, String model, String firmware, String location) {
        return deviceRepository.findByDeviceSerial(serialNumber)
                .map(existing -> {
                    existing.setModelVersion(model != null ? model : existing.getModelVersion());
                    existing.setFirmwareVersion(firmware != null ? firmware : existing.getFirmwareVersion());
                    existing.setAssignedLocation(location != null ? location : existing.getAssignedLocation());
                    existing.setLastHeartbeat(LocalDateTime.now());
                    existing.setStatus(Device.DeviceStatus.ACTIVE);
                    return deviceRepository.save(existing);
                })
                .orElseGet(() -> {
                    Device device = new Device(serialNumber, model, firmware, location);
                    return deviceRepository.save(device);
                });
    }

    public void recordHeartbeat(String serialNumber, Integer batteryLevel) {
        deviceRepository.findByDeviceSerial(serialNumber).ifPresent(d -> {
            d.setLastHeartbeat(LocalDateTime.now());
            if (batteryLevel != null) d.setBatteryLevel(batteryLevel);
            d.setStatus(Device.DeviceStatus.ACTIVE);
            deviceRepository.save(d);
        });
    }

    public List<Device> getAllDevices() {
        return deviceRepository.findAll();
    }
}
