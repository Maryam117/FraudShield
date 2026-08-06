package com.fraudshield.dto;

import com.fraudshield.entity.AlertStatus;
import jakarta.validation.constraints.NotNull;

public class AlertResolveRequest {

    @NotNull
    private AlertStatus status;
    private String notes;

    public AlertResolveRequest() {}

    public AlertStatus getStatus() { return status; }
    public void setStatus(AlertStatus status) { this.status = status; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
