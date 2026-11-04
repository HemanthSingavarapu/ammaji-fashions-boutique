package com.example.blouse.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "user_measurements")
@Data
public class UserMeasurement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne
    @JoinColumn(name = "user_id")
    @JsonIgnore
    private User user;
    
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
