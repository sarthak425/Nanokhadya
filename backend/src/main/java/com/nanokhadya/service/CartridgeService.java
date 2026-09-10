package com.nanokhadya.service;

import com.nanokhadya.model.Cartridge;
import com.nanokhadya.repository.CartridgeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class CartridgeService {

    @Autowired
    private CartridgeRepository cartridgeRepository;

    public Optional<Cartridge> verifyCartridge(String cartridgeUid) {
        return cartridgeRepository.findByCartridgeUid(cartridgeUid);
    }

    public Cartridge registerCartridge(String uid, String batchNumber, LocalDate mfgDate, LocalDate expDate) {
        return cartridgeRepository.findByCartridgeUid(uid).orElseGet(() -> {
            Cartridge cartridge = new Cartridge(uid, batchNumber, mfgDate, expDate);
            return cartridgeRepository.save(cartridge);
        });
    }

    public void markAsUsed(Cartridge cartridge) {
        cartridge.setIsUsed(true);
        cartridge.setUsedAt(LocalDateTime.now());
        cartridgeRepository.save(cartridge);
    }

    public List<Cartridge> getAllCartridges() {
        return cartridgeRepository.findAll();
    }
}
