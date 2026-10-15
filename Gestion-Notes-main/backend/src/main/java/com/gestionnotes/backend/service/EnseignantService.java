package com.gestionnotes.backend.service;

import com.gestionnotes.backend.dto.CreateUserRequest;
import com.gestionnotes.backend.entity.Enseignant;
import com.gestionnotes.backend.entity.Role;
import com.gestionnotes.backend.entity.User;
import com.gestionnotes.backend.repository.EnseignantRepository;
import com.gestionnotes.backend.repository.RoleRepository;
import com.gestionnotes.backend.repository.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class EnseignantService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final EnseignantRepository enseignantRepository;
    private final HashService hashService;

    public EnseignantService(
            UserRepository userRepository,
            RoleRepository roleRepository,
            EnseignantRepository enseignantRepository,
            HashService hashService
    ) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.enseignantRepository = enseignantRepository;
        this.hashService = hashService;
    }

    @Transactional
    public User create(CreateUserRequest req) throws Exception {

        Role role = roleRepository.findByNom("enseignant")
                .orElseThrow(() -> new RuntimeException("Role introuvable"));

        // CREATE USER
        User user = new User();
        user.setEmail(req.getEmail());
        user.setPasswordHash(hashService.sha256(req.getPassword()));
        user.setRole(role);
        user.setCreatedAt(LocalDateTime.now());

        User savedUser = userRepository.save(user);

        // CREATE ENSEIGNANT
        Enseignant enseignant = new Enseignant();
        enseignant.setNom(req.getNom());
        enseignant.setPrenom(req.getPrenom());
        enseignant.setUser(savedUser);

        enseignantRepository.save(enseignant);

        return savedUser;
    }
}