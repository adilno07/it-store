package com.store.itstorebackend.controller;

import com.store.itstorebackend.entity.Favorite;
import com.store.itstorebackend.service.FavoriteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/public/favorites")
@CrossOrigin(origins = "http://localhost:4200")
public class FavoriteController {

    @Autowired
    private FavoriteService favoriteService;

    @GetMapping("/{customerId}")
    public List<Favorite> getFavorites(@PathVariable Long customerId) {
        return favoriteService.getFavoritesByCustomer(customerId);
    }

    @PostMapping
    public Favorite addFavorite(@RequestParam Long customerId, @RequestParam Long productId) {
        return favoriteService.addFavorite(customerId, productId);
    }

    @DeleteMapping
    public void removeFavorite(@RequestParam Long customerId, @RequestParam Long productId) {
        favoriteService.removeFavorite(customerId, productId);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<String> handleRuntimeException(RuntimeException ex) {
        return ResponseEntity.badRequest().body(ex.getMessage());
    }
}