package com.organicfruits.api.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
@Document(collection = "products")
public class Product {
    @Id
    private String id;
    private String name;
    private Double price;
    private String category;
    private String image;
    private String description;
    private Boolean featured;
    private String unit;
    private Integer stock;
    private Double rating;
    private Integer reviews;
}
