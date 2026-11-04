package com.example.blouse.controller;

import com.example.blouse.entity.User;
import com.example.blouse.entity.UserMeasurement;
import com.example.blouse.repository.UserMeasurementRepository;
import com.example.blouse.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users/me/measurements")
public class MeasurementProfileController {

    private final UserMeasurementRepository measurementRepository;
    private final UserRepository userRepository;

    public MeasurementProfileController(UserMeasurementRepository measurementRepository, UserRepository userRepository) {
        this.measurementRepository = measurementRepository;
        this.userRepository = userRepository;
    }

    private User getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return userRepository.findByEmail(auth.getName()).orElseThrow();
    }

    @GetMapping
    public ResponseEntity<UserMeasurement> getMeasurements() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
                return ResponseEntity.ok(null);
            }
            return userRepository.findByEmail(auth.getName())
                    .flatMap(user -> measurementRepository.findByUserId(user.getId()))
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.ok(null));
        } catch (Exception e) {
            return ResponseEntity.ok(null);
        }
    }

    @PostMapping
    public UserMeasurement saveMeasurements(@RequestBody UserMeasurement measurements) {
        User user = getAuthenticatedUser();
        
        UserMeasurement existing = measurementRepository.findByUserId(user.getId()).orElse(new UserMeasurement());
        existing.setUser(user);
        existing.setBust(measurements.getBust());
        existing.setWaist(measurements.getWaist());
        existing.setShoulder(measurements.getShoulder());
        existing.setBlouseLength(measurements.getBlouseLength());
        existing.setSleeveLength(measurements.getSleeveLength());
        existing.setArmhole(measurements.getArmhole());
        existing.setFrontNeck(measurements.getFrontNeck());
        existing.setBackNeck(measurements.getBackNeck());
        existing.setOtherMeasurements(measurements.getOtherMeasurements());
        
        return measurementRepository.save(existing);
    }
}
