package com.organicfruits.api.controllers;

import com.organicfruits.api.models.Cart;
import com.organicfruits.api.repositories.CartRepository;
import com.organicfruits.api.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/cart")
public class CartController {
    {}

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private JwtUtils jwtUtils;

    private String getUserId(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return null;
        String token = authHeader.substring(7);
        try {
            return jwtUtils.extractClaim(token, claims -> (String) claims.get("id"));
        } catch (Exception e) {
            return null;
        }
    }

    @GetMapping
    public ResponseEntity<?> getCart(@RequestHeader(value = "Authorization", required = false) String auth) {
        String userId = getUserId(auth);
        if (userId == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));

        Optional<Cart> cart = cartRepository.findByUserId(userId);
        return ResponseEntity.ok(cart.orElse(Cart.builder().userId(userId).total(0.0).build()));
    }

    @PostMapping("/update")
    public ResponseEntity<?> updateCart(@RequestHeader(value = "Authorization", required = false) String auth, @RequestBody Cart cartData) {
        String userId = getUserId(auth);
        if (userId == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));

        Optional<Cart> existingCart = cartRepository.findByUserId(userId);
        Cart cart = existingCart.orElse(new Cart());
        
        cart.setUserId(userId);
        cart.setItems(cartData.getItems());
        cart.setTotal(cartData.getTotal());
        cart.setUpdatedAt(LocalDateTime.now());

        cartRepository.save(cart);
        return ResponseEntity.ok(Map.of("ok", true));
    }
}
