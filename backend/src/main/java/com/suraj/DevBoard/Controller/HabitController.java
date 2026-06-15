package com.suraj.DevBoard.Controller;

import com.suraj.DevBoard.DTO.HabitDTO;
import com.suraj.DevBoard.Security.CustomUserDetails;
import com.suraj.DevBoard.Service.HabitService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/habits")
public class HabitController {

    @Autowired
    private HabitService habitService;

    @GetMapping
    public ResponseEntity<List<HabitDTO>> getAllHabits(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(habitService.getAllHabits(userDetails.getUser()));
    }

    @PostMapping
    public ResponseEntity<HabitDTO> createHabit(
            @RequestBody HabitDTO dto,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(habitService.createHabit(dto, userDetails.getUser()));
    }

    @PostMapping("/{id}/toggle")
    public ResponseEntity<?> toggleHabit(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        try {
            return ResponseEntity.ok(habitService.toggleHabit(id, userDetails.getUser()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteHabit(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        try {
            habitService.deleteHabit(id, userDetails.getUser());
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", e.getMessage()));
        }
    }
}