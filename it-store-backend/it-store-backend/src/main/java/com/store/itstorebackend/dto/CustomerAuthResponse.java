package com.store.itstorebackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CustomerAuthResponse {
    private String token;
    private Long customerId;
    private String email;
    private String firstName;
    private String lastName;
}