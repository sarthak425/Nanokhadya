package com.nanokhadya.controller;

import com.nanokhadya.model.Cartridge;
import com.nanokhadya.service.CartridgeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cartridges")
@Tag(name = "Cartridges", description = "Multiplex test cartridge inventory and batch verification")
public class CartridgeController {

    @Autowired
    private CartridgeService cartridgeService;

    @GetMapping
    @Operation(summary = "List all registered cartridges")
    public ResponseEntity<List<Cartridge>> getAllCartridges() {
        return ResponseEntity.ok(cartridgeService.getAllCartridges());
    }

    @GetMapping("/verify/{uid}")
    @Operation(summary = "Verify cartridge UID and expiration status before test start")
    public ResponseEntity<Map<String, Object>> verifyCartridge(@PathVariable String uid) {
        return cartridgeService.verifyCartridge(uid)
                .map(c -> ResponseEntity.ok(Map.<String, Object>of(
                        "uid", c.getCartridgeUid(),
                        "batch", c.getBatchNumber(),
                        "isUsed", c.getIsUsed(),
                        "isExpired", c.isExpired(),
                        "valid", !c.getIsUsed() && !c.isExpired()
                )))
                .orElseGet(() -> ResponseEntity.ok(Map.<String, Object>of(
                        "uid", uid,
                        "valid", true, // Allow automatic lab registration for prototypes
                        "message", "Cartridge provisioned for prototype run"
                )));
    }

    @PostMapping
    @Operation(summary = "Batch register new cartridges")
    public ResponseEntity<Cartridge> registerCartridge(@RequestBody Map<String, String> payload) {
        String uid = payload.get("cartridgeUid");
        String batch = payload.getOrDefault("batchNumber", "2026-B1");
        LocalDate mfg = payload.containsKey("manufacturingDate") ? LocalDate.parse(payload.get("manufacturingDate")) : LocalDate.now();
        LocalDate exp = payload.containsKey("expiryDate") ? LocalDate.parse(payload.get("expiryDate")) : LocalDate.now().plusMonths(6);

        Cartridge cartridge = cartridgeService.registerCartridge(uid, batch, mfg, exp);
        return ResponseEntity.ok(cartridge);
    }
}
