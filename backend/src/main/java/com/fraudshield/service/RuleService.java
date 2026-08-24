package com.fraudshield.service;

import com.fraudshield.dto.RuleDto;
import com.fraudshield.entity.FraudRule;
import com.fraudshield.repository.FraudRuleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class RuleService {

    @Autowired
    private FraudRuleRepository ruleRepository;

    @Autowired
    private com.fraudshield.repository.TransactionRepository transactionRepository;

    @Autowired
    private AuditService auditService;

    public com.fraudshield.dto.SimulationResultDto simulateRule(com.fraudshield.dto.SimulationRequest request) {
        List<com.fraudshield.entity.Transaction> txns = transactionRepository.findAll();
        long totalEvaluated = txns.size();
        long flaggedCount = 0;
        java.math.BigDecimal totalVolume = java.math.BigDecimal.ZERO;
        List<String> affectedRefs = new java.util.ArrayList<>();

        for (com.fraudshield.entity.Transaction t : txns) {
            boolean matches = false;
            if ("HIGH_AMOUNT".equalsIgnoreCase(request.getRuleCode())) {
                if (request.getThresholdValue() != null && t.getAmount().compareTo(request.getThresholdValue()) >= 0) {
                    matches = true;
                }
            } else if ("HIGH_RISK_MERCHANT".equalsIgnoreCase(request.getRuleCode())) {
                if (t.getMerchantCategory() != null && (t.getMerchantCategory().toLowerCase().contains("crypto") || t.getMerchantCategory().toLowerCase().contains("gambling"))) {
                    matches = true;
                }
            } else if ("GEO_ANOMALY".equalsIgnoreCase(request.getRuleCode())) {
                if (t.getLocation() != null && (t.getLocation().toLowerCase().contains("panama") || t.getLocation().toLowerCase().contains("unknown"))) {
                    matches = true;
                }
            }

            if (matches) {
                flaggedCount++;
                totalVolume = totalVolume.add(t.getAmount());
                affectedRefs.add(t.getTransactionReference());
            }
        }

        return com.fraudshield.dto.SimulationResultDto.builder()
                .totalEvaluated(totalEvaluated)
                .flaggedCount(flaggedCount)
                .simulatedRiskVolume(totalVolume)
                .affectedTransactionRefs(affectedRefs)
                .build();
    }

    public List<RuleDto> getAllRules() {
        return ruleRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public RuleDto updateRule(Long id, RuleDto dto, String adminUser) {
        FraudRule rule = ruleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rule not found with id: " + id));

        if (dto.getThresholdValue() != null) {
            rule.setThresholdValue(dto.getThresholdValue());
        }
        if (dto.getRiskPoints() != null) {
            rule.setRiskPoints(dto.getRiskPoints());
        }
        if (dto.getIsActive() != null) {
            rule.setIsActive(dto.getIsActive());
        }
        if (dto.getDescription() != null) {
            rule.setDescription(dto.getDescription());
        }

        FraudRule saved = ruleRepository.save(rule);
        auditService.logAction("RULE_UPDATE", adminUser, "Rule:" + rule.getRuleCode(),
                "Updated threshold=" + rule.getThresholdValue() + ", points=" + rule.getRiskPoints() + ", active=" + rule.getIsActive(), "127.0.0.1");

        return mapToDto(saved);
    }

    public RuleDto createRule(RuleDto dto, String adminUser) {
        if (dto.getRuleCode() == null || dto.getRuleCode().isBlank()) {
            throw new RuntimeException("Rule Code is required");
        }
        if (ruleRepository.existsByRuleCode(dto.getRuleCode().toUpperCase())) {
            throw new RuntimeException("Rule Code '" + dto.getRuleCode() + "' already exists");
        }

        FraudRule rule = FraudRule.builder()
                .ruleCode(dto.getRuleCode().toUpperCase().trim())
                .ruleName(dto.getRuleName())
                .description(dto.getDescription())
                .thresholdValue(dto.getThresholdValue())
                .riskPoints(dto.getRiskPoints())
                .isActive(true)
                .build();

        FraudRule saved = ruleRepository.save(rule);
        auditService.logAction("RULE_CREATE", adminUser, "Rule:" + saved.getRuleCode(),
                "New rule created with threshold=" + saved.getThresholdValue() + ", points=" + saved.getRiskPoints(), "127.0.0.1");
        return mapToDto(saved);
    }

    public RuleDto toggleRuleStatus(Long id, String adminUser) {
        FraudRule rule = ruleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rule not found with id: " + id));
        rule.setIsActive(!rule.getIsActive());
        FraudRule saved = ruleRepository.save(rule);
        auditService.logAction("RULE_TOGGLE", adminUser, "Rule:" + rule.getRuleCode(),
                "Status toggled to " + rule.getIsActive(), "127.0.0.1");
        return mapToDto(saved);
    }

    private RuleDto mapToDto(FraudRule rule) {
        return RuleDto.builder()
                .id(rule.getId())
                .ruleCode(rule.getRuleCode())
                .ruleName(rule.getRuleName())
                .description(rule.getDescription())
                .thresholdValue(rule.getThresholdValue())
                .riskPoints(rule.getRiskPoints())
                .isActive(rule.getIsActive())
                .build();
    }
}
