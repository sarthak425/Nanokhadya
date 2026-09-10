package com.nanokhadya.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "test_results")
public class TestResult {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "test_session_id", nullable = false)
    @JsonIgnore
    private TestSession testSession;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "analyte_id", nullable = false)
    private Analyte analyte;

    @Column(nullable = false)
    private Boolean detected;

    @Column(name = "estimated_concentration")
    private Double estimatedConcentration;

    @Column(name = "concentration_unit", length = 16)
    private String concentrationUnit;

    @Column(name = "regulatory_threshold")
    private Double regulatoryThreshold;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ResultStatus status;

    @Column(name = "confidence_score")
    private Double confidenceScore;

    @Column(name = "decision_rationale")
    private String decisionRationale;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum ResultStatus {
        SAFE_WITHIN_LIMITS,
        WARNING_SUSPICIOUS,
        POSITIVE_ADULTERATED,
        INVALID_READING
    }

    public TestResult() {}

    public TestResult(TestSession testSession, Analyte analyte, Boolean detected,
                      Double estimatedConcentration, String concentrationUnit,
                      Double regulatoryThreshold, ResultStatus status,
                      Double confidenceScore, String decisionRationale) {
        this.testSession = testSession;
        this.analyte = analyte;
        this.detected = detected;
        this.estimatedConcentration = estimatedConcentration;
        this.concentrationUnit = concentrationUnit;
        this.regulatoryThreshold = regulatoryThreshold;
        this.status = status;
        this.confidenceScore = confidenceScore;
        this.decisionRationale = decisionRationale;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public TestSession getTestSession() { return testSession; }
    public void setTestSession(TestSession testSession) { this.testSession = testSession; }

    public Analyte getAnalyte() { return analyte; }
    public void setAnalyte(Analyte analyte) { this.analyte = analyte; }

    public Boolean getDetected() { return detected; }
    public void setDetected(Boolean detected) { this.detected = detected; }

    public Double getEstimatedConcentration() { return estimatedConcentration; }
    public void setEstimatedConcentration(Double estimatedConcentration) { this.estimatedConcentration = estimatedConcentration; }

    public String getConcentrationUnit() { return concentrationUnit; }
    public void setConcentrationUnit(String concentrationUnit) { this.concentrationUnit = concentrationUnit; }

    public Double getRegulatoryThreshold() { return regulatoryThreshold; }
    public void setRegulatoryThreshold(Double regulatoryThreshold) { this.regulatoryThreshold = regulatoryThreshold; }

    public ResultStatus getStatus() { return status; }
    public void setStatus(ResultStatus status) { this.status = status; }

    public Double getConfidenceScore() { return confidenceScore; }
    public void setConfidenceScore(Double confidenceScore) { this.confidenceScore = confidenceScore; }

    public String getDecisionRationale() { return decisionRationale; }
    public void setDecisionRationale(String decisionRationale) { this.decisionRationale = decisionRationale; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
