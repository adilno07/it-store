package com.store.itstorebackend.controller;

import com.store.itstorebackend.dto.PublicOrderRequest;
import com.store.itstorebackend.dto.SaleRequest;
import com.store.itstorebackend.entity.Customer;
import com.store.itstorebackend.entity.Sale;
import com.store.itstorebackend.repository.CustomerRepository;
import com.store.itstorebackend.service.SaleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public/orders")
@CrossOrigin(origins = "http://localhost:4200")
public class PublicOrderController {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private SaleService saleService;

    @PostMapping
    public ResponseEntity<?> placeOrder(@RequestBody PublicOrderRequest request) {

        // 1. Créer le client à la volée avec les infos fournies
        Customer customer = new Customer();
        customer.setFirstName(request.getFirstName());
        customer.setLastName(request.getLastName());
        customer.setPhone(request.getPhone());
        customer.setEmail(request.getEmail());
        customer.setAddress(request.getAddress());
        customer = customerRepository.save(customer);

        // 2. Construire la requête de vente à partir de ce client
        SaleRequest saleRequest = new SaleRequest();
        saleRequest.setCustomerId(customer.getId());
        saleRequest.setItems(request.getItems());

        // 3. Créer la commande en attente (PENDING, stock non déduit)
        Sale sale = saleService.createPendingOrder(saleRequest);

        return ResponseEntity.ok(sale);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<String> handleRuntimeException(RuntimeException ex) {
        return ResponseEntity.badRequest().body(ex.getMessage());
    }
}