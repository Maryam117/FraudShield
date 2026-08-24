package com.fraudshield.service;

import com.fraudshield.entity.*;
import com.fraudshield.repository.FraudAlertRepository;
import com.fraudshield.repository.FraudRuleRepository;
import com.fraudshield.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
public class FraudEngineService {

    @Autowired
    private FraudRuleRepository ruleRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private FraudAlertRepository alertRepository;

    @Autowired
    private com.fraudshield.repository.BlacklistRepository blacklistRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private AuditService auditService;

    public static class EvaluationResult {
        public int riskScore;
        public TransactionStatus status;
        public List<String> triggeredRules;
    }

    public EvaluationResult evaluateTransaction(User user, BigDecimal amount, String merchantCategory, String location, String ipAddress) {
        // Pre-check 1: Whitelist check
        if ((ipAddress != null && blacklistRepository.existsByValueAndListType(ipAddress, "WHITELIST")) ||
            (user.getEmail() != null && blacklistRepository.existsByValueAndListType(user.getEmail(), "WHITELIST"))) {
            EvaluationResult res = new EvaluationResult();
            res.riskScore = 0;
            res.status = TransactionStatus.APPROVED;
            res.triggeredRules = List.of("WHITELISTED_ENTITY (Bypassed rule engine)");
            return res;
        }

        // Pre-check 2: Blacklist check
        if ((ipAddress != null && blacklistRepository.existsByValueAndListType(ipAddress, "BLACKLIST")) ||
            (user.getEmail() != null && blacklistRepository.existsByValueAndListType(user.getEmail(), "BLACKLIST"))) {
            EvaluationResult res = new EvaluationResult();
            res.riskScore = 100;
            res.status = TransactionStatus.REJECTED;
            res.triggeredRules = List.of("BLACKLISTED_ENTITY (Instant rejection policy)");
            return res;
        }

        List<FraudRule> activeRules = ruleRepository.findByIsActiveTrue();
        int totalRiskScore = 0;
        List<String> triggeredRulesList = new ArrayList<>();

        for (FraudRule rule : activeRules) {
            boolean triggered = false;

            switch (rule.getRuleCode().toUpperCase()) {
                case "HIGH_AMOUNT":
                    if (amount.compareTo(rule.getThresholdValue()) >= 0) {
                        triggered = true;
                    }
                    break;

                case "VELOCITY_SPIKE":
                    LocalDateTime oneMinuteAgo = LocalDateTime.now().minusMinutes(1);
                    long recentTxnCount = transactionRepository.countByUserIdAndCreatedAtAfter(user.getId(), oneMinuteAgo);
                    if (recentTxnCount >= rule.getThresholdValue().longValue()) {
                        triggered = true;
                    }
                    break;

                case "GEO_ANOMALY":
                    String locLower = location != null ? location.toLowerCase(Locale.ROOT) : "";
                    String ipLower = ipAddress != null ? ipAddress.toLowerCase(Locale.ROOT) : "";
                    if (locLower.contains("panama") || locLower.contains("cayman") || locLower.contains("unknown")
                            || ipLower.startsWith("185.220.") || ipLower.startsWith("103.251.")) {
                        triggered = true;
                    }
                    break;

                case "HIGH_RISK_MERCHANT":
                    String merchantLower = merchantCategory != null ? merchantCategory.toLowerCase(Locale.ROOT) : "";
                    if (merchantLower.contains("crypto") || merchantLower.contains("gambling")
                            || merchantLower.contains("casino") || merchantLower.contains("offshore")) {
                        triggered = true;
                    }
                    break;

                default:
                    break;
            }

            if (triggered) {
                totalRiskScore += rule.getRiskPoints();
                triggeredRulesList.add(rule.getRuleCode() + " (" + rule.getRuleName() + ")");
            }
        }

        totalRiskScore = Math.min(100, totalRiskScore);

        TransactionStatus finalStatus;
        if (totalRiskScore < 30) {
            finalStatus = TransactionStatus.APPROVED;
        } else if (totalRiskScore <= 70) {
            finalStatus = TransactionStatus.SUSPICIOUS;
        } else {
            finalStatus = TransactionStatus.REJECTED;
        }

        EvaluationResult result = new EvaluationResult();
        result.riskScore = totalRiskScore;
        result.status = finalStatus;
        result.triggeredRules = triggeredRulesList;

        return result;
    }

    public void triggerAlertIfNeeded(Transaction transaction, EvaluationResult result) {
        if (result.status == TransactionStatus.SUSPICIOUS || result.status == TransactionStatus.REJECTED) {
            AlertLevel level;
            if (result.riskScore > 75) {
                level = AlertLevel.CRITICAL;
            } else if (result.riskScore > 50) {
                level = AlertLevel.HIGH;
            } else {
                level = AlertLevel.MEDIUM;
            }

            FraudAlert alert = FraudAlert.builder()
                    .transaction(transaction)
                    .user(transaction.getUser())
                    .alertLevel(level)
                    .status(AlertStatus.NEW)
                    .investigationNotes("Automated Fraud Engine Alert. Triggered: " + String.join(", ", result.triggeredRules))
                    .build();

            FraudAlert savedAlert = alertRepository.save(alert);
            notificationService.broadcastAlert(savedAlert);

            auditService.logAction("FRAUD_ALERT_CREATED", "SYSTEM", "Txn:" + transaction.getTransactionReference(),
                    "Alert generated level=" + level + ", RiskScore=" + result.riskScore, transaction.getIpAddress());
        }
    }
}
