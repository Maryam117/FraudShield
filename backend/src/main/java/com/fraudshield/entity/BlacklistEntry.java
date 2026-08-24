package com.fraudshield.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "blacklist_entries")
public class BlacklistEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "entry_type", nullable = false, length = 20)
    private String entryType; // ACCOUNT, IP, EMAIL

    @Column(name = "list_type", nullable = false, length = 20)
    private String listType = "BLACKLIST"; // BLACKLIST, WHITELIST

    @Column(nullable = false, length = 100)
    private String value;

    @Column(columnDefinition = "TEXT")
    private String reason;

    @Column(name = "created_by", length = 50)
    private String createdBy;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public BlacklistEntry() {}

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private String entryType;
        private String listType = "BLACKLIST";
        private String value;
        private String reason;
        private String createdBy;

        public Builder id(Long v) { this.id = v; return this; }
        public Builder entryType(String v) { this.entryType = v; return this; }
        public Builder listType(String v) { this.listType = v; return this; }
        public Builder value(String v) { this.value = v; return this; }
        public Builder reason(String v) { this.reason = v; return this; }
        public Builder createdBy(String v) { this.createdBy = v; return this; }

        public BlacklistEntry build() {
            BlacklistEntry e = new BlacklistEntry();
            e.id = id; e.entryType = entryType; e.listType = listType;
            e.value = value; e.reason = reason; e.createdBy = createdBy;
            return e;
        }
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEntryType() { return entryType; }
    public void setEntryType(String entryType) { this.entryType = entryType; }

    public String getListType() { return listType; }
    public void setListType(String listType) { this.listType = listType; }

    public String getValue() { return value; }
    public void setValue(String value) { this.value = value; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
