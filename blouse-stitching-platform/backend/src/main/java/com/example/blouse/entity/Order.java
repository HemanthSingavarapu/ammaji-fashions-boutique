package com.example.blouse.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "orders")
@Data
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true)
    private String orderNumber;
    
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    
    @ManyToOne
    @JoinColumn(name = "design_id", nullable = true)
    private Design design;
    
    @Column(length = 255)
    private String customDesignName;
    
    @Column(length = 2000)
    private String customDesignDetails;
    
    private BigDecimal amount;
    
    @Enumerated(EnumType.STRING)
    private PaymentStatus paymentStatus;
    
    @Enumerated(EnumType.STRING)
    private OrderStatus orderStatus = OrderStatus.ORDER_PLACED;
    
    @Column(length = 1000)
    private String deliveryAddress;
    
    @Column(length = 2000)
    private String specialInstructions;
    
    private String courierOption;
    
    private String paymentType; // "FULL" or "ADVANCE_20"
    
    private BigDecimal paidAmount;
    
    private BigDecimal balanceAmount;
    
    private String transactionNumber;
    
    private String refundStatus; // "NONE", "REFUND_PROCESSING", "REFUND_COMPLETED"
    
    private LocalDateTime refundInitiatedAt;
    
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @OrderBy("createdAt DESC")
    private List<OrderStatusHistory> statusHistory;
}
