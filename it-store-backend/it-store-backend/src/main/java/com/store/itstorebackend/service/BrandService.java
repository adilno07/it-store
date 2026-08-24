package com.store.itstorebackend.service;

import com.store.itstorebackend.entity.Brand;
import com.store.itstorebackend.repository.BrandRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BrandService {

    @Autowired
    private BrandRepository brandRepository;

    public List<Brand> getAllBrands() {
        return brandRepository.findAll();
    }

    public Brand createBrand(Brand brand) {
        return brandRepository.save(brand);
    }

    public Brand updateBrand(Long id, Brand updatedBrand) {
        updatedBrand.setId(id);
        return brandRepository.save(updatedBrand);
    }

    public void deleteBrand(Long id) {
        brandRepository.deleteById(id);
    }
}