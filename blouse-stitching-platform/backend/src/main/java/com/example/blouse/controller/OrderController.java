package com.example.blouse.controller;

import com.example.blouse.dto.OrderRequest;
import com.example.blouse.entity.*;
import com.example.blouse.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderRepository orderRepository;
    private final DesignRepository designRepository;
    private final UserRepository userRepository;
    private final MeasurementRepository measurementRepository;
    private final OrderStatusHistoryRepository historyRepository;

    public OrderController(OrderRepository orderRepository, DesignRepository designRepository, UserRepository userRepository, MeasurementRepository measurementRepository, OrderStatusHistoryRepository historyRepository) {
        this.orderRepository = orderRepository;
        this.designRepository = designRepository;
        this.userRepository = userRepository;
        this.measurementRepository = measurementRepository;
        this.historyRepository = historyRepository;
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return userRepository.findByEmail(auth.getName()).orElseThrow();
    }

    @PostMapping
    public ResponseEntity<Order> createOrder(@RequestBody OrderRequest request) {
        User user = getCurrentUser();
        
        Order order = new Order();
        // Generate Order ID: BLYYYYMMDDXXXX
        String dateStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        long count = orderRepository.count() + 1;
        order.setOrderNumber(String.format("BL%s%04d", dateStr, count));
        
        order.setUser(user);
        
        BigDecimal basePrice = new BigDecimal("0");
        if (request.getDesignId() != null) {
            Design design = designRepository.findById(request.getDesignId()).orElseThrow();
            order.setDesign(design);
            basePrice = design.getPrice();
        } else {
            order.setCustomDesignName(request.getCustomDesignName());
            order.setCustomDesignDetails(request.getCustomDesignDetails());
        }
        
        // Accept total calculated amount from frontend (excludes courier charges, billed at actuals)
        if (request.getAmount() != null) {
            order.setAmount(request.getAmount());
        } else {
            order.setAmount(basePrice);
        }
        
        order.setPaymentType(request.getPaymentType());
        order.setPaidAmount(request.getPaidAmount());
        order.setBalanceAmount(request.getBalanceAmount());
        order.setTransactionNumber(request.getTransactionNumber());
        
        order.setCourierOption(request.getCourierOption());
        order.setPaymentStatus(PaymentStatus.PENDING);
        order.setDeliveryAddress(request.getDeliveryAddress());
        order.setSpecialInstructions(request.getSpecialInstructions());
        
        order = orderRepository.save(order);
        
        Measurement measurement = request.getMeasurement();
        measurement.setOrder(order);
        measurementRepository.save(measurement);
        
        OrderStatusHistory history = new OrderStatusHistory();
        history.setOrder(order);
        history.setStatus(OrderStatus.ORDER_PLACED);
        history.setComment("Order created successfully.");
        history.setUpdatedBy(user.getName());
        historyRepository.save(history);
        
        return ResponseEntity.ok(order);
    }

    @GetMapping("/my-orders")
    public ResponseEntity<List<Order>> getMyOrders() {
        User user = getCurrentUser();
        return ResponseEntity.ok(orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrder(@PathVariable Long id) {
        User user = getCurrentUser();
        return orderRepository.findByIdAndUserId(id, user.getId())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/track/{orderNumber}")
    public ResponseEntity<Order> trackOrder(@PathVariable String orderNumber) {
        return orderRepository.findByOrderNumber(orderNumber)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteOrder(@PathVariable Long id) {
        User user = getCurrentUser();
        return orderRepository.findByIdAndUserId(id, user.getId())
                .map(order -> {
                    if (order.getPaymentStatus() == PaymentStatus.PENDING || order.getOrderStatus() == OrderStatus.CANCELLED) {
                        historyRepository.deleteAll(historyRepository.findByOrderIdOrderByCreatedAtAsc(id));
                        measurementRepository.findByOrderId(id).ifPresent(measurementRepository::delete);
                        orderRepository.delete(order);
                        return ResponseEntity.ok().build();
                    }
                    return ResponseEntity.badRequest().body("Cannot delete confirmed order");
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
