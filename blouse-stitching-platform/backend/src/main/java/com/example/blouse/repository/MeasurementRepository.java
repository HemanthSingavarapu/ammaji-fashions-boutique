package com.example.blouse.repository;

import com.example.blouse.entity.Measurement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MeasurementRepository extends JpaRepository<Measurement, Long> {
    Optional<Measurement> findByOrderId(Long orderId);
}
