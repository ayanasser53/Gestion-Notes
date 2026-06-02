package com.gestionnotes.backend.controller;

import com.gestionnotes.backend.entity.*;
import com.gestionnotes.backend.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/enseignant")
@CrossOrigin(origins = "*")
public class EnseignantController {

    private final PlanificationRepository planificationRepository;
    private final EtudiantRepository etudiantRepository;
    private final GroupeRepository groupeRepository;
    private final NoteRepository noteRepository;
    private final SemestreRepository semestreRepository;

    public EnseignantController(
            PlanificationRepository planificationRepository,
            EtudiantRepository etudiantRepository,
            GroupeRepository groupeRepository,
            NoteRepository noteRepository,
            SemestreRepository semestreRepository
    ) {
        this.planificationRepository = planificationRepository;
        this.etudiantRepository = etudiantRepository;
        this.groupeRepository = groupeRepository;
        this.noteRepository = noteRepository;
        this.semestreRepository = semestreRepository;
    }

    // =========================================================
    // 1. GET ALL PLANIFICATIONS FOR A TEACHER
    // =========================================================
    @GetMapping("/{enseignantId}/planifications")
    public ResponseEntity<?> getPlanificationsByEnseignant(@PathVariable Integer enseignantId) {

        List<Map<String, Object>> data = planificationRepository
                .findByEnseignantId(enseignantId)
                .stream()
                .map(p -> {
                    Map<String, Object> m = new LinkedHashMap<>();

                    m.put("id", p.getId());

                    m.put("semestreId", p.getSemestre().getId());
                    m.put("semestre", p.getSemestre().getNom());

                    m.put("matiereId", p.getMatiere().getId());
                    m.put("matiere", p.getMatiere().getIntitule());

                    m.put("groupeId", p.getGroupe().getId());
                    m.put("groupe", p.getGroupe().getNom());

                    m.put("classeId", p.getGroupe().getClasse().getId());
                    m.put("classe",
                            p.getGroupe().getClasse().getNiveau().getNom()
                                    + " - " +
                                    p.getGroupe().getClasse().getSpecialite().getNom()
                    );

                    m.put("coeffTps", p.getCoeffTps());
                    m.put("coeffProjet", p.getCoeffProjet());
                    m.put("coeffCtrl1", p.getCoeffCtrl1());
                    m.put("coeffCtrl2", p.getCoeffCtrl2());

                    return m;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(Map.of("data", data));
    }

    // =========================================================
    // 2. GET PLANIFICATIONS BY SEMESTRE
    // =========================================================
    @GetMapping("/{enseignantId}/planifications/semestre")
    public ResponseEntity<?> getPlanificationsBySemestre(
            @PathVariable Integer enseignantId,
            @RequestParam Integer semestreId
    ) {

        List<Map<String, Object>> data = planificationRepository
                .findByEnseignantIdAndSemestreId(enseignantId, semestreId)
                .stream()
                .map(p -> {
                    Groupe g = p.getGroupe();
                    Classe c = g.getClasse();

                    Map<String, Object> m = new LinkedHashMap<>();

                    m.put("planifId", p.getId());
                    m.put("matiereId", p.getMatiere().getId());
                    m.put("matiere", p.getMatiere().getIntitule());

                    m.put("groupeId", g.getId());
                    m.put("groupe", g.getNom());

                    m.put("classeId", c.getId());
                    m.put("classe", c.getNiveau().getNom() + " - " + c.getSpecialite().getNom());

                    m.put("coeffTps", p.getCoeffTps());
                    m.put("coeffProjet", p.getCoeffProjet());
                    m.put("coeffCtrl1", p.getCoeffCtrl1());
                    m.put("coeffCtrl2", p.getCoeffCtrl2());

                    return m;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(Map.of("data", data));
    }

    // =========================================================
    // 3. GET SEMESTRES FOR TEACHER
    // =========================================================
    @GetMapping("/{enseignantId}/semestres")
    public ResponseEntity<?> getSemestres(@PathVariable Integer enseignantId) {

    	List<Map<String, Object>> data = new ArrayList<>();

    	Set<Integer> seen = new HashSet<>();

    	planificationRepository
    	        .findByEnseignantId(enseignantId)
    	        .forEach(p -> {
    	            Integer id = p.getSemestre().getId();

    	            if (seen.add(id)) {
    	                Map<String, Object> m = new LinkedHashMap<>();
    	                m.put("id", id);
    	                m.put("nom", p.getSemestre().getNom());
    	                data.add(m);
    	            }
    	        });
        return ResponseEntity.ok(Map.of("data", data));
    }

    // =========================================================
    // 4. GET STUDENTS BY PLANIFICATION (ONLY USED ONE)
    // =========================================================
    @GetMapping("/planifications/{planificationId}/etudiants")
    public ResponseEntity<?> getEtudiantsByPlanification(@PathVariable Integer planificationId) {

        Planification p = planificationRepository.findById(planificationId)
                .orElseThrow(() -> new RuntimeException("Planification introuvable"));

        List<Map<String, Object>> data = etudiantRepository
                .findByGroupeId(p.getGroupe().getId())
                .stream()
                .map(e -> Map.<String, Object>of(
                        "id", e.getId(),
                        "matricule", e.getMatricule(),
                        "nom", e.getNom(),
                        "prenom", e.getPrenom()
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(Map.of(
                "planificationId", p.getId(),
                "matiere", p.getMatiere().getIntitule(),
                "semestre", p.getSemestre().getNom(),
                "groupe", p.getGroupe().getNom(),
                "classe",
                p.getGroupe().getClasse().getNiveau().getNom()
                        + " - " + p.getGroupe().getClasse().getSpecialite().getNom(),
                "data", data
        ));
    }

    // =========================================================
    // 5. GET FILTERS (SAFE DTO VERSION)
    // =========================================================
    @GetMapping("/{enseignantId}/filters")
    public ResponseEntity<?> getFilters(@PathVariable Integer enseignantId) {

        var planifs = planificationRepository.findByEnseignantId(enseignantId);

        var semestres = planifs.stream()
                .map(p -> Map.of("id", p.getSemestre().getId(), "nom", p.getSemestre().getNom()))
                .collect(Collectors.toMap(
                        m -> m.get("id"),
                        m -> m,
                        (a, b) -> a
                ))
                .values();

        var matieres = planifs.stream()
                .map(p -> Map.of("id", p.getMatiere().getId(), "intitule", p.getMatiere().getIntitule()))
                .collect(Collectors.toMap(
                        m -> m.get("id"),
                        m -> m,
                        (a, b) -> a
                ))
                .values();

        var groupes = planifs.stream()
                .map(p -> Map.of("id", p.getGroupe().getId(), "nom", p.getGroupe().getNom()))
                .collect(Collectors.toMap(
                        m -> m.get("id"),
                        m -> m,
                        (a, b) -> a
                ))
                .values();

        return ResponseEntity.ok(Map.of(
                "semestres", semestres,
                "matieres", matieres,
                "groupes", groupes
        ));
    }

    // =========================================================
    // 6. GET NOTES FOR PLANIFICATION
    // =========================================================
    @GetMapping("/planifications/{planifId}/notes")
    public ResponseEntity<?> getNotesForPlanification(@PathVariable Integer planifId) {

        Planification planif = planificationRepository.findById(planifId)
                .orElseThrow(() -> new RuntimeException("Planification introuvable"));

        List<Etudiant> etudiants = etudiantRepository
                .findByGroupeId(planif.getGroupe().getId());

        Map<Long, Note> notesMap = noteRepository
                .findByPlanificationId(planifId)
                .stream()
                .collect(Collectors.toMap(n -> n.getEtudiant().getId(), n -> n));

        List<Map<String, Object>> data = etudiants.stream().map(e -> {
            Note note = notesMap.get(e.getId());

            Map<String, Object> row = new LinkedHashMap<>();

            row.put("etudiantId", e.getId());
            row.put("matricule", e.getMatricule());
            row.put("nom", e.getNom());
            row.put("prenom", e.getPrenom());

            row.put("noteTps", note != null ? note.getNoteTps() : null);
            row.put("noteProjet", note != null ? note.getNoteProjet() : null);
            row.put("noteCtrl1", note != null ? note.getNoteCtrl1() : null);
            row.put("noteCtrl2", note != null ? note.getNoteCtrl2() : null);
            row.put("moyenne", note != null ? note.getMoyenne() : null);

            return row;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(Map.of(
                "data", data,
                "planifId", planifId,
                "coeffTps", planif.getCoeffTps(),
                "coeffProjet", planif.getCoeffProjet(),
                "coeffCtrl1", planif.getCoeffCtrl1(),
                "coeffCtrl2", planif.getCoeffCtrl2()
        ));
    }

    // =========================================================
    // 7. SAVE / UPDATE NOTES
    // =========================================================
    @PostMapping("/planifications/{planifId}/notes")
    @Transactional
    public ResponseEntity<?> saveNotes(
            @PathVariable Integer planifId,
            @RequestBody Map<String, Object> body
    ) {

        try {
            Planification planif = planificationRepository.findById(planifId)
                    .orElseThrow(() -> new RuntimeException("Planification introuvable"));

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> notesPayload =
                    (List<Map<String, Object>>) body.get("notes");

            Map<Long, Note> existing = noteRepository
                    .findByPlanificationId(planifId)
                    .stream()
                    .collect(Collectors.toMap(n -> n.getEtudiant().getId(), n -> n));

            for (Map<String, Object> item : notesPayload) {

                Long etudiantId = ((Number) item.get("etudiantId")).longValue();

                Etudiant etudiant = etudiantRepository.findById(etudiantId)
                        .orElseThrow(() -> new RuntimeException("Étudiant introuvable"));

                Note note = existing.getOrDefault(etudiantId, new Note());

                note.setPlanification(planif);
                note.setEtudiant(etudiant);

                BigDecimal tps = toBD(item.get("noteTps"));
                BigDecimal projet = toBD(item.get("noteProjet"));
                BigDecimal ctrl1 = toBD(item.get("noteCtrl1"));
                BigDecimal ctrl2 = toBD(item.get("noteCtrl2"));

                note.setNoteTps(tps);
                note.setNoteProjet(projet);
                note.setNoteCtrl1(ctrl1);
                note.setNoteCtrl2(ctrl2);

                note.setMoyenne(computeMoyenne(
                        tps, planif.getCoeffTps(),
                        projet, planif.getCoeffProjet(),
                        ctrl1, planif.getCoeffCtrl1(),
                        ctrl2, planif.getCoeffCtrl2()
                ));

                noteRepository.save(note);
            }

            return ResponseEntity.ok(Map.of("message", "Notes enregistrées avec succès"));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // =========================================================
    // HELPERS
    // =========================================================
    private BigDecimal toBD(Object val) {
        if (val == null) return null;
        try {
            return new BigDecimal(val.toString()).setScale(2, RoundingMode.HALF_UP);
        } catch (Exception e) {
            return null;
        }
    }

    private BigDecimal computeMoyenne(
            BigDecimal tps, int cTps,
            BigDecimal projet, int cProjet,
            BigDecimal ctrl1, int cCtrl1,
            BigDecimal ctrl2, int cCtrl2
    ) {

        BigDecimal total = BigDecimal.ZERO;
        int coeff = 0;

        if (tps != null) { total = total.add(tps.multiply(BigDecimal.valueOf(cTps))); coeff += cTps; }
        if (projet != null) { total = total.add(projet.multiply(BigDecimal.valueOf(cProjet))); coeff += cProjet; }
        if (ctrl1 != null) { total = total.add(ctrl1.multiply(BigDecimal.valueOf(cCtrl1))); coeff += cCtrl1; }
        if (ctrl2 != null) { total = total.add(ctrl2.multiply(BigDecimal.valueOf(cCtrl2))); coeff += cCtrl2; }

        if (coeff == 0) return BigDecimal.ZERO;

        return total.divide(BigDecimal.valueOf(coeff), 2, RoundingMode.HALF_UP);
    }
}