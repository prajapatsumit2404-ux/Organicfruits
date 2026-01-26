package com.organicfruits.api.controllers;

import com.organicfruits.api.models.Product;
import com.organicfruits.api.repositories.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    @GetMapping
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    @PostMapping
    public Product createProduct(@RequestBody Product product) {
        return productRepository.save(product);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable String id, @RequestBody Product productDetails) {
        Optional<Product> productOpt = productRepository.findById(id);
        if (productOpt.isEmpty()) return ResponseEntity.notFound().build();

        Product product = productOpt.get();
        product.setName(productDetails.getName());
        product.setPrice(productDetails.getPrice());
        product.setCategory(productDetails.getCategory());
        product.setImage(productDetails.getImage());
        product.setDescription(productDetails.getDescription());
        product.setFeatured(productDetails.getFeatured());

        return ResponseEntity.ok(productRepository.save(product));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable String id) {
        if (!productRepository.existsById(id)) return ResponseEntity.notFound().build();
        productRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/seed/initial")
    public ResponseEntity<?> seedProducts() {
        ObjectMapper mapper = new ObjectMapper();
        try {
            File jsonFile = new File("data/products.json");
            if (!jsonFile.exists()) {
                return ResponseEntity.badRequest().body("data/products.json not found");
            }
            List<Product> products = mapper.readValue(jsonFile, new TypeReference<List<Product>>() {});
            productRepository.deleteAll();
            productRepository.saveAll(products);
            return ResponseEntity.ok("Seeded " + products.size() + " products successfully");
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Failed to seed: " + e.getMessage());
        }
    }
}
