package com.suraj.DevBoard.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponseDTO {
    private String token;
    private UserDTO user;

    @Data
    @AllArgsConstructor
    public static class UserDTO {
        private Long id;
        private String name;
        private String email;
    }
}