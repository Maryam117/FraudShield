package com.fraudshield.repository;

import com.fraudshield.entity.Transaction;
import com.fraudshield.entity.TransactionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Transaction> findAllByOrderByCreatedAtDesc();

    @Query("SELECT COUNT(t) FROM Transaction t WHERE t.user.id = :userId AND t.createdAt >= :sinceTime")
    long countByUserIdAndCreatedAtAfter(@Param("userId") Long userId, @Param("sinceTime") LocalDateTime sinceTime);

    long countByStatus(TransactionStatus status);

    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.status = :status")
    BigDecimal sumAmountByStatus(@Param("status") TransactionStatus status);

    @Query("SELECT SUM(t.amount) FROM Transaction t")
    BigDecimal sumTotalAmount();
}
