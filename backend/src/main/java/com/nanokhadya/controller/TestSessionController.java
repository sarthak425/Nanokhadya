package com.nanokhadya.controller;

import com.nanokhadya.dto.CreateTestRequest;
import com.nanokhadya.dto.SensorReadingDto;
import com.nanokhadya.dto.TestSessionResponse;
import com.nanokhadya.model.TestSession;
import com.nanokhadya.model.User;
import com.nanokhadya.service.TestSessionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tests")
@Tag(name = "Test Sessions", description = "Endpoints for initiating and evaluating rapid food tests")
public class TestSessionController {

    @Autowired
    private TestSessionService testSessionService;

    @PostMapping
    @Operation(summary = "Initiate a new rapid test session")
    public ResponseEntity<TestSessionResponse> createTest(
            @Valid @RequestBody CreateTestRequest request,
            @AuthenticationPrincipal User operator) {
        TestSession session = testSessionService.createSession(request, operator);
        return ResponseEntity.ok(TestSessionResponse.fromEntity(session));
    }

    @PostMapping("/{id}/readings")
    @Operation(summary = "Submit optical sensor readings from portable reader and run FSSAI analysis")
    public ResponseEntity<TestSessionResponse> submitReadings(
            @PathVariable String id,
            @RequestBody List<SensorReadingDto> readings) {
        TestSession analyzed = testSessionService.submitReadingsAndAnalyze(id, readings);
        return ResponseEntity.ok(TestSessionResponse.fromEntity(analyzed));
    }

    @GetMapping
    @Operation(summary = "Get list of recent test sessions")
    public ResponseEntity<List<TestSessionResponse>> getAllTests() {
        List<TestSessionResponse> list = testSessionService.getRecentSessions().stream()
                .map(TestSessionResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get complete test report by ID")
    public ResponseEntity<TestSessionResponse> getTestById(@PathVariable String id) {
        TestSession session = testSessionService.getSessionById(id);
        return ResponseEntity.ok(TestSessionResponse.fromEntity(session));
    }
}
