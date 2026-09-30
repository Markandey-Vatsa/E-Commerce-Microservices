package com.example.orderservice.DTO;


import lombok.Data;

@Data
public class DeliveryTransferDTO {
    private Long orderId;
    private Long userId;
    private DeliveryAddressDTO deliveryAddress;
}
