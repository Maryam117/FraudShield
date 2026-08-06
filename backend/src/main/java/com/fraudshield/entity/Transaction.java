package com.fraudshield.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "transaction_reference", nullable = false, unique = true, length = 64)
    private String transactionReference;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "account_number", nullable = false, length = 30)
    private String accountNumber;

    @Column(name = "receiver_account", nullable = false, length = 30)
    private String receiverAccount;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, length = 10)
    private String currency = "USD";

    @Column(name = "merchant_category", nullable = false, length = 50)
    private String merchantCategory;

    @Column(nullable = false, length = 100)
    private String location;

    @Column(name = "ip_address", nullable = false, length = 45)
    private String ipAddress;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private TransactionStatus status = TransactionStatus.PENDING_REVIEW;

    @Column(name = "risk_score", nullable = false)
    private Integer riskScore = 0;

    @Column(name = "triggered_rules", columnDefinition = "TEXT")
    private String triggeredRules;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public Transaction() {}

    public static TransactionBuilder builder() { return new TransactionBuilder(); }

    public static class TransactionBuilder {
        private Long id;
        private String transactionReference;
        private User user;
        private String accountNumber;
        private String receiverAccount;
        private BigDecimal amount;
        private String currency = "USD";
        private String merchantCategory;
        private String location;
        private String ipAddress;
        private TransactionStatus status = TransactionStatus.PENDING_REVIEW;
        private Integer riskScore = 0;
        private String triggeredRules;

        public TransactionBuilder id(Long v) { this.id = v; return this; }
        public TransactionBuilder transactionReference(String v) { this.transactionReference = v; return this; }
        public TransactionBuilder user(User v) { this.user = v; return this; }
        public TransactionBuilder accountNumber(String v) { this.accountNumber = v; return this; }
        public TransactionBuilder receiverAccount(String v) { this.receiverAccount = v; return this; }
        public TransactionBuilder amount(BigDecimal v) { this.amount = v; return this; }
        public TransactionBuilder currency(String v) { this.currency = v; return this; }
        public TransactionBuilder merchantCategory(String v) { this.merchantCategory = v; return this; }
        public TransactionBuilder location(String v) { this.location = v; return this; }
        public TransactionBuilder ipAddress(String v) { this.ipAddress = v; return this; }
        public TransactionBuilder status(TransactionStatus v) { this.status = v; return this; }
        public TransactionBuilder riskScore(Integer v) { this.riskScore = v; return this; }
        public TransactionBuilder triggeredRules(String v) { this.triggeredRules = v; return this; }

        public Transaction build() {
            Transaction t = new Transaction();
            t.id = id; t.transactionReference = transactionReference;
            t.user = user; t.accountNumber = accountNumber;
            t.receiverAccount = receiverAccount; t.amount = amount;
            t.currency = currency; t.merchantCategory = merchantCategory;
            t.location = location; t.ipAddress = ipAddress;
            t.status = status; t.riskScore = riskScore;
            t.triggeredRules = triggeredRules;
            return t;
        }
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTransactionReference() { return transactionReference; }
    public void setTransactionReference(String v) { this.transactionReference = v; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getAccountNumber() { return accountNumber; }
    public void setAccountNumber(String v) { this.accountNumber = v; }

    public String getReceiverAccount() { return receiverAccount; }
    public void setReceiverAccount(String v) { this.receiverAccount = v; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getMerchantCategory() { return merchantCategory; }
    public void setMerchantCategory(String v) { this.merchantCategory = v; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }

    public TransactionStatus getStatus() { return status; }
    public void setStatus(TransactionStatus status) { this.status = status; }

    public Integer getRiskScore() { return riskScore; }
    public void setRiskScore(Integer riskScore) { this.riskScore = riskScore; }

    public String getTriggeredRules() { return triggeredRules; }
    public void setTriggeredRules(String v) { this.triggeredRules = v; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
