package com.nanokhadya.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "food_samples")
public class FoodSample {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "sample_code", unique = true, nullable = false)
    private String sampleCode;

    @Enumerated(EnumType.STRING)
    @Column(name = "food_category", nullable = false)
    private FoodCategory foodCategory = FoodCategory.DAIRY;

    @Column(name = "food_item", nullable = false)
    private String foodItem = "MILK";

    @Enumerated(EnumType.STRING)
    @Column(name = "milk_type")
    private MilkType milkType = MilkType.COW;

    @Column(name = "collection_source", nullable = false)
    private String collectionSource;

    @Column(name = "batch_lot_number")
    private String batchLotNumber;

    @Column(name = "collector_name")
    private String collectorName;

    @Column(name = "gps_latitude")
    private Double gpsLatitude;

    @Column(name = "gps_longitude")
    private Double gpsLongitude;

    @Column(name = "collected_at", nullable = false)
    private LocalDateTime collectedAt = LocalDateTime.now();

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum FoodCategory {
        DAIRY,
        HONEY,
        SPICES,
        EDIBLE_OILS,
        VEGETABLES,
        BEVERAGES
    }

    public enum MilkType {
        COW,
        BUFFALO,
        MIXED,
        PACKAGED_PASTEURIZED,
        NOT_APPLICABLE
    }

    public FoodSample() {}

    public FoodSample(String sampleCode, String foodItem, MilkType milkType, String collectionSource, String batchLotNumber, String collectorName) {
        this(sampleCode, FoodCategory.DAIRY, foodItem, milkType, collectionSource, batchLotNumber, collectorName);
    }

    public FoodSample(String sampleCode, FoodCategory foodCategory, String foodItem, MilkType milkType, String collectionSource, String batchLotNumber, String collectorName) {
        this.sampleCode = sampleCode;
        this.foodCategory = foodCategory != null ? foodCategory : FoodCategory.DAIRY;
        this.foodItem = foodItem != null ? foodItem : "MILK";
        this.milkType = milkType != null ? milkType : MilkType.NOT_APPLICABLE;
        this.collectionSource = collectionSource;
        this.batchLotNumber = batchLotNumber;
        this.collectorName = collectorName;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getSampleCode() { return sampleCode; }
    public void setSampleCode(String sampleCode) { this.sampleCode = sampleCode; }

    public FoodCategory getFoodCategory() { return foodCategory; }
    public void setFoodCategory(FoodCategory foodCategory) { this.foodCategory = foodCategory; }

    public String getFoodItem() { return foodItem; }
    public void setFoodItem(String foodItem) { this.foodItem = foodItem; }

    public MilkType getMilkType() { return milkType; }
    public void setMilkType(MilkType milkType) { this.milkType = milkType; }

    public String getCollectionSource() { return collectionSource; }
    public void setCollectionSource(String collectionSource) { this.collectionSource = collectionSource; }

    public String getBatchLotNumber() { return batchLotNumber; }
    public void setBatchLotNumber(String batchLotNumber) { this.batchLotNumber = batchLotNumber; }

    public String getCollectorName() { return collectorName; }
    public void setCollectorName(String collectorName) { this.collectorName = collectorName; }

    public Double getGpsLatitude() { return gpsLatitude; }
    public void setGpsLatitude(Double gpsLatitude) { this.gpsLatitude = gpsLatitude; }

    public Double getGpsLongitude() { return gpsLongitude; }
    public void setGpsLongitude(Double gpsLongitude) { this.gpsLongitude = gpsLongitude; }

    public LocalDateTime getCollectedAt() { return collectedAt; }
    public void setCollectedAt(LocalDateTime collectedAt) { this.collectedAt = collectedAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
