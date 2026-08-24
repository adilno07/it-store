package com.store.itstorebackend.controller;

import com.store.itstorebackend.dto.CustomerAuthResponse;
import com.store.itstorebackend.dto.CustomerLoginRequest;
import com.store.itstorebackend.dto.CustomerRegisterRequest;
import com.store.itstorebackend.entity.Customer;
import com.store.itstorebackend.repository.CustomerRepository;
import com.store.itstorebackend.security.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public/auth")
@CrossOrigin(origins = "http://localhost:4200")
public class CustomerAuthController {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody CustomerRegisterRequest request) {

        if (customerRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Un compte existe déjà avec cet email.");
        }

        Customer customer = new Customer();
        customer.setFirstName(request.getFirstName());
        customer.setLastName(request.getLastName());
        customer.setEmail(request.getEmail());
        customer.setPhone(request.getPhone());
        customer.setPassword(passwordEncoder.encode(request.getPassword()));

        customerRepository.save(customer);

        String token = jwtService.generateToken(customer.getEmail(), "CUSTOMER");

        return ResponseEntity.ok(new CustomerAuthResponse(
                token, customer.getId(), customer.getEmail(),
                customer.getFirstName(), customer.getLastName()
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody CustomerLoginRequest request) {

        Customer customer = customerRepository.findByEmail(request.getEmail()).orElse(null);

        if (customer == null || customer.getPassword() == null ||
                !passwordEncoder.matches(request.getPassword(), customer.getPassword())) {
            return ResponseEntity.status(401).body("Email ou mot de passe incorrect.");
        }

        String token = jwtService.generateToken(customer.getEmail(), "CUSTOMER");

        return ResponseEntity.ok(new CustomerAuthResponse(
                token, customer.getId(), customer.getEmail(),
                customer.getFirstName(), customer.getLastName()
        ));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<String> handleRuntimeException(RuntimeException ex) {
        return ResponseEntity.badRequest().body(ex.getMessage());
    }
}