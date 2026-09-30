package com.example.deliveryservice.Entity;
import jakarta.persistence.*;
import lombok.Data;


@Data
@Entity
public class DeliveryAddress {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long userId;
    private String houseNumber;
    private String street;
    private String city;
    private String state;
    private String postalCode;
}