package com.fraudshield.dto;

import java.math.BigDecimal;

public class RuleDto {
    private Long id;
    private String ruleCode;
    private String ruleName;
    private String description;
    private BigDecimal thresholdValue;
    private Integer riskPoints;
    private Boolean isActive;

    public RuleDto() {}

    private RuleDto(Builder b) {
        this.id = b.id;
        this.ruleCode = b.ruleCode;
        this.ruleName = b.ruleName;
        this.description = b.description;
        this.thresholdValue = b.thresholdValue;
        this.riskPoints = b.riskPoints;
        this.isActive = b.isActive;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private String ruleCode;
        private String ruleName;
        private String description;
        private BigDecimal thresholdValue;
        private Integer riskPoints;
        private Boolean isActive;

        public Builder id(Long v) { this.id = v; return this; }
        public Builder ruleCode(String v) { this.ruleCode = v; return this; }
        public Builder ruleName(String v) { this.ruleName = v; return this; }
        public Builder description(String v) { this.description = v; return this; }
        public Builder thresholdValue(BigDecimal v) { this.thresholdValue = v; return this; }
        public Builder riskPoints(Integer v) { this.riskPoints = v; return this; }
        public Builder isActive(Boolean v) { this.isActive = v; return this; }
        public RuleDto build() { return new RuleDto(this); }
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
}

