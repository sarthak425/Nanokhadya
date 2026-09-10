package com.nanokhadya.repository;

import com.nanokhadya.model.Cartridge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface CartridgeRepository extends JpaRepository<Cartridge, String> {
    Optional<Cartridge> findByCartridgeUid(String cartridgeUid);
    boolean existsByCartridgeUid(String cartridgeUid);
    List<Cartridge> findByBatchNumber(String batchNumber);
}
