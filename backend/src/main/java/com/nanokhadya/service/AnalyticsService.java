package com.nanokhadya.service;

import com.nanokhadya.dto.AnalyticsSummaryDto;
import com.nanokhadya.model.Device;
import com.nanokhadya.repository.DeviceRepository;
import com.nanokhadya.repository.TestSessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AnalyticsService {

    @Autowired
    private TestSessionRepository testSessionRepository;

    @Autowired
    private DeviceRepository deviceRepository;

    public AnalyticsSummaryDto getSummary() {
        long total = testSessionRepository.count();
        long pass = testSessionRepository.countPassScreening();
        long warning = testSessionRepository.countWarning();
        long positive = testSessionRepository.countPositive();
        long invalid = testSessionRepository.countInvalid();
        long activeDevices = deviceRepository.findByStatus(Device.DeviceStatus.ACTIVE).size();

        return new AnalyticsSummaryDto(total, pass, warning, positive, invalid, activeDevices);
    }
}
