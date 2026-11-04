package com.example.blouse.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Data
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne
    @JoinColumn(name = "order_id")
    private Order order;
    
    private String paymentReference;
    private BigDecimal amount;
    private String paymentMethod;
    
    @Enumerated(EnumType.STRING)
    private PaymentStatus status;
    
    @CreationTimestamp
    private LocalDateTime createdAt;
}
