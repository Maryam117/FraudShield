package com.fraudshield.controller;

import com.fraudshield.dto.TransactionResponse;
import com.fraudshield.service.TransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/reports")
public class ReportController {

    @Autowired
    private TransactionService transactionService;

    @GetMapping("/export/csv")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<byte[]> exportTransactionsCsv() {
        List<TransactionResponse> list = transactionService.getAllTransactions();

        StringBuilder csv = new StringBuilder();
        csv.append("Transaction Reference,User,Account,Receiver,Amount,Currency,Merchant Category,Location,IP Address,Status,Risk Score,Triggered Rules,Created At\n");

        for (TransactionResponse t : list) {
            csv.append(escapeCsv(t.getTransactionReference())).append(",")
               .append(escapeCsv(t.getUsername())).append(",")
               .append(escapeCsv(t.getAccountNumber())).append(",")
               .append(escapeCsv(t.getReceiverAccount())).append(",")
               .append(t.getAmount()).append(",")
               .append(escapeCsv(t.getCurrency())).append(",")
               .append(escapeCsv(t.getMerchantCategory())).append(",")
               .append(escapeCsv(t.getLocation())).append(",")
               .append(escapeCsv(t.getIpAddress())).append(",")
               .append(t.getStatus()).append(",")
               .append(t.getRiskScore()).append(",")
               .append(escapeCsv(t.getTriggeredRules())).append(",")
               .append(t.getCreatedAt()).append("\n");
        }

        byte[] bytes = csv.toString().getBytes(StandardCharsets.UTF_8);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=fraudshield_transactions_report.csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(bytes);
    }

    private String escapeCsv(String data) {
        if (data == null) return "\"\"";
        String escaped = data.replaceAll("\"", "\"\"");
        return "\"" + escaped + "\"";
    }
}
