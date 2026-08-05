-- ========================================================
-- FraudShield Database Schema DDL
-- Database Target: MySQL 8.0 / phpMyAdmin
-- Compatible with http://localhost/phpmyadmin/
-- ========================================================

CREATE DATABASE IF NOT EXISTS `fraudshield_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `fraudshield_db`;

-- --------------------------------------------------------
-- Table: users
-- --------------------------------------------------------
DROP TABLE IF EXISTS `audit_logs`;
DROP TABLE IF EXISTS `fraud_alerts`;
DROP TABLE IF EXISTS `transactions`;
DROP TABLE IF EXISTS `fraud_rules`;
DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(100) NOT NULL,
  `role` VARCHAR(20) NOT NULL DEFAULT 'ROLE_USER',
  `status` VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_username` (`username`),
  INDEX `idx_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: fraud_rules
-- --------------------------------------------------------
CREATE TABLE `fraud_rules` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `rule_code` VARCHAR(50) NOT NULL UNIQUE,
  `rule_name` VARCHAR(100) NOT NULL,
  `description` TEXT,
  `threshold_value` DECIMAL(15,2) NOT NULL,
  `risk_points` INT NOT NULL DEFAULT 10,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: transactions
-- --------------------------------------------------------
CREATE TABLE `transactions` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `transaction_reference` VARCHAR(64) NOT NULL UNIQUE,
  `user_id` BIGINT NOT NULL,
  `account_number` VARCHAR(30) NOT NULL,
  `receiver_account` VARCHAR(30) NOT NULL,
  `amount` DECIMAL(15,2) NOT NULL,
  `currency` VARCHAR(10) NOT NULL DEFAULT 'USD',
  `merchant_category` VARCHAR(50) NOT NULL,
  `location` VARCHAR(100) NOT NULL,
  `ip_address` VARCHAR(45) NOT NULL,
  `status` VARCHAR(30) NOT NULL DEFAULT 'PENDING_REVIEW',
  `risk_score` INT NOT NULL DEFAULT 0,
  `triggered_rules` TEXT,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_txn_ref` (`transaction_reference`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: fraud_alerts
-- --------------------------------------------------------
CREATE TABLE `fraud_alerts` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `transaction_id` BIGINT NOT NULL,
  `user_id` BIGINT NOT NULL,
  `alert_level` VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
  `status` VARCHAR(30) NOT NULL DEFAULT 'NEW',
  `assigned_to` VARCHAR(50) DEFAULT NULL,
  `investigation_notes` TEXT DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`transaction_id`) REFERENCES `transactions`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_alert_status` (`status`),
  INDEX `idx_alert_level` (`alert_level`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: audit_logs
-- --------------------------------------------------------
CREATE TABLE `audit_logs` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `action` VARCHAR(100) NOT NULL,
  `performed_by` VARCHAR(50) NOT NULL,
  `target_entity` VARCHAR(100) NOT NULL,
  `details` TEXT,
  `ip_address` VARCHAR(45) DEFAULT '127.0.0.1',
  `timestamp` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_audit_performed_by` (`performed_by`),
  INDEX `idx_audit_timestamp` (`timestamp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
