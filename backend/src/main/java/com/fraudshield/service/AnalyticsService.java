package com.fraudshield.service;

import com.fraudshield.dto.AnalyticsSummaryDto;
import com.fraudshield.entity.AlertLevel;
import com.fraudshield.entity.AlertStatus;
import com.fraudshield.entity.FraudAlert;
import com.fraudshield.entity.TransactionStatus;
import com.fraudshield.repository.FraudAlertRepository;
import com.fraudshield.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AnalyticsService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private FraudAlertRepository alertRepository;

    public AnalyticsSummaryDto getExecutiveAnalytics() {
        long totalTxns = transactionRepository.count();
        long approved = transactionRepository.countByStatus(TransactionStatus.APPROVED);
        long suspicious = transactionRepository.countByStatus(TransactionStatus.SUSPICIOUS);
        long rejected = transactionRepository.countByStatus(TransactionStatus.REJECTED);

        BigDecimal totalVolume = transactionRepository.sumTotalAmount();
        if (totalVolume == null) totalVolume = BigDecimal.ZERO;

        BigDecimal atRisk = transactionRepository.sumAmountByStatus(TransactionStatus.REJECTED);
        if (atRisk == null) atRisk = BigDecimal.ZERO;
        BigDecimal suspiciousVolume = transactionRepository.sumAmountByStatus(TransactionStatus.SUSPICIOUS);
        if (suspiciousVolume != null) {
            atRisk = atRisk.add(suspiciousVolume);
        }

        double fraudRate = totalTxns > 0 ? ((double) (suspicious + rejected) / totalTxns) * 100.0 : 0.0;
        long activeAlerts = alertRepository.countByStatus(AlertStatus.NEW) + alertRepository.countByStatus(AlertStatus.UNDER_INVESTIGATION);

        Map<String, Long> statusDist = new HashMap<>();
        statusDist.put("APPROVED", approved);
        statusDist.put("SUSPICIOUS", suspicious);
        statusDist.put("REJECTED", rejected);

        Map<String, Long> alertDist = new HashMap<>();
        List<FraudAlert> alerts = alertRepository.findAll();
        for (AlertLevel level : AlertLevel.values()) {
            long count = alerts.stream().filter(a -> a.getAlertLevel() == level).count();
            alertDist.put(level.name(), count);
        }

        return AnalyticsSummaryDto.builder()
                .totalTransactions(totalTxns)
                .approvedCount(approved)
                .suspiciousCount(suspicious)
                .rejectedCount(rejected)
                .totalVolume(totalVolume)
                .revenueAtRisk(atRisk)
                .fraudRatePercentage(Math.round(fraudRate * 10.0) / 10.0)
                .activeAlertsCount(activeAlerts)
                .statusDistribution(statusDist)
                .alertLevelDistribution(alertDist)
                .build();
    }
}
