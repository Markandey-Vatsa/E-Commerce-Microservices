package com.example.orderservice.DTO;

import lombok.Data;

import java.util.UUID;

@Data
public class OrderResponse {

    private boolean success;
    private UUID orderId;
    private String message;
}