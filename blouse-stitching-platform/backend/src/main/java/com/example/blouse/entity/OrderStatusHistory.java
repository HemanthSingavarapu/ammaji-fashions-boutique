package com.example.blouse.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "order_status_history")
@Data
public class OrderStatusHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "order_id")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Order order;
    
    @Enumerated(EnumType.STRING)
    private OrderStatus status;
    
    private String comment;
    private String updatedBy;
    
    @CreationTimestamp
    private LocalDateTime createdAt;
}
