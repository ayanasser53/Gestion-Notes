package com.gestionnotes.backend.service;

import com.gestionnotes.backend.dto.CreateUserRequest;
import com.gestionnotes.backend.entity.Etudiant;
import com.gestionnotes.backend.entity.Role;
import com.gestionnotes.backend.entity.User;
import com.gestionnotes.backend.repository.EtudiantRepository;
import com.gestionnotes.backend.repository.RoleRepository;
import com.gestionnotes.backend.repository.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class EtudiantService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final EtudiantRepository etudiantRepository;
    private final HashService hashService;

    public EtudiantService(
            UserRepository userRepository,
            RoleRepository roleRepository,
            EtudiantRepository etudiantRepository,
            HashService hashService
    ) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.etudiantRepository = etudiantRepository;
        this.hashService = hashService;
    }

    @Transactional
    public User create(CreateUserRequest req) throws Exception {

        // FIND ROLE
        Role role = roleRepository.findByNom("etudiant")
                .orElseThrow(() -> new RuntimeException("Role introuvable"));

        // CREATE USER
        User user = new User();
        user.setEmail(req.getEmail());
        user.setPasswordHash(hashService.sha256(req.getPassword()));
        user.setRole(role);
        user.setCreatedAt(LocalDateTime.now());

        User savedUser = userRepository.save(user);

        // CREATE ETUDIANT
        Etudiant etudiant = new Etudiant();
        etudiant.setNom(req.getNom());
        etudiant.setPrenom(req.getPrenom());

        // ⚠️ FIX IMPORTANT (ID = Integer conversion safe)
        Integer matricule = generateMatricule(savedUser.getId());

        etudiant.setMatricule(matricule);
        etudiant.setUser(savedUser);

        etudiantRepository.save(etudiant);

        return savedUser;
    }

    // 🔥 Matricule compatible int4 (INTEGER PostgreSQL)
    private Integer generateMatricule(Integer id) {
        // version simple et sûre
        return 100000 + id;
    }
}