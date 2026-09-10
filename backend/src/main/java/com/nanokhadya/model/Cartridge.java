package com.nanokhadya.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "cartridges")
public class Cartridge {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "cartridge_uid", unique = true, nullable = false)
    private String cartridgeUid;

    @Column(name = "batch_number", nullable = false)
    private String batchNumber;

    @Column(name = "manufacturing_date", nullable = false)
    private LocalDate manufacturingDate;

    @Column(name = "expiry_date", nullable = false)
    private LocalDate expiryDate;

    @Column(name = "is_used", nullable = false)
    private Boolean isUsed = false;

    @Column(name = "used_at")
    private LocalDateTime usedAt;

    @Column(name = "calibration_data_json", columnDefinition = "TEXT")
    private String calibrationDataJson;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Cartridge() {}

    public Cartridge(String cartridgeUid, String batchNumber, LocalDate manufacturingDate, LocalDate expiryDate) {
        this.cartridgeUid = cartridgeUid;
        this.batchNumber = batchNumber;
        this.manufacturingDate = manufacturingDate;
        this.expiryDate = expiryDate;
        this.isUsed = false;
    }

    public boolean isExpired() {
        return LocalDate.now().isAfter(this.expiryDate);
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getCartridgeUid() { return cartridgeUid; }
    public void setCartridgeUid(String cartridgeUid) { this.cartridgeUid = cartridgeUid; }

    public String getBatchNumber() { return batchNumber; }
    public void setBatchNumber(String batchNumber) { this.batchNumber = batchNumber; }

    public LocalDate getManufacturingDate() { return manufacturingDate; }
    public void setManufacturingDate(LocalDate manufacturingDate) { this.manufacturingDate = manufacturingDate; }

    public LocalDate getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDate expiryDate) { this.expiryDate = expiryDate; }

    public Boolean getIsUsed() { return isUsed; }
    public void setIsUsed(Boolean isUsed) { this.isUsed = isUsed; }

    public LocalDateTime getUsedAt() { return usedAt; }
    public void setUsedAt(LocalDateTime usedAt) { this.usedAt = usedAt; }

    public String getCalibrationDataJson() { return calibrationDataJson; }
    public void setCalibrationDataJson(String calibrationDataJson) { this.calibrationDataJson = calibrationDataJson; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
