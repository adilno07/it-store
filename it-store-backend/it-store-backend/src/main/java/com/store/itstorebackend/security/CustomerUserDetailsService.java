package com.store.itstorebackend.security;

import com.store.itstorebackend.entity.Customer;
import com.store.itstorebackend.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomerUserDetailsService implements UserDetailsService {

    @Autowired
    private CustomerRepository customerRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Customer customer = customerRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Client introuvable : " + email));

        if (customer.getPassword() == null) {
            throw new UsernameNotFoundException("Ce compte n'a pas de mot de passe défini.");
        }

        return org.springframework.security.core.userdetails.User
                .withUsername(customer.getEmail())
                .password(customer.getPassword())
                .authorities(new SimpleGrantedAuthority("ROLE_CUSTOMER"))
                .build();
    }
}