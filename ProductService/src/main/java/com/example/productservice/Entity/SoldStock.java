//package com.example.productservice.Entity;
//
//import jakarta.persistence.*;
//import lombok.Data;
//
//import java.time.LocalDateTime;
//import java.util.UUID;
//
//@Entity
//@Data
//public class SoldStock {
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long Id;
//
//    @Column(nullable = false)
//    private UUID orderId;
//
//    @Column(nullable = false)
//    private Long productId;
//
//    @Column(nullable = false)
//    private Integer quantity;
//
//    @Column(nullable = false)
//    private LocalDateTime createdAt;
//
//}
