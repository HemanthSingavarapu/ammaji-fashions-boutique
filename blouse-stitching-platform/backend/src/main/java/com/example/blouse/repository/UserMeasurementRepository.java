package com.example.blouse.repository;

import com.example.blouse.entity.UserMeasurement;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserMeasurementRepository extends JpaRepository<UserMeasurement, Long> {
    Optional<UserMeasurement> findByUserId(Long userId);
}
