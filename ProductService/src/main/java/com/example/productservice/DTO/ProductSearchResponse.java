package com.example.productservice.DTO;

import lombok.Data;

import java.util.List;

@Data
public class ProductSearchResponse {
    private List<ProductDTO> content;

    private Integer totalElements;

    private Integer totalPages;

    private Integer number;

    private Integer size;

    private Boolean first;

    private Boolean last;

    private Boolean empty;
}
