package com.organicfruits.api.services;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.organicfruits.api.models.Product;
import com.organicfruits.api.models.User;
import com.organicfruits.api.repositories.ProductRepository;
import com.organicfruits.api.repositories.UserRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.util.List;

@Service
public class DataSeeder {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostConstruct
    public void seedData() {
        if (productRepository.count() == 0) {
            ObjectMapper mapper = new ObjectMapper();
            try {
                File jsonFile = new File("data/products.json");
                System.out.println("Checking for products.json at: " + jsonFile.getAbsolutePath());
                if (jsonFile.exists()) {
                    List<Product> products = mapper.readValue(jsonFile, new TypeReference<List<Product>>() {});
                    productRepository.saveAll(products);
                    System.out.println("✓ Successfully seeded " + products.size() + " products");
                } else {
                    System.err.println("✗ CRITICAL: products.json NOT FOUND at " + jsonFile.getAbsolutePath());
                }
            } catch (IOException e) {
                System.err.println("✗ Failed to seed products: " + e.getMessage());
                e.printStackTrace();
            }
        }

        // Seed Admin if missing
        if (userRepository.findByEmail("admin@organicfruits.com").isEmpty()) {
            User admin = User.builder()
                    .name("Administrator")
                    .email("admin@organicfruits.com")
                    .password(passwordEncoder.encode("admin123"))
                    .role("admin")
                    .build();
            userRepository.save(admin);
            System.out.println("✓ Seeded Admin user: admin@organicfruits.com / admin123");
        }
    }
}
