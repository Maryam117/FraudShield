package com.fraudshield.repository;

import com.fraudshield.entity.BlacklistEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BlacklistRepository extends JpaRepository<BlacklistEntry, Long> {
    List<BlacklistEntry> findByListType(String listType);
    Optional<BlacklistEntry> findByValueAndListType(String value, String listType);
    boolean existsByValueAndListType(String value, String listType);
}
