package com.fraudshield.controller;

import com.fraudshield.dto.ApiResponse;
import com.fraudshield.dto.RuleDto;
import com.fraudshield.security.UserDetailsImpl;
import com.fraudshield.service.RuleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/rules")
public class RuleController {

    @Autowired
    private RuleService ruleService;

    @GetMapping
    public ResponseEntity<?> getAllRules() {
        List<RuleDto> rules = ruleService.getAllRules();
        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .message("Fraud rules fetched")
                .data(rules)
                .build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateRule(
            @PathVariable Long id,
            @RequestBody RuleDto dto,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            RuleDto updated = ruleService.updateRule(id, dto, userDetails.getUsername());
            return ResponseEntity.ok(ApiResponse.builder()
                    .success(true)
                    .message("Fraud rule updated successfully")
                    .data(updated)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.builder()
                    .success(false)
                    .message(e.getMessage())
                    .build());
        }
    }

    @PatchMapping("/{id}/toggle")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> toggleRuleStatus(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            RuleDto updated = ruleService.toggleRuleStatus(id, userDetails.getUsername());
            return ResponseEntity.ok(ApiResponse.builder()
                    .success(true)
                    .message("Rule status toggled to " + updated.getIsActive())
                    .data(updated)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.builder()
                    .success(false)
                    .message(e.getMessage())
                    .build());
        }
    }
}
