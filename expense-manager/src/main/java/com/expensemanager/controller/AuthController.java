package com.expensemanager.controller;

import com.expensemanager.model.User;
import com.expensemanager.repository.UserRepository;
import com.expensemanager.utils.JwtUtil;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository repo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public AuthController(UserRepository repo) {
        this.repo = repo;
    }

    // ✅ REGISTER USER
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {

        // check if user already exists
        Optional<User> existingUser = repo.findByEmail(user.getEmail());

        if (existingUser.isPresent()) {
            return ResponseEntity.badRequest().body("User already exists");
        }

        // encode password
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        repo.save(user);

        return ResponseEntity.ok("User registered successfully");
    }

    // ✅ LOGIN USER
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user) {

        Optional<User> existingUser = repo.findByEmail(user.getEmail());

        if (existingUser.isEmpty()) {
            return ResponseEntity.status(401).body("User not found");
        }

        User dbUser = existingUser.get();

        // compare encoded password
        if (!passwordEncoder.matches(user.getPassword(), dbUser.getPassword())) {
            return ResponseEntity.status(401).body("Invalid password");
        }

        // generate JWT token
        String token = JwtUtil.generateToken(dbUser.getEmail());

        return ResponseEntity.ok(token);
    }
}