package com.nanokhadya.controller;

import com.nanokhadya.model.FoodSample;
import com.nanokhadya.service.SampleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/samples")
@Tag(name = "Food Samples", description = "Milk food sample management and traceability")
public class SampleController {

    @Autowired
    private SampleService sampleService;

    @GetMapping
    @Operation(summary = "List recent food samples collected")
    public ResponseEntity<List<FoodSample>> getRecentSamples() {
        return ResponseEntity.ok(sampleService.getRecentSamples());
    }
}
