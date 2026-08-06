package com.fraudshield.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "fraud_rules")
public class FraudRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "rule_code", nullable = false, unique = true, length = 50)
    private String ruleCode;

    @Column(name = "rule_name", nullable = false, length = 100)
    private String ruleName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "threshold_value", nullable = false, precision = 15, scale = 2)
    private BigDecimal thresholdValue;

    @Column(name = "risk_points", nullable = false)
    private Integer riskPoints;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public FraudRule() {}

    public static FraudRuleBuilder builder() { return new FraudRuleBuilder(); }

    public static class FraudRuleBuilder {
        private Long id;
        private String ruleCode;
        private String ruleName;
        private String description;
        private BigDecimal thresholdValue;
        private Integer riskPoints;
        private Boolean isActive = true;

        public FraudRuleBuilder id(Long v) { this.id = v; return this; }
        public FraudRuleBuilder ruleCode(String v) { this.ruleCode = v; return this; }
        public FraudRuleBuilder ruleName(String v) { this.ruleName = v; return this; }
        public FraudRuleBuilder description(String v) { this.description = v; return this; }
        public FraudRuleBuilder thresholdValue(BigDecimal v) { this.thresholdValue = v; return this; }
        public FraudRuleBuilder riskPoints(Integer v) { this.riskPoints = v; return this; }
        public FraudRuleBuilder isActive(Boolean v) { this.isActive = v; return this; }

        public FraudRule build() {
            FraudRule r = new FraudRule();
            r.id = id; r.ruleCode = ruleCode; r.ruleName = ruleName;
            r.description = description; r.thresholdValue = thresholdValue;
            r.riskPoints = riskPoints; r.isActive = isActive;
            return r;
        }
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getRuleCode() { return ruleCode; }
    public void setRuleCode(String ruleCode) { this.ruleCode = ruleCode; }

    public String getRuleName() { return ruleName; }
    public void setRuleName(String ruleName) { this.ruleName = ruleName; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public BigDecimal getThresholdValue() { return thresholdValue; }
    public void setThresholdValue(BigDecimal thresholdValue) { this.thresholdValue = thresholdValue; }

    public Integer getRiskPoints() { return riskPoints; }
    public void setRiskPoints(Integer riskPoints) { this.riskPoints = riskPoints; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
