package com.organicfruits.api.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "messages")
public class Message {
    @Id
    private String id;
    private String userId; // Optional - for authenticated users
    private String customerName; // For public/contact form submissions
    private String customerEmail; // For public/contact form submissions
    private String customerPhone; // Optional - for contact forms
    private String subject;
    private String message;
    private LocalDateTime createdAt;
}
