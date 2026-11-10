package com.example.ChatBotService.DTO;


import lombok.Data;
import java.math.BigDecimal;

@Data
public class ProductServiceSearchRequest {
    private String keyword;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private Integer page = 0;
    private Integer size = 10;
}