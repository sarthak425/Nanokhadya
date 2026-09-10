package com.nanokhadya.model;

import jakarta.persistence.*;

@Entity
@Table(name = "analytes")
public class Analyte {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(name = "code_identifier", nullable = false, unique = true, length = 16)
    private String codeIdentifier;

    @Column(name = "cas_number", length = 32)
    private String casNumber;

    @Column(name = "zone_index", nullable = false)
    private Integer zoneIndex;

    @Column(name = "regulatory_threshold_fssai")
    private Double regulatoryThresholdFssai;

    @Column(nullable = false, length = 16)
    private String unit;

    @Column(name = "zero_tolerance", nullable = false)
    private Boolean zeroTolerance = true;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "sensing_nanomaterial")
    private String sensingNanomaterial;

    @Column(name = "commodity_category", length = 32)
    private String commodityCategory = "DAIRY";

    public Analyte() {}

    public Analyte(String name, String codeIdentifier, Integer zoneIndex, Double regulatoryThresholdFssai, 
                   String unit, Boolean zeroTolerance, String sensingNanomaterial, String description) {
        this.name = name;
        this.codeIdentifier = codeIdentifier;
        this.zoneIndex = zoneIndex;
        this.regulatoryThresholdFssai = regulatoryThresholdFssai;
        this.unit = unit;
        this.zeroTolerance = zeroTolerance;
        this.sensingNanomaterial = sensingNanomaterial;
        this.description = description;
        this.commodityCategory = "DAIRY";
    }

    public Analyte(String name, String codeIdentifier, Integer zoneIndex, Double regulatoryThresholdFssai, 
                   String unit, Boolean zeroTolerance, String sensingNanomaterial, String description, String commodityCategory) {
        this.name = name;
        this.codeIdentifier = codeIdentifier;
        this.zoneIndex = zoneIndex;
        this.regulatoryThresholdFssai = regulatoryThresholdFssai;
        this.unit = unit;
        this.zeroTolerance = zeroTolerance;
        this.sensingNanomaterial = sensingNanomaterial;
        this.description = description;
        this.commodityCategory = commodityCategory;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCodeIdentifier() { return codeIdentifier; }
    public void setCodeIdentifier(String codeIdentifier) { this.codeIdentifier = codeIdentifier; }

    public String getCasNumber() { return casNumber; }
    public void setCasNumber(String casNumber) { this.casNumber = casNumber; }

    public Integer getZoneIndex() { return zoneIndex; }
    public void setZoneIndex(Integer zoneIndex) { this.zoneIndex = zoneIndex; }

    public Double getRegulatoryThresholdFssai() { return regulatoryThresholdFssai; }
    public void setRegulatoryThresholdFssai(Double regulatoryThresholdFssai) { this.regulatoryThresholdFssai = regulatoryThresholdFssai; }

    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }

    public Boolean getZeroTolerance() { return zeroTolerance; }
    public void setZeroTolerance(Boolean zeroTolerance) { this.zeroTolerance = zeroTolerance; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getSensingNanomaterial() { return sensingNanomaterial; }
    public void setSensingNanomaterial(String sensingNanomaterial) { this.sensingNanomaterial = sensingNanomaterial; }

    public String getCommodityCategory() { return commodityCategory; }
    public void setCommodityCategory(String commodityCategory) { this.commodityCategory = commodityCategory; }
}
