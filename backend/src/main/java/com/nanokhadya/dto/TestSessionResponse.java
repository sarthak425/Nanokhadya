package com.nanokhadya.dto;

import com.nanokhadya.model.SensorReading;
import com.nanokhadya.model.TestResult;
import com.nanokhadya.model.TestSession;

import java.time.LocalDateTime;
import java.util.List;

public class TestSessionResponse {

    private String id;
    private String sessionCode;
    private String deviceSerial;
    private String cartridgeUid;
    private String sampleCode;
    private String foodCategory;
    private String foodItem;
    private String milkType;
    private String collectionSource;
    private String operatorName;
    private TestSession.SessionStatus status;
    private TestSession.ValidityStatus validityStatus;
    private TestSession.OverallResult overallScreeningResult;
    private String rawImageUrl;
    private String processedImageUrl;
    private Integer reactionDurationSeconds;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private List<SensorReading> sensorReadings;
    private List<TestResult> testResults;

    public TestSessionResponse() {}

    public static TestSessionResponse fromEntity(TestSession session) {
        TestSessionResponse resp = new TestSessionResponse();
        resp.setId(session.getId());
        resp.setSessionCode(session.getSessionCode());
        resp.setDeviceSerial(session.getDevice() != null ? session.getDevice().getDeviceSerial() : null);
        resp.setCartridgeUid(session.getCartridge() != null ? session.getCartridge().getCartridgeUid() : null);
        resp.setSampleCode(session.getSample() != null ? session.getSample().getSampleCode() : null);
        resp.setFoodCategory(session.getSample() != null && session.getSample().getFoodCategory() != null ? session.getSample().getFoodCategory().name() : null);
        resp.setFoodItem(session.getSample() != null ? session.getSample().getFoodItem() : null);
        resp.setMilkType(session.getSample() != null && session.getSample().getMilkType() != null ? session.getSample().getMilkType().name() : null);
        resp.setCollectionSource(session.getSample() != null ? session.getSample().getCollectionSource() : null);
        resp.setOperatorName(session.getOperator() != null ? session.getOperator().getFullName() : "Field Operator");
        resp.setStatus(session.getStatus());
        resp.setValidityStatus(session.getValidityStatus());
        resp.setOverallScreeningResult(session.getOverallScreeningResult());
        resp.setRawImageUrl(session.getRawImageUrl());
        resp.setProcessedImageUrl(session.getProcessedImageUrl());
        resp.setReactionDurationSeconds(session.getReactionDurationSeconds());
        resp.setStartedAt(session.getStartedAt());
        resp.setCompletedAt(session.getCompletedAt());
        resp.setSensorReadings(session.getSensorReadings());
        resp.setTestResults(session.getTestResults());
        return resp;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getSessionCode() { return sessionCode; }
    public void setSessionCode(String sessionCode) { this.sessionCode = sessionCode; }

    public String getDeviceSerial() { return deviceSerial; }
    public void setDeviceSerial(String deviceSerial) { this.deviceSerial = deviceSerial; }

    public String getCartridgeUid() { return cartridgeUid; }
    public void setCartridgeUid(String cartridgeUid) { this.cartridgeUid = cartridgeUid; }

    public String getSampleCode() { return sampleCode; }
    public void setSampleCode(String sampleCode) { this.sampleCode = sampleCode; }

    public String getFoodCategory() { return foodCategory; }
    public void setFoodCategory(String foodCategory) { this.foodCategory = foodCategory; }

    public String getFoodItem() { return foodItem; }
    public void setFoodItem(String foodItem) { this.foodItem = foodItem; }

    public String getMilkType() { return milkType; }
    public void setMilkType(String milkType) { this.milkType = milkType; }

    public String getCollectionSource() { return collectionSource; }
    public void setCollectionSource(String collectionSource) { this.collectionSource = collectionSource; }

    public String getOperatorName() { return operatorName; }
    public void setOperatorName(String operatorName) { this.operatorName = operatorName; }

    public TestSession.SessionStatus getStatus() { return status; }
    public void setStatus(TestSession.SessionStatus status) { this.status = status; }

    public TestSession.ValidityStatus getValidityStatus() { return validityStatus; }
    public void setValidityStatus(TestSession.ValidityStatus validityStatus) { this.validityStatus = validityStatus; }

    public TestSession.OverallResult getOverallScreeningResult() { return overallScreeningResult; }
    public void setOverallScreeningResult(TestSession.OverallResult overallScreeningResult) { this.overallScreeningResult = overallScreeningResult; }

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
