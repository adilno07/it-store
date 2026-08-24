package com.store.itstorebackend.service;

import com.store.itstorebackend.entity.Customer;
import com.store.itstorebackend.entity.Favorite;
import com.store.itstorebackend.entity.Product;
import com.store.itstorebackend.repository.CustomerRepository;
import com.store.itstorebackend.repository.FavoriteRepository;
import com.store.itstorebackend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class FavoriteService {

    @Autowired
    private FavoriteRepository favoriteRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private ProductRepository productRepository;

    public List<Favorite> getFavoritesByCustomer(Long customerId) {
        return favoriteRepository.findByCustomerId(customerId);
    }

    @Transactional
    public Favorite addFavorite(Long customerId, Long productId) {
        boolean alreadyExists = favoriteRepository
                .findByCustomerIdAndProductId(customerId, productId)
                .isPresent();

        if (alreadyExists) {
            return favoriteRepository.findByCustomerIdAndProductId(customerId, productId).get();
        }

        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Client introuvable."));
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Produit introuvable."));

        Favorite favorite = new Favorite();
        favorite.setCustomer(customer);
        favorite.setProduct(product);

        return favoriteRepository.save(favorite);
    }

    @Transactional
    public void removeFavorite(Long customerId, Long productId) {
        favoriteRepository.deleteByCustomerIdAndProductId(customerId, productId);
    }
}