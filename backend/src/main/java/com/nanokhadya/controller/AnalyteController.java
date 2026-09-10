package com.nanokhadya.controller;

import com.nanokhadya.model.Analyte;
import com.nanokhadya.repository.AnalyteRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/analytes")
@Tag(name = "Analytes", description = "Target food adulterants and regulatory threshold metadata")
public class AnalyteController {

    @Autowired
    private AnalyteRepository analyteRepository;

    @GetMapping
    @Operation(summary = "Get list of all target adulterants and their sensing zones")
    public ResponseEntity<List<Analyte>> getAllAnalytes() {
        return ResponseEntity.ok(analyteRepository.findAllByOrderByZoneIndexAsc());
    }
}
