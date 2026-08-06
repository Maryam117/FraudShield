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
    private AuditService auditService;

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
