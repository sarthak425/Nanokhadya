package com.nanokhadya.service;

import com.nanokhadya.model.FoodSample;
import com.nanokhadya.repository.FoodSampleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SampleService {

    @Autowired
    private FoodSampleRepository sampleRepository;

    public FoodSample getOrCreateSample(String sampleCode, String foodCategory, FoodSample.MilkType milkType,
                                        String collectionSource, String batchLot, String collector,
                                        Double latitude, Double longitude) {
        return sampleRepository.findBySampleCode(sampleCode)
                .orElseGet(() -> {
                    FoodSample sample = new FoodSample(sampleCode, foodCategory, milkType, collectionSource, batchLot, collector);
                    sample.setGpsLatitude(latitude);
                    sample.setGpsLongitude(longitude);
                    return sampleRepository.save(sample);
                });
    }

    public List<FoodSample> getRecentSamples() {
        return sampleRepository.findTop20ByOrderByCollectedAtDesc();
    }
}
