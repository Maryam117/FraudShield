package com.fraudshield.dto;

import jakarta.validation.constraints.NotBlank;

public class DisputeRequest {

    @NotBlank(message = "Reason for dispute is required")
    private String reason;

    public DisputeRequest() {}

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
