package com.example.ChatBotService.DTO;


import lombok.Data;
import org.springframework.ai.tool.annotation.ToolParam;

import java.math.BigDecimal;

@Data
public class ProductSearchRequest {
    @ToolParam(description = "Product name or search keyword")
    private String keyword;

    @ToolParam(description = "Maximum product price in INR")
    private BigDecimal maxPrice;

    @ToolParam(description = "Minimum product price in INR")
    private BigDecimal minPrice;
}
