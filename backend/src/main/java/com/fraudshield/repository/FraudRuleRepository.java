package com.fraudshield.repository;

import com.fraudshield.entity.FraudRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FraudRuleRepository extends JpaRepository<FraudRule, Long> {
    Optional<FraudRule> findByRuleCode(String ruleCode);
    List<FraudRule> findByIsActiveTrue();
}
