package com.example.blouse.controller;

import com.example.blouse.entity.Order;
import com.example.blouse.entity.OrderStatus;
import com.example.blouse.entity.OrderStatusHistory;
import com.example.blouse.entity.User;
import com.example.blouse.repository.OrderRepository;
import com.example.blouse.repository.OrderStatusHistoryRepository;
import com.example.blouse.repository.UserRepository;
import com.example.blouse.entity.PaymentStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/orders")
public class OrderActionController {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final OrderStatusHistoryRepository historyRepository;

    public OrderActionController(OrderRepository orderRepository, UserRepository userRepository, OrderStatusHistoryRepository historyRepository) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.historyRepository = historyRepository;
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return userRepository.findByEmail(auth.getName()).orElseThrow();
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<?> cancelOrder(@PathVariable Long id) {
        User user = getCurrentUser();
        Order order = orderRepository.findByIdAndUserId(id, user.getId()).orElseThrow();
        
        if (order.getOrderStatus() == OrderStatus.ORDER_PLACED || order.getOrderStatus() == OrderStatus.PAYMENT_CONFIRMED) {
            order.setOrderStatus(OrderStatus.CANCELLED);
            
            boolean hadPayment = order.getPaymentStatus() == PaymentStatus.SUCCESS && 
                                (order.getPaidAmount() == null || order.getPaidAmount().compareTo(BigDecimal.ZERO) > 0);
            
            BigDecimal refundAmt = order.getPaidAmount();
            if (hadPayment) {
                if (refundAmt == null) {
                    if ("ADVANCE_20".equals(order.getPaymentType())) {
                        refundAmt = order.getAmount().multiply(new BigDecimal("0.20")).setScale(0, java.math.RoundingMode.HALF_UP);
                    } else {
                        refundAmt = order.getAmount();
                    }
                    order.setPaidAmount(refundAmt);
                }
                order.setRefundStatus("REFUND_PROCESSING");
                order.setRefundInitiatedAt(LocalDateTime.now());
            } else {
                order.setRefundStatus(null);
                order.setPaidAmount(BigDecimal.ZERO);
            }

            order = orderRepository.save(order);
            
            OrderStatusHistory history = new OrderStatusHistory();
            history.setOrder(order);
            history.setStatus(OrderStatus.CANCELLED);
            
            String comment = "Order cancelled by customer.";
            if (hadPayment) {
                comment += String.format(" Refund of ₹%s initiated (Expected within 2 business days). Txn: %s", 
                    refundAmt != null ? refundAmt : "0", 
                    order.getTransactionNumber() != null ? order.getTransactionNumber() : "N/A");
            }
            history.setComment(comment);
            history.setUpdatedBy(user.getName());
            historyRepository.save(history);
            
            return ResponseEntity.ok(order);
        } else {
            return ResponseEntity.badRequest().body("Order cannot be cancelled at this stage.");
        }
    }
}
