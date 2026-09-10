package com.nanokhadya.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "test_sessions")
public class TestSession {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "session_code", unique = true, nullable = false)
    private String sessionCode;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "device_id", nullable = false)
    private Device device;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "cartridge_id", nullable = false)
    private Cartridge cartridge;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "sample_id", nullable = false)
    private FoodSample sample;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "operator_id")
    private User operator;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SessionStatus status = SessionStatus.INITIATED;

    @Enumerated(EnumType.STRING)
    @Column(name = "validity_status", nullable = false)
    private ValidityStatus validityStatus = ValidityStatus.PENDING_EVALUATION;

    @Enumerated(EnumType.STRING)
    @Column(name = "overall_screening_result", nullable = false)
    private OverallResult overallScreeningResult = OverallResult.PENDING;

    @Column(name = "raw_image_url")
    private String rawImageUrl;

    @Column(name = "processed_image_url")
    private String processedImageUrl;

    @Column(name = "reaction_duration_seconds")
    private Integer reactionDurationSeconds = 60;

    @Column(name = "started_at", updatable = false)
    private LocalDateTime startedAt = LocalDateTime.now();

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @OneToMany(mappedBy = "testSession", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SensorReading> sensorReadings = new ArrayList<>();

    @OneToMany(mappedBy = "testSession", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TestResult> testResults = new ArrayList<>();

    public enum SessionStatus {
        INITIATED,
        INCUBATING,
        IMAGING,
        ANALYZING,
        COMPLETED,
        FAILED
    }

    public enum ValidityStatus {
        PENDING_EVALUATION,
        VALID,
        INVALID_INSUFFICIENT_SAMPLE,
        INVALID_OPTICAL_SATURATION,
        INVALID_EXPIRED_CARTRIDGE,
        INVALID_CHAMBER_AJAR
    }

    public enum OverallResult {
        PENDING,
        PASS_SCREENING,
        WARNING_SUSPICIOUS,
        POSITIVE_SCREENING,
        INVALID_TEST
    }

    public TestSession() {}

    public TestSession(String sessionCode, Device device, Cartridge cartridge, FoodSample sample, User operator) {
        this.sessionCode = sessionCode;
        this.device = device;
        this.cartridge = cartridge;
        this.sample = sample;
        this.operator = operator;
        this.status = SessionStatus.INITIATED;
        this.validityStatus = ValidityStatus.PENDING_EVALUATION;
        this.overallScreeningResult = OverallResult.PENDING;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getSessionCode() { return sessionCode; }
    public void setSessionCode(String sessionCode) { this.sessionCode = sessionCode; }

    public Device getDevice() { return device; }
    public void setDevice(Device device) { this.device = device; }

    public Cartridge getCartridge() { return cartridge; }
    public void setCartridge(Cartridge cartridge) { this.cartridge = cartridge; }

    public FoodSample getSample() { return sample; }
    public void setSample(FoodSample sample) { this.sample = sample; }

    public User getOperator() { return operator; }
    public void setOperator(User operator) { this.operator = operator; }

    public SessionStatus getStatus() { return status; }
    public void setStatus(SessionStatus status) { this.status = status; }

    public ValidityStatus getValidityStatus() { return validityStatus; }
    public void setValidityStatus(ValidityStatus validityStatus) { this.validityStatus = validityStatus; }

    public OverallResult getOverallScreeningResult() { return overallScreeningResult; }
    public void setOverallScreeningResult(OverallResult overallScreeningResult) { this.overallScreeningResult = overallScreeningResult; }

    public String getRawImageUrl() { return rawImageUrl; }
    public void setRawImageUrl(String rawImageUrl) { this.rawImageUrl = rawImageUrl; }

    public String getProcessedImageUrl() { return processedImageUrl; }
    public void setProcessedImageUrl(String processedImageUrl) { this.processedImageUrl = processedImageUrl; }

    public Integer getReactionDurationSeconds() { return reactionDurationSeconds; }
    public void setReactionDurationSeconds(Integer reactionDurationSeconds) { this.reactionDurationSeconds = reactionDurationSeconds; }

    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }

    public List<SensorReading> getSensorReadings() { return sensorReadings; }
    public void setSensorReadings(List<SensorReading> sensorReadings) { this.sensorReadings = sensorReadings; }

    public List<TestResult> getTestResults() { return testResults; }
    public void setTestResults(List<TestResult> testResults) { this.testResults = testResults; }
}
