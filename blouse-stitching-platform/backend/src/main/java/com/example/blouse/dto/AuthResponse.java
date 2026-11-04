package com.example.blouse.dto;
import com.example.blouse.entity.User;
import lombok.AllArgsConstructor;
import lombok.Data;
@Data @AllArgsConstructor public class AuthResponse { private String token; private User user; }
