package com.nanokhadya.service;

import com.nanokhadya.dto.CreateTestRequest;
import com.nanokhadya.dto.SensorReadingDto;
import com.nanokhadya.model.*;
import com.nanokhadya.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class TestSessionService {

    @Autowired
    private TestSessionRepository testSessionRepository;

    @Autowired
    private DeviceRepository deviceRepository;

    @Autowired
    private CartridgeRepository cartridgeRepository;

    @Autowired
    private FoodSampleRepository foodSampleRepository;

    @Autowired
    private AnalyteRepository analyteRepository;

    @Autowired
    private SensorReadingRepository sensorReadingRepository;

    @Autowired
    private TestResultRepository testResultRepository;

    @Autowired
    private DecisionEngineService decisionEngineService;

    @Autowired
    private CartridgeService cartridgeService;

    @Autowired
    private AuditService auditService;

    @Transactional
    public TestSession createSession(CreateTestRequest req, User operator) {
        Device device = deviceRepository.findByDeviceSerial(req.getDeviceSerial())
                .orElseGet(() -> deviceRepository.save(new Device(req.getDeviceSerial(), "v1.0-ESP32S3", "1.0.0", req.getCollectionSource())));

        Cartridge cartridge = cartridgeRepository.findByCartridgeUid(req.getCartridgeUid())
                .orElseGet(() -> cartridgeRepository.save(new Cartridge(
                        req.getCartridgeUid(),
                        "BATCH-" + System.currentTimeMillis() % 10000,
                        java.time.LocalDate.now().minusDays(5),
                        java.time.LocalDate.now().plusMonths(6)
                )));

        FoodSample sample = foodSampleRepository.findBySampleCode(req.getSampleCode())
                .orElseGet(() -> {
                    FoodSample s = new FoodSample(
                            req.getSampleCode(),
                            req.getFoodCategory(),
                            req.getMilkType(),
                            req.getCollectionSource(),
                            req.getBatchLotNumber(),
                            operator != null ? operator.getFullName() : "Field Operator"
                    );
                    s.setGpsLatitude(req.getGpsLatitude());
                    s.setGpsLongitude(req.getGpsLongitude());
                    return foodSampleRepository.save(s);
                });

        String sessionCode = "TEST-" + System.currentTimeMillis();
        TestSession session = new TestSession(sessionCode, device, cartridge, sample, operator);
        TestSession saved = testSessionRepository.save(session);

        auditService.logAction(
                operator != null ? operator.getId() : "SYSTEM",
                "CREATE_TEST_SESSION",
                "TestSession",
                saved.getId(),
                "Session created with code: " + sessionCode,
                null
        );

        return saved;
    }

    @Transactional
    public TestSession submitReadingsAndAnalyze(String sessionId, List<SensorReadingDto> readingDtos) {
        TestSession session = testSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Test session not found: " + sessionId));

        List<SensorReading> readings = new ArrayList<>();
        for (SensorReadingDto dto : readingDtos) {
            Analyte analyte = null;
            if (dto.getAnalyteId() != null) {
                analyte = analyteRepository.findById(dto.getAnalyteId()).orElse(null);
            }
            if (analyte == null) {
                analyte = analyteRepository.findByZoneIndex(dto.getZoneIndex()).orElse(null);
            }

            SensorReading reading = new SensorReading(
                    session,
                    dto.getZoneIndex(),
                    analyte,
                    dto.getRawR(),
                    dto.getRawG(),
                    dto.getRawB(),
                    dto.getCielabL(),
                    dto.getCielabA(),
                    dto.getCielabB(),
                    dto.getDeltaE()
            );
            reading.setWhiteReferenceDelta(dto.getWhiteReferenceDelta());
            readings.add(reading);
        }

        // Persist readings
        sensorReadingRepository.saveAll(readings);
        session.setSensorReadings(readings);

        // Execute FSSAI Decision Engine
        DecisionEngineService.EvaluationOutcome outcome = decisionEngineService.evaluateSession(session, readings);

        session.setValidityStatus(outcome.getValidityStatus());
        session.setOverallScreeningResult(outcome.getOverallResult());
        session.setStatus(TestSession.SessionStatus.COMPLETED);
        session.setCompletedAt(LocalDateTime.now());

        testResultRepository.saveAll(outcome.getResults());
        session.setTestResults(outcome.getResults());

        // Mark cartridge as used
        if (session.getCartridge() != null) {
            cartridgeService.markAsUsed(session.getCartridge());
        }

        TestSession finalized = testSessionRepository.save(session);

        auditService.logAction(
                session.getOperator() != null ? session.getOperator().getId() : "SYSTEM",
                "ANALYZE_TEST_SESSION",
                "TestSession",
                finalized.getId(),
                "Analyzed result: " + finalized.getOverallScreeningResult(),
                null
        );

        return finalized;
    }

    public List<TestSession> getRecentSessions() {
        return testSessionRepository.findTop50ByOrderByStartedAtDesc();
    }

    public TestSession getSessionById(String id) {
        return testSessionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Test session not found with ID: " + id));
    }
}
