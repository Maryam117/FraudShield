package com.fraudshield.repository;

import com.fraudshield.entity.AlertStatus;
import com.fraudshield.entity.FraudAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FraudAlertRepository extends JpaRepository<FraudAlert, Long> {
    List<FraudAlert> findAllByOrderByCreatedAtDesc();
    List<FraudAlert> findByStatus(AlertStatus status);
    long countByStatus(AlertStatus status);
}
