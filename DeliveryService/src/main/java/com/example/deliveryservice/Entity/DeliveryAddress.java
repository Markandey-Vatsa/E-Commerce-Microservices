package com.example.deliveryservice.Entity;
import jakarta.persistence.Embeddable;
import lombok.Data;


@Data
@Embeddable
public class DeliveryAddress {
    private String houseNumber;
    private String street;
    private String city;
    private String state;
    private String postalCode;
}