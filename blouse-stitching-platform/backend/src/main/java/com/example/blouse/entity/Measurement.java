package com.example.blouse.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "measurements")
@Data
public class Measurement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne
    @JoinColumn(name = "order_id")
    private Order order;
    
    private Double bust;
    private Double waist;
    private Double shoulder;
    private Double blouseLength;
    private Double sleeveLength;
    private Double armhole;
    private Double frontNeck;
    private Double backNeck;
    
    @Column(length = 1000)
    private String otherMeasurements;
}
