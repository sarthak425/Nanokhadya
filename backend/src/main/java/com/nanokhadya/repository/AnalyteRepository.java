package com.nanokhadya.repository;

import com.nanokhadya.model.Analyte;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface AnalyteRepository extends JpaRepository<Analyte, Long> {
    Optional<Analyte> findByCodeIdentifier(String codeIdentifier);
    Optional<Analyte> findByZoneIndex(Integer zoneIndex);
    List<Analyte> findAllByOrderByZoneIndexAsc();
    List<Analyte> findByCommodityCategory(String commodityCategory);
}
