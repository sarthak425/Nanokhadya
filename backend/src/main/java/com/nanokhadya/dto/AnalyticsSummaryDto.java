package com.nanokhadya.dto;

public class AnalyticsSummaryDto {
    private long totalTests;
    private long passScreening;
    private long warningSamples;
    private long positiveAdulterated;
    private long invalidTests;
    private long activeDevices;
    private double adulterationRatePercentage;

    public AnalyticsSummaryDto() {}

    public AnalyticsSummaryDto(long totalTests, long passScreening, long warningSamples,
                               long positiveAdulterated, long invalidTests, long activeDevices) {
        this.totalTests = totalTests;
        this.passScreening = passScreening;
        this.warningSamples = warningSamples;
        this.positiveAdulterated = positiveAdulterated;
        this.invalidTests = invalidTests;
        this.activeDevices = activeDevices;
        this.adulterationRatePercentage = totalTests > 0 
                ? Math.round(((double) (warningSamples + positiveAdulterated) / totalTests) * 1000.0) / 10.0 
                : 0.0;
    }

    public long getTotalTests() { return totalTests; }
    public void setTotalTests(long totalTests) { this.totalTests = totalTests; }

    public long getPassScreening() { return passScreening; }
    public void setPassScreening(long passScreening) { this.passScreening = passScreening; }

    public long getWarningSamples() { return warningSamples; }
    public void setWarningSamples(long warningSamples) { this.warningSamples = warningSamples; }

    public long getPositiveAdulterated() { return positiveAdulterated; }
    public void setPositiveAdulterated(long positiveAdulterated) { this.positiveAdulterated = positiveAdulterated; }

    public long getInvalidTests() { return invalidTests; }
    public void setInvalidTests(long invalidTests) { this.invalidTests = invalidTests; }

    public long getActiveDevices() { return activeDevices; }
    public void setActiveDevices(long activeDevices) { this.activeDevices = activeDevices; }

    public double getAdulterationRatePercentage() { return adulterationRatePercentage; }
    public void setAdulterationRatePercentage(double adulterationRatePercentage) { this.adulterationRatePercentage = adulterationRatePercentage; }
}
