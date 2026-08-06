package com.fraudshield.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "fraud_alerts")
public class FraudAlert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "transaction_id", nullable = false)
    private Transaction transaction;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "alert_level", nullable = false, length = 20)
    private AlertLevel alertLevel = AlertLevel.MEDIUM;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private AlertStatus status = AlertStatus.NEW;

    @Column(name = "assigned_to", length = 50)
    private String assignedTo;

    @Column(name = "investigation_notes", columnDefinition = "TEXT")
    private String investigationNotes;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public FraudAlert() {}

    public static FraudAlertBuilder builder() { return new FraudAlertBuilder(); }

    public static class FraudAlertBuilder {
        private Transaction transaction;
        private User user;
        private AlertLevel alertLevel = AlertLevel.MEDIUM;
        private AlertStatus status = AlertStatus.NEW;
        private String assignedTo;
        private String investigationNotes;

        public FraudAlertBuilder transaction(Transaction v) { this.transaction = v; return this; }
        public FraudAlertBuilder user(User v) { this.user = v; return this; }
        public FraudAlertBuilder alertLevel(AlertLevel v) { this.alertLevel = v; return this; }
        public FraudAlertBuilder status(AlertStatus v) { this.status = v; return this; }
        public FraudAlertBuilder assignedTo(String v) { this.assignedTo = v; return this; }
        public FraudAlertBuilder investigationNotes(String v) { this.investigationNotes = v; return this; }

        public FraudAlert build() {
            FraudAlert a = new FraudAlert();
            a.transaction = transaction; a.user = user;
            a.alertLevel = alertLevel; a.status = status;
            a.assignedTo = assignedTo; a.investigationNotes = investigationNotes;
            return a;
        }
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Transaction getTransaction() { return transaction; }
    public void setTransaction(Transaction transaction) { this.transaction = transaction; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public AlertLevel getAlertLevel() { return alertLevel; }
    public void setAlertLevel(AlertLevel alertLevel) { this.alertLevel = alertLevel; }

    public AlertStatus getStatus() { return status; }
    public void setStatus(AlertStatus status) { this.status = status; }

    public String getAssignedTo() { return assignedTo; }
    public void setAssignedTo(String assignedTo) { this.assignedTo = assignedTo; }

    public String getInvestigationNotes() { return investigationNotes; }
    public void setInvestigationNotes(String investigationNotes) { this.investigationNotes = investigationNotes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
