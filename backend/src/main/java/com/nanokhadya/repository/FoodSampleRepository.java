package com.nanokhadya.repository;

import com.nanokhadya.model.FoodSample;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface FoodSampleRepository extends JpaRepository<FoodSample, String> {
    Optional<FoodSample> findBySampleCode(String sampleCode);
    boolean existsBySampleCode(String sampleCode);
    List<FoodSample> findTop20ByOrderByCollectedAtDesc();
}
