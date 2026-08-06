package com.fraudshield.controller;

import com.fraudshield.dto.ApiResponse;
import com.fraudshield.dto.TransactionRequest;
import com.fraudshield.dto.TransactionResponse;
import com.fraudshield.security.UserDetailsImpl;
import com.fraudshield.service.TransactionService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    @Autowired
    private TransactionService transactionService;

    @PostMapping
    public ResponseEntity<?> createTransaction(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody TransactionRequest request,
            HttpServletRequest servletRequest) {
        try {
            String clientIp = servletRequest.getRemoteAddr();
            TransactionResponse response = transactionService.createTransaction(userDetails.getId(), request, clientIp);
            return ResponseEntity.ok(ApiResponse.builder()
                    .success(true)
                    .message("Transaction processed by Fraud Engine")
                    .data(response)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.builder()
                    .success(false)
                    .message(e.getMessage())
                    .build());
        }
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMyTransactions(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        List<TransactionResponse> list = transactionService.getUserTransactions(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .message("User transactions fetched")
                .data(list)
                .build());
    }

    @GetMapping
    public ResponseEntity<?> getAllTransactions() {
        List<TransactionResponse> list = transactionService.getAllTransactions();
        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .message("All transactions fetched")
                .data(list)
                .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getTransactionById(@PathVariable Long id) {
        try {
            TransactionResponse response = transactionService.getTransactionById(id);
            return ResponseEntity.ok(ApiResponse.builder()
                    .success(true)
                    .message("Transaction details fetched")
                    .data(response)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.builder()
                    .success(false)
                    .message(e.getMessage())
                    .build());
        }
    }
}
