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

    // Vente créée directement par un employé/admin en magasin : confirmée immédiatement, stock déduit tout de suite
    @Transactional
    public Sale createSale(SaleRequest request) {
        return createSaleInternal(request, SaleSource.IN_STORE, OrderStatus.CONFIRMED, true);
    }

    // Utilisé par le flow public (commande en ligne) : reste PENDING, stock non déduit
    @Transactional
    public Sale createPendingOrder(SaleRequest request) {
        return createSaleInternal(request, SaleSource.ONLINE, OrderStatus.PENDING, false);
    }

    private Sale createSaleInternal(SaleRequest request, SaleSource source, OrderStatus status, boolean deductStock) {

        Customer customer = null;
        if (request.getCustomerId() != null) {
            customer = customerRepository.findById(request.getCustomerId())
                    .orElseThrow(() -> new RuntimeException("Client introuvable"));
        }

        Sale sale = new Sale();
        sale.setCustomer(customer);
        sale.setSaleDate(LocalDateTime.now());
        sale.setSource(source);
        sale.setStatus(status);

        List<SaleItem> items = new ArrayList<>();
        double total = 0.0;

        for (SaleItemRequest itemRequest : request.getItems()) {

            Product product = productRepository.findById(itemRequest.getProductId())
                    .orElseThrow(() -> new RuntimeException("Produit introuvable : " + itemRequest.getProductId()));

            if (deductStock && product.getQuantity() < itemRequest.getQuantity()) {
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

            if (deductStock) {
                product.setQuantity(product.getQuantity() - itemRequest.getQuantity());
                productRepository.save(product);
            }
        }

        sale.setItems(items);
        sale.setTotal(total);

        return saleRepository.save(sale);
    }

    // Confirmation d'une commande en attente par le staff : déduit le stock à ce moment-là
    @Transactional
    public Sale confirmOrder(Long id) {
        Sale sale = saleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Commande introuvable."));

        if (sale.getStatus() != OrderStatus.PENDING) {
            throw new RuntimeException("Seule une commande en attente peut être confirmée.");
        }

        for (SaleItem item : sale.getItems()) {
            Product product = item.getProduct();
            if (product.getQuantity() < item.getQuantity()) {
                throw new RuntimeException("Stock insuffisant pour : " + product.getName());
            }
            product.setQuantity(product.getQuantity() - item.getQuantity());
            productRepository.save(product);
        }

        sale.setStatus(OrderStatus.CONFIRMED);
        return saleRepository.save(sale);
    }

    // Annulation d'une commande en attente : aucun impact sur le stock (jamais déduit)
    @Transactional
    public Sale cancelOrder(Long id) {
        Sale sale = saleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Commande introuvable."));

        if (sale.getStatus() != OrderStatus.PENDING) {
            throw new RuntimeException("Seule une commande en attente peut être annulée.");
        }

        sale.setStatus(OrderStatus.CANCELLED);
        return saleRepository.save(sale);
    }

    public void deleteSale(Long id) {
        saleRepository.deleteById(id);
    }
}