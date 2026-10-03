package com.example.deliveryservice.DTO;



import lombok.Data;

import java.util.UUID;

@Data
public class DeliveryTransferDTO {
    private UUID orderId;
    private Long userId;
    private DeliveryAddressDTO deliveryAddress;
}
