package com.nanokhadya.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "sensor_readings")
public class SensorReading {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "test_session_id", nullable = false)
    @JsonIgnore
    private TestSession testSession;

    @Column(name = "zone_index", nullable = false)
    private Integer zoneIndex;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "analyte_id")
    private Analyte analyte;

    @Column(name = "raw_r", nullable = false)
    private Double rawR;

    @Column(name = "raw_g", nullable = false)
    private Double rawG;

    @Column(name = "raw_b", nullable = false)
    private Double rawB;

    @Column(name = "cielab_l", nullable = false)
    private Double cielabL;

    @Column(name = "cielab_a", nullable = false)
    private Double cielabA;

    @Column(name = "cielab_b", nullable = false)
    private Double cielabB;

    @Column(name = "delta_e", nullable = false)
    private Double deltaE;

    @Column(name = "white_reference_delta")
    private Double whiteReferenceDelta = 0.0;

    public SensorReading() {}

    public SensorReading(TestSession testSession, Integer zoneIndex, Analyte analyte,
                         Double rawR, Double rawG, Double rawB,
                         Double cielabL, Double cielabA, Double cielabB, Double deltaE) {
        this.testSession = testSession;
        this.zoneIndex = zoneIndex;
        this.analyte = analyte;
        this.rawR = rawR;
        this.rawG = rawG;
        this.rawB = rawB;
        this.cielabL = cielabL;
        this.cielabA = cielabA;
        this.cielabB = cielabB;
        this.deltaE = deltaE;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public TestSession getTestSession() { return testSession; }
    public void setTestSession(TestSession testSession) { this.testSession = testSession; }

    public Integer getZoneIndex() { return zoneIndex; }
    public void setZoneIndex(Integer zoneIndex) { this.zoneIndex = zoneIndex; }

    public Analyte getAnalyte() { return analyte; }
    public void setAnalyte(Analyte analyte) { this.analyte = analyte; }

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
