package com.store.itstorebackend.dto;

import lombok.Data;

import java.util.List;

@Data
public class SaleRequest {
    private Long customerId;
    private List<SaleItemRequest> items;
}