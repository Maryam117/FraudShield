package com.fraudshield.service;

import com.fraudshield.dto.AlertResolveRequest;
import com.fraudshield.entity.AlertStatus;
import com.fraudshield.entity.FraudAlert;
import com.fraudshield.entity.Transaction;
import com.fraudshield.entity.TransactionStatus;
import com.fraudshield.repository.FraudAlertRepository;
import com.fraudshield.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AlertService {

    @Autowired
    private FraudAlertRepository alertRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private AuditService auditService;

    public List<FraudAlert> getAllAlerts() {
        return alertRepository.findAllByOrderByCreatedAtDesc();
    }

    public FraudAlert resolveAlert(Long alertId, AlertResolveRequest request, String adminUser) {
        FraudAlert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new RuntimeException("Alert not found with id: " + alertId));

        alert.setStatus(request.getStatus());
        alert.setAssignedTo(adminUser);
        if (request.getNotes() != null) {
            alert.setInvestigationNotes(request.getNotes());
        }

        // If confirmed fraud, ensure underlying transaction status is REJECTED
        Transaction txn = alert.getTransaction();
        if (request.getStatus() == AlertStatus.CONFIRMED_FRAUD) {
            txn.setStatus(TransactionStatus.REJECTED);
            transactionRepository.save(txn);
        } else if (request.getStatus() == AlertStatus.RESOLVED_SAFE) {
            txn.setStatus(TransactionStatus.APPROVED);
            transactionRepository.save(txn);
        }

        FraudAlert savedAlert = alertRepository.save(alert);
        auditService.logAction("ALERT_RESOLVED", adminUser, "AlertID:" + alertId,
                "New Status: " + request.getStatus() + ", Notes: " + request.getNotes(), "127.0.0.1");

        return savedAlert;
    }
}
