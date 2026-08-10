package com.store.itstorebackend.service;

import com.store.itstorebackend.dto.SaleItemRequest;
import com.store.itstorebackend.dto.SaleRequest;
import com.store.itstorebackend.entity.*;
import com.store.itstorebackend.repository.CustomerRepository;
import com.store.itstorebackend.repository.ProductRepository;
import com.store.itstorebackend.repository.SaleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class SaleService {

    @Autowired
    private SaleRepository saleRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CustomerRepository customerRepository;

    public List<Sale> getAllSales() {
        return saleRepository.findAll();
    }

    public Sale getSaleById(Long id) {
        return saleRepository.findById(id).orElse(null);
    }

    @Transactional
    public Sale createSale(SaleRequest request) {

        Customer customer = null;
        if (request.getCustomerId() != null) {
            customer = customerRepository.findById(request.getCustomerId())
                    .orElseThrow(() -> new RuntimeException("Client introuvable"));
        }

        Sale sale = new Sale();
        sale.setCustomer(customer);
        sale.setSaleDate(LocalDateTime.now());

        List<SaleItem> items = new ArrayList<>();
        double total = 0.0;

        for (SaleItemRequest itemRequest : request.getItems()) {

            Product product = productRepository.findById(itemRequest.getProductId())
                    .orElseThrow(() -> new RuntimeException("Produit introuvable : " + itemRequest.getProductId()));

            if (product.getQuantity() < itemRequest.getQuantity()) {
                throw new RuntimeException("Stock insuffisant pour : " + product.getName() +
                        " (disponible : " + product.getQuantity() + ", demandé : " + itemRequest.getQuantity() + ")");
            }

            SaleItem item = new SaleItem();
            item.setSale(sale);
            item.setProduct(product);
            item.setQuantity(itemRequest.getQuantity());
            item.setUnitPrice(product.getPrice());

            items.add(item);
            total += product.getPrice() * itemRequest.getQuantity();

            product.setQuantity(product.getQuantity() - itemRequest.getQuantity());
            productRepository.save(product);
        }

        sale.setItems(items);
        sale.setTotal(total);

        return saleRepository.save(sale);
    }

    public void deleteSale(Long id) {
        saleRepository.deleteById(id);
    }
}