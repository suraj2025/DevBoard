package com.suraj.DevBoard.Service;

import com.suraj.DevBoard.DTO.AuthResponseDTO;
import com.suraj.DevBoard.DTO.LoginRequestDTO;
import com.suraj.DevBoard.DTO.RegisterRequestDTO;
import com.suraj.DevBoard.Entity.Users;
import com.suraj.DevBoard.Repository.UserRepository;
import com.suraj.DevBoard.Security.CustomUserDetails;
import com.suraj.DevBoard.Security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    public AuthResponseDTO login(LoginRequestDTO request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        String token = jwtUtil.generateToken(userDetails);

        AuthResponseDTO.UserDTO userDTO = new AuthResponseDTO.UserDTO(
                userDetails.getId(), userDetails.getName(), userDetails.getUsername()
        );

        return new AuthResponseDTO(token, userDTO);
    }

    public void register(RegisterRequestDTO request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already registered");
        }

        Users user = new Users();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        userRepository.save(user);
    }
}