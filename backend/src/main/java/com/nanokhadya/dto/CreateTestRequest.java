package com.nanokhadya.dto;

import com.nanokhadya.model.FoodSample;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CreateTestRequest {

    @NotBlank
    private String deviceSerial;

    @NotBlank
    private String cartridgeUid;

    @NotBlank
    private String sampleCode;

    private String foodCategory = "MILK";

    @NotNull
    private FoodSample.MilkType milkType = FoodSample.MilkType.COW;

    @NotBlank
    private String collectionSource;

    private String batchLotNumber;

    private Double gpsLatitude;

    private Double gpsLongitude;

    public CreateTestRequest() {}

    public String getDeviceSerial() { return deviceSerial; }
    public void setDeviceSerial(String deviceSerial) { this.deviceSerial = deviceSerial; }

    public String getCartridgeUid() { return cartridgeUid; }
    public void setCartridgeUid(String cartridgeUid) { this.cartridgeUid = cartridgeUid; }

    public String getSampleCode() { return sampleCode; }
    public void setSampleCode(String sampleCode) { this.sampleCode = sampleCode; }

    public String getFoodCategory() { return foodCategory; }
    public void setFoodCategory(String foodCategory) { this.foodCategory = foodCategory; }

    public FoodSample.MilkType getMilkType() { return milkType; }
    public void setMilkType(FoodSample.MilkType milkType) { this.milkType = milkType; }

    public String getCollectionSource() { return collectionSource; }
    public void setCollectionSource(String collectionSource) { this.collectionSource = collectionSource; }

    public String getBatchLotNumber() { return batchLotNumber; }
    public void setBatchLotNumber(String batchLotNumber) { this.batchLotNumber = batchLotNumber; }

    public Double getGpsLatitude() { return gpsLatitude; }
    public void setGpsLatitude(Double gpsLatitude) { this.gpsLatitude = gpsLatitude; }

    public Double getGpsLongitude() { return gpsLongitude; }
    public void setGpsLongitude(Double gpsLongitude) { this.gpsLongitude = gpsLongitude; }
}
