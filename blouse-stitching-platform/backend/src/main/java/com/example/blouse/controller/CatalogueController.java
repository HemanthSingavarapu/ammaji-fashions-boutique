package com.example.blouse.controller;

import com.example.blouse.entity.Category;
import com.example.blouse.entity.Design;
import com.example.blouse.repository.CategoryRepository;
import com.example.blouse.repository.DesignRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class CatalogueController {

    private final CategoryRepository categoryRepository;
    private final DesignRepository designRepository;

    public CatalogueController(CategoryRepository categoryRepository, DesignRepository designRepository) {
        this.categoryRepository = categoryRepository;
        this.designRepository = designRepository;
    }

    @GetMapping("/categories")
    public List<Category> getCategories() {
        return categoryRepository.findByActiveTrue();
    }
    
    @GetMapping("/categories/{id}")
    public ResponseEntity<Category> getCategory(@PathVariable Long id) {
        return categoryRepository.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/designs")
    public List<Design> getDesigns() {
        return designRepository.findByActiveTrue();
    }

    @GetMapping("/designs/featured")
    public List<Design> getFeaturedDesigns() {
        return designRepository.findByFeaturedTrueAndActiveTrue();
    }

    @GetMapping("/designs/category/{categoryId}")
    public List<Design> getDesignsByCategory(@PathVariable Long categoryId) {
        return designRepository.findByCategoryIdAndActiveTrue(categoryId);
    }

    @GetMapping("/designs/{id}")
    public ResponseEntity<Design> getDesign(@PathVariable Long id) {
        return designRepository.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }
}
