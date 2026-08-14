package com.store.itstorebackend.controller;

import com.store.itstorebackend.dto.AuthResponse;
import com.store.itstorebackend.dto.LoginRequest;
import com.store.itstorebackend.dto.RegisterRequest;
import com.store.itstorebackend.entity.Role;
import com.store.itstorebackend.entity.User;
import com.store.itstorebackend.repository.RoleRepository;
import com.store.itstorebackend.repository.UserRepository;
import com.store.itstorebackend.security.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:4200")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    // Réservé aux ADMIN déjà connectés : création d'un nouvel employé/admin
    @PostMapping("/register")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Un compte existe déjà avec cet email.");
        }

        String roleName = (request.getRole() != null) ? request.getRole() : "EMPLOYEE";

        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new RuntimeException("Rôle introuvable : " + roleName));

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setRole(role);

        userRepository.save(user);

        String token = jwtService.generateToken(user.getEmail(), role.getName());

        return ResponseEntity.ok(new AuthResponse(
                token, user.getEmail(), user.getFirstName(), user.getLastName(), role.getName()
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElse(null);

        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return ResponseEntity.status(401).body("Email ou mot de passe incorrect.");
        }

        String roleName = user.getRole() != null ? user.getRole().getName() : "EMPLOYEE";
        String token = jwtService.generateToken(user.getEmail(), roleName);

        return ResponseEntity.ok(new AuthResponse(
                token, user.getEmail(), user.getFirstName(), user.getLastName(), roleName
        ));
    }
    @ExceptionHandler(org.springframework.security.access.AccessDeniedException.class)
    public ResponseEntity<String> handleAccessDenied(org.springframework.security.access.AccessDeniedException ex) {
        return ResponseEntity.status(403).body("Accès refusé : réservé aux administrateurs.");
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<String> handleRuntimeException(RuntimeException ex) {
        return ResponseEntity.badRequest().body(ex.getMessage());
    }
}