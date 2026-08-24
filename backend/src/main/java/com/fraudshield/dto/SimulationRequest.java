package com.fraudshield.dto;

import java.math.BigDecimal;

public class SimulationRequest {
    private String ruleCode;
    private BigDecimal thresholdValue;
    private Integer riskPoints;

    public SimulationRequest() {}

    public String getRuleCode() { return ruleCode; }
    public void setRuleCode(String ruleCode) { this.ruleCode = ruleCode; }

    public BigDecimal getThresholdValue() { return thresholdValue; }
    public void setThresholdValue(BigDecimal thresholdValue) { this.thresholdValue = thresholdValue; }

    public Integer getRiskPoints() { return riskPoints; }
    public void setRiskPoints(Integer riskPoints) { this.riskPoints = riskPoints; }
}
