package com.example.blouse.controller;

import com.example.blouse.dto.AuthRequest;
import com.example.blouse.dto.AuthResponse;
import com.example.blouse.dto.RegisterRequest;
import com.example.blouse.entity.Role;
import com.example.blouse.entity.User;
import com.example.blouse.repository.UserRepository;
import com.example.blouse.security.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(AuthenticationManager authenticationManager, UserDetailsService userDetailsService, JwtUtil jwtUtil, UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        String identifier = request.getEmail() != null ? request.getEmail().trim() : "";
        
        // Find user by email (case-insensitive) or by mobile
        User user = userRepository.findByEmailIgnoreCase(identifier)
                .or(() -> userRepository.findByMobile(identifier))
                .orElse(null);

        if (user == null) {
            return ResponseEntity.status(401).body("Invalid user or user details not found. Please register.");
        }

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(user.getEmail(), request.getPassword())
            );
        } catch (Exception ex) {
            return ResponseEntity.status(401).body("Incorrect password. Please check your password.");
        }

        final UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        final String jwt = jwtUtil.generateToken(userDetails);

        return ResponseEntity.ok(new AuthResponse(jwt, user));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        String email = request.getEmail() != null ? request.getEmail().trim().toLowerCase() : "";
        String mobile = request.getMobile() != null ? request.getMobile().trim() : "";

        if (userRepository.existsByEmailIgnoreCase(email)) {
            return ResponseEntity.badRequest().body("An account with this email already exists. Please log in.");
        }

        if (!mobile.isEmpty() && userRepository.existsByMobile(mobile)) {
            return ResponseEntity.badRequest().body("An account with this mobile number already exists. Please log in.");
        }

        User user = new User();
        user.setName(request.getName() != null ? request.getName().trim() : "");
        user.setEmail(email);
        user.setMobile(mobile);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.USER);
        user.setAddress(request.getAddress());
        user.setCity(request.getCity());
        user.setState(request.getState());
        user.setPincode(request.getPincode());

        userRepository.save(user);

        return ResponseEntity.ok("User registered successfully");
    }
    
    @PostMapping("/setup-admin")
    public ResponseEntity<?> setupAdmin() {
        if (userRepository.existsByEmail("admin@blouse.com")) {
            return ResponseEntity.ok("Admin already exists");
        }
        User admin = new User();
        admin.setName("Admin");
        admin.setEmail("admin@blouse.com");
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setRole(Role.ADMIN);
        userRepository.save(admin);
        return ResponseEntity.ok("Admin created");
    }
}
