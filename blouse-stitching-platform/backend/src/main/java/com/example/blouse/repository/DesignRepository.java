package com.example.blouse.repository;

import com.example.blouse.entity.Design;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DesignRepository extends JpaRepository<Design, Long> {
    List<Design> findByActiveTrue();
    List<Design> findByCategoryIdAndActiveTrue(Long categoryId);
    List<Design> findByFeaturedTrueAndActiveTrue();
}
