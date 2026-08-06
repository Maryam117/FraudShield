package com.fraudshield.dto;

import java.math.BigDecimal;
import java.util.Map;

public class AnalyticsSummaryDto {
    private long totalTransactions;
    private long approvedCount;
    private long suspiciousCount;
    private long rejectedCount;
    private BigDecimal totalVolume;
    private BigDecimal revenueAtRisk;
    private double fraudRatePercentage;
    private long activeAlertsCount;
    private Map<String, Long> statusDistribution;
    private Map<String, Long> alertLevelDistribution;

    public AnalyticsSummaryDto() {}

    private AnalyticsSummaryDto(Builder b) {
        this.totalTransactions = b.totalTransactions;
        this.approvedCount = b.approvedCount;
        this.suspiciousCount = b.suspiciousCount;
        this.rejectedCount = b.rejectedCount;
        this.totalVolume = b.totalVolume;
        this.revenueAtRisk = b.revenueAtRisk;
        this.fraudRatePercentage = b.fraudRatePercentage;
        this.activeAlertsCount = b.activeAlertsCount;
        this.statusDistribution = b.statusDistribution;
        this.alertLevelDistribution = b.alertLevelDistribution;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private long totalTransactions;
        private long approvedCount;
        private long suspiciousCount;
        private long rejectedCount;
        private BigDecimal totalVolume;
        private BigDecimal revenueAtRisk;
        private double fraudRatePercentage;
        private long activeAlertsCount;
        private Map<String, Long> statusDistribution;
        private Map<String, Long> alertLevelDistribution;

        public Builder totalTransactions(long v) { this.totalTransactions = v; return this; }
        public Builder approvedCount(long v) { this.approvedCount = v; return this; }
        public Builder suspiciousCount(long v) { this.suspiciousCount = v; return this; }
        public Builder rejectedCount(long v) { this.rejectedCount = v; return this; }
        public Builder totalVolume(BigDecimal v) { this.totalVolume = v; return this; }
        public Builder revenueAtRisk(BigDecimal v) { this.revenueAtRisk = v; return this; }
        public Builder fraudRatePercentage(double v) { this.fraudRatePercentage = v; return this; }
        public Builder activeAlertsCount(long v) { this.activeAlertsCount = v; return this; }
        public Builder statusDistribution(Map<String, Long> v) { this.statusDistribution = v; return this; }
        public Builder alertLevelDistribution(Map<String, Long> v) { this.alertLevelDistribution = v; return this; }
        public AnalyticsSummaryDto build() { return new AnalyticsSummaryDto(this); }
    }

    public long getTotalTransactions() { return totalTransactions; }
    public long getApprovedCount() { return approvedCount; }
    public long getSuspiciousCount() { return suspiciousCount; }
    public long getRejectedCount() { return rejectedCount; }
    public BigDecimal getTotalVolume() { return totalVolume; }
    public BigDecimal getRevenueAtRisk() { return revenueAtRisk; }
    public double getFraudRatePercentage() { return fraudRatePercentage; }
    public long getActiveAlertsCount() { return activeAlertsCount; }
    public Map<String, Long> getStatusDistribution() { return statusDistribution; }
    public Map<String, Long> getAlertLevelDistribution() { return alertLevelDistribution; }

    public void setTotalTransactions(long v) { totalTransactions = v; }
    public void setApprovedCount(long v) { approvedCount = v; }
    public void setSuspiciousCount(long v) { suspiciousCount = v; }
    public void setRejectedCount(long v) { rejectedCount = v; }
    public void setTotalVolume(BigDecimal v) { totalVolume = v; }
    public void setRevenueAtRisk(BigDecimal v) { revenueAtRisk = v; }
    public void setFraudRatePercentage(double v) { fraudRatePercentage = v; }
    public void setActiveAlertsCount(long v) { activeAlertsCount = v; }
    public void setStatusDistribution(Map<String, Long> v) { statusDistribution = v; }
    public void setAlertLevelDistribution(Map<String, Long> v) { alertLevelDistribution = v; }
}

