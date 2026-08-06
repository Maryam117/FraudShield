package com.fraudshield.dto;

import com.fraudshield.entity.TransactionStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class TransactionResponse {
    private Long id;
    private String transactionReference;
    private Long userId;
    private String username;
    private String accountNumber;
    private String receiverAccount;
    private BigDecimal amount;
    private String currency;
    private String merchantCategory;
    private String location;
    private String ipAddress;
    private TransactionStatus status;
    private Integer riskScore;
    private String triggeredRules;
    private LocalDateTime createdAt;

    public TransactionResponse() {}

    private TransactionResponse(Builder b) {
        this.id = b.id;
        this.transactionReference = b.transactionReference;
        this.userId = b.userId;
        this.username = b.username;
        this.accountNumber = b.accountNumber;
        this.receiverAccount = b.receiverAccount;
        this.amount = b.amount;
        this.currency = b.currency;
        this.merchantCategory = b.merchantCategory;
        this.location = b.location;
        this.ipAddress = b.ipAddress;
        this.status = b.status;
        this.riskScore = b.riskScore;
        this.triggeredRules = b.triggeredRules;
        this.createdAt = b.createdAt;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private String transactionReference;
        private Long userId;
        private String username;
        private String accountNumber;
        private String receiverAccount;
        private BigDecimal amount;
        private String currency;
        private String merchantCategory;
        private String location;
        private String ipAddress;
        private TransactionStatus status;
        private Integer riskScore;
        private String triggeredRules;
        private LocalDateTime createdAt;

        public Builder id(Long v) { this.id = v; return this; }
        public Builder transactionReference(String v) { this.transactionReference = v; return this; }
        public Builder userId(Long v) { this.userId = v; return this; }
        public Builder username(String v) { this.username = v; return this; }
        public Builder accountNumber(String v) { this.accountNumber = v; return this; }
        public Builder receiverAccount(String v) { this.receiverAccount = v; return this; }
        public Builder amount(BigDecimal v) { this.amount = v; return this; }
        public Builder currency(String v) { this.currency = v; return this; }
        public Builder merchantCategory(String v) { this.merchantCategory = v; return this; }
        public Builder location(String v) { this.location = v; return this; }
        public Builder ipAddress(String v) { this.ipAddress = v; return this; }
        public Builder status(TransactionStatus v) { this.status = v; return this; }
        public Builder riskScore(Integer v) { this.riskScore = v; return this; }
        public Builder triggeredRules(String v) { this.triggeredRules = v; return this; }
        public Builder createdAt(LocalDateTime v) { this.createdAt = v; return this; }
        public TransactionResponse build() { return new TransactionResponse(this); }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTransactionReference() { return transactionReference; }
    public void setTransactionReference(String v) { this.transactionReference = v; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

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

