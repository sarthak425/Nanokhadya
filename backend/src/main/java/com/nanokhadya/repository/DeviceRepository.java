package com.nanokhadya.repository;

import com.nanokhadya.model.Device;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface DeviceRepository extends JpaRepository<Device, String> {
    Optional<Device> findByDeviceSerial(String deviceSerial);
    boolean existsByDeviceSerial(String deviceSerial);
    List<Device> findByStatus(Device.DeviceStatus status);
}
