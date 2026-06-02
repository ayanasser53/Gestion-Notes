package com.gestionnotes.backend.controller;

import com.gestionnotes.backend.dto.CreateClasseRequest;
import com.gestionnotes.backend.entity.*;
import com.gestionnotes.backend.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class ClasseController {

    private final ClasseRepository classeRepository;
    private final NiveauRepository niveauRepository;
    private final SpecialiteRepository specialiteRepository;
    private final AnneeUniversitaireRepository anneeRepository;
    private final GroupeRepository groupeRepository;
    private final EtudiantRepository etudiantRepository;

    public ClasseController(ClasseRepository classeRepository,
                            NiveauRepository niveauRepository,
                            SpecialiteRepository specialiteRepository,
                            AnneeUniversitaireRepository anneeRepository,
                            GroupeRepository groupeRepository,
                            EtudiantRepository etudiantRepository) {
        this.classeRepository    = classeRepository;
        this.niveauRepository    = niveauRepository;
        this.specialiteRepository = specialiteRepository;
        this.anneeRepository     = anneeRepository;
        this.groupeRepository    = groupeRepository;
        this.etudiantRepository  = etudiantRepository;
    }

    // ═════════════════════════════════════════════════════════════════════════
    //  ANNÉES UNIVERSITAIRES
    // ═════════════════════════════════════════════════════════════════════════

    @GetMapping("/annees")
    public ResponseEntity<?> listerAnnees() {
        List<Map<String, Object>> data = anneeRepository.findAll().stream()
            .map(a -> Map.<String, Object>of(
                "id",        a.getId(),
                "libelle",   a.getLibelle(),
                "dateDebut", a.getDateDebut() != null ? a.getDateDebut().toString() : "",
                "dateFin",   a.getDateFin()   != null ? a.getDateFin().toString()   : ""
            ))
            .collect(Collectors.toList());
        return ResponseEntity.ok(Map.of("data", data));
    }

    @PostMapping("/annees")
    public ResponseEntity<?> creerAnnee(@RequestBody Map<String, String> req) {
        try {
            AnneeUniversitaire annee = new AnneeUniversitaire();
            annee.setLibelle(req.get("libelle"));
            annee.setDateDebut(java.time.LocalDate.parse(req.get("dateDebut")));
            annee.setDateFin(java.time.LocalDate.parse(req.get("dateFin")));
            AnneeUniversitaire saved = anneeRepository.save(annee);
            return ResponseEntity.ok(Map.of(
                "message",   "Année créée avec succès",
                "id",        saved.getId(),
                "libelle",   saved.getLibelle(),
                "dateDebut", saved.getDateDebut().toString(),
                "dateFin",   saved.getDateFin().toString()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/annees/{id}")
    public ResponseEntity<?> supprimerAnnee(@PathVariable Integer id) {
        if (!anneeRepository.existsById(id)) {
            return ResponseEntity.status(404).body(Map.of("error", "Année introuvable"));
        }
        anneeRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Année supprimée"));
    }

    // ═════════════════════════════════════════════════════════════════════════
    //  NIVEAUX
    // ═════════════════════════════════════════════════════════════════════════

    @GetMapping("/niveaux")
    public ResponseEntity<?> listerNiveaux() {
        List<Map<String, Object>> data = niveauRepository.findAll().stream()
            .map(n -> Map.<String, Object>of(
                "id",  n.getId(),
                "nom", n.getNom()
            ))
            .collect(Collectors.toList());
        return ResponseEntity.ok(Map.of("data", data));
    }

    @PostMapping("/niveaux")
    public ResponseEntity<?> creerNiveau(@RequestBody Map<String, String> req) {
        try {
            Niveau niveau = new Niveau();
            niveau.setNom(req.get("nom"));
            Niveau saved = niveauRepository.save(niveau);
            return ResponseEntity.ok(Map.of(
                "message", "Niveau créé avec succès",
                "id",      saved.getId(),
                "nom",     saved.getNom()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/niveaux/{id}")
    public ResponseEntity<?> supprimerNiveau(@PathVariable Integer id) {
        if (!niveauRepository.existsById(id)) {
            return ResponseEntity.status(404).body(Map.of("error", "Niveau introuvable"));
        }
        niveauRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Niveau supprimé"));
    }

    // ═════════════════════════════════════════════════════════════════════════
    //  SPÉCIALITÉS
    // ═════════════════════════════════════════════════════════════════════════

    @GetMapping("/specialites")
    public ResponseEntity<?> listerSpecialites() {
        List<Map<String, Object>> data = specialiteRepository.findAll().stream()
            .map(s -> Map.<String, Object>of(
                "id",  s.getId(),
                "nom", s.getNom()
            ))
            .collect(Collectors.toList());
        return ResponseEntity.ok(Map.of("data", data));
    }

    @PostMapping("/specialites")
    public ResponseEntity<?> creerSpecialite(@RequestBody Map<String, String> req) {
        try {
            Specialite specialite = new Specialite();
            specialite.setNom(req.get("nom"));
            Specialite saved = specialiteRepository.save(specialite);
            return ResponseEntity.ok(Map.of(
                "message", "Spécialité créée avec succès",
                "id",      saved.getId(),
                "nom",     saved.getNom()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/specialites/{id}")
    public ResponseEntity<?> supprimerSpecialite(@PathVariable Integer id) {
        if (!specialiteRepository.existsById(id)) {
            return ResponseEntity.status(404).body(Map.of("error", "Spécialité introuvable"));
        }
        specialiteRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Spécialité supprimée"));
    }

    // ═════════════════════════════════════════════════════════════════════════
    //  CLASSES
    // ═════════════════════════════════════════════════════════════════════════

    @GetMapping("/classes")
    public ResponseEntity<?> listerClasses(@RequestParam Integer anneeId) {
        List<Map<String, Object>> data = classeRepository
            .findByAnneeUniversitaireId(anneeId).stream()
            .map(c -> {
                List<String> groupesNoms = groupeRepository
                    .findByClasse_Id(c.getId())
                    .stream()
                    .map(Groupe::getNom)
                    .collect(Collectors.toList());
                return Map.<String, Object>of(
                    "id",            c.getId(),
                    "niveauId",      c.getNiveau().getId(),
                    "niveauNom",     c.getNiveau().getNom(),
                    "specialiteId",  c.getSpecialite().getId(),
                    "specialiteNom", c.getSpecialite().getNom(),
                    "groupes",       groupesNoms.size(),
                    "groupesNoms",   groupesNoms
                );
            })
            .collect(Collectors.toList());
        return ResponseEntity.ok(Map.of("data", data));
    }

    @PostMapping("/classes")
    @Transactional
    public ResponseEntity<?> creerClasse(@RequestBody CreateClasseRequest req) {
        try {
            Niveau niveau = niveauRepository.findById(req.getNiveauId())
                .orElseThrow(() -> new RuntimeException("Niveau introuvable"));

            Specialite specialite = specialiteRepository.findById(req.getSpecialiteId())
                .orElseThrow(() -> new RuntimeException("Spécialité introuvable"));

            AnneeUniversitaire annee = anneeRepository.findById(req.getAnneeId())
                .orElseThrow(() -> new RuntimeException("Année introuvable"));

            // Créer la classe
            Classe classe = new Classe();
            classe.setNiveau(niveau);
            classe.setSpecialite(specialite);
            classe.setAnneeUniversitaire(annee);
            Classe saved = classeRepository.save(classe);

            // Créer les groupes : G1, G2, G3...
            int nbGroupes = req.getGroupes() != null ? req.getGroupes() : 1;
            for (int i = 1; i <= nbGroupes; i++) {
                Groupe g = new Groupe();
                g.setClasse(saved);
                g.setNom("G" + i);
                groupeRepository.save(g);
            }

            return ResponseEntity.ok(Map.of(
                "message",       "Classe créée avec " + nbGroupes + " groupe(s)",
                "id",            saved.getId(),
                "niveauNom",     niveau.getNom(),
                "specialiteNom", specialite.getNom(),
                "groupes",       nbGroupes
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/classes/{id}")
    @Transactional
    public ResponseEntity<?> supprimerClasse(@PathVariable Integer id) {
        if (!classeRepository.existsById(id)) {
            return ResponseEntity.status(404).body(Map.of("error", "Classe introuvable"));
        }
        groupeRepository.deleteByClasse_Id(id);
        classeRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Classe et ses groupes supprimés"));
    }

    // ═════════════════════════════════════════════════════════════════════════
    //  AFFECTATION DES ÉTUDIANTS AUX GROUPES
    // ═════════════════════════════════════════════════════════════════════════

    @GetMapping("/classes/{classeId}/groupes")
    public ResponseEntity<?> listerGroupesClasse(@PathVariable Integer classeId) {
        if (!classeRepository.existsById(classeId)) {
            return ResponseEntity.status(404).body(Map.of("error", "Classe introuvable"));
        }

        List<Map<String, Object>> data = groupeRepository.findByClasse_Id(classeId).stream()
            .map(g -> Map.<String, Object>of(
                "id", g.getId(),
                "nom", g.getNom()
            ))
            .collect(Collectors.toList());

        return ResponseEntity.ok(Map.of("data", data));
    }

    @GetMapping("/groupes/{groupeId}/etudiants")
    public ResponseEntity<?> listerEtudiantsGroupe(@PathVariable Integer groupeId) {
        if (!groupeRepository.existsById(groupeId)) {
            return ResponseEntity.status(404).body(Map.of("error", "Groupe introuvable"));
        }

        List<Map<String, Object>> data = etudiantRepository.findByGroupeId(groupeId).stream()
            .map(e -> Map.<String, Object>of(
                "id", e.getId(),
                "matricule", e.getMatricule(),
                "nom", e.getNom(),
                "prenom", e.getPrenom(),
                "email", e.getUser() != null ? e.getUser().getEmail() : ""
            ))
            .collect(Collectors.toList());

        return ResponseEntity.ok(Map.of("data", data));
    }

    @GetMapping("/etudiants/disponibles")
    public ResponseEntity<?> listerEtudiantsDisponibles() {
        List<Map<String, Object>> data = etudiantRepository.findByGroupeIsNull().stream()
            .map(e -> Map.<String, Object>of(
                "id", e.getId(),
                "matricule", e.getMatricule(),
                "nom", e.getNom(),
                "prenom", e.getPrenom(),
                "email", e.getUser() != null ? e.getUser().getEmail() : ""
            ))
            .collect(Collectors.toList());

        return ResponseEntity.ok(Map.of("data", data));
    }

    @PostMapping("/groupes/{groupeId}/etudiants")
    @Transactional
    public ResponseEntity<?> affecterEtudiantsAuGroupe(@PathVariable Integer groupeId,
                                                       @RequestBody Map<String, List<Long>> req) {
        try {
            Groupe groupe = groupeRepository.findById(groupeId)
                .orElseThrow(() -> new RuntimeException("Groupe introuvable"));

            List<Long> etudiantIds = req.get("etudiantIds");
            if (etudiantIds == null || etudiantIds.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Aucun étudiant sélectionné"));
            }

            for (Long etudiantId : etudiantIds) {
                Etudiant etudiant = etudiantRepository.findById(etudiantId)
                    .orElseThrow(() -> new RuntimeException("Étudiant introuvable : " + etudiantId));
                etudiant.setGroupe(groupe);
                etudiantRepository.save(etudiant);
            }

            return ResponseEntity.ok(Map.of("message", "Étudiants affectés au groupe"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/etudiants/{etudiantId}/groupe")
    @Transactional
    public ResponseEntity<?> retirerEtudiantDuGroupe(@PathVariable Long etudiantId) {
        try {
            Etudiant etudiant = etudiantRepository.findById(etudiantId)
                .orElseThrow(() -> new RuntimeException("Étudiant introuvable"));
            etudiant.setGroupe(null);
            etudiantRepository.save(etudiant);
            return ResponseEntity.ok(Map.of("message", "Étudiant retiré du groupe"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

}
