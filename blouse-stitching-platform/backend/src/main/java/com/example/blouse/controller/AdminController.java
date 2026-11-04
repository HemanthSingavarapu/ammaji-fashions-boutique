package com.example.blouse.controller;

import com.example.blouse.entity.*;
import com.example.blouse.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final OrderRepository orderRepository;
    private final CategoryRepository categoryRepository;
    private final DesignRepository designRepository;
    private final UserRepository userRepository;
    private final OrderStatusHistoryRepository historyRepository;
    private final com.example.blouse.service.EmailService emailService;

    public AdminController(OrderRepository orderRepository, CategoryRepository categoryRepository, DesignRepository designRepository, UserRepository userRepository, OrderStatusHistoryRepository historyRepository, com.example.blouse.service.EmailService emailService) {
        this.orderRepository = orderRepository;
        this.categoryRepository = categoryRepository;
        this.designRepository = designRepository;
        this.userRepository = userRepository;
        this.historyRepository = historyRepository;
        this.emailService = emailService;
    }

    @GetMapping("/orders")
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<Order> getOrder(@PathVariable Long id) {
        return orderRepository.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/users")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    
    @PutMapping("/orders/{id}/status")
    public ResponseEntity<Order> updateOrderStatus(@PathVariable Long id, @RequestParam OrderStatus status, @RequestParam String comment) {
        Order order = orderRepository.findById(id).orElseThrow();
        order.setOrderStatus(status);
        orderRepository.save(order);
        
        OrderStatusHistory history = new OrderStatusHistory();
        history.setOrder(order);
        history.setStatus(status);
        history.setComment(comment);
        history.setUpdatedBy("Admin");
        historyRepository.save(history);
        
        // Send email notification to user
        if (order.getUser() != null && order.getUser().getEmail() != null) {
            emailService.sendOrderStatusUpdate(
                order.getUser().getEmail(),
                order.getUser().getName() != null ? order.getUser().getName() : "Customer",
                order.getOrderNumber(),
                status.name(),
                comment
            );
        }
        
        return ResponseEntity.ok(order);
    }

    @PostMapping("/categories")
    public Category createCategory(@RequestBody Category category) {
        return categoryRepository.save(category);
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<Category> updateCategory(@PathVariable Long id, @RequestBody Category categoryDetails) {
        return categoryRepository.findById(id).map(category -> {
            category.setName(categoryDetails.getName());
            category.setActive(categoryDetails.isActive());
            return ResponseEntity.ok(categoryRepository.save(category));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable Long id) {
        return categoryRepository.findById(id).map(category -> {
            categoryRepository.delete(category);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/designs")
    public Design createDesign(@RequestBody Design design) {
        return designRepository.save(design);
    }

    @PutMapping("/designs/{id}")
    public ResponseEntity<Design> updateDesign(@PathVariable Long id, @RequestBody Design designDetails) {
        return designRepository.findById(id).map(design -> {
            design.setName(designDetails.getName());
            design.setPrice(designDetails.getPrice());
            design.setDescription(designDetails.getDescription());
            design.setImageUrl(designDetails.getImageUrl());
            design.setCategory(designDetails.getCategory());
            design.setActive(designDetails.isActive());
            design.setFeatured(designDetails.isFeatured());
            return ResponseEntity.ok(designRepository.save(design));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/designs/{id}")
    public ResponseEntity<?> deleteDesign(@PathVariable Long id) {
        return designRepository.findById(id).map(design -> {
            designRepository.delete(design);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }
}
