package com.example.productservice.Entity;


import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;

@Entity
@Data
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String description;

    @Column(nullable = false,precision = 12, scale = 2)
    private BigDecimal price;

    @Column(nullable = false)
    private Integer stock;

    private String sellerEmail;
}
