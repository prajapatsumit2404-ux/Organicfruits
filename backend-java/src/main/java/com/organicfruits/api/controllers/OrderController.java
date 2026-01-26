package com.organicfruits.api.controllers;

import com.organicfruits.api.models.Order;
import com.organicfruits.api.repositories.OrderRepository;
import com.organicfruits.api.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private JwtUtils jwtUtils;

    private Map<String, Object> getClaims(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return null;
        String token = authHeader.substring(7);
        try {
            return jwtUtils.extractClaim(token, claims -> claims);
        } catch (Exception e) {
            return null;
        }
    }

    @GetMapping
    public ResponseEntity<?> getOrders(@RequestHeader(value = "Authorization", required = false) String auth) {
        Map<String, Object> claims = getClaims(auth);
        if (claims == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));

        String userId = (String) claims.get("id");
        String role = (String) claims.get("role");

        if ("admin".equals(role)) {
            return ResponseEntity.ok(orderRepository.findAll());
        }
        return ResponseEntity.ok(orderRepository.findByUserId(userId));
    }

    @PostMapping
    public ResponseEntity<?> createOrder(@RequestHeader(value = "Authorization", required = false) String auth, @RequestBody Order orderRequest) {
        Map<String, Object> claims = getClaims(auth);
        if (claims == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));

        String userId = (String) claims.get("id");

        Order order = Order.builder()
                .userId(userId)
                .orderNumber("ORD-" + System.currentTimeMillis())
                .items(orderRequest.getItems())
                .total(orderRequest.getTotal())
                .status("pending")
                .paymentMethod(orderRequest.getPaymentMethod())
                .paymentStatus("cod".equals(orderRequest.getPaymentMethod()) ? "pending" : "paid") // Mock logic: prepaid is paid
                .customerName(orderRequest.getCustomerName())
                .phone(orderRequest.getPhone())
                .address(orderRequest.getAddress())
                .notes(orderRequest.getNotes())
                .createdAt(LocalDateTime.now())
                .build();

        orderRepository.save(order);
        return ResponseEntity.ok(order);
    }
}
