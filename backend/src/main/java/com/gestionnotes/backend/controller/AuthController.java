package com.gestionnotes.backend.controller;

import com.gestionnotes.backend.dto.LoginRequest;
import com.gestionnotes.backend.dto.RegisterRequest;
import com.gestionnotes.backend.entity.Role;
import com.gestionnotes.backend.entity.User;
import com.gestionnotes.backend.repository.RoleRepository;
import com.gestionnotes.backend.repository.UserRepository;
import com.gestionnotes.backend.service.HashService;
import com.gestionnotes.backend.service.JwtService;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final HashService hashService;
    private final JwtService jwtService;

    public AuthController(
            UserRepository userRepository,
            RoleRepository roleRepository,
            HashService hashService,
            JwtService jwtService
    ) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.hashService = hashService;
        this.jwtService = jwtService;
    }

    private void verifierEmailEnsias(String email) {
        if (email == null || !email.matches("^[a-zA-Z0-9._%+-]+@ensias\\.um5\\.ac\\.ma$")) {
            throw new RuntimeException("Email ENSIAS obligatoire");
        }
    }

    @PostMapping("/admin-register")
    public Map<String, Object> registerAdmin(@RequestBody RegisterRequest request) throws Exception {

        verifierEmailEnsias(request.getEmail());

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email déjà utilisé");
        }

        Role adminRole = roleRepository.findByNom("admin")
                .orElseThrow(() -> new RuntimeException("Role admin introuvable"));

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPasswordHash(hashService.sha256(request.getPassword()));
        user.setRole(adminRole);
        user.setCreatedAt(LocalDateTime.now());

        User savedUser = userRepository.save(user);

        String token = jwtService.generateToken(savedUser);

        return Map.of(
                "message", "Compte admin créé avec succès",
                "id", savedUser.getId(),
                "email", savedUser.getEmail(),
                "role", savedUser.getRole().getNom(),
                "token", token
        );
    }

    @PostMapping("/admin-login")
    public Map<String, Object> loginAdmin(@RequestBody LoginRequest request) throws Exception {

        verifierEmailEnsias(request.getEmail());

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Email incorrect"));

        String passwordHash = hashService.sha256(request.getPassword());

        if (!user.getPasswordHash().equals(passwordHash)) {
            throw new RuntimeException("Mot de passe incorrect");
        }

        if (!user.getRole().getNom().equals("admin")) {
            throw new RuntimeException("Accès refusé : vous n'êtes pas admin");
        }

        String token = jwtService.generateToken(user);

        return Map.of(
                "message", "Connexion admin réussie",
                "id", user.getId(),
                "email", user.getEmail(),
                "role", user.getRole().getNom(),
                "token", token
        );
    }
}