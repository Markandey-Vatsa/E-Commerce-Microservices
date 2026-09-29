package com.example.deliveryservice.Entity;
import jakarta.persistence.*;

@Entity
public class DeliveryPartner {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    private String name;

    private String phone;

    private Integer pinCode;

    @Enumerated(EnumType.STRING)
    private PartnerStatus status;
}