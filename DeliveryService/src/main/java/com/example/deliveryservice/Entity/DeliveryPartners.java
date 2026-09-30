package com.example.deliveryservice.Entity;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
public class DeliveryPartners {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    private String name;

    private String phone;

    private String pinCode;

    @Enumerated(EnumType.STRING)
    private PartnerStatus status;
}