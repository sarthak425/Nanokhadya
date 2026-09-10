package com.nanokhadya;

import com.nanokhadya.model.*;
import com.nanokhadya.repository.AnalyteRepository;
import com.nanokhadya.service.DecisionEngineService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class DecisionEngineServiceTest {

    @Mock
    private AnalyteRepository analyteRepository;

    @InjectMocks
    private DecisionEngineService decisionEngineService;

    private Cartridge validCartridge;
    private Cartridge expiredCartridge;
    private Analyte melamine;
    private Analyte h2o2;
    private Analyte urea;
    private Analyte starch;
    private Analyte neutralizer;

    @BeforeEach
    void setUp() {
        validCartridge = new Cartridge("MC-VALID", "BATCH-1", LocalDate.now().minusDays(5), LocalDate.now().plusMonths(6));
        expiredCartridge = new Cartridge("MC-EXPIRED", "BATCH-0", LocalDate.now().minusMonths(8), LocalDate.now().minusDays(2));

        melamine = new Analyte("Melamine", "MELAMINE", 1, 2.5, "ppm", false, "AuNP", "LSPR");
        h2o2 = new Analyte("Hydrogen Peroxide", "H2O2", 2, 0.0, "ppm", true, "Fe3O4", "TMB");
        urea = new Analyte("Synthetic Urea", "UREA", 3, 700.0, "mg/L", false, "Urease", "pH");
        starch = new Analyte("Starch", "STARCH", 4, 0.0, "% w/v", true, "Lugol", "Amylose");
        neutralizer = new Analyte("Neutralizer", "NEUTRALIZER", 5, 0.0, "pH", true, "BCP", "Alkali");
    }

    @Test
    void testPureMilkSamplePassScreening() {
        TestSession session = new TestSession();
        session.setCartridge(validCartridge);

        List<SensorReading> readings = new ArrayList<>();
        // All zones have minimal delta-E (no color change)
        readings.add(new SensorReading(session, 1, melamine, 200.0, 50.0, 50.0, 55.0, 25.0, 15.0, 1.2));
        readings.add(new SensorReading(session, 2, h2o2, 220.0, 220.0, 220.0, 85.0, 0.5, 1.0, 0.8));
        readings.add(new SensorReading(session, 3, urea, 210.0, 190.0, 50.0, 75.0, 5.0, 45.0, 2.5));
        readings.add(new SensorReading(session, 4, starch, 200.0, 180.0, 70.0, 70.0, 3.0, 30.0, 1.0));
        readings.add(new SensorReading(session, 5, neutralizer, 180.0, 190.0, 60.0, 72.0, -5.0, 25.0, 1.5));
        readings.add(new SensorReading(session, 6, null, 245.0, 245.0, 245.0, 95.0, 0.0, 0.0, 0.5)); // White tile

        DecisionEngineService.EvaluationOutcome outcome = decisionEngineService.evaluateSession(session, readings);

        assertEquals(TestSession.ValidityStatus.VALID, outcome.getValidityStatus());
        assertEquals(TestSession.OverallResult.PASS_SCREENING, outcome.getOverallResult());
        assertEquals(5, outcome.getResults().size());
        for (TestResult tr : outcome.getResults()) {
            assertEquals(TestResult.ResultStatus.SAFE_WITHIN_LIMITS, tr.getStatus());
        }
    }

    @Test
    void testMelamineAdulterationPositiveScreening() {
        TestSession session = new TestSession();
        session.setCartridge(validCartridge);

        List<SensorReading> readings = new ArrayList<>();
        // Zone 1 Melamine high Delta-E (aggregation shift)
        readings.add(new SensorReading(session, 1, melamine, 110.0, 60.0, 180.0, 42.0, 18.0, -25.0, 9.5));
        readings.add(new SensorReading(session, 2, h2o2, 220.0, 220.0, 220.0, 85.0, 0.5, 1.0, 0.8));
        readings.add(new SensorReading(session, 3, urea, 210.0, 190.0, 50.0, 75.0, 5.0, 45.0, 2.5));
        readings.add(new SensorReading(session, 4, starch, 200.0, 180.0, 70.0, 70.0, 3.0, 30.0, 1.0));
        readings.add(new SensorReading(session, 5, neutralizer, 180.0, 190.0, 60.0, 72.0, -5.0, 25.0, 1.5));
        readings.add(new SensorReading(session, 6, null, 245.0, 245.0, 245.0, 95.0, 0.0, 0.0, 0.5));

        DecisionEngineService.EvaluationOutcome outcome = decisionEngineService.evaluateSession(session, readings);

        assertEquals(TestSession.ValidityStatus.VALID, outcome.getValidityStatus());
        assertEquals(TestSession.OverallResult.POSITIVE_SCREENING, outcome.getOverallResult());

        TestResult melamineResult = outcome.getResults().stream()
                .filter(r -> r.getAnalyte().getCodeIdentifier().equals("MELAMINE"))
                .findFirst().orElseThrow();

        assertTrue(melamineResult.getDetected());
        assertEquals(TestResult.ResultStatus.POSITIVE_ADULTERATED, melamineResult.getStatus());
        assertTrue(melamineResult.getEstimatedConcentration() >= 2.5);
    }

    @Test
    void testExpiredCartridgeRejected() {
        TestSession session = new TestSession();
        session.setCartridge(expiredCartridge);

        List<SensorReading> readings = new ArrayList<>();
        DecisionEngineService.EvaluationOutcome outcome = decisionEngineService.evaluateSession(session, readings);

        assertEquals(TestSession.ValidityStatus.INVALID_EXPIRED_CARTRIDGE, outcome.getValidityStatus());
        assertEquals(TestSession.OverallResult.INVALID_TEST, outcome.getOverallResult());
    }

    @Test
    void testOpticalSaturationRejected() {
        TestSession session = new TestSession();
        session.setCartridge(validCartridge);

        List<SensorReading> readings = new ArrayList<>();
        // White reference tile saturated (L* > 99.0 or < 40.0)
        readings.add(new SensorReading(session, 6, null, 255.0, 255.0, 255.0, 100.0, 0.0, 0.0, 30.0));

        DecisionEngineService.EvaluationOutcome outcome = decisionEngineService.evaluateSession(session, readings);

        assertEquals(TestSession.ValidityStatus.INVALID_OPTICAL_SATURATION, outcome.getValidityStatus());
        assertEquals(TestSession.OverallResult.INVALID_TEST, outcome.getOverallResult());
    }
}
