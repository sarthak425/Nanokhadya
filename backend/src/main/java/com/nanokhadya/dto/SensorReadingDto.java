package com.nanokhadya.dto;

import jakarta.validation.constraints.NotNull;

public class SensorReadingDto {

    @NotNull
    private Integer zoneIndex;

    private Long analyteId;

    @NotNull
    private Double rawR;

    @NotNull
    private Double rawG;

    @NotNull
    private Double rawB;

    @NotNull
    private Double cielabL;

    @NotNull
    private Double cielabA;

    @NotNull
    private Double cielabB;

    @NotNull
    private Double deltaE;

    private Double whiteReferenceDelta = 0.0;

    public SensorReadingDto() {}

    public SensorReadingDto(Integer zoneIndex, Long analyteId, Double rawR, Double rawG, Double rawB,
                            Double cielabL, Double cielabA, Double cielabB, Double deltaE) {
        this.zoneIndex = zoneIndex;
        this.analyteId = analyteId;
        this.rawR = rawR;
        this.rawG = rawG;
        this.rawB = rawB;
        this.cielabL = cielabL;
        this.cielabA = cielabA;
        this.cielabB = cielabB;
        this.deltaE = deltaE;
    }

    public Integer getZoneIndex() { return zoneIndex; }
    public void setZoneIndex(Integer zoneIndex) { this.zoneIndex = zoneIndex; }

    public Long getAnalyteId() { return analyteId; }
    public void setAnalyteId(Long analyteId) { this.analyteId = analyteId; }

    public Double getRawR() { return rawR; }
    public void setRawR(Double rawR) { this.rawR = rawR; }

    public Double getRawG() { return rawG; }
    public void setRawG(Double rawG) { this.rawG = rawG; }

    public Double getRawB() { return rawB; }
    public void setRawB(Double rawB) { this.rawB = rawB; }

    public Double getCielabL() { return cielabL; }
    public void setCielabL(Double cielabL) { this.cielabL = cielabL; }

    public Double getCielabA() { return cielabA; }
    public void setCielabA(Double cielabA) { this.cielabA = cielabA; }

    public Double getCielabB() { return cielabB; }
    public void setCielabB(Double cielabB) { this.cielabB = cielabB; }

    public Double getDeltaE() { return deltaE; }
    public void setDeltaE(Double deltaE) { this.deltaE = deltaE; }

    public Double getWhiteReferenceDelta() { return whiteReferenceDelta; }
    public void setWhiteReferenceDelta(Double whiteReferenceDelta) { this.whiteReferenceDelta = whiteReferenceDelta; }
}
