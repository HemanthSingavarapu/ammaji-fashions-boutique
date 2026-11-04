package com.example.blouse.dto;
import com.example.blouse.entity.Measurement;
import lombok.Data;
@Data public class OrderRequest {
    private Long designId;
    private String customDesignName;
    private String customDesignDetails;
    private String deliveryAddress;
    private String specialInstructions;
    private Measurement measurement;
    private String courierOption; // "SELF" or "BOUTIQUE"
    private java.math.BigDecimal amount;
    private String paymentType;
    private java.math.BigDecimal paidAmount;
    private java.math.BigDecimal balanceAmount;
    private String transactionNumber;
}
