package com.gestionnotes.backend.repository;

import com.gestionnotes.backend.entity.Planification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlanificationRepository extends JpaRepository<Planification, Integer> {

    // Used by admin
    List<Planification> findBySemestreId(Integer semestreId);

    boolean existsBySemestreIdAndGroupeIdAndMatiereId(
            Integer semestreId, Integer groupeId, Integer matiereId);

    // Used by enseignant
    List<Planification> findByEnseignantId(Integer enseignantId);

    List<Planification> findByEnseignantIdAndSemestreId(
            Integer enseignantId, Integer semestreId);
}
