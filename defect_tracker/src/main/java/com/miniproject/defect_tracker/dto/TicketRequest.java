package com.miniproject.defect_tracker.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class TicketRequest {
    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    private String codeSnippet;

    @Pattern(regexp = "LOW|MEDIUM|HIGH", message = "Severity must be LOW, MEDIUM, or HIGH")
    private String severity;

    @NotNull(message = "Assigned user is required")
    private Integer assignedToUserId;
}