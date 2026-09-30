package com.example.orderservice.DTO;

import lombok.Data;

@Data
public class OrderRequestDTO {

    private Long userId;
    private Long productId;
    private Integer quantity;
    private DeliveryAddressDTO deliveryAddressDTO;

}
