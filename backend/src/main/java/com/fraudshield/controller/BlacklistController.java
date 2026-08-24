package com.fraudshield.controller;

import com.fraudshield.dto.ApiResponse;
import com.fraudshield.entity.BlacklistEntry;
import com.fraudshield.security.UserDetailsImpl;
import com.fraudshield.service.BlacklistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/blacklist")
@PreAuthorize("hasRole('ADMIN')")
public class BlacklistController {

    @Autowired
    private BlacklistService blacklistService;

    @GetMapping
    public ResponseEntity<?> getAllEntries() {
        List<BlacklistEntry> list = blacklistService.getAllEntries();
        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .message("List entries fetched successfully")
                .data(list)
                .build());
    }

    @PostMapping
    public ResponseEntity<?> addEntry(
            @RequestBody BlacklistEntry entry,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            BlacklistEntry saved = blacklistService.addEntry(entry, userDetails.getUsername());
            return ResponseEntity.ok(ApiResponse.builder()
                    .success(true)
                    .message("Entry added to " + entry.getListType())
                    .data(saved)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.builder()
                    .success(false)
                    .message(e.getMessage())
                    .build());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateEntry(
            @PathVariable Long id,
            @RequestBody BlacklistEntry entry,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            BlacklistEntry updated = blacklistService.updateEntry(id, entry, userDetails.getUsername());
            return ResponseEntity.ok(ApiResponse.builder()
                    .success(true)
                    .message("Entry updated successfully")
                    .data(updated)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.builder()
                    .success(false)
                    .message(e.getMessage())
                    .build());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> removeEntry(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            blacklistService.removeEntry(id, userDetails.getUsername());
            return ResponseEntity.ok(ApiResponse.builder()
                    .success(true)
                    .message("Entry removed successfully")
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.builder()
                    .success(false)
                    .message(e.getMessage())
                    .build());
        }
    }
}
