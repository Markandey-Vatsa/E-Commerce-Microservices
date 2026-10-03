package com.example.orderservice.DTO;


import jakarta.validation.constraints.Positive;
import lombok.Data;
import org.antlr.v4.runtime.misc.NotNull;

import java.util.UUID;

@Data
public class StockReservationRequest {

    @NotNull
    private UUID orderId;
    @NotNull
    private Long productId;
    @NotNull
    @Positive
    private Integer quantity;
}
