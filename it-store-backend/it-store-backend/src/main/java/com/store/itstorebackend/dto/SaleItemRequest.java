package com.store.itstorebackend.dto;

import lombok.Data;

@Data
public class SaleItemRequest {
    private Long productId;
    private Integer quantity;
}