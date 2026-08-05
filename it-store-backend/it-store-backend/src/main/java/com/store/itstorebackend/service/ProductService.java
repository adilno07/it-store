package com.store.itstorebackend.service;

import com.store.itstorebackend.entity.Product;
import com.store.itstorebackend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductService {
    @Autowired
    private ProductRepository productRepository;

    public List<Product> getAllProducts(){
        return productRepository.findAll();
    }

    public Product getProductById(Long id){
        return productRepository.findById(id).orElse(null);
    }

    public Product createProduct(Product product){
        return productRepository.save(product);
    }

    public Product updateProduct(Long id, Product updatedProduct){
        updatedProduct.setId(id);
        return productRepository.save(updatedProduct);
    }

    public void deleteProduct(Long id){
        productRepository.deleteById(id);
    }

    public List<Product> searchProducts(String name, Long categoryId, Long brandId, Double minPrice, Double maxPrice) {
        return productRepository.searchProducts(name, categoryId, brandId, minPrice, maxPrice);
    }
}
