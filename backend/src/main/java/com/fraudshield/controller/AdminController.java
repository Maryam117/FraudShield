package com.fraudshield.controller;

import com.fraudshield.dto.AlertResolveRequest;
import com.fraudshield.dto.AnalyticsSummaryDto;
import com.fraudshield.dto.ApiResponse;
import com.fraudshield.entity.AuditLog;
import com.fraudshield.entity.FraudAlert;
import com.fraudshield.security.UserDetailsImpl;
import com.fraudshield.service.AlertService;
import com.fraudshield.service.AnalyticsService;
import com.fraudshield.service.AuditService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private AlertService alertService;

    @Autowired
    private AnalyticsService analyticsService;

    @Autowired
    private AuditService auditService;

    @Autowired
    private com.fraudshield.service.UserService userService;

    @Autowired
    private com.fraudshield.service.NotificationService notificationService;

    @GetMapping("/alerts/stream")
    public org.springframework.web.servlet.mvc.method.annotation.SseEmitter streamAlerts() {
        return notificationService.subscribe();
    }

    @GetMapping("/analytics")
    public ResponseEntity<?> getAnalytics() {
        AnalyticsSummaryDto analytics = analyticsService.getExecutiveAnalytics();
        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .message("Executive analytics fetched")
                .data(analytics)
                .build());
    }

    @GetMapping("/alerts")
    public ResponseEntity<?> getAllAlerts() {
        List<FraudAlert> alerts = alertService.getAllAlerts();
        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .message("Fraud alerts fetched")
                .data(alerts)
                .build());
    }

    @PutMapping("/alerts/{id}/resolve")
    public ResponseEntity<?> resolveAlert(
            @PathVariable Long id,
            @Valid @RequestBody AlertResolveRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            FraudAlert alert = alertService.resolveAlert(id, request, userDetails.getUsername());
            return ResponseEntity.ok(ApiResponse.builder()
                    .success(true)
                    .message("Fraud alert status updated to " + request.getStatus())
                    .data(alert)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.builder()
                    .success(false)
                    .message(e.getMessage())
                    .build());
        }
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<?> getAuditLogs() {
        List<AuditLog> logs = auditService.getAllAuditLogs();
        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .message("System audit logs fetched")
                .data(logs)
                .build());
    }

    // --- User Management Endpoints ---

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        List<com.fraudshield.entity.User> users = userService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .message("Users fetched successfully")
                .data(users)
                .build());
    }

    @PostMapping("/users")
    public ResponseEntity<?> createUser(
            @Valid @RequestBody com.fraudshield.dto.UserRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            com.fraudshield.entity.User user = userService.createUser(request, userDetails.getUsername());
            return ResponseEntity.ok(ApiResponse.builder()
                    .success(true)
                    .message("User created successfully")
                    .data(user)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.builder()
                    .success(false)
                    .message(e.getMessage())
                    .build());
        }
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody com.fraudshield.dto.UserRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            com.fraudshield.entity.User user = userService.updateUser(id, request, userDetails.getUsername());
            return ResponseEntity.ok(ApiResponse.builder()
                    .success(true)
                    .message("User updated successfully")
                    .data(user)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.builder()
                    .success(false)
                    .message(e.getMessage())
                    .build());
        }
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            userService.deleteUser(id, userDetails.getUsername());
            return ResponseEntity.ok(ApiResponse.builder()
                    .success(true)
                    .message("User deleted successfully")
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.builder()
                    .success(false)
                    .message(e.getMessage())
                    .build());
        }
    }
}
