package com.miniproject.defect_tracker.service;

import com.miniproject.defect_tracker.dto.RegistrationRequest;
import com.miniproject.defect_tracker.entity.User;
import com.miniproject.defect_tracker.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    @Autowired
    private UserRepository userRepository;

    // ✅ REMOVE PasswordEncoder - Use plain text
    public User authenticate(String username, String password) {
        log.info("Login attempt for user: {}", username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));

        // ✅ Direct password comparison (plain text)
        if (!user.getPassword().equals(password)) {
            log.warn("Invalid password attempt for user: {}", username);
            throw new IllegalArgumentException("Invalid credentials");
        }

        log.info("Login successful for user: {}", username);
        return user;
    }

    public User register(RegistrationRequest req) {
        log.info("Registration attempt for user: {}", req.getUsername());

        if (userRepository.existsByUsername(req.getUsername())) {
            throw new IllegalArgumentException("Username already exists!");
        }

        if (userRepository.existsByEmail(req.getEmail())) {
            throw new IllegalArgumentException("Email already registered!");
        }

        String role = req.getRole().trim().toUpperCase();
        if (!role.equals("DEVELOPER") && !role.equals("TESTER")) {
            throw new IllegalArgumentException("Role must be DEVELOPER or TESTER");
        }

        User user = new User();
        user.setUsername(req.getUsername().trim());
        user.setEmail(req.getEmail().trim());
        user.setRole(role);

        // ✅ Store password as plain text (simple)
        user.setPassword(req.getPassword());

        User savedUser = userRepository.save(user);
        log.info("Registration successful for user: {}", req.getUsername());

        return savedUser;
    }
}