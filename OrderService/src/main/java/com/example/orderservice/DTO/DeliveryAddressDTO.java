package com.example.orderservice.DTO;


import lombok.Data;

@Data
public class DeliveryAddressDTO {
    private String houseNumber;
    private String street;
    private String city;
    private String state;
    private String postalCode;
}
