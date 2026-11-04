package com.example.blouse.security;

import com.example.blouse.entity.User;
import com.example.blouse.repository.UserRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String identifier) throws UsernameNotFoundException {
        String cleanIdentifier = identifier != null ? identifier.trim() : "";
        User user = userRepository.findByEmailIgnoreCase(cleanIdentifier)
                .or(() -> userRepository.findByMobile(cleanIdentifier))
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email or mobile: " + cleanIdentifier));

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
        );
    }
}
