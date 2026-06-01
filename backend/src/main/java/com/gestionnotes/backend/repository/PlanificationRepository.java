package com.gestionnotes.backend.repository;

import com.gestionnotes.backend.entity.Planification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlanificationRepository extends JpaRepository<Planification, Integer> {

    // semestre is a @ManyToOne object → traverse via semestre.id
    List<Planification> findBySemestre_Id(Integer semestreId);

    // same for groupe and matiere
    boolean existsBySemestre_IdAndGroupe_IdAndMatiere_Id(
            Integer semestreId, Integer groupeId, Integer matiereId);
}