package com.nanokhadya.controller;

import com.nanokhadya.dto.AnalyticsSummaryDto;
import com.nanokhadya.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analytics")
@Tag(name = "Analytics", description = "Food safety metrics and adulteration prevalence data")
public class AnalyticsController {

    @Autowired
    private AnalyticsService analyticsService;

    @GetMapping
    @Operation(summary = "Get overview safety metrics (safe, warning, adulterated, total tests)")
    public ResponseEntity<AnalyticsSummaryDto> getSummary() {
        return ResponseEntity.ok(analyticsService.getSummary());
    }
}
