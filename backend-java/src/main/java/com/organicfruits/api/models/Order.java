package com.organicfruits.api.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "orders")
public class Order {
    @Id
    private String id;
    private String orderNumber;
    private String userId;
    private List<OrderItem> items;
    private Double total;
    private String status; // "pending", "completed", etc.
    private String paymentMethod; // "upi", "card", "cod"
    private String paymentStatus; // "pending", "paid", "failed"
    private String customerName;
    private String phone;
    private String address;
    private String notes;
    private LocalDateTime createdAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItem {
        private String id;
        private String name;
        private Double price;
        private Integer quantity;
    }
}
