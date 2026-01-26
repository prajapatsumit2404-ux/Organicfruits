package com.organicfruits.api.repositories;

import com.organicfruits.api.models.Product;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ProductRepository extends MongoRepository<Product, String> {
}
