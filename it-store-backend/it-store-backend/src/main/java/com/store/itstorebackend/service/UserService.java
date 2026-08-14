package com.store.itstorebackend.service;

import com.store.itstorebackend.dto.UserResponse;
import com.store.itstorebackend.dto.UserUpdateRequest;
import com.store.itstorebackend.entity.Role;
import com.store.itstorebackend.entity.User;
import com.store.itstorebackend.repository.RoleRepository;
import com.store.itstorebackend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    public UserResponse updateUser(Long id, UserUpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable."));

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());

        if (request.getRole() != null) {
            Role role = roleRepository.findByName(request.getRole())
                    .orElseThrow(() -> new RuntimeException("Rôle introuvable : " + request.getRole()));
            user.setRole(role);
        }

        userRepository.save(user);
        return toResponse(user);
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    private UserResponse toResponse(User user) {
        String roleName = user.getRole() != null ? user.getRole().getName() : null;
        return new UserResponse(user.getId(), user.getEmail(), user.getFirstName(), user.getLastName(), roleName);
    }
}