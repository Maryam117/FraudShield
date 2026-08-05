-- ========================================================
-- FraudShield Database Initial Seed Data (DML)
-- Target Database: fraudshield_db
-- ========================================================

USE `fraudshield_db`;

-- --------------------------------------------------------
-- Seed Users (Passwords hashed with BCrypt for 'admin123' and 'password123')
-- Admin: admin / admin123
-- Standard Users: user1 / password123, user2 / password123
-- --------------------------------------------------------
INSERT INTO `users` (`id`, `username`, `email`, `password`, `full_name`, `role`, `status`) VALUES
(1, 'admin', 'admin@fraudshield.io', 'admin123', 'System Administrator', 'ROLE_ADMIN', 'ACTIVE'),
(2, 'user1', 'john.doe@example.com', 'password123', 'John Doe', 'ROLE_USER', 'ACTIVE'),
(3, 'user2', 'sarah.connor@example.com', 'password123', 'Sarah Connor', 'ROLE_USER', 'ACTIVE');

-- --------------------------------------------------------
-- Seed Dynamic Fraud Detection Rules
-- --------------------------------------------------------
INSERT INTO `fraud_rules` (`id`, `rule_code`, `rule_name`, `description`, `threshold_value`, `risk_points`, `is_active`) VALUES
(1, 'HIGH_AMOUNT', 'High Transaction Amount Rule', 'Flags transactions exceeding high value threshold ($10,000)', 10000.00, 45, TRUE),
(2, 'VELOCITY_SPIKE', 'High Frequency Velocity Rule', 'Detects rapid repeated transfers from same account in short window (>3 in 1 min)', 3.00, 35, TRUE),
(3, 'GEO_ANOMALY', 'Geographic & IP Blacklist Anomaly', 'Detects logins or payments originating from high-risk IP ranges or flagged regions', 1.00, 30, TRUE),
(4, 'HIGH_RISK_MERCHANT', 'High Risk Merchant Category Code', 'Flags purchases involving high-risk categories (Crypto, Gambling, Offshore Wire)', 1.00, 25, TRUE);

-- --------------------------------------------------------
-- Seed Sample Transactions
-- --------------------------------------------------------
INSERT INTO `transactions` (`id`, `transaction_reference`, `user_id`, `account_number`, `receiver_account`, `amount`, `currency`, `merchant_category`, `location`, `ip_address`, `status`, `risk_score`, `triggered_rules`, `created_at`) VALUES
(1, 'TXN-9021839210-A1', 2, 'ACC-88392019', 'REC-99382011', 450.00, 'USD', 'Retail Shopping', 'New York, US', '192.168.1.10', 'APPROVED', 10, 'None', NOW() - INTERVAL 5 DAY),
(2, 'TXN-9021839211-B2', 2, 'ACC-88392019', 'REC-44102933', 12500.00, 'USD', 'Wire Transfer', 'London, UK', '185.220.101.5', 'REJECTED', 75, 'HIGH_AMOUNT, GEO_ANOMALY', NOW() - INTERVAL 3 DAY),
(3, 'TXN-9021839212-C3', 3, 'ACC-55291044', 'REC-11203948', 8900.00, 'USD', 'Crypto Exchange', 'Tokyo, JP', '192.168.1.45', 'SUSPICIOUS', 55, 'HIGH_RISK_MERCHANT', NOW() - INTERVAL 2 DAY),
(4, 'TXN-9021839213-D4', 3, 'ACC-55291044', 'REC-77392011', 15000.00, 'USD', 'Offshore Banking', 'Panama City, PA', '103.251.170.8', 'REJECTED', 85, 'HIGH_AMOUNT, GEO_ANOMALY, HIGH_RISK_MERCHANT', NOW() - INTERVAL 1 DAY),
(5, 'TXN-9021839214-E5', 2, 'ACC-88392019', 'REC-33291044', 120.50, 'USD', 'Supermarket', 'New York, US', '192.168.1.10', 'APPROVED', 0, 'None', NOW() - INTERVAL 4 HOUR);

-- --------------------------------------------------------
-- Seed Sample Fraud Alerts
-- --------------------------------------------------------
INSERT INTO `fraud_alerts` (`id`, `transaction_id`, `user_id`, `alert_level`, `status`, `assigned_to`, `investigation_notes`, `created_at`) VALUES
(1, 2, 2, 'HIGH', 'NEW', NULL, 'Automatic system alert triggered due to high-value transfer ($12,500) and offshore IP address.', NOW() - INTERVAL 3 DAY),
(2, 3, 3, 'MEDIUM', 'UNDER_INVESTIGATION', 'admin', 'Risk officer assigned to check customer verification documents for crypto purchase.', NOW() - INTERVAL 2 DAY),
(3, 4, 3, 'CRITICAL', 'CONFIRMED_FRAUD', 'admin', 'Account takeover confirmed. Unauthorized transfer attempt to Panama account blocked.', NOW() - INTERVAL 1 DAY);

-- --------------------------------------------------------
-- Seed Initial Audit Logs
-- --------------------------------------------------------
INSERT INTO `audit_logs` (`id`, `action`, `performed_by`, `target_entity`, `details`, `ip_address`, `timestamp`) VALUES
(1, 'USER_LOGIN', 'admin', 'User: admin', 'Admin user logged into the system.', '127.0.0.1', NOW() - INTERVAL 3 DAY),
(2, 'RULE_EVALUATION', 'SYSTEM', 'Txn: TXN-9021839211-B2', 'Fraud engine flagged transaction with risk score 75.', '127.0.0.1', NOW() - INTERVAL 3 DAY),
(3, 'ALERT_STATUS_UPDATE', 'admin', 'Alert ID: 3', 'Alert status updated to CONFIRMED_FRAUD by risk officer.', '127.0.0.1', NOW() - INTERVAL 1 DAY);
