package com.example.blouse.controller;

import com.example.blouse.entity.Order;
import com.example.blouse.entity.OrderStatus;
import com.example.blouse.entity.Payment;
import com.example.blouse.entity.PaymentStatus;
import com.example.blouse.repository.OrderRepository;
import com.example.blouse.repository.PaymentRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {
    
    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final com.example.blouse.repository.OrderStatusHistoryRepository historyRepository;

    public PaymentController(OrderRepository orderRepository, PaymentRepository paymentRepository, com.example.blouse.repository.OrderStatusHistoryRepository historyRepository) {
        this.orderRepository = orderRepository;
        this.paymentRepository = paymentRepository;
        this.historyRepository = historyRepository;
    }

    @PostMapping("/dummy")
    public ResponseEntity<?> processDummyPayment(
            @RequestParam Long orderId, 
            @RequestParam boolean success,
            @RequestParam(required = false) String transactionNumber,
            @RequestParam(required = false) String paymentType,
            @RequestParam(required = false) BigDecimal paidAmount,
            @RequestParam(required = false) BigDecimal balanceAmount) {
        Order order = orderRepository.findById(orderId).orElse(null);
        if (order == null) {
            return ResponseEntity.status(404).body("Order not found or session expired. Please refresh checkout.");
        }
        
        String effectiveTxn = transactionNumber;
        if (effectiveTxn == null || effectiveTxn.trim().isEmpty()) {
            String dateStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
            effectiveTxn = String.format("TXN-%s-%06d", dateStr, (int)(Math.random() * 900000) + 100000);
        }
        
        BigDecimal effectivePaid = paidAmount;
        if (effectivePaid == null) {
            effectivePaid = "ADVANCE_20".equals(paymentType) 
                ? order.getAmount().multiply(new BigDecimal("0.20")).setScale(0, java.math.RoundingMode.HALF_UP)
                : order.getAmount();
        }
        
        BigDecimal effectiveBalance = balanceAmount;
        if (effectiveBalance == null && order.getAmount() != null) {
            effectiveBalance = order.getAmount().subtract(effectivePaid);
            if (effectiveBalance.compareTo(BigDecimal.ZERO) < 0) effectiveBalance = BigDecimal.ZERO;
        }

        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setAmount(effectivePaid != null ? effectivePaid : order.getAmount());
        payment.setPaymentMethod(paymentType != null ? paymentType : "ONLINE_PAYMENT");
        payment.setPaymentReference(effectiveTxn);
        
        if (paymentType != null) {
            order.setPaymentType(paymentType);
        }
        order.setPaidAmount(effectivePaid);
        order.setBalanceAmount(effectiveBalance);
        order.setTransactionNumber(effectiveTxn);
        
        if (success) {
            payment.setStatus(PaymentStatus.SUCCESS);
            order.setPaymentStatus(PaymentStatus.SUCCESS);
            order.setOrderStatus(OrderStatus.PAYMENT_CONFIRMED);
            
            com.example.blouse.entity.OrderStatusHistory history = new com.example.blouse.entity.OrderStatusHistory();
            history.setOrder(order);
            history.setStatus(OrderStatus.PAYMENT_CONFIRMED);
            String modeText = "ADVANCE_20".equals(order.getPaymentType()) ? "20% Advance Booking Fee" : "Full Payment";
            history.setComment(String.format("Payment successful via %s (₹%s). Txn Ref: %s", modeText, effectivePaid, effectiveTxn));
            history.setUpdatedBy("SYSTEM");
            historyRepository.save(history);
        } else {
            payment.setStatus(PaymentStatus.FAILED);
            order.setPaymentStatus(PaymentStatus.FAILED);
            order.setOrderStatus(OrderStatus.CANCELLED);
            order.setPaidAmount(BigDecimal.ZERO);
            order.setBalanceAmount(BigDecimal.ZERO);
            order.setTransactionNumber(null);
            order.setRefundStatus(null);
            order.setRefundInitiatedAt(null);
            
            com.example.blouse.entity.OrderStatusHistory history = new com.example.blouse.entity.OrderStatusHistory();
            history.setOrder(order);
            history.setStatus(OrderStatus.CANCELLED);
            history.setComment("Payment cancelled by customer during checkout. Order not placed.");
            history.setUpdatedBy("SYSTEM");
            historyRepository.save(history);
        }
        
        paymentRepository.save(payment);
        orderRepository.save(order);
        
        return ResponseEntity.ok(payment);
    }
}
