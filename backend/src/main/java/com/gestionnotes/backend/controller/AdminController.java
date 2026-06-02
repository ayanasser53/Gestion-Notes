package com.gestionnotes.backend.controller;

import com.gestionnotes.backend.dto.CreateMatiereRequest;
import com.gestionnotes.backend.entity.Enseignant;
import com.gestionnotes.backend.entity.Matiere;

import com.gestionnotes.backend.repository.MatiereRepository;
import com.gestionnotes.backend.dto.CreateUserRequest;
import com.gestionnotes.backend.entity.User;
import com.gestionnotes.backend.repository.EnseignantRepository;
import com.gestionnotes.backend.repository.EtudiantRepository;
import com.gestionnotes.backend.repository.UserRepository;
import com.gestionnotes.backend.service.EnseignantService;
import com.gestionnotes.backend.service.EtudiantService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final EnseignantService enseignantService;
    private final EtudiantService etudiantService;

    private final EnseignantRepository enseignantRepository;
    private final EtudiantRepository etudiantRepository;

    private final UserRepository userRepository;

    private final MatiereRepository matiereRepository;

    public AdminController(
            EnseignantService enseignantService,
            EtudiantService etudiantService,
            EnseignantRepository enseignantRepository,
            EtudiantRepository etudiantRepository,
            UserRepository userRepository,
             MatiereRepository matiereRepository
            
    ) {
        this.enseignantService = enseignantService;
        this.etudiantService = etudiantService;
        this.enseignantRepository = enseignantRepository;
        this.etudiantRepository = etudiantRepository;
        this.userRepository = userRepository;
        this.matiereRepository = matiereRepository;
    }

    // ================= CREATE ENSEIGNANT =================

    @PostMapping("/enseignants")
    public ResponseEntity<?> createEnseignant(
            @RequestBody CreateUserRequest req
    ) throws Exception {

        if (userRepository.existsByEmail(req.getEmail())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Email déjà utilisé"));
        }

        User user = enseignantService.create(req);

        return ResponseEntity.ok(Map.of(
                "message", "Enseignant créé avec succès",
                "id", user.getId(),
                "email", user.getEmail()
        ));
    }

    // ================= CREATE ETUDIANT =================

    @PostMapping("/etudiants")
    public ResponseEntity<?> createEtudiant(
            @RequestBody CreateUserRequest req
    ) throws Exception {

        if (userRepository.existsByEmail(req.getEmail())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Email déjà utilisé"));
        }

        User user = etudiantService.create(req);

        return ResponseEntity.ok(Map.of(
                "message", "Étudiant créé avec succès",
                "id", user.getId()
        ));
    }

    // ================= LIST ENSEIGNANTS =================

    @GetMapping("/enseignants")
    public ResponseEntity<?> listEnseignants() {

        List<Map<String, Object>> data =
                enseignantRepository.findAll()
                        .stream()
                        .map(e -> Map.<String, Object>of(
                                "id", e.getId(),
                                "nom", e.getNom(),
                                "prenom", e.getPrenom(),
                                "email", e.getUser().getEmail()
                        ))
                        .collect(Collectors.toList());

        return ResponseEntity.ok(Map.of("data", data));
    }

    // ================= LIST ETUDIANTS =================

    @GetMapping("/etudiants")
    public ResponseEntity<?> listEtudiants() {

        List<Map<String, Object>> data =
                etudiantRepository.findAll()
                        .stream()
                        .map(e -> Map.<String, Object>of(
                                "id", e.getId(),
                                "nom", e.getNom(),
                                "prenom", e.getPrenom(),
                                "matricule", e.getMatricule(),
                                "email", e.getUser().getEmail()
                        ))
                        .collect(Collectors.toList());

        return ResponseEntity.ok(Map.of("data", data));
    }

    // ================= DELETE USER =================

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Integer id) {

        if (!userRepository.existsById(id)) {
            return ResponseEntity.status(404)
                    .body(Map.of("error", "Utilisateur introuvable"));
        }

        userRepository.deleteById(id);

        return ResponseEntity.ok(
                Map.of("message", "Utilisateur supprimé")
        );
    }
 // ================= LIST MATIERES =================

    @GetMapping("/matieres")
    public ResponseEntity<?> listMatieres() {

        List<Map<String, Object>> data =
                matiereRepository.findAll()
                        .stream()
                        .map(m -> Map.<String, Object>of(
                                "id", m.getId(),
                                "code", m.getCode(),
                                "intitule", m.getIntitule(),
                                "enseignantId",
                                        m.getEnseignant() != null
                                                ? m.getEnseignant().getId()
                                                : 0L
                        ))
                        .collect(Collectors.toList());

        return ResponseEntity.ok(Map.of("data", data));
    }

    // ================= CREATE MATIERE =================

    @PostMapping("/matieres")
    public ResponseEntity<?> createMatiere(
            @RequestBody CreateMatiereRequest req
    ) {
        try {

            if (req.getCode() == null || req.getCode().isBlank()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Le code de la matière est obligatoire"));
            }

            if (req.getIntitule() == null || req.getIntitule().isBlank()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "L'intitulé de la matière est obligatoire"));
            }

            Matiere matiere = new Matiere();
            matiere.setCode(req.getCode());
            matiere.setIntitule(req.getIntitule());

            if (req.getEnseignantId() != null) {

                Enseignant enseignant =
                        enseignantRepository.findById(req.getEnseignantId().intValue())
                                .orElseThrow(() ->
                                        new RuntimeException("Enseignant introuvable"));

                matiere.setEnseignant(enseignant);
            }

            Matiere saved = matiereRepository.save(matiere);

            return ResponseEntity.ok(Map.of(
                    "message", "Matière créée avec succès",
                    "id", saved.getId(),
                    "code", saved.getCode(),
                    "intitule", saved.getIntitule(),
                    "enseignantId",
                            saved.getEnseignant() != null
                                    ? saved.getEnseignant().getId()
                                    : null
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ================= DELETE MATIERE =================

    @DeleteMapping("/matieres/{id}")
    public ResponseEntity<?> deleteMatiere(@PathVariable Integer id) {

        if (!matiereRepository.existsById(id)) {
            return ResponseEntity.status(404)
                    .body(Map.of("error", "Matière introuvable"));
        }

        matiereRepository.deleteById(id);

        return ResponseEntity.ok(
                Map.of("message", "Matière supprimée")
        );
    }
   
}