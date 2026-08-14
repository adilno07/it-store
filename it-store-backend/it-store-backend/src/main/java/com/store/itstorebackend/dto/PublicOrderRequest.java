package com.store.itstorebackend.dto;

import lombok.Data;

import java.util.List;

@Data
public class PublicOrderRequest {
    private String firstName;
    private String lastName;
    private String phone;
    private String email;
    private String address;
    private List<SaleItemRequest> items;
}