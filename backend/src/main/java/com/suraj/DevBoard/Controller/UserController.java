package com.suraj.DevBoard.Controller;

import com.suraj.DevBoard.DTO.PasswordChangeDTO;
import com.suraj.DevBoard.DTO.ProfileDTO;
import com.suraj.DevBoard.Security.CustomUserDetails;
import com.suraj.DevBoard.Service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/profile")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<ProfileDTO> getProfile(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(userService.getProfile(userDetails.getUser()));
    }

    @PutMapping
    public ResponseEntity<?> updateProfile(
            @RequestBody ProfileDTO dto,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        try {
            return ResponseEntity.ok(userService.updateProfile(dto, userDetails.getUser()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/password")
    public ResponseEntity<?> changePassword(
            @RequestBody PasswordChangeDTO dto,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        try {
            userService.changePassword(dto, userDetails.getUser());
            return ResponseEntity.ok(Map.of("message", "Password updated successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/data")
    public ResponseEntity<?> clearAllData(@AuthenticationPrincipal CustomUserDetails userDetails) {
        userService.clearAllData(userDetails.getUser());
        return ResponseEntity.ok(Map.of("message", "All data cleared"));
    }

    @DeleteMapping
    public ResponseEntity<?> deleteAccount(@AuthenticationPrincipal CustomUserDetails userDetails) {
        userService.deleteAccount(userDetails.getUser());
        return ResponseEntity.ok(Map.of("message", "Account deleted"));
    }
}