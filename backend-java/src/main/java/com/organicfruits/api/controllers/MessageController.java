package com.organicfruits.api.controllers;

import com.organicfruits.api.models.Message;
import com.organicfruits.api.repositories.MessageRepository;
import com.organicfruits.api.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private JwtUtils jwtUtils;

    private Map<String, Object> getClaims(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return null;
        try {
            return jwtUtils.extractClaim(authHeader.substring(7), claims -> claims);
        } catch (Exception e) { return null; }
    }

    @GetMapping
    public ResponseEntity<?> getMessages(@RequestHeader(value = "Authorization", required = false) String auth) {
        Map<String, Object> claims = getClaims(auth);
        if (claims == null || !"admin".equals(claims.get("role"))) {
            return ResponseEntity.status(403).body(Map.of("error", "Admin only"));
        }
        return ResponseEntity.ok(messageRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<?> sendMessage(@RequestHeader(value = "Authorization", required = false) String auth, @RequestBody Message msgRequest) {
        Map<String, Object> claims = getClaims(auth);
        if (claims == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));

        Message message = Message.builder()
                .userId((String) claims.get("id"))
                .subject(msgRequest.getSubject())
                .message(msgRequest.getMessage())
                .createdAt(LocalDateTime.now())
                .build();

        messageRepository.save(message);
        return ResponseEntity.ok(Map.of("ok", true));
    }

    @PostMapping("/public")
    public ResponseEntity<?> sendPublicMessage(@RequestBody Message msgRequest) {
        // Validate required fields
        if (msgRequest.getCustomerName() == null || msgRequest.getCustomerName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Customer name is required"));
        }
        if (msgRequest.getCustomerEmail() == null || msgRequest.getCustomerEmail().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Customer email is required"));
        }
        if (msgRequest.getMessage() == null || msgRequest.getMessage().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Message is required"));
        }

        // Email validation (basic)
        if (!msgRequest.getCustomerEmail().matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid email format"));
        }

        Message message = Message.builder()
                .customerName(msgRequest.getCustomerName())
                .customerEmail(msgRequest.getCustomerEmail())
                .customerPhone(msgRequest.getCustomerPhone())
                .subject(msgRequest.getSubject())
                .message(msgRequest.getMessage())
                .createdAt(LocalDateTime.now())
                .build();

        messageRepository.save(message);
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Thank you! Your message has been sent successfully. We'll get back to you soon!"
        ));
    }
}
