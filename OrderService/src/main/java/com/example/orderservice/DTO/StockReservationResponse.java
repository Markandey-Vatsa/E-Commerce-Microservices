package com.example.orderservice.DTO;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class StockReservationResponse {

    private boolean success;

    private Long reservationId;

    private Long productId;

    private Integer quantity;

    private BigDecimal unitPrice;

    private String message;
}

