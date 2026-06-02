package com.gestionnotes.backend.controller;

import com.gestionnotes.backend.entity.*;
import com.gestionnotes.backend.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class PlanificationController {

    private final PlanificationRepository planificationRepository;
    private final SemestreRepository semestreRepository;
    private final GroupeRepository groupeRepository;
    private final MatiereRepository matiereRepository;
    private final EnseignantRepository enseignantRepository;
    private final AnneeUniversitaireRepository anneeRepository;
    private final ClasseRepository classeRepository;

    public PlanificationController(
            PlanificationRepository planificationRepository,
            SemestreRepository semestreRepository,
            GroupeRepository groupeRepository,
            MatiereRepository matiereRepository,
            EnseignantRepository enseignantRepository,
            AnneeUniversitaireRepository anneeRepository,
            ClasseRepository classeRepository) {
        this.planificationRepository = planificationRepository;
        this.semestreRepository      = semestreRepository;
        this.groupeRepository        = groupeRepository;
        this.matiereRepository       = matiereRepository;
        this.enseignantRepository    = enseignantRepository;
        this.anneeRepository         = anneeRepository;
        this.classeRepository        = classeRepository;
    }

    // ─── GET /api/admin/semestres?anneeId=X ──────────────────────────────────
    // List semesters for a given academic year
    @GetMapping("/semestres")
    public ResponseEntity<?> listerSemestres(@RequestParam Integer anneeId) {
        List<Map<String, Object>> data = semestreRepository
                .findByAnneeUniversitaireId(anneeId)
                .stream()
                .map(s -> Map.<String, Object>of(
                        "id",  s.getId(),
                        "nom", s.getNom()
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(Map.of("data", data));
    }

    // ─── POST /api/admin/semestres ────────────────────────────────────────────
    @PostMapping("/semestres")
    public ResponseEntity<?> creerSemestre(@RequestBody Map<String, Object> req) {
        try {
            Integer anneeId = (Integer) req.get("anneeId");
            String nom = (String) req.get("nom");

            AnneeUniversitaire annee = anneeRepository.findById(anneeId)
                    .orElseThrow(() -> new RuntimeException("Année introuvable"));

            Semestre semestre = new Semestre();
            semestre.setAnneeUniversitaire(annee);
            semestre.setNom(nom);
            Semestre saved = semestreRepository.save(semestre);

            return ResponseEntity.ok(Map.of(
                    "message", "Semestre créé avec succès",
                    "id",  saved.getId(),
                    "nom", saved.getNom()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ─── GET /api/admin/planifications?semestreId=X ──────────────────────────
    // List all planifications for a semester
    @GetMapping("/planifications")
    public ResponseEntity<?> listerPlanifications(@RequestParam Integer semestreId) {
        List<Map<String, Object>> data = planificationRepository
                .findBySemestreId(semestreId)
                .stream()
                .map(p -> {
                    Groupe g = p.getGroupe();
                    Classe c = g.getClasse();
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id",              p.getId());
                    m.put("semestreId",      p.getSemestre().getId());
                    m.put("semestreNom",     p.getSemestre().getNom());
                    m.put("groupeId",        g.getId());
                    m.put("groupeNom",       g.getNom());
                    m.put("classeId",        c.getId());
                    m.put("classeNom",       c.getNiveau().getNom() + " - " + c.getSpecialite().getNom());
                    m.put("matiereId",       p.getMatiere().getId());
                    m.put("matiereIntitule", p.getMatiere().getIntitule());
                    m.put("matiereCode",     p.getMatiere().getCode());
                    m.put("enseignantId",    p.getEnseignant().getId());
                    m.put("enseignantNom",   p.getEnseignant().getPrenom() + " " + p.getEnseignant().getNom());
                    m.put("coeffTps",        p.getCoeffTps());
                    m.put("coeffProjet",     p.getCoeffProjet());
                    m.put("coeffCtrl1",      p.getCoeffCtrl1());
                    m.put("coeffCtrl2",      p.getCoeffCtrl2());
                    return m;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(Map.of("data", data));
    }

    // ─── POST /api/admin/planifications ──────────────────────────────────────
    @PostMapping("/planifications")
    @Transactional
    public ResponseEntity<?> creerPlanification(@RequestBody Map<String, Object> req) {
        try {
            Integer semestreId   = (Integer) req.get("semestreId");
            Integer groupeId     = (Integer) req.get("groupeId");
            Integer matiereId    = (Integer) req.get("matiereId");
            Integer enseignantId = (Integer) req.get("enseignantId");
            int coeffTps    = req.get("coeffTps")    != null ? (Integer) req.get("coeffTps")    : 0;
            int coeffProjet = req.get("coeffProjet") != null ? (Integer) req.get("coeffProjet") : 0;
            int coeffCtrl1  = req.get("coeffCtrl1")  != null ? (Integer) req.get("coeffCtrl1")  : 0;
            int coeffCtrl2  = req.get("coeffCtrl2")  != null ? (Integer) req.get("coeffCtrl2")  : 0;

            // Check duplicate: same semestre + groupe + matière
            boolean exists = planificationRepository
                    .existsBySemestreIdAndGroupeIdAndMatiereId(semestreId, groupeId, matiereId);
            if (exists) {
                return ResponseEntity.badRequest().body(Map.of(
                        "error", "Cette matière est déjà planifiée pour ce groupe dans ce semestre"
                ));
            }

            Semestre   semestre   = semestreRepository.findById(semestreId)
                    .orElseThrow(() -> new RuntimeException("Semestre introuvable"));
            Groupe     groupe     = groupeRepository.findById(groupeId)
                    .orElseThrow(() -> new RuntimeException("Groupe introuvable"));
            Matiere    matiere    = matiereRepository.findById(matiereId)
                    .orElseThrow(() -> new RuntimeException("Matière introuvable"));
            Enseignant enseignant = enseignantRepository.findById(enseignantId)
                    .orElseThrow(() -> new RuntimeException("Enseignant introuvable"));

            Planification p = new Planification();
            p.setSemestre(semestre);
            p.setGroupe(groupe);
            p.setMatiere(matiere);
            p.setEnseignant(enseignant);
            p.setCoeffTps(coeffTps);
            p.setCoeffProjet(coeffProjet);
            p.setCoeffCtrl1(coeffCtrl1);
            p.setCoeffCtrl2(coeffCtrl2);

            Planification saved = planificationRepository.save(p);

            return ResponseEntity.ok(Map.of(
                    "message", "Planification créée avec succès",
                    "id",      saved.getId()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ─── DELETE /api/admin/planifications/{id} ───────────────────────────────
    @DeleteMapping("/planifications/{id}")
    public ResponseEntity<?> supprimerPlanification(@PathVariable Integer id) {
        if (!planificationRepository.existsById(id)) {
            return ResponseEntity.status(404).body(Map.of("error", "Planification introuvable"));
        }
        planificationRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Planification supprimée"));
    }

    // ─── PUT /api/admin/planifications/{id} ──────────────────────────────────
    @PutMapping("/planifications/{id}")
    @Transactional
    public ResponseEntity<?> modifierPlanification(
            @PathVariable Integer id,
            @RequestBody Map<String, Object> req) {
        try {
            Planification p = planificationRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Planification introuvable"));

            if (req.containsKey("enseignantId")) {
                Enseignant enseignant = enseignantRepository
                        .findById((Integer) req.get("enseignantId"))
                        .orElseThrow(() -> new RuntimeException("Enseignant introuvable"));
                p.setEnseignant(enseignant);
            }
            if (req.containsKey("coeffTps"))    p.setCoeffTps((Integer) req.get("coeffTps"));
            if (req.containsKey("coeffProjet")) p.setCoeffProjet((Integer) req.get("coeffProjet"));
            if (req.containsKey("coeffCtrl1"))  p.setCoeffCtrl1((Integer) req.get("coeffCtrl1"));
            if (req.containsKey("coeffCtrl2"))  p.setCoeffCtrl2((Integer) req.get("coeffCtrl2"));

            planificationRepository.save(p);
            return ResponseEntity.ok(Map.of("message", "Planification mise à jour"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}