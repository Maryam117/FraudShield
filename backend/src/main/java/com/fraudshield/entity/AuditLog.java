package com.fraudshield.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String action;

    @Column(name = "performed_by", nullable = false, length = 50)
    private String performedBy;

    @Column(name = "target_entity", nullable = false, length = 100)
    private String targetEntity;

    @Column(columnDefinition = "TEXT")
    private String details;

    @Column(name = "ip_address", length = 45)
    private String ipAddress = "127.0.0.1";

    @Column(updatable = false)
    private LocalDateTime timestamp;

    public AuditLog() {}

    public static AuditLogBuilder builder() { return new AuditLogBuilder(); }

    public static class AuditLogBuilder {
        private String action;
        private String performedBy;
        private String targetEntity;
        private String details;
        private String ipAddress = "127.0.0.1";

        public AuditLogBuilder action(String v) { this.action = v; return this; }
        public AuditLogBuilder performedBy(String v) { this.performedBy = v; return this; }
        public AuditLogBuilder targetEntity(String v) { this.targetEntity = v; return this; }
        public AuditLogBuilder details(String v) { this.details = v; return this; }
        public AuditLogBuilder ipAddress(String v) { this.ipAddress = v; return this; }

        public AuditLog build() {
            AuditLog l = new AuditLog();
            l.action = action; l.performedBy = performedBy;
            l.targetEntity = targetEntity; l.details = details;
            l.ipAddress = ipAddress;
            return l;
        }
    }

    @PrePersist
    protected void onCreate() {
        timestamp = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getPerformedBy() { return performedBy; }
    public void setPerformedBy(String performedBy) { this.performedBy = performedBy; }

    public String getTargetEntity() { return targetEntity; }
    public void setTargetEntity(String targetEntity) { this.targetEntity = targetEntity; }

    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }

    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
