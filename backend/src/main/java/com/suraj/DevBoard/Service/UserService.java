package com.suraj.DevBoard.Service;

import com.suraj.DevBoard.DTO.PasswordChangeDTO;
import com.suraj.DevBoard.DTO.ProfileDTO;
import com.suraj.DevBoard.Entity.Habit;
import com.suraj.DevBoard.Entity.Task;
import com.suraj.DevBoard.Entity.Users;
import com.suraj.DevBoard.Repository.HabitRepository;
import com.suraj.DevBoard.Repository.TaskRepository;
import com.suraj.DevBoard.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private HabitRepository habitRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public ProfileDTO getProfile(Users user) {
        return new ProfileDTO(user.getId(), user.getName(), user.getEmail());
    }

    public ProfileDTO updateProfile(ProfileDTO dto, Users user) {
        if (dto.getName() != null && !dto.getName().isBlank()) {
            user.setName(dto.getName());
        }
        if (dto.getEmail() != null && !dto.getEmail().isBlank()) {
            if (!dto.getEmail().equals(user.getEmail()) && userRepository.existsByEmail(dto.getEmail())) {
                throw new IllegalArgumentException("Email already in use");
            }
            user.setEmail(dto.getEmail());
        }

        Users saved = userRepository.save(user);
        return new ProfileDTO(saved.getId(), saved.getName(), saved.getEmail());
    }

    public void changePassword(PasswordChangeDTO dto, Users user) {
        if (!passwordEncoder.matches(dto.getCurrentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }
        if (dto.getNewPassword() == null || dto.getNewPassword().length() < 6) {
            throw new IllegalArgumentException("New password must be at least 6 characters");
        }
        user.setPassword(passwordEncoder.encode(dto.getNewPassword()));
        userRepository.save(user);
    }

    public void clearAllData(Users user) {
        taskRepository.deleteAll(taskRepository.findByUser(user));
        habitRepository.deleteAll(habitRepository.findByUser(user));
    }

    public void deleteAccount(Users user) {
        // tasks/habits will cascade-delete only if FK configured with cascade,
        // so clear them explicitly first
        clearAllData(user);
        userRepository.delete(user);
    }
}