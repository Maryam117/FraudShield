package com.fraudshield.dto;

import java.math.BigDecimal;
import java.util.List;

public class SimulationResultDto {
    private long totalEvaluated;
    private long flaggedCount;
    private BigDecimal simulatedRiskVolume;
    private List<String> affectedTransactionRefs;

    public SimulationResultDto() {}

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private long totalEvaluated;
        private long flaggedCount;
        private BigDecimal simulatedRiskVolume;
        private List<String> affectedTransactionRefs;

        public Builder totalEvaluated(long v) { this.totalEvaluated = v; return this; }
        public Builder flaggedCount(long v) { this.flaggedCount = v; return this; }
        public Builder simulatedRiskVolume(BigDecimal v) { this.simulatedRiskVolume = v; return this; }
        public Builder affectedTransactionRefs(List<String> v) { this.affectedTransactionRefs = v; return this; }

        public SimulationResultDto build() {
            SimulationResultDto dto = new SimulationResultDto();
            dto.totalEvaluated = totalEvaluated;
            dto.flaggedCount = flaggedCount;
            dto.simulatedRiskVolume = simulatedRiskVolume;
            dto.affectedTransactionRefs = affectedTransactionRefs;
            return dto;
        }
    }

    public long getTotalEvaluated() { return totalEvaluated; }
    public void setTotalEvaluated(long totalEvaluated) { this.totalEvaluated = totalEvaluated; }

    public long getFlaggedCount() { return flaggedCount; }
    public void setFlaggedCount(long flaggedCount) { this.flaggedCount = flaggedCount; }

    public BigDecimal getSimulatedRiskVolume() { return simulatedRiskVolume; }
    public void setSimulatedRiskVolume(BigDecimal simulatedRiskVolume) { this.simulatedRiskVolume = simulatedRiskVolume; }

    public List<String> getAffectedTransactionRefs() { return affectedTransactionRefs; }
    public void setAffectedTransactionRefs(List<String> affectedTransactionRefs) { this.affectedTransactionRefs = affectedTransactionRefs; }
}
