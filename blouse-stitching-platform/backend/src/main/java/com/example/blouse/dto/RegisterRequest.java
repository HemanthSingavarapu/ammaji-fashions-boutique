package com.example.blouse.dto;
import lombok.Data;
@Data public class RegisterRequest {
    private String name; private String email; private String mobile; private String password;
    private String address; private String city; private String state; private String pincode;
}
